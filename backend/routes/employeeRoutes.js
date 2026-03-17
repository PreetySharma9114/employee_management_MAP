const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { validateEmployee, validateEmployeeUpdate } = require('../middleware/validation');

router.get('/employees', employeeController.getAllEmployees);
router.get('/employees/:id', employeeController.getEmployeeById);
router.post('/employees', validateEmployee, employeeController.createEmployee);
router.put('/employees/:id', validateEmployeeUpdate, employeeController.updateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);
router.get('/employees/:id/salary', employeeController.calculateSalary);

module.exports = router;