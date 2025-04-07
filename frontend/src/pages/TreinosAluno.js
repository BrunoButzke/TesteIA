import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Divider,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Alert
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import api from '../services/api';

// Ordem para os dias da semana
const ORDEM_DIAS = {
  'Segunda': 1,
  'Terça': 2,
  'Quarta': 3,
  'Quinta': 4,
  'Sexta': 5,
  'Sábado': 6,
  'Domingo': 7
};

export default function TreinosAluno() {
  const [treinos, setTreinos] = useState([]);
  const [aluno, setAluno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const { id } = useParams();

  useEffect(() => {
    carregarDados();
  }, [id]);

  async function carregarDados() {
    try {
      setLoading(true);
      setErro('');

      // Carregar informações do aluno
      const alunoResponse = await api.get(`/usuarios/aluno/${id}`);
      setAluno(alunoResponse.data);

      // Carregar treinos do aluno
      const treinosResponse = await api.get(`/treinos/aluno/${id}`);
      
      // Ordenar treinos por dia da semana
      const treinosOrdenados = treinosResponse.data.sort((a, b) => {
        return ORDEM_DIAS[a.diaSemana] - ORDEM_DIAS[b.diaSemana];
      });
      
      setTreinos(treinosOrdenados);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados do aluno e treinos');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Typography>Carregando...</Typography>
      </Container>
    );
  }

  if (erro) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">{erro}</Alert>
      </Container>
    );
  }

  if (!aluno) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning">Aluno não encontrado</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Treinos de {aluno.nome}
        </Typography>
        
        {treinos.length === 0 ? (
          <Alert severity="info">
            Nenhum treino cadastrado para este aluno
          </Alert>
        ) : (
          <Box>
            {treinos.map((treino) => (
              <Card key={treino._id} sx={{ mb: 2 }}>
                <CardHeader 
                  title={treino.nome}
                  subheader={`${treino.diaSemana}`}
                />
                <Divider />
                <CardContent>
                  <List>
                    {treino.exercicios.map((exercicio) => (
                      <ListItem key={exercicio._id} disablePadding>
                        <Accordion sx={{ width: '100%' }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
                              <Typography>{exercicio.nome}</Typography>
                              <Chip 
                                label={exercicio.concluido ? 'Concluído' : 'Pendente'} 
                                color={exercicio.concluido ? 'success' : 'default'} 
                                size="small"
                                sx={{ ml: 2 }}
                              />
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box>
                              <Typography variant="body2">
                                <strong>Séries:</strong> {exercicio.series}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Repetições:</strong> {exercicio.repeticoes}
                              </Typography>
                              {exercicio.observacoes && (
                                <Typography variant="body2">
                                  <strong>Observações:</strong> {exercicio.observacoes}
                                </Typography>
                              )}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
} 