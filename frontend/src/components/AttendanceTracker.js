import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../api';

const today = () => new Date().toISOString().split('T')[0];
const nowTime = () => new Date().toTimeString().slice(0, 5);
const thisMonth = () => new Date().toISOString().slice(0, 7);

function AttendanceTracker({ showMessage }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeId: '', date: today(), checkIn: nowTime(), notes: '' });
  const [filterDate, setFilterDate] = useState('');
  const [filterEmpId, setFilterEmpId] = useState('');
  const [summaryEmpId, setSummaryEmpId] = useState('');
  const [summaryMonth, setSummaryMonth] = useState(thisMonth());
  const [summary, setSummary] = useState(null);
  const [checkoutId, setCheckoutId] = useState('');
  const [checkoutTime, setCheckoutTime] = useState(nowTime());

  useEffect(() => { fetchRecords(); }, [filterDate, filterEmpId]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterEmpId) params.employeeId = filterEmpId;
      const res = await attendanceAPI.getAll(params);
      setRecords(res.data.data);
    } catch {
      showMessage('Failed to fetch attendance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    try {
      const res = await attendanceAPI.checkIn(form);
      setRecords((prev) => [res.data.data, ...prev]);
      showMessage(`Check-in recorded for employee ${form.employeeId}`, 'success');
      setForm({ employeeId: '', date: today(), checkIn: nowTime(), notes: '' });
      setShowForm(false);
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to record check-in', 'error');
    }
  };

  const handleCheckOut = async (id) => {
    if (!checkoutTime) { showMessage('Enter check-out time', 'error'); return; }
    try {
      const res = await attendanceAPI.checkOut(id, { checkOut: checkoutTime });
      setRecords((prev) => prev.map((r) => (r.id === id ? res.data.data : r)));
      setCheckoutId('');
      showMessage('Check-out recorded successfully!', 'success');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to record check-out', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await attendanceAPI.delete(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showMessage('Attendance record deleted', 'success');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to delete record', 'error');
    }
  };

  const fetchSummary = async () => {
    if (!summaryEmpId.trim()) { showMessage('Please enter an Employee ID', 'error'); return; }
    try {
      const res = await attendanceAPI.getMonthlySummary(summaryEmpId.trim(), summaryMonth);
      setSummary(res.data.data);
    } catch {
      showMessage('Failed to fetch monthly summary', 'error');
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Attendance Tracker</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Check In'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3 style={{ marginBottom: '16px', color: '#333' }}>Record Check-In</h3>
          <form onSubmit={handleCheckIn}>
            <div className="form-row">
              <div className="form-group">
                <label>Employee ID</label>
                <input name="employeeId" value={form.employeeId} onChange={handleChange}
                  placeholder="Employee ID" required />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input name="date" type="date" value={form.date} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Check-In Time (HH:MM)</label>
                <input name="checkIn" type="time" value={form.checkIn} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Notes <span className="optional">(optional)</span></label>
                <input name="notes" value={form.notes} onChange={handleChange} placeholder="Any notes..." />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Record Check-In</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Monthly Summary */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <h3 style={{ marginBottom: '12px', fontSize: '15px', color: '#495057' }}>Monthly Summary</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '140px' }}>
            <input value={summaryEmpId} onChange={(e) => setSummaryEmpId(e.target.value)}
              placeholder="Employee ID" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <input type="month" value={summaryMonth} onChange={(e) => setSummaryMonth(e.target.value)} />
          </div>
          <button className="btn btn-info" onClick={fetchSummary}>Get Summary</button>
        </div>
        {summary && (
          <div className="balance-grid" style={{ marginTop: '12px' }}>
            <div className="balance-card annual">
              <div className="balance-label">Days Present</div>
              <div className="balance-value">{summary.totalDays}</div>
              <div className="balance-sub">in {summary.month}</div>
            </div>
            <div className="balance-card sick">
              <div className="balance-label">Hours Worked</div>
              <div className="balance-value">{summary.totalHours}</div>
              <div className="balance-sub">total hours</div>
            </div>
            <div className="balance-card casual">
              <div className="balance-label">Avg Hours/Day</div>
              <div className="balance-value">
                {summary.totalDays ? (summary.totalHours / summary.totalDays).toFixed(1) : 0}
              </div>
              <div className="balance-sub">per working day</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="filters-row">
        <input
          type="date" value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          placeholder="Filter by date"
        />
        <input
          value={filterEmpId} onChange={(e) => setFilterEmpId(e.target.value)}
          placeholder="Filter by Employee ID"
        />
        <button className="btn btn-secondary btn-sm" onClick={() => { setFilterDate(''); setFilterEmpId(''); }}>
          Clear
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading attendance records...</div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Attendance Records</h3>
            <p>Record a check-in to get started.</p>
          </div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Date</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Hours</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id}>
                  <td><span className="id-badge">#{rec.id}</span></td>
                  <td><strong>{rec.employeeId}</strong></td>
                  <td>{rec.date}</td>
                  <td>
                    <span className="status-badge" style={{ background: '#d4edda', color: '#155724', border: '1px solid #28a745' }}>
                      {rec.checkIn}
                    </span>
                  </td>
                  <td>
                    {rec.checkOut ? (
                      <span className="status-badge" style={{ background: '#cce5ff', color: '#004085', border: '1px solid #004085' }}>
                        {rec.checkOut}
                      </span>
                    ) : (
                      checkoutId === rec.id ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input type="time" value={checkoutTime}
                            onChange={(e) => setCheckoutTime(e.target.value)}
                            style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }} />
                          <button className="btn btn-sm btn-success" onClick={() => handleCheckOut(rec.id)}>
                            Save
                          </button>
                        </div>
                      ) : (
                        <button className="btn btn-sm btn-info" onClick={() => { setCheckoutId(rec.id); setCheckoutTime(nowTime()); }}>
                          Check Out
                        </button>
                      )
                    )}
                  </td>
                  <td>{rec.hoursWorked != null ? `${rec.hoursWorked}h` : <span className="text-muted">—</span>}</td>
                  <td className="text-muted">{rec.notes || '—'}</td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(rec.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AttendanceTracker;
