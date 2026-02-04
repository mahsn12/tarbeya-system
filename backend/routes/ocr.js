const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { convert } = require('pdf-poppler');
const Tesseract = require('tesseract.js');

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

async function pdfToImages(pdfPath){
  // Copy PDF to an ASCII-only temp file to avoid poppler issues with Unicode paths on Windows
  const tmpPdf = path.join(os.tmpdir(), 'tarbeya_pdf_' + Date.now() + '_' + Math.round(Math.random()*1e9) + path.extname(pdfPath));
  const outDir = path.join(os.tmpdir(), 'tarbeya_pdf_out_' + Date.now() + '_' + Math.round(Math.random()*1e9));
  await fs.ensureDir(outDir);
  try{
    await fs.copy(pdfPath, tmpPdf);
    const opts = {
      format: 'png',
      out_dir: outDir,
      out_prefix: 'page',
      page: null
    };
    try{
      await convert(tmpPdf, opts);
    }catch(e){
      throw new Error('pdf-poppler conversion failed: ' + (e.message || String(e)));
    }
    const images = (await fs.readdir(outDir)).filter(f=>f.toLowerCase().endsWith('.png')).map(f=>path.join(outDir,f)).sort();
    return { images, outDir, tmpPdf };
  }catch(err){
    // cleanup on error
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

function extractStudentsFromText(rawText){
  const text = normalizeArabicNumbers(rawText);
  const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);

  // find faculty line
  let faculty = '';
  for(const l of lines){ if(l.includes('كلية')){ faculty = l.match(/كلية\s*[:\-–]?\s*(.*)/)?.[1] || l; break; } }

  const blacklist = ['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','ملاحظات','رقم المسلسل','الرقم القومي','الاسم','إدارة','التربية','العسكرية','جامعة','كشف','التمام','كلية','الدورة','الأسبوع','التاريخ','صفحة'];

  const ids = [];
  const idRegex = /\b\d{14}\b/g;
  let match;
  while((match = idRegex.exec(text))){ ids.push({id:match[0], index:match.index}); }

  const students = [];
  for(const item of ids){
    let lineIndex = -1;
    for(let i=0;i<lines.length;i++){ if(lines[i].includes(item.id)){ lineIndex = i; break; } }
    if(lineIndex === -1) continue;

    const context = [];
    for(let d=Math.max(0,lineIndex-2); d<=Math.min(lines.length-1,lineIndex+2); d++) context.push(lines[d]);
    const ctx = context.join(' ');
    if(blacklist.some(w=>ctx.includes(w))) continue;

    const seqMatch = ctx.match(/\b(\d{1,3})\b/);
    const serial = seqMatch ? seqMatch[1] : 0;

    let candidate = ctx.replace(item.id,'').replace(/الرقم\s*القومي/g,'').replace(/\b\d{1,3}\b/g,'').trim();
    const nameMatch = candidate.match(/[\u0600-\u06FF\s]{3,80}/);
    const name = nameMatch ? nameMatch[0].trim() : '';

    if(name && item.id){
      students.push({
        national_id: Number(item.id),
        sequence_number: serial? Number(serial):0,
        student_name: name,
        faculty_name: faculty || '',
        registered_research: false,
        finished_research: false
      });
    }
  }
  return students;
}

router.post('/upload', upload.single('pdf'), async (req,res)=>{
  if(!req.file) return res.status(400).json({ success:false, error:'No file' });
  const pdfPath = req.file.path;
  let tempDir=null;
  try{
    const { images, outDir, tmpPdf } = await pdfToImages(pdfPath);
    tempDir = outDir;
    if(!images.length) throw new Error('No images generated from PDF');

    let fullText='';
    for(const img of images){
      try{
        const { data:{ text }} = await Tesseract.recognize(img, 'ara');
        fullText += '\n' + text;
      }catch(e){ console.warn('page OCR error', e.message); }
    }

    const students = extractStudentsFromText(fullText);
    if(!students.length){ await fs.remove(pdfPath); if(tempDir) await fs.remove(tempDir); return res.json({ success:true, inserted:0 }); }

    const ids = students.map(s=>s.national_id);
    const existing = await EnrolledStudent.find({ national_id: { $in: ids } }).select('national_id').lean();
    const existingIds = new Set(existing.map(e=>Number(e.national_id)));
    const toInsert = students.filter(s=>!existingIds.has(Number(s.national_id)));

    let inserted=0;
    if(toInsert.length){
      const result = await EnrolledStudent.insertMany(toInsert, { ordered:false });
      inserted = result.length;
    }

    // remove original upload, the temp copied pdf, and the temp images dir
    try{ await fs.remove(pdfPath) }catch(e){}
    if(tmpPdf) try{ await fs.remove(tmpPdf) }catch(e){}
    if(tempDir) await fs.remove(tempDir);

    return res.json({ success:true, inserted });
  }catch(err){
    try{ await fs.remove(pdfPath) }catch(e){}
    // also attempt to remove the temp copy (if it was created)
    try{ if(typeof tmpPdf!=='undefined' && tmpPdf) await fs.remove(tmpPdf) }catch(e){}
    if(tempDir) try{ await fs.remove(tempDir) }catch(e){}
    console.error('OCR error:', err);
    return res.status(500).json({ success:false, error: err.message || String(err) });
  }
});

module.exports = router;
