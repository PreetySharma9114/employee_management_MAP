const Department = require('../models/Department');
const { publish } = require('../messaging/producer');

const getAllDepartments = (req, res) => {
  try {
    const departments = Department.getAll();
    res.json({ success: true, data: departments, count: departments.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch departments' });
  }
};

const getDepartmentById = (req, res) => {
  try {
    const dept = Department.getById(req.params.id);
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, data: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch department' });
  }
};

const createDepartment = async (req, res) => {
  try {
    const existing = Department.getByName(req.body.name);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Department "${req.body.name}" already exists`
      });
    }

    const dept = Department.create(req.body);

    await publish('department.events', 'department.created', dept).catch(
      (err) => console.warn('[Department] Could not publish department.created event:', err.message)
    );

    res.status(201).json({ success: true, data: dept, message: 'Department created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create department' });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const dept = Department.update(req.params.id, req.body);
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await publish('department.events', 'department.updated', dept).catch(
      (err) => console.warn('[Department] Could not publish department.updated event:', err.message)
    );

    res.json({ success: true, data: dept, message: 'Department updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update department' });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const dept = Department.delete(req.params.id);
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await publish('department.events', 'department.deleted', dept).catch(
      (err) => console.warn('[Department] Could not publish department.deleted event:', err.message)
    );

    res.json({ success: true, data: dept, message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete department' });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
