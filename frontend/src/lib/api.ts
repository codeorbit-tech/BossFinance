import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ───
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  me: () => api.get('/auth/me'),
};

// ─── Customers ───
export const customersApi = {
  list: (params?: Record<string, string>) => api.get('/customers', { params }),
  get: (id: string) => api.get(`/customers/${id}`),
  create: (data: Record<string, unknown>) => api.post('/customers', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/customers/${id}`, data),
  markNpa: (id: string) => api.patch(`/customers/${id}/npa`),
};

// ─── Loans ───
export const loansApi = {
  list: (params?: Record<string, string>) => api.get('/loans', { params }),
  get: (id: string) => api.get(`/loans/${id}`),
  create: (data: Record<string, unknown>) => api.post('/loans', data),
  approve: (id: string) => api.patch(`/loans/${id}/approve`),
  disburse: (id: string) => api.patch(`/loans/${id}/disburse`),
  query: (id: string, description: string) => api.patch(`/loans/${id}/query`, { description }),
  updatePdf: (id: string, pdfUrl: string) => api.patch(`/loans/${id}/pdf`, { pdfUrl }),
  uploadPdf: (id: string, file: File | Blob) => {
    const formData = new FormData();
    formData.append('pdf', file, 'application.pdf');
    return api.post(`/loans/${id}/upload-pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  resubmit: (id: string, data: Record<string, any>) => api.patch(`/loans/${id}/resubmit`, data),
};

// ─── Repayments ───
export const repaymentsApi = {
  list: (params?: Record<string, string>) => api.get('/repayments', { params }),
  record: (data: Record<string, unknown>) => api.post('/repayments', data),
};

// ─── Notifications ───
export const notificationsApi = {
  list: (params?: Record<string, string>) => api.get('/notifications', { params }),
  send: (data: Record<string, unknown>) => api.post('/notifications/send', data),
};

// ─── Expenses ───
export const expensesApi = {
  list: () => api.get('/expenses'),
  create: (data: Record<string, unknown>) => api.post('/expenses', data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

// ─── Settings ───
export const settingsApi = {
  listHolidays: () => api.get('/settings/holidays'),
  addHoliday: (data: Record<string, unknown>) => api.post('/settings/holidays', data),
  deleteHoliday: (id: string) => api.delete(`/settings/holidays/${id}`),
  getSettings: () => api.get('/settings'),
  updateSetting: (key: string, value: string) => api.post('/settings', { key, value }),
};

// ─── Analytics ───
export const analyticsApi = {
  getExpenseTracker: () => api.get('/analytics/expense-tracker'),
  getDashboard: (period: string) => api.get('/analytics/dashboard', { params: { period } }),
  getRecentActivity: () => api.get('/analytics/activity'),
  getEmployeeStats: () => api.get('/analytics/employee'),
};

// ─── Users (Staff) ───
export const usersApi = {
  list: () => api.get('/users'),
  create: (data: Record<string, unknown>) => api.post('/users', data),
  delete: (id: string) => api.delete(`/users/${id}`),
};
