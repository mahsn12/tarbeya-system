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
  national_ids: {
    type: [Number],
    default: []
  },
  leader_national_id: {
    type: Number
  },
  research_topics: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Automatically set leader_national_id to the first national_id if not explicitly provided
teamSchema.pre('save', function (next) {
  const ids = Array.isArray(this.national_ids) ? this.national_ids : [];
  if (ids.length > 0) {
    if (!this.leader_national_id || !ids.includes(this.leader_national_id)) {
      this.leader_national_id = ids[0];
    }
  } else {
    this.leader_national_id = undefined;
  }
  next();
});

module.exports = mongoose.model('Team', teamSchema);
