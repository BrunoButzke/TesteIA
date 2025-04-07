import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ListIcon from '@mui/icons-material/List';
import PeopleIcon from '@mui/icons-material/People';
import { useAuth } from '../contexts/AuthContext';

const Menu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  return (
    <div>
      <ListItemButton 
        onClick={() => navigate('/dashboard')}
        selected={location.pathname === '/dashboard'}
      >
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItemButton>

      {usuario?.tipo === 'personal' && (
        <>
          <ListItemButton 
            onClick={() => navigate('/criar-treino')}
            selected={location.pathname === '/criar-treino'}
          >
            <ListItemIcon>
              <FitnessCenterIcon />
            </ListItemIcon>
            <ListItemText primary="Criar Treino" />
          </ListItemButton>

          <ListItemButton 
            onClick={() => navigate('/lista-treinos')}
            selected={location.pathname === '/lista-treinos'}
          >
            <ListItemIcon>
              <ListIcon />
            </ListItemIcon>
            <ListItemText primary="Ver Todos os Treinos" />
          </ListItemButton>

          <ListItemButton 
            onClick={() => navigate('/alunos')}
            selected={location.pathname === '/alunos' || location.pathname.startsWith('/alunos/')}
          >
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Gerenciar Alunos" />
          </ListItemButton>
        </>
      )}
    </div>
  );
};

export default Menu; 