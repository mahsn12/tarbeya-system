const Faculty = require('../models/Faculty');
const EnrolledStudent = require('../models/EnrolledStudent');
const RegisteredStudent = require('../models/RegisteredStudent');
const Team = require('../models/Team');

async function updateFacultyStats(facultyName) {
  const enrolledIds = await EnrolledStudent.distinct('national_id', { faculty_name: facultyName });
  const registeredIds = await RegisteredStudent.distinct('national_id', { faculty_name: facultyName });
  const enrolledCount = enrolledIds.length;
  const registeredCount = registeredIds.length;
  const unregisteredCount = enrolledIds.filter(id => !registeredIds.includes(id)).length;
  const teamsCount = await Team.countDocuments({ faculty_name: facultyName });

  await Faculty.updateOne(
    { faculty_name: facultyName },
    {
      $set: {
        enrolled_students: enrolledCount,
        registered_students: registeredCount,
        unregistered_students: unregisteredCount,
        unregistered_unenrolled_students: 0,
        number_of_teams: teamsCount
      }
    }
  );
}

exports.updateFacultyStats = updateFacultyStats;

// Get all faculties
exports.getAllFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find();
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single faculty by ID
exports.getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new faculty
exports.createFaculty = async (req, res) => {
  const faculty = new Faculty({
    faculty_name: req.body.faculty_name
  });

  try {
    const newFaculty = await faculty.save();
    res.status(201).json(newFaculty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update faculty
exports.updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    if (req.body.faculty_name != null) {
      faculty.faculty_name = req.body.faculty_name;
    }

    const updatedFaculty = await faculty.save();
    res.json(updatedFaculty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete faculty
exports.deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
