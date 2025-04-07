import axios from 'axios';

const baseURL = window.location.origin.includes('localhost') 
  ? 'http://localhost:5000/api'
  : '/api';

const api = axios.create({
  baseURL
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 