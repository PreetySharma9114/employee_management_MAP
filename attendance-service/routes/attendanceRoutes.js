const express = require('express');
const router = express.Router();
const {
  getAllRecords,
  getRecordById,
  getEmployeeSummary,
  checkIn,
  checkOut,
  deleteRecord
} = require('../controllers/attendanceController');
const { validateCheckIn, validateCheckOut } = require('../middleware/validation');

// Attendance CRUD
router.get('/attendance', getAllRecords);
router.post('/attendance/checkin', validateCheckIn, checkIn);
router.get('/attendance/:id', getRecordById);
router.patch('/attendance/:id/checkout', validateCheckOut, checkOut);
router.delete('/attendance/:id', deleteRecord);

// Employee-specific routes
router.get('/employees/:employeeId/attendance/summary', getEmployeeSummary);

module.exports = router;
