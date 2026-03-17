const express = require('express');
const router = express.Router();
const {
  getAllLeaves,
  getLeaveById,
  getLeavesByEmployee,
  getLeaveBalance,
  createLeave,
  updateLeaveStatus,
  deleteLeave
} = require('../controllers/leaveController');
const { validateLeaveRequest, validateLeaveUpdate } = require('../middleware/validation');

// Leave request CRUD
router.get('/leaves', getAllLeaves);
router.post('/leaves', validateLeaveRequest, createLeave);
router.get('/leaves/:id', getLeaveById);
router.patch('/leaves/:id/status', validateLeaveUpdate, updateLeaveStatus);
router.delete('/leaves/:id', deleteLeave);

// Employee-specific leave routes
router.get('/employees/:employeeId/leaves', getLeavesByEmployee);
router.get('/employees/:employeeId/leaves/balance', getLeaveBalance);

module.exports = router;
