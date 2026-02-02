const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  faculty_name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Faculty', facultySchema);
