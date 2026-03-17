let employees = [];
let nextId = 1;

class Employee {
  constructor(name, email, department, role, salary) {
    this.id = nextId++;
    this.name = name;
    this.email = email;
    this.department = department;
    this.role = role;
    this.salary = salary;
    this.createdAt = new Date();
  }

  static getAll() {
    return employees;
  }

  static getById(id) {
    return employees.find(emp => emp.id === parseInt(id));
  }

  static create(employeeData) {
    const employee = new Employee(
      employeeData.name,
      employeeData.email,
      employeeData.department,
      employeeData.role,
      employeeData.salary
    );
    employees.push(employee);
    return employee;
  }

  static update(id, employeeData) {
    const index = employees.findIndex(emp => emp.id === parseInt(id));
    if (index === -1) return null;
    
    employees[index] = { ...employees[index], ...employeeData };
    return employees[index];
  }

  static delete(id) {
    const index = employees.findIndex(emp => emp.id === parseInt(id));
    if (index === -1) return null;
    
    const deletedEmployee = employees[index];
    employees.splice(index, 1);
    return deletedEmployee;
  }

  static reset() {
    employees = [];
    nextId = 1;
  }
}

module.exports = Employee;