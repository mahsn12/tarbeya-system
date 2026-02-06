const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { google } = require('googleapis');
const readline = require('readline');
const EnrolledStudent = require('../models/EnrolledStudent');

// uploads folder
const uploadsDir = path.resolve(__dirname, '..', 'uploads');
fs.ensureDirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random()*1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') return cb(new Error('Only PDFs are allowed'));
    cb(null, true);
  },
  limits: { fileSize: 100 * 1024 * 1024 }
});

function normalizeArabicNumbers(text){
  if(!text) return '';
  const arabic = '٠١٢٣٤٥٦٧٨٩';
  const western = '0123456789';
  return text.replace(/[٠-٩]/g, d => western[arabic.indexOf(d)])
             .replace(/[۰-۹]/g, d => western['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
}

function extractSerialFromName(text) {
  let name = text, serial = "";
  const end = text.match(/(.+?)\s+(\d{1,3})$/);
  const start = text.match(/^(\d{1,3})\s+(.+)$/);
  if (end) { name = end[1]; serial = end[2]; }
  else if (start) { serial = start[1]; name = start[2]; }
  return { name: name.trim(), serial };
}

function extractStudentsFromText(rawText) {
  const text = normalizeArabicNumbers(rawText);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // EXACT Apps Script faculty extraction
  const collegeMatch = text.match(/كلية\s+[^\n]+/);
  const faculty = collegeMatch ? collegeMatch[0].trim() : "";

  const blacklist = [
    'السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس',
    'ملاحظات','رقم المسلسل','الرقم القومي','الاسم','إدارة',
    'التربية','العسكرية','جامعة','كشف','التمام','كلية',
    'الدورة','الأسبوع','التاريخ','صفحة'
  ];

  const students = [];
  let currentStudent = { serial: "", name: "", id: "", college: faculty };
  let pendingSerial = "";

  lines.forEach(line => {
    if (blacklist.some(w => line.includes(w))) return;
    const cleanLine = normalizeArabicNumbers(line);
    const idMatch = cleanLine.match(/\b\d{14}\b/);
    if (idMatch) {
      if (currentStudent.id) students.push({
        national_id: Number(currentStudent.id),
        sequence_number: currentStudent.serial ? Number(currentStudent.serial) : 0,
        student_name: currentStudent.name.trim(),
        faculty_name: currentStudent.college || '',
        registered_research: false,
        finished_research: false
      });
      const nationalId = idMatch[0];
      let remainingText = cleanLine.replace(nationalId, '').trim();
      let { name, serial } = extractSerialFromName(remainingText);
      if (!serial && pendingSerial) {
        serial = pendingSerial;
        pendingSerial = "";
      }
      currentStudent = { serial, id: nationalId, name, college: faculty };
    } else {
      const isOnlyNumber = /^\d{1,3}$/.test(cleanLine);
      if (isOnlyNumber) {
        if (currentStudent.id && !currentStudent.serial) {
          currentStudent.serial = cleanLine;
        } else {
          pendingSerial = cleanLine;
        }
      } else if (currentStudent.id) {
        let { name, serial } = extractSerialFromName(cleanLine);
        currentStudent.name = (currentStudent.name + " " + name).trim();
        if (serial) currentStudent.serial = serial;
      }
    }
  });
  if (currentStudent.id) students.push({
    national_id: Number(currentStudent.id),
    sequence_number: currentStudent.serial ? Number(currentStudent.serial) : 0,
    student_name: currentStudent.name.trim(),
    faculty_name: currentStudent.college || '',
    registered_research: false,
    finished_research: false
  });
  return students;
}
// Google OAuth2 setup
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = path.resolve(__dirname, '../token.json');
const CREDENTIALS_PATH = path.resolve(__dirname, '../client_secret.json');

async function getOAuth2Client() {
  const credentials = JSON.parse(process.env.GOOGLE_CLIENT_SECRET_JSON);
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  if (!redirect_uris || !Array.isArray(redirect_uris) || !redirect_uris[0]) {
    throw new Error('No redirect_uris found in client_secret.json. Please download a valid OAuth2 client credentials file from Google Cloud Console.');
  }
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  "http://localhost:5173/oauth"
);
  // Try to load token
  try {
    const token = await fs.readFile(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (err) {
    // No token, prompt user
    const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const code = await new Promise(resolve => rl.question('Enter the code from that page here: ', answer => { rl.close(); resolve(answer); }));
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
    console.log('Token stored to', TOKEN_PATH);
    return oAuth2Client;
  }
}

router.post('/upload', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file' });
  const pdfPath = req.file.path;
  let fileId, docId;
  let drive;
  try {
    const auth = await getOAuth2Client();
    drive = google.drive({ version: 'v3', auth });
    // 1. Upload PDF to My Drive
    const fileMetadata = { name: req.file.originalname, mimeType: 'application/pdf' };
    const media = { mimeType: 'application/pdf', body: fs.createReadStream(pdfPath) };
    const uploadRes = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id'
    });
    fileId = uploadRes.data.id;

    // 2. Copy as Google Doc (to trigger OCR)
    const copyRes = await drive.files.copy({
      fileId,
      resource: { mimeType: 'application/vnd.google-apps.document', name: 'OCR_' + req.file.originalname },
      fields: 'id'
    });
    docId = copyRes.data.id;

    // 3. Export Google Doc as plain text
    const exportRes = await drive.files.export({ fileId: docId, mimeType: 'text/plain' }, { responseType: 'stream' });
    let text = '';
    exportRes.data.on('data', chunk => { text += chunk.toString(); });
    await new Promise(resolve => exportRes.data.on('end', resolve));

    // 4. Clean up: delete files from Drive
    await drive.files.delete({ fileId });
    await drive.files.delete({ fileId: docId });
    await fs.remove(pdfPath);

    // 5. Extract students and insert into DB
    const students = extractStudentsFromText(text);
    if (!students.length) return res.json({ success: true, inserted: 0 });
    const ids = students.map(s => s.national_id);
    const existing = await EnrolledStudent.find({ national_id: { $in: ids } }).select('national_id').lean();
    const existingIds = new Set(existing.map(e => Number(e.national_id)));
    const toInsert = students.filter(s => !existingIds.has(Number(s.national_id)));
    let inserted = 0;
    if (toInsert.length) {
      const result = await EnrolledStudent.insertMany(toInsert, { ordered: false });
      inserted = result.length;
    }
    return res.json({ success: true, inserted });
  } catch (err) {
    if (drive && fileId) try { await drive.files.delete({ fileId }); } catch {}
    if (drive && docId) try { await drive.files.delete({ fileId: docId }); } catch {}
    await fs.remove(pdfPath);
    console.error('Drive OCR error:', err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

module.exports = router;
