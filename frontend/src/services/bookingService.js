import api from './api';

export const bookingService = {
  getBookings: (params) => api.get('/api/bookings/', { params }),
  getBooking: (id) => api.get(`/api/bookings/${id}`),
  createBooking: (data) => api.post('/api/bookings/', data),
  updateBookingStatus: (id, status) => api.patch(`/api/bookings/${id}/status`, { status }),
  cancelBooking: (id, reason) => api.post(`/api/bookings/${id}/cancel`, { reason }),
};

export default bookingService;
