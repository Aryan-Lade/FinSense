import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

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
export const seedDemo = () => api.post('/demo/seed');
export const resetDemo = () => api.post('/demo/reset');
export const advanceClock = (days = 2) => api.post(`/demo/advance-clock?days=${days}`);

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export default api;
