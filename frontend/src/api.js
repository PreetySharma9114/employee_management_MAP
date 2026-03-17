import axios from 'axios';

// In Docker: all calls go to the same origin (port 80); nginx routes by path.
// In local dev: override with REACT_APP_API_URL / REACT_APP_GATEWAY_URL env vars.
const BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace(/\/api$/, '')
  : '';

function makeClient(prefix) {
  return axios.create({
    baseURL: `${BASE}${prefix}`,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── Individual service clients (nginx proxies each prefix to the right service)
const employeeClient  = makeClient('/api');       // → backend:3001
const authClient      = makeClient('/api/auth');  // → auth-service:3002
const leaveClient     = makeClient('/api');       // → leave-service:3003  (/api/leaves/...)
const attendanceClient = makeClient('/api');      // → attendance-service:3004 (/api/attendance/...)
const deptClient      = makeClient('/api');       // → department-service:3005 (/api/departments/...)

// ── JWT token injection for auth-required calls
employeeClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─────────────────────────────────────────────────────────────────────────────
// Employee API (existing)
// ─────────────────────────────────────────────────────────────────────────────
export const employeeAPI = {
  getAll:          ()         => employeeClient.get('/employees'),
  getById:         (id)       => employeeClient.get(`/employees/${id}`),
  create:          (data)     => employeeClient.post('/employees', data),
  update:          (id, data) => employeeClient.put(`/employees/${id}`, data),
  delete:          (id)       => employeeClient.delete(`/employees/${id}`),
  calculateSalary: (id)       => employeeClient.get(`/employees/${id}/salary`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)   => authClient.post('/register', data),
  login:    (data)   => authClient.post('/login', data),
  verify:   ()       => authClient.get('/verify', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }),
  getUsers:   ()     => authClient.get('/users'),
  deleteUser: (id)   => authClient.delete(`/users/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Department API
// ─────────────────────────────────────────────────────────────────────────────
export const departmentAPI = {
  getAll:   ()         => deptClient.get('/departments'),
  getById:  (id)       => deptClient.get(`/departments/${id}`),
  create:   (data)     => deptClient.post('/departments', data),
  update:   (id, data) => deptClient.put(`/departments/${id}`, data),
  delete:   (id)       => deptClient.delete(`/departments/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Leave API
// ─────────────────────────────────────────────────────────────────────────────
export const leaveAPI = {
  getAll:           (params)   => leaveClient.get('/leaves', { params }),
  getById:          (id)       => leaveClient.get(`/leaves/${id}`),
  create:           (data)     => leaveClient.post('/leaves', data),
  updateStatus:     (id, data) => leaveClient.patch(`/leaves/${id}/status`, data),
  delete:           (id)       => leaveClient.delete(`/leaves/${id}`),
  getByEmployee:    (empId)    => leaveClient.get(`/employees/${empId}/leaves`),
  getBalance:       (empId)    => leaveClient.get(`/employees/${empId}/leaves/balance`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Attendance API
// ─────────────────────────────────────────────────────────────────────────────
export const attendanceAPI = {
  getAll:         (params)     => attendanceClient.get('/attendance', { params }),
  getById:        (id)         => attendanceClient.get(`/attendance/${id}`),
  checkIn:        (data)       => attendanceClient.post('/attendance/checkin', data),
  checkOut:       (id, data)   => attendanceClient.patch(`/attendance/${id}/checkout`, data),
  delete:         (id)         => attendanceClient.delete(`/attendance/${id}`),
  getMonthlySummary: (empId, month) =>
    attendanceClient.get(`/employees/${empId}/attendance/summary`, { params: { month } }),
};

export default employeeClient;
