import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('samudra_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('samudra_token');
      localStorage.removeItem('samudra_user');
      localStorage.removeItem('samudra_role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// Reports endpoints
export const reportsAPI = {
  getAll: (params = {}) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  create: (reportData) => api.post('/reports', reportData),
  update: (id, reportData) => api.put(`/reports/${id}`, reportData),
  delete: (id) => api.delete(`/reports/${id}`),
  verify: (id, verificationData) => api.post(`/reports/${id}/verify`, verificationData),
  reject: (id, reason) => api.post(`/reports/${id}/reject`, { reason }),
  getMyReports: () => api.get('/reports/my'),
  uploadImage: (reportId, formData) => api.post(`/reports/${reportId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Alerts endpoints
export const alertsAPI = {
  getAll: (params = {}) => api.get('/alerts', { params }),
  getActive: () => api.get('/alerts/active'),
  getById: (id) => api.get(`/alerts/${id}`),
  create: (alertData) => api.post('/alerts', alertData),
  update: (id, alertData) => api.put(`/alerts/${id}`, alertData),
  delete: (id) => api.delete(`/alerts/${id}`),
  activate: (id) => api.post(`/alerts/${id}/activate`),
  deactivate: (id) => api.post(`/alerts/${id}/deactivate`),
};

// Users endpoints (Admin only)
export const usersAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  toggleStatus: (id) => api.post(`/users/${id}/toggle-status`),
};

// Analytics endpoints
export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getReportStats: (params = {}) => api.get('/analytics/reports', { params }),
  getLocationStats: (params = {}) => api.get('/analytics/locations', { params }),
  getTrendData: (params = {}) => api.get('/analytics/trends', { params }),
  getHeatmapData: (params = {}) => api.get('/analytics/heatmap', { params }),
};

// Notifications endpoints
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete('/notifications'),
};

// Settings endpoints
export const settingsAPI = {
  getSystem: () => api.get('/settings/system'),
  updateSystem: (settings) => api.put('/settings/system', settings),
  getUser: () => api.get('/settings/user'),
  updateUser: (settings) => api.put('/settings/user', settings),
  updateProfile: (profileData) => api.put('/settings/profile', profileData),
  changePassword: (passwordData) => api.put('/settings/password', passwordData),
};

export default api;