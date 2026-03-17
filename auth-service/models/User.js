let users = [];
let nextId = 1;

class User {
  constructor({ email, passwordHash, role = 'employee', employeeId = null }) {
    this.id = String(nextId++);
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.employeeId = employeeId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static getAll() {
    return users.map(User._sanitize);
  }

  static getById(id) {
    const user = users.find((u) => u.id === String(id));
    return user ? User._sanitize(user) : null;
  }

  static getByIdWithHash(id) {
    return users.find((u) => u.id === String(id)) || null;
  }

  static getByEmail(email) {
    return users.find((u) => u.email === email) || null;
  }

  static create(data) {
    const user = new User(data);
    users.push(user);
    return User._sanitize(user);
  }

  static update(id, data) {
    const idx = users.findIndex((u) => u.id === String(id));
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...data, updatedAt: new Date() };
    return User._sanitize(users[idx]);
  }

  static delete(id) {
    const idx = users.findIndex((u) => u.id === String(id));
    if (idx === -1) return null;
    const [deleted] = users.splice(idx, 1);
    return User._sanitize(deleted);
  }

  static _sanitize(user) {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  static reset() {
    users = [];
    nextId = 1;
  }
}

module.exports = User;
