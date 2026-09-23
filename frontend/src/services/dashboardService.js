import api from './api';

export const dashboardService = {
  getStats: () => api.get('/api/dashboard/stats'),
};

export default dashboardService;
