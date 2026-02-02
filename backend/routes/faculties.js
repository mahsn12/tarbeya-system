const express = require('express');
const router = express.Router();
const facultiesController = require('../controllers/facultiesController');

// GET all faculties
router.get('/', facultiesController.getAllFaculties);

// GET single faculty by ID
router.get('/:id', facultiesController.getFacultyById);

// POST create new faculty
router.post('/', facultiesController.createFaculty);

// PUT update faculty
router.put('/:id', facultiesController.updateFaculty);

// DELETE faculty
router.delete('/:id', facultiesController.deleteFaculty);

module.exports = router;
