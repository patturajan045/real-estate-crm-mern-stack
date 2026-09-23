import api from './api';

export const buildingService = {
  getBuildings: (params) => api.get('/api/buildings/', { params }),
  getBuilding: (id) => api.get(`/api/buildings/${id}`),
  createBuilding: (data) => api.post('/api/buildings/', data),
  updateBuilding: (id, data) => api.put(`/api/buildings/${id}`, data),
  deleteBuilding: (id) => api.delete(`/api/buildings/${id}`),
};

export default buildingService;
