const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  team_code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  faculty_name: {
    type: String,
    required: true,
    trim: true
  },
  student_names: {
    type: [String],
    default: []
  },
  national_numbers: {
    type: [String],
    default: []
  },
  research_topics: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);
