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
};

// ─── Loans ───
export const loansApi = {
  list: (params?: Record<string, string>) => api.get('/loans', { params }),
  create: (data: Record<string, unknown>) => api.post('/loans', data),
  approve: (id: string) => api.patch(`/loans/${id}/approve`),
  reject: (id: string) => api.patch(`/loans/${id}/reject`),
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
