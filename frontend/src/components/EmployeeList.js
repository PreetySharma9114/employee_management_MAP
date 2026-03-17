import React from 'react';

function EmployeeList({ employees, onDelete, onCalculateSalary }) {
  if (employees.length === 0) {
    return (
      <div className="employees-list">
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          <h3>No Employees Found</h3>
          <p>Add your first employee to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employees-list">
      <h2 style={{ padding: '20px', borderBottom: '1px solid #ddd' }}>
        Employee List ({employees.length})
      </h2>
      <table className="employees-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Role</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.name}</td>
              <td>{employee.email}</td>
              <td>{employee.department}</td>
              <td>{employee.role}</td>
              <td>${parseFloat(employee.salary).toFixed(2)}</td>
              <td>
                <div className="actions">
                  <button 
                    className="btn btn-info"
                    onClick={() => onCalculateSalary(employee.id)}
                  >
                    Calculate Salary
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => onDelete(employee.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeList;