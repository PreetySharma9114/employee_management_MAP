let departments = [];
let nextId = 1;

class Department {
  constructor({ name, description, managerId = null, budget }) {
    this.id = String(nextId++);
    this.name = name;
    this.description = description;
    this.managerId = managerId || null;
    this.budget = budget;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static getAll() {
    return [...departments];
  }

  static getById(id) {
    return departments.find((d) => d.id === String(id)) || null;
  }

  static getByName(name) {
    return departments.find((d) => d.name.toLowerCase() === name.toLowerCase()) || null;
  }

  static create(data) {
    const dept = new Department(data);
    departments.push(dept);
    return { ...dept };
  }

  static update(id, data) {
    const idx = departments.findIndex((d) => d.id === String(id));
    if (idx === -1) return null;
    departments[idx] = { ...departments[idx], ...data, updatedAt: new Date() };
    return { ...departments[idx] };
  }

  static delete(id) {
    const idx = departments.findIndex((d) => d.id === String(id));
    if (idx === -1) return null;
    const [deleted] = departments.splice(idx, 1);
    return { ...deleted };
  }

  static reset() {
    departments = [];
    nextId = 1;
  }
}

module.exports = Department;
