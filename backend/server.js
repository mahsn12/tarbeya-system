require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const Config = require('./models/Config');
const Faculty = require('./models/Faculty');

// ================= MIDDLEWARE =================

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= MONGODB =================

const MONGO = process.env.MONGO_URI || process.env.MONGODB_URI;

mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {

  console.log('MongoDB connected');

  // Config singleton
  const existing = await Config.findOne();
  if (!existing) {
    await Config.create({});
    console.log('Config initialized');
  }

  // Faculty seed
  const count = await Faculty.countDocuments();

  if (count === 0) {
    const initialFaculties = [
      'كلية البنات',
      'كلية الهندسة',
      'كلية الاداب(تعليم مفتوح)',
      'كلية حقوق (تعليم مفتوح)',
      'كلية تجارة (تعليم مفتوح)',
      'كلية زراعة (تعليم مفتوح)',
      'محول من جامعة اخرى',
      'الجامعة المصرية للتعلم الالكتروني الاهلية',
      'كلية الآداب',
      'كلية الحقوق',
      'كلية الاثار',
      'كلية العلوم',
      'كلية التجارة',
      'كلية الحاسبات والمعلومات',
      'كلية الأعلام',
      'كلية الصيدلة',
      'كلية طب الاسنان',
      'كلية الالسن',
      'كلية الطب',
      'كلية التمريض',
      'معهد فني تمريض بالدمرداش',
      'كلية الزراعة',
      'الطب البيطري',
      'كلية التربية',
      'التربية النوعية',
      'معهد فني تمريض تخصصي',
      'الجامعة المصرية للتعلم الالكتروني'
    ];

    await Faculty.insertMany(initialFaculties.map(f => ({ faculty_name: f })));
    console.log('Faculties seeded');
  }

})
.catch(err => console.error("Mongo error:", err));

// ================= ROUTES =================

app.use('/api/ocr', require('./routes/ocrDriveUnified'));
app.use('/api/faculties', require('./routes/faculties'));
app.use('/api/research-topics', require('./routes/researchTopics'));
app.use('/api/enrolled-students', require('./routes/enrolledStudents'));
app.use('/api/registered-students', require('./routes/registeredStudents'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/config', require('./routes/config'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/auth', require('./routes/Auth'));

// ================= HEALTH =================

app.get('/api/health', (req,res)=>{
  res.json({status:'OK'});
});

// ================= START =================

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
