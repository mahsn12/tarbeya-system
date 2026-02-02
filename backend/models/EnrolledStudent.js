const mongoose = require('mongoose');

const enrolledStudentSchema = new mongoose.Schema({
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
  faculty_name: {
    type: String,
    required: true,
    trim: true
  },
  registered_research: {
    type: Boolean,
    default: false
  },
  finished_research: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EnrolledStudent', enrolledStudentSchema);
