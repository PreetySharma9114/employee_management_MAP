let records = [];
let nextId = 1;

class Attendance {
  constructor({ employeeId, date, checkIn, notes = null }) {
    this.id = String(nextId++);
    this.employeeId = String(employeeId);
    this.date = date;
    this.checkIn = checkIn;
    this.checkOut = null;
    this.hoursWorked = null;
    this.status = 'present';
    this.notes = notes;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static getAll({ employeeId, date, month } = {}) {
    let result = [...records];
    if (employeeId) result = result.filter((r) => r.employeeId === String(employeeId));
    if (date) result = result.filter((r) => r.date === date);
    if (month) result = result.filter((r) => r.date.startsWith(month));
    return result;
  }

  static getById(id) {
    return records.find((r) => r.id === String(id)) || null;
  }

  static getByEmployeeAndDate(employeeId, date) {
    return records.find((r) => r.employeeId === String(employeeId) && r.date === date) || null;
  }

  static create(data) {
    const record = new Attendance(data);
    records.push(record);
    return { ...record };
  }

  static checkOut(id, { checkOut, notes }) {
    const idx = records.findIndex((r) => r.id === String(id));
    if (idx === -1) return null;

    const rec = records[idx];
    const [inH, inM] = rec.checkIn.split(':').map(Number);
    const [outH, outM] = checkOut.split(':').map(Number);
    const hoursWorked = parseFloat(((outH * 60 + outM - (inH * 60 + inM)) / 60).toFixed(2));

    records[idx] = {
      ...rec,
      checkOut,
      hoursWorked: hoursWorked > 0 ? hoursWorked : 0,
      notes: notes || rec.notes,
      updatedAt: new Date()
    };
    return { ...records[idx] };
  }

  static delete(id) {
    const idx = records.findIndex((r) => r.id === String(id));
    if (idx === -1) return null;
    const [deleted] = records.splice(idx, 1);
    return { ...deleted };
  }

  static getMonthlySummary(employeeId, month) {
    const monthRecords = records.filter(
      (r) => r.employeeId === String(employeeId) && r.date.startsWith(month)
    );
    const totalDays = monthRecords.length;
    const totalHours = monthRecords.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
    return { employeeId, month, totalDays, totalHours: parseFloat(totalHours.toFixed(2)) };
  }

  static deleteByEmployeeId(employeeId) {
    const before = records.length;
    records = records.filter((r) => r.employeeId !== String(employeeId));
    return before - records.length;
  }

  static reset() {
    records = [];
    nextId = 1;
  }
}

module.exports = Attendance;
