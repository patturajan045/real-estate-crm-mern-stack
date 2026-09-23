import api from './api';

export const cmsService = {
  getContent: () => api.get('/api/cms/content'),
  getGroupedContent: () => api.get('/api/cms/content/grouped'),
  batchUpdateContent: (updates) => api.post('/api/cms/content/batch', { updates }),
  resetDefaults: () => api.post('/api/cms/reset'),
};

export default cmsService;
