import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Checkbox,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Chip,
  Collapse,
  IconButton
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Ordem para os dias da semana
const ORDEM_DIAS = {
  'segunda-feira': 1,
  'terca-feira': 2,
  'quarta-feira': 3,
  'quinta-feira': 4,
  'sexta-feira': 5,
  'sabado': 6,
  'domingo': 7
};

// Mapeamento para exibição formatada
const DIAS_FORMATADOS = {
  'segunda-feira': 'Segunda-feira',
  'terca-feira': 'Terça-feira',
  'quarta-feira': 'Quarta-feira',
  'quinta-feira': 'Quinta-feira',
  'sexta-feira': 'Sexta-feira',
  'sabado': 'Sábado',
  'domingo': 'Domingo'
};

export default function DashboardAluno() {
  const [treinos, setTreinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [treinosExpandidos, setTreinosExpandidos] = useState({});
  const { usuario } = useAuth();

  const carregarTreinos = useCallback(async () => {
    try {
      setLoading(true);
      setErro('');
      
      const response = await api.get(`/treinos/aluno/${usuario.id}`);
      
      // Ordenar treinos por dia da semana
      const treinosOrdenados = response.data.sort((a, b) => {
        return ORDEM_DIAS[a.diaSemana] - ORDEM_DIAS[b.diaSemana];
      });
      
      // Inicializar o estado de expansão (todos expandidos por padrão)
      const estadoInicial = {};
      treinosOrdenados.forEach(treino => {
        estadoInicial[treino._id] = true; // true significa expandido
      });
      setTreinosExpandidos(estadoInicial);
      
      setTreinos(treinosOrdenados);
    } catch (error) {
      console.error('Erro ao carregar treinos:', error);
      setErro('Erro ao carregar seus treinos');
    } finally {
      setLoading(false);
    }
  }, [usuario.id]);

  useEffect(() => {
    carregarTreinos();
  }, [carregarTreinos]);

  async function marcarExercicio(treinoId, exercicioId, concluido) {
    try {
      setErro('');
      
      await api.patch(`/treinos/${treinoId}/exercicios/${exercicioId}/concluir`, {
        concluido: concluido
      });
      
      // Atualizar localmente
      setTreinos(treinos.map(treino => {
        if (treino._id === treinoId) {
          return {
            ...treino,
            exercicios: treino.exercicios.map(ex => {
              if (ex._id === exercicioId) {
                return { ...ex, concluido };
              }
              return ex;
            })
          };
        }
        return treino;
      }));
    } catch (error) {
      console.error('Erro ao marcar exercício:', error);
      setErro('Erro ao atualizar o exercício');
    }
  }

  async function resetarTreino(treinoId) {
    try {
      setErro('');
      
      const response = await api.post(`/treinos/${treinoId}/resetar-conclusao`);
      
      // Atualizar localmente
      setTreinos(treinos.map(treino => {
        if (treino._id === treinoId) {
          return response.data;
        }
        return treino;
      }));
    } catch (error) {
      console.error('Erro ao resetar treino:', error);
      setErro('Erro ao resetar o treino');
    }
  }

  function contarExerciciosConcluidos(treino) {
    const concluidos = treino.exercicios.filter(ex => ex.concluido).length;
    return `${concluidos}/${treino.exercicios.length} concluídos`;
  }

  function alternarExpansaoTreino(treinoId) {
    setTreinosExpandidos(prev => ({
      ...prev,
      [treinoId]: !prev[treinoId]
    }));
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Typography>Carregando...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Meus Treinos
        </Typography>
        
        {erro && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {erro}
          </Alert>
        )}
        
        {treinos.length === 0 ? (
          <Alert severity="info">
            Você ainda não tem treinos cadastrados.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {treinos.map((treino) => (
              <Grid item xs={12} key={treino._id}>
                <Card>
                  <CardHeader
                    title={treino.nome}
                    subheader={`${DIAS_FORMATADOS[treino.diaSemana] || treino.diaSemana} • ${contarExerciciosConcluidos(treino)}`}
                    action={
                      <IconButton onClick={() => alternarExpansaoTreino(treino._id)}>
                        {treinosExpandidos[treino._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    }
                  />
                  <Divider />
                  <Collapse in={treinosExpandidos[treino._id]} timeout="auto" unmountOnExit>
                    <CardContent>
                      <List>
                        {treino.exercicios.map((exercicio) => (
                          <ListItem key={exercicio._id} disablePadding>
                            <ListItemIcon>
                              <Checkbox
                                edge="start"
                                checked={exercicio.concluido}
                                onChange={(e) => marcarExercicio(treino._id, exercicio._id, e.target.checked)}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={exercicio.nome}
                              secondary={`${exercicio.series} séries × ${exercicio.repeticoes} repetições${exercicio.observacoes ? ` • ${exercicio.observacoes}` : ''}`}
                            />
                            <Chip 
                              size="small" 
                              label={exercicio.concluido ? "Concluído" : "Pendente"}
                              color={exercicio.concluido ? "success" : "default"}
                              sx={{ ml: 1 }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        color="secondary"
                        onClick={() => resetarTreino(treino._id)}
                      >
                        Resetar Progresso
                      </Button>
                    </CardActions>
                  </Collapse>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
} 