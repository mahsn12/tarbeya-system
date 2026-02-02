const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const Config = require('./models/Config');

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
