const ResearchTopic = require('../models/ResearchTopic');

// Get all research topics
exports.getAllResearchTopics = async (req, res) => {
  try {
    const topics = await ResearchTopic.find();
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single research topic by ID
exports.getResearchTopicById = async (req, res) => {
  try {
    const topic = await ResearchTopic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: 'Research topic not found' });
    }
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new research topic
exports.createResearchTopic = async (req, res) => {
  const topic = new ResearchTopic({
    topic_name: req.body.topic_name
  });

  try {
    const newTopic = await topic.save();
    res.status(201).json(newTopic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update research topic
exports.updateResearchTopic = async (req, res) => {
  try {
    const topic = await ResearchTopic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: 'Research topic not found' });
    }

    if (req.body.topic_name != null) {
      topic.topic_name = req.body.topic_name;
    }

    const updatedTopic = await topic.save();
    res.json(updatedTopic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete research topic
exports.deleteResearchTopic = async (req, res) => {
  try {
    const topic = await ResearchTopic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: 'Research topic not found' });
    }

    await ResearchTopic.findByIdAndDelete(req.params.id);
    res.json({ message: 'Research topic deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
