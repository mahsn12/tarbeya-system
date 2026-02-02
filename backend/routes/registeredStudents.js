const express = require('express');
const router = express.Router();
const registeredStudentsController = require('../controllers/registeredStudentsController');

// GET all registered students
router.get('/', registeredStudentsController.getAllRegisteredStudents);

// GET registered student by national ID
router.get('/national/:nationalId', registeredStudentsController.getRegisteredStudentByNationalId);

// GET registered students by team code
router.get('/team/:teamCode', registeredStudentsController.getRegisteredStudentsByTeamCode);

// GET single registered student by ID
router.get('/:id', registeredStudentsController.getRegisteredStudentById);

// POST create new registered student
router.post('/', registeredStudentsController.createRegisteredStudent);

// PUT update registered student
router.put('/:id', registeredStudentsController.updateRegisteredStudent);

// DELETE registered student
router.delete('/:id', registeredStudentsController.deleteRegisteredStudent);

module.exports = router;
