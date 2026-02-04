require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const Config = require('./models/Config');
const Faculty = require('./models/Faculty');

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGO = process.env.MONGO_URI || process.env.MONGODB_URI;
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async ()=>{
    console.log('MongoDB connected');
    // Ensure Config singleton exists on startup
    try {
      const existing = await Config.findOne();
      if (!existing) {
        await Config.create({});
        console.log('Initialized Config singleton with defaults');
      }
    } catch (initErr) {
      console.error('Failed to initialize Config singleton:', initErr.message);
    }

    try {
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

        await Faculty.insertMany(initialFaculties.map(name => ({ faculty_name: name })));
        console.log('Seeded initial faculties');
      }
    } catch (seedErr) {
      console.error('Failed to seed faculties:', seedErr.message);
    }
  })
  .catch(err=>console.error('MongoDB connection error', err));

// Mount existing API routes
app.use('/api/ocr', require('./routes/ocrDriveUnified'));
app.use('/api/faculties', require('./routes/faculties'));
app.use('/api/research-topics', require('./routes/researchTopics'));
app.use('/api/enrolled-students', require('./routes/enrolledStudents'));
app.use('/api/registered-students', require('./routes/registeredStudents'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/config', require('./routes/config'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req,res)=>res.json({status:'OK'}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`);

  // Self-ping every 10 minutes to keep server alive
  setInterval(() => {
    fetch(`http://localhost:${PORT}/api/health`)
      .then(res => res.json())
      .then(data => console.log('Self-ping:', data))
      .catch(err => console.error('Self-ping failed:', err.message));
  }, 10 * 60 * 1000);
});
