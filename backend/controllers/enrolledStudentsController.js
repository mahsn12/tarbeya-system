const EnrolledStudent = require('../models/EnrolledStudent');
const { updateFacultyStats } = require('./facultiesController');

// Get all enrolled students
exports.getAllEnrolledStudents = async (req, res) => {
  try {
    const students = await EnrolledStudent.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single enrolled student by ID
exports.getEnrolledStudentById = async (req, res) => {
  try {
    const student = await EnrolledStudent.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Enrolled student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get enrolled student by national ID
exports.getEnrolledStudentByNationalId = async (req, res) => {
  try {
    const student = await EnrolledStudent.findOne({ national_id: req.params.nationalId });
    if (!student) {
      return res.status(404).json({ message: 'Enrolled student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new enrolled student
exports.createEnrolledStudent = async (req, res) => {
  const student = new EnrolledStudent({
    national_id: req.body.national_id,
    sequence_number: req.body.sequence_number,
    student_name: req.body.student_name,
    faculty_name: req.body.faculty_name,
    registered_research: req.body.registered_research || false,
    finished_research: req.body.finished_research || false
  });

  try {
    const newStudent = await student.save();
    await updateFacultyStats(newStudent.faculty_name);
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update enrolled student
exports.updateEnrolledStudent = async (req, res) => {
  try {
    const student = await EnrolledStudent.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Enrolled student not found' });
    }

    const prevFaculty = student.faculty_name;
    if (req.body.national_id != null) {
      student.national_id = req.body.national_id;
    }
    if (req.body.sequence_number != null) {
      student.sequence_number = req.body.sequence_number;
    }
    if (req.body.student_name != null) {
      student.student_name = req.body.student_name;
    }
    if (req.body.faculty_name != null) {
      student.faculty_name = req.body.faculty_name;
    }
    if (req.body.registered_research != null) {
      student.registered_research = req.body.registered_research;
    }
    if (req.body.finished_research != null) {
      student.finished_research = req.body.finished_research;
    }

    const updatedStudent = await student.save();
    await updateFacultyStats(updatedStudent.faculty_name);
    if (prevFaculty && prevFaculty !== updatedStudent.faculty_name) {
      await updateFacultyStats(prevFaculty);
    }
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete enrolled student
exports.deleteEnrolledStudent = async (req, res) => {
  try {
    const student = await EnrolledStudent.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Enrolled student not found' });
    }

    await EnrolledStudent.findByIdAndDelete(req.params.id);
    await updateFacultyStats(student.faculty_name);
    res.json({ message: 'Enrolled student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
