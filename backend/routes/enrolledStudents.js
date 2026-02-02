const express = require('express');
const router = express.Router();
const enrolledStudentsController = require('../controllers/enrolledStudentsController');

// GET all enrolled students
router.get('/', enrolledStudentsController.getAllEnrolledStudents);

// GET enrolled student by national ID
router.get('/national/:nationalId', enrolledStudentsController.getEnrolledStudentByNationalId);

// GET single enrolled student by ID
router.get('/:id', enrolledStudentsController.getEnrolledStudentById);

// POST create new enrolled student
router.post('/', enrolledStudentsController.createEnrolledStudent);

// PUT update enrolled student
router.put('/:id', enrolledStudentsController.updateEnrolledStudent);

// DELETE enrolled student
router.delete('/:id', enrolledStudentsController.deleteEnrolledStudent);

module.exports = router;
