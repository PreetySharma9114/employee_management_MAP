const express = require('express');
const router = express.Router();
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
const { validateDepartment, validateDepartmentUpdate } = require('../middleware/validation');

router.get('/departments', getAllDepartments);
router.post('/departments', validateDepartment, createDepartment);
router.get('/departments/:id', getDepartmentById);
router.put('/departments/:id', validateDepartmentUpdate, updateDepartment);
router.delete('/departments/:id', deleteDepartment);

module.exports = router;
