import api from './api';

export const projectService = {
  getProjects: (params) => api.get('/api/projects/', { params }),
  getProject: (id) => api.get(`/api/projects/${id}`),
  createProject: (data) => api.post('/api/projects/', data),
  updateProject: (id, data) => api.put(`/api/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/api/projects/${id}`),
};

export default projectService;
