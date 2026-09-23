import api from './api';

export const notificationService = {
  getNotifications: (params) => api.get('/api/notifications/', { params }),
  markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.post('/api/notifications/read-all'),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
};

export default notificationService;
