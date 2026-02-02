const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Reset database (dangerous operation) - removes all records except Config
router.post('/reset', adminController.resetDatabase);

module.exports = router;
