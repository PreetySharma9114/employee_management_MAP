import React, { useState, useEffect } from 'react';
import { employeeAPI } from './api';
import EmployeeForm from './components/EmployeeForm';
import EmployeeList from './components/EmployeeList';
import DepartmentList from './components/DepartmentList';
import LeaveManagement from './components/LeaveManagement';
import AttendanceTracker from './components/AttendanceTracker';
import './App.css';

const TABS = [
  { id: 'employees',   label: '👤 Employees',   icon: '👤' },
  { id: 'departments', label: '🏢 Departments',  icon: '🏢' },
  { id: 'leave',       label: '🌴 Leave',        icon: '🌴' },
  { id: 'attendance',  label: '📋 Attendance',   icon: '📋' },
];

function App() {
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeAPI.getAll();
      setEmployees(response.data.data);
    } catch {
      showMessage('Failed to fetch employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employeeData) => {
    try {
      const response = await employeeAPI.create(employeeData);
      setEmployees([...employees, response.data.data]);
      showMessage('Employee added successfully!', 'success');
      return true;
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to add employee', 'error');
      return false;
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await employeeAPI.delete(id);
      setEmployees(employees.filter((emp) => emp.id !== id));
      showMessage('Employee deleted successfully!', 'success');
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to delete employee', 'error');
    }
  };

  const calculateSalary = async (id) => {
    try {
      const response = await employeeAPI.calculateSalary(id);
      const { employee, baseSalary, finalSalary, taxDeduction } = response.data.data;
      const info =
        `Salary for ${employee.name}\n` +
        `Base:       $${baseSalary.toFixed(2)}\n` +
        `Tax (10%):  -$${taxDeduction.toFixed(2)}\n` +
        `Net Salary: $${finalSalary.toFixed(2)}`;
      alert(info);
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to calculate salary', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  return (
    <div className="app-shell">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">EMS</div>
          <div>
            <div className="brand-name">Employee MS</div>
            <div className="brand-sub">Management Suite</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`nav-item${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label.replace(/^.\s/, '')}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="service-status">
            <div className="status-dot"></div>
            <span>All services online</span>
          </div>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────── */}
      <main className="main-content">
        <div className="topbar">
          <div>
            <h1 className="page-title">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h1>
            <p className="page-subtitle">
              {activeTab === 'employees'   && 'Add, manage and track all employees'}
              {activeTab === 'departments' && 'Organise your company departments and budgets'}
              {activeTab === 'leave'       && 'Submit, review and approve leave requests'}
              {activeTab === 'attendance'  && 'Track daily check-ins and working hours'}
            </p>
          </div>
        </div>

        {message.text && (
          <div className={`toast toast-${message.type}`}>
            <span className="toast-icon">{message.type === 'success' ? '✓' : '✕'}</span>
            {message.text}
          </div>
        )}

        <div className="content-area">
          {activeTab === 'employees' && (
            <>
              <EmployeeForm onSubmit={addEmployee} />
              {loading ? (
                <div className="loading">Loading employees…</div>
              ) : (
                <EmployeeList
                  employees={employees}
                  onDelete={deleteEmployee}
                  onCalculateSalary={calculateSalary}
                />
              )}
            </>
          )}

          {activeTab === 'departments' && (
            <DepartmentList showMessage={showMessage} />
          )}

          {activeTab === 'leave' && (
            <LeaveManagement showMessage={showMessage} />
          )}

          {activeTab === 'attendance' && (
            <AttendanceTracker showMessage={showMessage} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
