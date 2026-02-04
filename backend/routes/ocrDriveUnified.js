const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { Readable } = require('stream');
const { google } = require('googleapis');
const EnrolledStudent = require('../models/EnrolledStudent');

// Memory storage for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') return cb(new Error('Only PDFs are allowed'));
    cb(null, true);
  },
  limits: { fileSize: 100 * 1024 * 1024 }
});

// Paths for OAuth credentials and token
const TOKEN_PATH = path.resolve(__dirname, '../token.json');
const CREDENTIALS_PATH = path.resolve(__dirname, '../client_secret.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

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
      if (!serial && pendingSerial) { serial = pendingSerial; pendingSerial = ""; }
      currentStudent = { serial, id: nationalId, name, college: faculty };
    } else {
      const isOnlyNumber = /^\d{1,3}$/.test(cleanLine);
      if (isOnlyNumber) {
        if (currentStudent.id && !currentStudent.serial) currentStudent.serial = cleanLine;
        else pendingSerial = cleanLine;
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

async function getOAuth2Client() {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const credentials = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  if (!redirect_uris || !Array.isArray(redirect_uris) || !redirect_uris[0]) {
    throw new Error('No redirect_uris found in client_secret.json. Please add http://localhost to Authorized redirect URIs and re-download the credentials.');
  }
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  return oAuth2Client;
}

async function loadToken(oAuth2Client) {
  try {
    const token = await fs.readFile(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return true;
  } catch {
    return false;
  }
}

async function saveToken(oAuth2Client, code) {
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
}

function getAuthUrl(oAuth2Client) {
  return oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES, prompt: 'consent' });
}

function shouldReauth(err) {
  const msg = String(err && err.message || '').toLowerCase();
  const status = err && (err.code || err.status || (err.response && err.response.status));
  if (status === 401) return true;
  if (msg.includes('invalid_grant') || msg.includes('invalid_token')) return true;
  if (msg.includes('invalid authentication credentials')) return true;
  if (msg.includes('expired')) return true;
  return false;
}

async function ocrWithDrive(drive, buffer, originalName) {
  // Upload PDF (from memory) to My Drive
  const fileMetadata = { name: originalName, mimeType: 'application/pdf' };
  const media = { mimeType: 'application/pdf', body: Readable.from(buffer) };
  const uploadRes = await drive.files.create({ resource: fileMetadata, media, fields: 'id' });
  const fileId = uploadRes.data.id;

  // Copy as Google Doc (triggers OCR)
  const copyRes = await drive.files.copy({ fileId, resource: { mimeType: 'application/vnd.google-apps.document', name: 'OCR_' + originalName }, fields: 'id' });
  const docId = copyRes.data.id;

  // Export Google Doc as plain text
  const exportRes = await drive.files.export({ fileId: docId, mimeType: 'text/plain' }, { responseType: 'stream' });
  let text = '';
  exportRes.data.on('data', chunk => { text += chunk.toString(); });
  await new Promise(resolve => exportRes.data.on('end', resolve));

  // Cleanup remote files
  try { await drive.files.delete({ fileId }); } catch {}
  try { await drive.files.delete({ fileId: docId }); } catch {}

  return text;
}

router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const oAuth2Client = await getOAuth2Client();

    // If code provided, exchange and store token first
    if (req.body && req.body.code) {
      await saveToken(oAuth2Client, req.body.code);
    }

    // Load (or reload) token
    const hasToken = await loadToken(oAuth2Client);
    if (!hasToken) {
      const authUrl = getAuthUrl(oAuth2Client);
      return res.status(200).json({ requiresAuth: true, authUrl });
    }

    // Ensure file present
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded. Send multipart/form-data with field name "pdf".' });
    }

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    // Quick token validity check to avoid exposing auth errors to caller
    try {
      await drive.files.list({ pageSize: 1, fields: 'files(id)' });
    } catch (e) {
      if (shouldReauth(e)) {
        const authUrl = getAuthUrl(oAuth2Client);
        return res.status(200).json({ requiresAuth: true, authUrl });
      }
      throw e;
    }

    // Run OCR via Drive
    const text = await ocrWithDrive(drive, req.file.buffer, req.file.originalname);

    // Parse students (Apps Script equivalent)
    const students = extractStudentsFromText(text);
    if (!students.length) return res.json({ requiresAuth:false, success: true, inserted: 0 });

    // Deduplicate and insert
    const ids = students.map(s => s.national_id);
    const existing = await EnrolledStudent.find({ national_id: { $in: ids } }).select('national_id').lean();
    const existingIds = new Set(existing.map(e => Number(e.national_id)));
    const toInsert = students.filter(s => !existingIds.has(Number(s.national_id)));

    let inserted = 0;
    if (toInsert.length) {
      const result = await EnrolledStudent.insertMany(toInsert, { ordered: false });
      inserted = result.length;
    }

    return res.json({ requiresAuth:false, success: true, inserted });
  } catch (err) {
    // Centralized re-auth handling for any Google auth failures
    if (shouldReauth(err)) {
      try {
        const oAuth2Client = await getOAuth2Client();
        const authUrl = getAuthUrl(oAuth2Client);
        return res.status(200).json({ requiresAuth: true, authUrl });
      } catch {}
    }
    console.error('Unified Drive OCR error:', err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

module.exports = router;
