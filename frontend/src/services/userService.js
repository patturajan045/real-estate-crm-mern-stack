import api from './api';

export const userService = {
  getUsers: (params) => api.get('/api/users/', { params }),
  getUser: (id) => api.get(`/api/users/${id}`),
  createUser: (userData) => api.post('/api/users/', userData),
  updateUser: (id, userData) => api.put(`/api/users/${id}`, userData),
  toggleActive: (id, isActive) => api.patch(`/api/users/${id}/toggle-active`, { is_active: isActive }),
  resetPassword: (id, password) => api.post(`/api/users/${id}/reset-password`, { password }),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
};

export default userService;
