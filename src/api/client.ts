import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const setupInterceptors = (onUnauthorized: () => void) => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        const teniaToken = !!localStorage.getItem('token');
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        if (teniaToken) onUnauthorized();
        if (!window.location.pathname.startsWith('/login') && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
};

export default api;