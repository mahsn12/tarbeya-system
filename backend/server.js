require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGO = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tarbeya_system';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>console.log('MongoDB connected'))
  .catch(err=>console.error('MongoDB connection error', err));

// Mount existing API routes
app.use('/api/ocr', require('./routes/ocr'));
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
app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));
