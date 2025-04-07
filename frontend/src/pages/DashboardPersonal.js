import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box
} from '@mui/material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPersonal() {
  const [treinos, setTreinos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [treinosResponse, alunosResponse] = await Promise.all([
        api.get('/treinos/personal'),
        api.get('/usuarios/alunos')
      ]);

      setTreinos(treinosResponse.data);
      setAlunos(alunosResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Bem-vindo, {usuario?.nome}!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Aqui está um resumo dos seus treinos e alunos
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Treinos Recentes
            </Typography>
            <List>
              {treinos.slice(0, 5).map((treino) => (
                <ListItem key={treino._id}>
                  <ListItemText
                    primary={treino.nome}
                    secondary={`${treino.diaSemana} - ${treino.aluno.nome}`}
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate('/lista-treinos')}
              >
                Ver Todos os Treinos
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Seus Alunos
            </Typography>
            <List>
              {alunos.map((aluno) => (
                <ListItem key={aluno._id}>
                  <ListItemText
                    primary={aluno.nome}
                    secondary={`${aluno.email}`}
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate('/alunos')}
              >
                Gerenciar Alunos
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 