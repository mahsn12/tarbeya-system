const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  faculty_name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  enrolled_students: {
    type: Number,
    default: 0
  },
  registered_students: {
    type: Number,
    default: 0
  },
  unregistered_students: {
    type: Number,
    default: 0
  },
  unregistered_unenrolled_students: {
    type: Number,
    default: 0
  },
  number_of_teams: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Faculty', facultySchema);
