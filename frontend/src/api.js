import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 minutes for deep PaddleOCR inferences
});

// Attach Authorization Bearer token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('finsense_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication APIs
export const getAuthConfig = () => api.get('/auth/config');
export const authRegister = (data) => api.post('/auth/register', data);
export const authLogin = (data) => api.post('/auth/login', data);
export const authMe = () => api.get('/auth/me');
export const authLogout = () => api.post('/auth/logout');

export const getHealth = () => api.get('/health');
export const getInvoices = (params) => api.get('/invoices/', { params });
export const getInvoice = (id) => api.get(`/invoices/${id}`);
export const updateInvoice = (id, data) => api.put(`/invoices/${id}`, data);
export const markPaid = (id) => api.post(`/invoices/${id}/mark-paid`);
export const markUnpaid = (id) => api.post(`/invoices/${id}/mark-unpaid`);
export const approveInvoice = (id) => api.post(`/invoices/${id}/approve`);
export const rejectInvoice = (id) => api.post(`/invoices/${id}/reject`);

export const getSuppliers = () => api.get('/suppliers/');
export const getReminders = () => api.get('/reminders/');

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const exportInvoicesCSV = () => {
  window.open('/api/export/invoices/csv', '_blank');
};

export const exportDashboardJSON = () => {
  window.open('/api/export/dashboard/json', '_blank');
};

export default api;
