import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autenticado, setAutenticado] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');

    console.log('Token no localStorage:', token);
    console.log('Usuário no localStorage:', usuarioSalvo);

    if (token && usuarioSalvo) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      console.log('Headers da API:', api.defaults.headers);
      setUsuario(JSON.parse(usuarioSalvo));
      setAutenticado(true);
    }

    setLoading(false);
  }, []);

  const login = async (email, senha, novoCodigoPersonal = null) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { 
        email, 
        senha,
        novoCodigoPersonal
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      
      api.defaults.headers.Authorization = `Bearer ${response.data.token}`;
      
      setUsuario(response.data.usuario);
      setAutenticado(true);
      setError(null);
      return { success: true };
    } catch (error) {
      setError(
        error.response?.data?.mensagem || 
        'Ocorreu um erro ao fazer login. Tente novamente.'
      );
      
      // Verificar se o usuário está desvinculado
      if (error.response?.status === 403 && error.response?.data?.desvinculado) {
        return { 
          success: false, 
          desvinculado: true, 
          mensagem: error.response.data.mensagem 
        };
      }
      
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  async function registro(nome, email, senha, tipo, codigoPersonal = null) {
    try {
      const response = await api.post('/auth/registro', {
        nome,
        email,
        senha,
        tipo,
        codigoPersonal
      });
      const { token, usuario } = response.data;

      console.log('Token recebido no registro:', token);
      console.log('Usuário recebido no registro:', usuario);

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      api.defaults.headers.Authorization = `Bearer ${token}`;
      console.log('Headers da API após registro:', api.defaults.headers);
      setUsuario(usuario);

      return true;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw new Error(error.response?.data?.mensagem || 'Erro ao registrar');
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    delete api.defaults.headers.Authorization;
  }

  return (
    <AuthContext.Provider value={{ usuario, login, registro, logout, loading, autenticado, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 