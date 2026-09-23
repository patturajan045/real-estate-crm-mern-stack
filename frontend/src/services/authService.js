import api from './api';

export const authService = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
};

export default authService;
