const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const facultiesRoutes = require('./routes/faculties');
const researchTopicsRoutes = require('./routes/researchTopics');
const enrolledStudentsRoutes = require('./routes/enrolledStudents');
const registeredStudentsRoutes = require('./routes/registeredStudents');
const teamsRoutes = require('./routes/teams');

app.use('/api/faculties', facultiesRoutes);
app.use('/api/research-topics', researchTopicsRoutes);
app.use('/api/enrolled-students', enrolledStudentsRoutes);
app.use('/api/registered-students', registeredStudentsRoutes);
app.use('/api/teams', teamsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
