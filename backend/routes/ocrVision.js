const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { convert } = require('pdf-poppler');
const vision = require('@google-cloud/vision');
const EnrolledStudent = require('../models/EnrolledStudent');

// Memory storage: keep upload in RAM, avoid persistent files
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') return cb(new Error('Only PDFs are allowed'));
    cb(null, true);
  },
  limits: { fileSize: 100 * 1024 * 1024 }
});

async function pdfBufferToImages(buffer){
  const tmpPdf = path.join(os.tmpdir(), 'tarbeya_pdf_' + Date.now() + '_' + Math.round(Math.random()*1e9) + '.pdf');
  const outDir = path.join(os.tmpdir(), 'tarbeya_pdf_out_' + Date.now() + '_' + Math.round(Math.random()*1e9));
  await fs.ensureDir(outDir);
  try{
    await fs.writeFile(tmpPdf, buffer);
    const opts = { format: 'png', out_dir: outDir, out_prefix: 'page', page: null };
    try{ await convert(tmpPdf, opts); }
    catch(e){ throw new Error('pdf-poppler conversion failed: ' + (e.message || String(e))); }
    const images = (await fs.readdir(outDir)).filter(f=>f.toLowerCase().endsWith('.png')).map(f=>path.join(outDir,f)).sort();
    return { images, outDir, tmpPdf };
  }catch(err){
    try{ await fs.remove(tmpPdf) }catch(e){}
    try{ await fs.remove(outDir) }catch(e){}
    throw err;
  }
}

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

router.post('/upload', upload.single('pdf'), async (req,res)=>{
  if(!req.file) return res.status(400).json({ success:false, error:'No file' });
  let tempDir=null; let tmpPdf=null;
  try{
    // Convert uploaded PDF buffer to images (in temp dir)
    const { images, outDir, tmpPdf: tmpPdfPath } = await pdfBufferToImages(req.file.buffer);
    tempDir = outDir; tmpPdf = tmpPdfPath;
    if(!images.length) throw new Error('No images generated from PDF');

    // Cloud Vision client with explicit credentials
    const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve(__dirname, '../service_account.json');
    const client = new vision.ImageAnnotatorClient({ keyFilename: keyFile });

    let fullText='';
    for(const img of images){
      try{
        const content = await fs.readFile(img);
        const [result] = await client.documentTextDetection({ image: { content }, imageContext: { languageHints: ['ar'] } });
        const pageText = result.fullTextAnnotation ? result.fullTextAnnotation.text : '';
        fullText += '\n' + pageText;
      }catch(e){ console.warn('page OCR error', e.message); }
    }

    const students = extractStudentsFromText(fullText);
    if(!students.length){ if(tmpPdf) try{ await fs.remove(tmpPdf) }catch(e){} if(tempDir) await fs.remove(tempDir); return res.json({ success:true, inserted:0 }); }

    const ids = students.map(s=>s.national_id);
    const existing = await EnrolledStudent.find({ national_id: { $in: ids } }).select('national_id').lean();
    const existingIds = new Set(existing.map(e=>Number(e.national_id)));
    const toInsert = students.filter(s=>!existingIds.has(Number(s.national_id)));

    let inserted=0;
    if(toInsert.length){
      const result = await EnrolledStudent.insertMany(toInsert, { ordered:false });
      inserted = result.length;
    }

    if(tmpPdf) try{ await fs.remove(tmpPdf) }catch(e){}
    if(tempDir) await fs.remove(tempDir);
    return res.json({ success:true, inserted });
  }catch(err){
    if(tmpPdf) try{ await fs.remove(tmpPdf) }catch(e){}
    if(tempDir) try{ await fs.remove(tempDir) }catch(e){}
    console.error('Vision OCR error:', err);
    return res.status(500).json({ success:false, error: err.message || String(err) });
  }
});

module.exports = router;
