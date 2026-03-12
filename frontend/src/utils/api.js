import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Property APIs
export const propertyAPI = {
  getAll: (filters) => api.get('/properties', { params: filters }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
  verify: (id, status) => api.patch(`/properties/${id}/verify`, { status }),
  updateStatus: (id, status) => api.patch(`/properties/${id}/status`, { status }),
  getMyProperties: () => api.get('/properties/user/my-properties'),
  contactOwner: (id, data) => api.post(`/properties/${id}/contact`, data),
  getInquiries: (id) => api.get(`/properties/${id}/inquiries`),
  requestSale: (id, data) => api.post(`/properties/${id}/request-sale`, data),
  approveSale: (id) => api.patch(`/properties/${id}/approve-sale`),
  rejectSale: (id) => api.patch(`/properties/${id}/reject-sale`),
};

export default api;
