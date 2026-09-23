import api from './api';

export const unitService = {
  getUnits: (params) => api.get('/api/units/', { params }),
  getUnit: (id) => api.get(`/api/units/${id}`),
  createUnit: (data) => api.post('/api/units/', data),
  updateUnit: (id, data) => api.put(`/api/units/${id}`, data),
  deleteUnit: (id) => api.delete(`/api/units/${id}`),
};

export default unitService;
