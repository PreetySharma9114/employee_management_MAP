let leaveRequests = [];
let nextId = 1;

const LEAVE_ALLOCATIONS = {
  annual: 20,
  sick: 10,
  casual: 5,
  unpaid: Infinity
};

class LeaveRequest {
  constructor({ employeeId, type, startDate, endDate, reason }) {
    this.id = String(nextId++);
    this.employeeId = String(employeeId);
    this.type = type;
    this.startDate = startDate;
    this.endDate = endDate;
    this.reason = reason;
    this.status = 'pending';
    this.reviewNote = null;
    this.reviewedBy = null;
    this.reviewedAt = null;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static getAll() {
    return [...leaveRequests];
  }

  static getById(id) {
    return leaveRequests.find((r) => r.id === String(id)) || null;
  }

  static getByEmployeeId(employeeId) {
    return leaveRequests.filter((r) => r.employeeId === String(employeeId));
  }

  static create(data) {
    const request = new LeaveRequest(data);
    leaveRequests.push(request);
    return { ...request };
  }

  static updateStatus(id, { status, reviewNote, reviewedBy }) {
    const idx = leaveRequests.findIndex((r) => r.id === String(id));
    if (idx === -1) return null;
    leaveRequests[idx] = {
      ...leaveRequests[idx],
      status,
      reviewNote: reviewNote || null,
      reviewedBy: reviewedBy || null,
      reviewedAt: new Date(),
      updatedAt: new Date()
    };
    return { ...leaveRequests[idx] };
  }

  static delete(id) {
    const idx = leaveRequests.findIndex((r) => r.id === String(id));
    if (idx === -1) return null;
    const [deleted] = leaveRequests.splice(idx, 1);
    return { ...deleted };
  }

  static getBalance(employeeId) {
    const approved = leaveRequests.filter(
      (r) => r.employeeId === String(employeeId) && r.status === 'approved'
    );
    const used = { annual: 0, sick: 0, casual: 0, unpaid: 0 };
    approved.forEach((r) => {
      const start = new Date(r.startDate);
      const end = new Date(r.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      if (used[r.type] !== undefined) used[r.type] += days;
    });
    return {
      annualBalance: LEAVE_ALLOCATIONS.annual,
      sickBalance: LEAVE_ALLOCATIONS.sick,
      casualBalance: LEAVE_ALLOCATIONS.casual,
      usedAnnual: used.annual,
      usedSick: used.sick,
      usedCasual: used.casual
    };
  }

  static deleteByEmployeeId(employeeId) {
    const before = leaveRequests.length;
    leaveRequests = leaveRequests.filter((r) => r.employeeId !== String(employeeId));
    return before - leaveRequests.length;
  }

  static reset() {
    leaveRequests = [];
    nextId = 1;
  }
}

module.exports = LeaveRequest;
