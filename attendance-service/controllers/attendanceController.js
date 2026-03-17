const Attendance = require('../models/Attendance');
const { publish } = require('../messaging/producer');

const getAllRecords = (req, res) => {
  try {
    const { employeeId, date, month } = req.query;
    const records = Attendance.getAll({ employeeId, date, month });
    res.json({ success: true, data: records, count: records.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance records' });
  }
};

const getRecordById = (req, res) => {
  try {
    const record = Attendance.getById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance record' });
  }
};

const getEmployeeSummary = (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ success: false, message: 'Query param "month" (YYYY-MM) is required' });
    }
    const summary = Attendance.getMonthlySummary(req.params.employeeId, month);
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch monthly summary' });
  }
};

const checkIn = async (req, res) => {
  try {
    const { employeeId, date } = req.body;

    const existing = Attendance.getByEmployeeAndDate(employeeId, date);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Employee ${employeeId} already has an attendance record for ${date}`
      });
    }

    const record = Attendance.create(req.body);

    await publish('attendance.events', 'attendance.checkin', record).catch(
      (err) => console.warn('[Attendance] Could not publish attendance.checkin event:', err.message)
    );

    res.status(201).json({ success: true, data: record, message: 'Check-in recorded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record check-in' });
  }
};

const checkOut = async (req, res) => {
  try {
    const record = Attendance.getById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    if (record.checkOut) {
      return res.status(409).json({ success: false, message: 'Employee has already checked out' });
    }

    const updated = Attendance.checkOut(req.params.id, req.body);

    await publish('attendance.events', 'attendance.checkout', updated).catch(
      (err) => console.warn('[Attendance] Could not publish attendance.checkout event:', err.message)
    );

    res.json({ success: true, data: updated, message: 'Check-out recorded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record check-out' });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const record = Attendance.delete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    res.json({ success: true, data: record, message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete attendance record' });
  }
};

module.exports = { getAllRecords, getRecordById, getEmployeeSummary, checkIn, checkOut, deleteRecord };
