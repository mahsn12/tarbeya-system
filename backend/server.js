const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const Config = require('./models/Config');
const Faculty = require('./models/Faculty');

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
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
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const facultiesRoutes = require('./routes/faculties');
const researchTopicsRoutes = require('./routes/researchTopics');
const enrolledStudentsRoutes = require('./routes/enrolledStudents');
const registeredStudentsRoutes = require('./routes/registeredStudents');
const teamsRoutes = require('./routes/teams');
const configRoutes = require('./routes/config');
const adminRoutes = require('./routes/admin');

app.use('/api/faculties', facultiesRoutes);
app.use('/api/research-topics', researchTopicsRoutes);
app.use('/api/enrolled-students', enrolledStudentsRoutes);
app.use('/api/registered-students', registeredStudentsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/config', configRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
