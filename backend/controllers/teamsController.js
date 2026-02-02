const Team = require('../models/Team');
const { getOrCreateConfig } = require('./configController');
const { updateFacultyStats } = require('./facultiesController');

// Helper function to validate team member count
const validateTeamMemberCount = async (memberCount) => {
  const config = await getOrCreateConfig();
  if (memberCount < config.min_team_members) {
    return { valid: false, message: `Team must have at least ${config.min_team_members} member(s)` };
  }
  if (memberCount > config.max_team_members) {
    return { valid: false, message: `Team cannot have more than ${config.max_team_members} member(s)` };
  }
  return { valid: true };
};

// Get all teams
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single team by ID
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get team by team code
exports.getTeamByCode = async (req, res) => {
  try {
    const team = await Team.findOne({ team_code: req.params.teamCode });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new team
exports.createTeam = async (req, res) => {
  try {
    const studentNames = req.body.student_names || [];
    const nationalIds = req.body.national_ids || [];
    
    // Use the larger array length as member count
    const memberCount = Math.max(studentNames.length, nationalIds.length);
    
    // Validate team member count against config
    const validation = await validateTeamMemberCount(memberCount);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const team = new Team({
      team_code: req.body.team_code,
      faculty_name: req.body.faculty_name,
      student_names: studentNames,
      national_ids: nationalIds,
      leader_national_id: nationalIds.length > 0 ? nationalIds[0] : undefined,
      research_topics: req.body.research_topics || []
    });

    const newTeam = await team.save();
    await updateFacultyStats(newTeam.faculty_name);
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update team
exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Prepare updated values
    const studentNames = req.body.student_names != null ? req.body.student_names : team.student_names;
    const nationalIds = req.body.national_ids != null ? req.body.national_ids : team.national_ids;
    
    // Calculate member count from updated values
    const memberCount = Math.max(studentNames.length, nationalIds.length);
    
    // Validate team member count against config
    const validation = await validateTeamMemberCount(memberCount);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    if (req.body.team_code != null) {
      team.team_code = req.body.team_code;
    }
    const prevFaculty = team.faculty_name;
    if (req.body.faculty_name != null) {
      team.faculty_name = req.body.faculty_name;
    }
    if (req.body.student_names != null) {
      team.student_names = req.body.student_names;
    }
    if (req.body.national_ids != null) {
      team.national_ids = req.body.national_ids;
      // Automatically set leader to first id on update when national_ids are provided
      team.leader_national_id = team.national_ids.length > 0 ? team.national_ids[0] : undefined;
    }
    if (req.body.research_topics != null) {
      team.research_topics = req.body.research_topics;
    }

    const updatedTeam = await team.save();
    await updateFacultyStats(updatedTeam.faculty_name);
    if (prevFaculty && prevFaculty !== updatedTeam.faculty_name) {
      await updateFacultyStats(prevFaculty);
    }
    res.json(updatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete team
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    await Team.findByIdAndDelete(req.params.id);
    await updateFacultyStats(team.faculty_name);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
