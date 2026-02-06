const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const { Readable } = require('stream');
const { google } = require('googleapis');
const EnrolledStudent = require('../models/EnrolledStudent');

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter:(req,file,cb)=>{
    if(path.extname(file.originalname).toLowerCase()!=='.pdf')
      return cb(new Error('Only PDFs'));
    cb(null,true);
  }
});

const CREDS = require('../client_secret.json');
const TOKEN_PATH = path.resolve(__dirname,'../token.json');

const CLIENT_ID = (CREDS.installed||CREDS.web).client_id;
const CLIENT_SECRET = (CREDS.installed||CREDS.web).client_secret;
const REDIRECT = "http://localhost:5173/oauth";
const SCOPES = ['https://www.googleapis.com/auth/drive'];

function buildAuthUrl(){
  return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&access_type=offline&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT)}&scope=${SCOPES[0]}&prompt=consent`;
}

async function getClient(code){

  const oauth = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT);

  if(code){
    const {tokens} = await oauth.getToken(code);
    await fs.writeFile(TOKEN_PATH,JSON.stringify(tokens));
    oauth.setCredentials(tokens);
    return oauth;
  }

  try{
    const token = await fs.readFile(TOKEN_PATH);
    oauth.setCredentials(JSON.parse(token));
    return oauth;
  }catch{
    return null;
  }
}

function normalizeArabicNumbers(t){
  if(!t) return '';
  const a='٠١٢٣٤٥٦٧٨٩',w='0123456789';
  return t.replace(/[٠-٩]/g,d=>w[a.indexOf(d)]);
}

function extractStudents(text){

  const lines=normalizeArabicNumbers(text).split('\n').map(x=>x.trim()).filter(Boolean);

  const students=[];
  let cur={};

  lines.forEach(l=>{
    const id=l.match(/\b\d{14}\b/);

    if(id){
      if(cur.id) students.push(cur);
      cur={national_id:Number(id[0]),student_name:l.replace(id[0],'').trim(),sequence_number:0,faculty_name:'',registered_research:false,finished_research:false};
    }else if(cur.id){
      cur.student_name += " "+l;
    }
  });

  if(cur.id) students.push(cur);

  return students;
}

async function ocrDrive(drive,buffer,name){

  const up=await drive.files.create({
    resource:{name,mimeType:'application/pdf'},
    media:{mimeType:'application/pdf',body:Readable.from(buffer)},
    fields:'id'
  });

  const fileId=up.data.id;

  const copy=await drive.files.copy({
    fileId,
    resource:{mimeType:'application/vnd.google-apps.document'},
    fields:'id'
  });

  const docId=copy.data.id;

  const exp=await drive.files.export({fileId:docId,mimeType:'text/plain'},{responseType:'stream'});

  let text="";
  exp.data.on('data',c=>text+=c.toString());
  await new Promise(r=>exp.data.on('end',r));

  await drive.files.delete({fileId});
  await drive.files.delete({fileId:docId});

  return text;
}

router.post('/upload',upload.single('pdf'),async(req,res)=>{

  try{

    const code=req.body?.code;

    console.log("OAUTH CODE:", req.body.code);

    const auth=await getClient(code);

    if(!auth){
      return res.json({requiresAuth:true,authUrl:buildAuthUrl()});
    }

    const drive=google.drive({version:'v3',auth});

    const text=await ocrDrive(drive,req.file.buffer,req.file.originalname);

    const students=extractStudents(text);

    if(!students.length) return res.json({success:true,inserted:0});

    const ids=students.map(s=>s.national_id);
    const existing=await EnrolledStudent.find({national_id:{$in:ids}}).lean();
    const set=new Set(existing.map(e=>Number(e.national_id)));

    const toInsert=students.filter(s=>!set.has(s.national_id));

    let inserted=0;
    if(toInsert.length){
      const r=await EnrolledStudent.insertMany(toInsert,{ordered:false});
      inserted=r.length;
    }

    res.json({success:true,inserted});

  }catch(e){
    console.error(e);
    res.status(500).json({success:false,error:String(e)});
  }
});

module.exports=router;
