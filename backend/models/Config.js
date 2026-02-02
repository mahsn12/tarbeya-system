const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  registration_status: {
    type: Boolean,
    default: false
  },
  automatic_assignment: {
    type: Boolean,
    default: false
  },
  max_team_members: {
    type: Number,
    default: 5
  },
  min_team_members: {
    type: Number,
    default: 2
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Config', configSchema);
