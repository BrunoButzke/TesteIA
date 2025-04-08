import axios from 'axios';

const baseURL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : `${window.location.origin}/api`;

console.log('API base URL:', baseURL);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token adicionado ao header:', token.substring(0, 10) + '...');
    }
    return config;
  },
  (error) => {
    console.error('Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros nas respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na resposta da API:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api; 