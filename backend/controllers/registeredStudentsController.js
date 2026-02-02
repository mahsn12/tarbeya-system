const RegisteredStudent = require('../models/RegisteredStudent');

// Get all registered students
exports.getAllRegisteredStudents = async (req, res) => {
  try {
    const students = await RegisteredStudent.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single registered student by ID
exports.getRegisteredStudentById = async (req, res) => {
  try {
    const student = await RegisteredStudent.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Registered student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get registered student by national ID
exports.getRegisteredStudentByNationalId = async (req, res) => {
  try {
    const student = await RegisteredStudent.findOne({ national_id: req.params.nationalId });
    if (!student) {
      return res.status(404).json({ message: 'Registered student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get registered students by team code
exports.getRegisteredStudentsByTeamCode = async (req, res) => {
  try {
    const students = await RegisteredStudent.find({ team_code: req.params.teamCode });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new registered student
exports.createRegisteredStudent = async (req, res) => {
  const student = new RegisteredStudent({
    national_id: req.body.national_id,
    sequence_number: req.body.sequence_number,
    student_name: req.body.student_name,
    phone_number: req.body.phone_number,
    faculty_name: req.body.faculty_name,
    research_name: req.body.research_name,
    educational_level: req.body.educational_level,
    team_code: req.body.team_code,
    registration_date: new Date()
  });

  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update registered student
exports.updateRegisteredStudent = async (req, res) => {
  try {
    const student = await RegisteredStudent.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Registered student not found' });
    }

    if (req.body.national_id != null) {
      student.national_id = req.body.national_id;
    }
    if (req.body.sequence_number != null) {
      student.sequence_number = req.body.sequence_number;
    }
    if (req.body.student_name != null) {
      student.student_name = req.body.student_name;
    }
    if (req.body.phone_number != null) {
      student.phone_number = req.body.phone_number;
    }
    if (req.body.faculty_name != null) {
      student.faculty_name = req.body.faculty_name;
    }
    if (req.body.research_name != null) {
      student.research_name = req.body.research_name;
    }
    if (req.body.educational_level != null) {
      student.educational_level = req.body.educational_level;
    }
    if (req.body.team_code != null) {
      student.team_code = req.body.team_code;
    }

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete registered student
exports.deleteRegisteredStudent = async (req, res) => {
  try {
    const student = await RegisteredStudent.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Registered student not found' });
    }

    await RegisteredStudent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Registered student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
