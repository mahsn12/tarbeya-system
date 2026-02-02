const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teamsController');

// GET all teams
router.get('/', teamsController.getAllTeams);

// GET team by team code
router.get('/code/:teamCode', teamsController.getTeamByCode);

// GET single team by ID
router.get('/:id', teamsController.getTeamById);

// POST create new team
router.post('/', teamsController.createTeam);

// PUT update team
router.put('/:id', teamsController.updateTeam);

// DELETE team
router.delete('/:id', teamsController.deleteTeam);

module.exports = router;
