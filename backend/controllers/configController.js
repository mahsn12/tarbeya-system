const Config = require('../models/Config');

// Helper function to get or create config (singleton pattern)
const getOrCreateConfig = async () => {
  let config = await Config.findOne();
  if (!config) {
    config = await Config.create({});
  }
  return config;
};

// Get full config
exports.getConfig = async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get registration status
exports.getRegistrationStatus = async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json({ registration_status: config.registration_status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Set registration status
exports.setRegistrationStatus = async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    if (req.body.registration_status == null) {
      return res.status(400).json({ message: 'registration_status is required' });
    }
    config.registration_status = req.body.registration_status;
    await config.save();
    res.json({ registration_status: config.registration_status });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get automatic assignment
exports.getAutomaticAssignment = async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json({ automatic_assignment: config.automatic_assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Set automatic assignment
exports.setAutomaticAssignment = async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    if (req.body.automatic_assignment == null) {
      return res.status(400).json({ message: 'automatic_assignment is required' });
    }
    config.automatic_assignment = req.body.automatic_assignment;
    await config.save();
    res.json({ automatic_assignment: config.automatic_assignment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get team member limits
exports.getTeamMemberLimits = async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json({
      min_team_members: config.min_team_members,
      max_team_members: config.max_team_members
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Set team member limits
exports.setTeamMemberLimits = async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    
    const min = req.body.min_team_members;
    const max = req.body.max_team_members;

    if (min != null && max != null && min > max) {
      return res.status(400).json({ message: 'min_team_members cannot be greater than max_team_members' });
    }

    if (min != null) {
      if (min < 1) {
        return res.status(400).json({ message: 'min_team_members must be at least 1' });
      }
      config.min_team_members = min;
    }

    if (max != null) {
      if (max < 1) {
        return res.status(400).json({ message: 'max_team_members must be at least 1' });
      }
      config.max_team_members = max;
    }

    // Validate after update
    if (config.min_team_members > config.max_team_members) {
      return res.status(400).json({ message: 'min_team_members cannot be greater than max_team_members' });
    }

    await config.save();
    res.json({
      min_team_members: config.min_team_members,
      max_team_members: config.max_team_members
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Export helper for use in other controllers
exports.getOrCreateConfig = getOrCreateConfig;
