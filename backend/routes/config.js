const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

// GET full config
router.get('/', configController.getConfig);

// GET/SET registration status
router.get('/registration-status', configController.getRegistrationStatus);
router.put('/registration-status', configController.setRegistrationStatus);

// GET/SET automatic assignment
router.get('/automatic-assignment', configController.getAutomaticAssignment);
router.put('/automatic-assignment', configController.setAutomaticAssignment);

// GET/SET team member limits
router.get('/team-limits', configController.getTeamMemberLimits);
router.put('/team-limits', configController.setTeamMemberLimits);

module.exports = router;
