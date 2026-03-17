import React, { useState, useEffect } from 'react';
import { departmentAPI } from '../api';

const EMPTY_FORM = { name: '', description: '', managerId: '', budget: '' };

function DepartmentList({ showMessage }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await departmentAPI.getAll();
      setDepartments(res.data.data);
    } catch {
      showMessage('Failed to fetch departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, budget: parseFloat(form.budget) };
    try {
      if (editId) {
        const res = await departmentAPI.update(editId, payload);
        setDepartments((prev) => prev.map((d) => (d.id === editId ? res.data.data : d)));
        showMessage('Department updated successfully!', 'success');
      } else {
        const res = await departmentAPI.create(payload);
        setDepartments((prev) => [...prev, res.data.data]);
        showMessage('Department created successfully!', 'success');
      }
      resetForm();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleEdit = (dept) => {
    setForm({
      name: dept.name,
      description: dept.description,
      managerId: dept.managerId || '',
      budget: String(dept.budget),
    });
    setEditId(dept.id);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete department "${name}"?`)) return;
    try {
      await departmentAPI.delete(id);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      showMessage('Department deleted successfully!', 'success');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to delete department', 'error');
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Departments</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm && !editId ? 'Cancel' : '+ Add Department'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3 style={{ marginBottom: '16px', color: '#333' }}>
            {editId ? 'Edit Department' : 'New Department'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Department Name</label>
                <input name="name" value={form.name} onChange={handleChange}
                  placeholder="e.g. Engineering" required />
              </div>
              <div className="form-group">
                <label>Budget ($)</label>
                <input name="budget" type="number" min="0" value={form.budget}
                  onChange={handleChange} placeholder="e.g. 500000" required />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input name="description" value={form.description} onChange={handleChange}
                placeholder="Department responsibilities" required />
            </div>
            <div className="form-group">
              <label>Manager ID <span className="optional">(optional)</span></label>
              <input name="managerId" value={form.managerId} onChange={handleChange}
                placeholder="Employee ID of the manager" />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editId ? 'Save Changes' : 'Create Department'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">Loading departments...</div>
        ) : departments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <h3>No Departments Yet</h3>
            <p>Create your first department to get started.</p>
          </div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Manager ID</th>
                <th>Budget</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id}>
                  <td><span className="id-badge">#{dept.id}</span></td>
                  <td><strong>{dept.name}</strong></td>
                  <td className="text-muted">{dept.description}</td>
                  <td>{dept.managerId || <span className="text-muted">—</span>}</td>
                  <td><strong>${Number(dept.budget).toLocaleString()}</strong></td>
                  <td className="text-muted">{new Date(dept.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-sm btn-info" onClick={() => handleEdit(dept)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(dept.id, dept.name)}>
                        Delete
                      </button>
                    </div>
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

export default DepartmentList;
