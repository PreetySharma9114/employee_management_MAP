const LeaveRequest = require('../models/LeaveRequest');
const { publish } = require('../messaging/producer');

const getAllLeaves = (req, res) => {
  try {
    const { employeeId, status, type } = req.query;
    let leaves = LeaveRequest.getAll();

    if (employeeId) leaves = leaves.filter((l) => l.employeeId === String(employeeId));
    if (status) leaves = leaves.filter((l) => l.status === status);
    if (type) leaves = leaves.filter((l) => l.type === type);

    res.json({ success: true, data: leaves, count: leaves.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leave requests' });
  }
};

const getLeaveById = (req, res) => {
  try {
    const leave = LeaveRequest.getById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    res.json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leave request' });
  }
};

const getLeavesByEmployee = (req, res) => {
  try {
    const leaves = LeaveRequest.getByEmployeeId(req.params.employeeId);
    res.json({ success: true, data: leaves, count: leaves.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch employee leaves' });
  }
};

const getLeaveBalance = (req, res) => {
  try {
    const balance = LeaveRequest.getBalance(req.params.employeeId);
    res.json({ success: true, data: balance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leave balance' });
  }
};

const createLeave = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ success: false, message: 'endDate must be after startDate' });
    }

    const leave = LeaveRequest.create(req.body);

    await publish('leave.events', 'leave.created', leave).catch(
      (err) => console.warn('[Leave] Could not publish leave.created event:', err.message)
    );

    res.status(201).json({ success: true, data: leave, message: 'Leave request submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create leave request' });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const { status, reviewNote, reviewedBy } = req.body;
    const leave = LeaveRequest.updateStatus(req.params.id, { status, reviewNote, reviewedBy });

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const eventType = status === 'approved' ? 'leave.approved' : 'leave.rejected';
    await publish('leave.events', eventType, leave).catch(
      (err) => console.warn(`[Leave] Could not publish ${eventType} event:`, err.message)
    );

    res.json({ success: true, data: leave, message: `Leave request ${status} successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update leave status' });
  }
};

const deleteLeave = async (req, res) => {
  try {
    const leave = LeaveRequest.delete(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    await publish('leave.events', 'leave.deleted', leave).catch(
      (err) => console.warn('[Leave] Could not publish leave.deleted event:', err.message)
    );

    res.json({ success: true, data: leave, message: 'Leave request deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete leave request' });
  }
};

module.exports = {
  getAllLeaves,
  getLeaveById,
  getLeavesByEmployee,
  getLeaveBalance,
  createLeave,
  updateLeaveStatus,
  deleteLeave
};
