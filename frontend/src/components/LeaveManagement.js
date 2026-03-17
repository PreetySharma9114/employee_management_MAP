import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../api';

const STATUS_COLORS = {
  pending:  { bg: '#fff3cd', color: '#856404', border: '#ffc107' },
  approved: { bg: '#d4edda', color: '#155724', border: '#28a745' },
  rejected: { bg: '#f8d7da', color: '#721c24', border: '#dc3545' },
};

const EMPTY_FORM = { employeeId: '', type: 'annual', startDate: '', endDate: '', reason: '' };

function LeaveManagement({ showMessage }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [balanceEmpId, setBalanceEmpId] = useState('');
  const [balance, setBalance] = useState(null);

  useEffect(() => { fetchLeaves(); }, [filterStatus, filterType]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.type = filterType;
      const res = await leaveAPI.getAll(params);
      setLeaves(res.data.data);
    } catch {
      showMessage('Failed to fetch leave requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await leaveAPI.create(form);
      setLeaves((prev) => [res.data.data, ...prev]);
      showMessage('Leave request submitted successfully!', 'success');
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to submit leave request', 'error');
    }
  };

  const handleStatusChange = async (id, status) => {
    const reviewNote = status === 'rejected'
      ? window.prompt('Reason for rejection (optional):') || ''
      : '';
    try {
      const res = await leaveAPI.updateStatus(id, { status, reviewNote });
      setLeaves((prev) => prev.map((l) => (l.id === id ? res.data.data : l)));
      showMessage(`Leave request ${status} successfully!`, 'success');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave request?')) return;
    try {
      await leaveAPI.delete(id);
      setLeaves((prev) => prev.filter((l) => l.id !== id));
      showMessage('Leave request deleted successfully!', 'success');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to delete leave request', 'error');
    }
  };

  const fetchBalance = async () => {
    if (!balanceEmpId.trim()) {
      showMessage('Please enter an Employee ID', 'error');
      return;
    }
    try {
      const res = await leaveAPI.getBalance(balanceEmpId.trim());
      setBalance(res.data.data);
    } catch {
      showMessage('Failed to fetch leave balance', 'error');
    }
  };

  const daysCount = (start, end) => {
    if (!start || !end) return '—';
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24) + 1;
    return diff > 0 ? `${diff}d` : '—';
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Leave Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Request Leave'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3 style={{ marginBottom: '16px', color: '#333' }}>New Leave Request</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Employee ID</label>
                <input name="employeeId" value={form.employeeId} onChange={handleChange}
                  placeholder="Employee ID" required />
              </div>
              <div className="form-group">
                <label>Leave Type</label>
                <select name="type" value={form.type} onChange={handleChange} required>
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input name="startDate" type="date" value={form.startDate} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input name="endDate" type="date" value={form.endDate} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Reason</label>
              <textarea name="reason" value={form.reason} onChange={handleChange}
                placeholder="Describe the reason for leave" required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Submit Request</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Leave Balance lookup */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <h3 style={{ marginBottom: '12px', fontSize: '15px', color: '#495057' }}>Check Leave Balance</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0, flex: 1 }}>
            <input value={balanceEmpId} onChange={(e) => setBalanceEmpId(e.target.value)}
              placeholder="Enter Employee ID" />
          </div>
          <button className="btn btn-info" onClick={fetchBalance}>Check Balance</button>
        </div>
        {balance && (
          <div className="balance-grid">
            <div className="balance-card annual">
              <div className="balance-label">Annual</div>
              <div className="balance-value">{balance.annualBalance - balance.usedAnnual}</div>
              <div className="balance-sub">of {balance.annualBalance} remaining</div>
            </div>
            <div className="balance-card sick">
              <div className="balance-label">Sick</div>
              <div className="balance-value">{balance.sickBalance - balance.usedSick}</div>
              <div className="balance-sub">of {balance.sickBalance} remaining</div>
            </div>
            <div className="balance-card casual">
              <div className="balance-label">Casual</div>
              <div className="balance-value">{balance.casualBalance - balance.usedCasual}</div>
              <div className="balance-sub">of {balance.casualBalance} remaining</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="filters-row">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="annual">Annual</option>
          <option value="sick">Sick</option>
          <option value="casual">Casual</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading leave requests...</div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌴</div>
            <h3>No Leave Requests</h3>
            <p>Submit a leave request to get started.</p>
          </div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => {
                const s = STATUS_COLORS[leave.status] || STATUS_COLORS.pending;
                return (
                  <tr key={leave.id}>
                    <td><span className="id-badge">#{leave.id}</span></td>
                    <td><strong>{leave.employeeId}</strong></td>
                    <td><span className="type-badge">{leave.type}</span></td>
                    <td>{leave.startDate}</td>
                    <td>{leave.endDate}</td>
                    <td>{daysCount(leave.startDate, leave.endDate)}</td>
                    <td>
                      <span className="status-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="text-muted" style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {leave.reason}
                    </td>
                    <td>
                      <div className="actions">
                        {leave.status === 'pending' && (
                          <>
                            <button className="btn btn-sm btn-success" onClick={() => handleStatusChange(leave.id, 'approved')}>
                              Approve
                            </button>
                            <button className="btn btn-sm btn-warning" onClick={() => handleStatusChange(leave.id, 'rejected')}>
                              Reject
                            </button>
                          </>
                        )}
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(leave.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default LeaveManagement;
