const mongoose = require('mongoose');

const registeredStudentSchema = new mongoose.Schema({
  national_id: {
    type: Number,
    required: true,
    unique: true
  },
  sequence_number: {
    type: Number,
    required: true
  },
  student_name: {
    type: String,
    required: true,
    trim: true
  },
  phone_number: {
    type: String,
    required: true,
    trim: true
  },
  faculty_name: {
    type: String,
    required: true,
    trim: true
  },
  research_name: {
    type: String,
    required: true,
    trim: true
  },
  educational_level: {
    type: String,
    required: true,
    trim: true
  },
  team_code: {
    type: String,
    required: true,
    trim: true
  },
  registration_date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RegisteredStudent', registeredStudentSchema);
