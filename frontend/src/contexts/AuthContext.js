import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStoredUser = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Erro ao carregar usuário do localStorage:", error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    loadStoredUser();
  }, []);

  const login = async (email, senha) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, senha });
      
      // Verificar se a resposta contém o token e usuário
      if (response.data && response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        
        // Redirecionar com base no tipo de usuário
        if (response.data.user.tipo === 'personal') {
          navigate('/dashboard/personal');
        } else {
          navigate('/dashboard/aluno');
        }
        
        return { success: true };
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error("Erro no login:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const registro = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/registro', userData);
      
      if (response.data && response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        
        // Redirecionar com base no tipo de usuário
        if (response.data.user.tipo === 'personal') {
          navigate('/dashboard/personal');
        } else {
          navigate('/dashboard/aluno');
        }
        
        return { success: true };
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error("Erro no registro:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao criar conta.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, registro }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 