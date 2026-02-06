const Faculty = require('../models/Faculty');
const ResearchTopic = require('../models/ResearchTopic');
const EnrolledStudent = require('../models/EnrolledStudent');
const RegisteredStudent = require('../models/RegisteredStudent');
const Team = require('../models/Team');
const Config = require('../models/Config');

// Reset database by removing all records EXCEPT Config singleton
exports.resetDatabase = async (req, res) => {
  try {
    const results = await Promise.all([
      ResearchTopic.deleteMany({}),
      EnrolledStudent.deleteMany({}),
      RegisteredStudent.deleteMany({}),
      Team.deleteMany({})
      // Intentionally NOT deleting Config
    ]);

    const summary = {
      research_topics_deleted: results[1].deletedCount || 0,
      enrolled_students_deleted: results[2].deletedCount || 0,
      registered_students_deleted: results[3].deletedCount || 0,
      teams_deleted: results[4].deletedCount || 0,
    };

    const config = await Config.findOne();

    res.json({
      message: 'Database reset complete. Config and Faculties preserved.',
      summary,
      config_preserved: !!config,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
