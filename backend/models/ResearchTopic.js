const mongoose = require('mongoose');

const researchTopicSchema = new mongoose.Schema({
  topic_name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ResearchTopic', researchTopicSchema);
