import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const diasSemana = {
  'segunda-feira': 'Segunda-feira',
  'terca-feira': 'Terça-feira',
  'quarta-feira': 'Quarta-feira',
  'quinta-feira': 'Quinta-feira',
  'sexta-feira': 'Sexta-feira',
  'sabado': 'Sábado',
  'domingo': 'Domingo'
};

export default function DetalhesTreino() {
  const [treino, setTreino] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  useEffect(() => {
    carregarTreino();
  }, [id]);

  const carregarTreino = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/treinos/${id}`);
      setTreino(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar treino:', err);
      setError('Não foi possível carregar os detalhes do treino. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = () => {
    navigate(`/editar-treino/${id}`);
  };

  const handleVoltar = () => {
    // Volta para a lista de treinos ou para o dashboard dependendo do tipo de usuário
    if (usuario?.tipo === 'personal') {
      navigate('/lista-treinos');
    } else {
      navigate('/aluno/dashboard');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" mt={4}>Carregando detalhes do treino...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleVoltar}
          sx={{ mt: 2 }}
        >
          Voltar
        </Button>
      </Container>
    );
  }

  if (!treino) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Treino não encontrado.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleVoltar}
          sx={{ mt: 2 }}
        >
          Voltar
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {treino.nome}
          </Typography>
          {usuario?.tipo === 'personal' && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditar}
            >
              Editar
            </Button>
          )}
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Dia da Semana
                </Typography>
                <Typography variant="h6">
                  {diasSemana[treino.diaSemana]}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Aluno
                </Typography>
                <Typography variant="h6">
                  {treino.aluno ? treino.aluno.nome : 'Nenhum aluno associado'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Exercícios
        </Typography>
        
        {treino.exercicios.length === 0 ? (
          <Alert severity="info">Este treino não possui exercícios.</Alert>
        ) : (
          <List>
            {treino.exercicios.map((exercicio, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" component="div">
                          {exercicio.nome}
                        </Typography>
                        <Chip 
                          label={`${exercicio.series} x ${exercicio.repeticoes}`}
                          color="primary"
                          size="small"
                          sx={{ ml: 2 }}
                        />
                      </Box>
                    }
                    secondary={
                      exercicio.observacoes && (
                        <Typography
                          sx={{ display: 'inline' }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          Observações: {exercicio.observacoes}
                        </Typography>
                      )
                    }
                  />
                </ListItem>
                {index < treino.exercicios.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
        
        <Box sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleVoltar}
          >
            Voltar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 