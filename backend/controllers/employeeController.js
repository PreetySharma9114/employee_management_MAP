const Employee = require('../models/Employee');
const grpcClient = require('../grpc/grpcClient');
const { publish } = require('../messaging/producer');

const getAllEmployees = async (req, res) => {
  try {
    const employees = Employee.getAll();
    res.json({
      success: true,
      data: employees,
      count: employees.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees'
    });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = Employee.getById(id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee'
    });
  }
};

const createEmployee = async (req, res) => {
  try {
    const employee = Employee.create(req.body);

    await publish('employee.events', 'employee.created', employee).catch(
      (err) => console.warn('[Backend] Could not publish employee.created:', err.message)
    );

    res.status(201).json({
      success: true,
      data: employee,
      message: 'Employee created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create employee'
    });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = Employee.update(id, req.body);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await publish('employee.events', 'employee.updated', employee).catch(
      (err) => console.warn('[Backend] Could not publish employee.updated:', err.message)
    );

    res.json({
      success: true,
      data: employee,
      message: 'Employee updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update employee'
    });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = Employee.delete(id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await publish('employee.events', 'employee.deleted', employee).catch(
      (err) => console.warn('[Backend] Could not publish employee.deleted:', err.message)
    );

    res.json({
      success: true,
      data: employee,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee'
    });
  }
};

const calculateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = Employee.getById(id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const grpcResponse = await grpcClient.calculateSalary(employee.salary);
    
    res.json({
      success: true,
      data: {
        employee,
        baseSalary: employee.salary,
        finalSalary: grpcResponse.finalSalary,
        taxDeduction: employee.salary - grpcResponse.finalSalary
      },
      message: 'Salary calculated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate salary'
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  calculateSalary
};