const express = require('express');
const router = express.Router();
const researchTopicsController = require('../controllers/researchTopicsController');

// GET all research topics
router.get('/', researchTopicsController.getAllResearchTopics);

// GET single research topic by ID
router.get('/:id', researchTopicsController.getResearchTopicById);

// POST create new research topic
router.post('/', researchTopicsController.createResearchTopic);

// PUT update research topic
router.put('/:id', researchTopicsController.updateResearchTopic);

// DELETE research topic
router.delete('/:id', researchTopicsController.deleteResearchTopic);

module.exports = router;
