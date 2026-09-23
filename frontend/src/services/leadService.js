import api from './api';

export const leadService = {
  getLeads: (params) => api.get('/api/leads/', { params }),
  getLead: (id) => api.get(`/api/leads/${id}`),
  createLead: (leadData) => api.post('/api/leads/', leadData),
  updateLead: (id, leadData) => api.put(`/api/leads/${id}`, leadData),
  deleteLead: (id) => api.delete(`/api/leads/${id}`),
  addNote: (id, text) => api.post(`/api/leads/${id}/notes`, { text }),
};

export default leadService;
