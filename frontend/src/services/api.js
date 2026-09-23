import axios from 'axios';
import Swal from 'sweetalert2';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors and 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('crm_jwt_token');
      localStorage.removeItem('crm_user_profile');
      if (window.location.pathname !== '/login') {
        Swal.fire({
          icon: 'warning',
          title: 'Session Expired',
          text: 'Your session has timed out. Please log in again.',
          confirmButtonColor: '#2563eb',
        }).then(() => {
          window.location.href = '/login';
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
