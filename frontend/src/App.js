import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Registro from './pages/Registro';
import DashboardPersonal from './pages/DashboardPersonal';
import DashboardAluno from './pages/DashboardAluno';
import DetalhesTreino from './pages/DetalhesTreino';
import CriarTreino from './pages/CriarTreino';
import ListaAlunos from './pages/ListaAlunos';
import TreinosAluno from './pages/TreinosAluno';
import ListaTreinos from './pages/ListaTreinos';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function PrivateRoute({ children, allowedTypes = ['personal', 'aluno'] }) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  if (!allowedTypes.includes(usuario.tipo)) {
    return <Navigate to={usuario.tipo === 'personal' ? '/dashboard' : '/aluno/dashboard'} />;
  }

  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedTypes={['personal']}>
                  <DashboardPersonal />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/criar-treino"
              element={
                <PrivateRoute allowedTypes={['personal']}>
                  <CriarTreino />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/treinos/:id"
              element={
                <PrivateRoute>
                  <DetalhesTreino />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/alunos"
              element={
                <PrivateRoute allowedTypes={['personal']}>
                  <ListaAlunos />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/alunos/:id/treinos"
              element={
                <PrivateRoute allowedTypes={['personal']}>
                  <TreinosAluno />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/aluno/dashboard"
              element={
                <PrivateRoute allowedTypes={['aluno']}>
                  <DashboardAluno />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/lista-treinos"
              element={
                <PrivateRoute allowedTypes={['personal']}>
                  <ListaTreinos />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/editar-treino/:id"
              element={
                <PrivateRoute allowedTypes={['personal']}>
                  <CriarTreino />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/visualizar-treino/:id"
              element={
                <PrivateRoute allowedTypes={['personal']}>
                  <DetalhesTreino />
                </PrivateRoute>
              }
            />
            
            {/* Rota de compatibilidade para redirecionamento */}
            <Route
              path="/treinos"
              element={<Navigate to="/lista-treinos" />}
            />
            
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 