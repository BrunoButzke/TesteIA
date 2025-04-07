import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Button, Box, Grid, Card, CardContent, 
  CardActions, IconButton, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, Snackbar, Alert, Divider, Chip,
  TextField, InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import api from '../services/api';

const diasSemana = {
  'segunda-feira': 'Segunda-feira',
  'terca-feira': 'Terça-feira',
  'quarta-feira': 'Quarta-feira',
  'quinta-feira': 'Quinta-feira',
  'sexta-feira': 'Sexta-feira',
  'sabado': 'Sábado',
  'domingo': 'Domingo'
};

const ListaTreinos = () => {
  const [treinos, setTreinos] = useState([]);
  const [treinosFiltrados, setTreinosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [treinoParaExcluir, setTreinoParaExcluir] = useState(null);
  const [feedback, setFeedback] = useState({ open: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    carregarTreinos();
  }, []);

  const filtrarTreinos = useCallback(() => {
    if (!searchTerm.trim()) {
      setTreinosFiltrados(treinos);
      return;
    }

    const termo = searchTerm.toLowerCase().trim();
    const resultado = treinos.filter(treino => {
      // Filtrar por nome do treino
      const matchNome = treino.nome.toLowerCase().includes(termo);
      
      // Filtrar por nome do aluno
      const matchAluno = treino.aluno && treino.aluno.nome.toLowerCase().includes(termo);
      
      // Filtrar por dia da semana
      const diaSemanaFormatado = diasSemana[treino.diaSemana] || '';
      const matchDia = diaSemanaFormatado.toLowerCase().includes(termo);

      // Filtrar por exercícios
      const matchExercicios = treino.exercicios.some(ex => 
        ex.nome && ex.nome.toLowerCase().includes(termo)
      );
      
      return matchNome || matchAluno || matchDia || matchExercicios;
    });
    
    setTreinosFiltrados(resultado);
  }, [searchTerm, treinos]);

  useEffect(() => {
    filtrarTreinos();
  }, [filtrarTreinos]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const carregarTreinos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/treinos/personal');
      setTreinos(response.data);
      setTreinosFiltrados(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar treinos:', err);
      setError('Não foi possível carregar os treinos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const editarTreino = (treinoId) => {
    navigate(`/editar-treino/${treinoId}`);
  };

  const confirmarExclusao = (treino) => {
    setTreinoParaExcluir(treino);
    setDialogOpen(true);
  };

  const excluirTreino = async () => {
    try {
      await api.delete(`/treinos/${treinoParaExcluir._id}`);
      setFeedback({
        open: true,
        message: 'Treino excluído com sucesso!',
        type: 'success'
      });
      setTreinos(treinos.filter(t => t._id !== treinoParaExcluir._id));
    } catch (err) {
      console.error('Erro ao excluir treino:', err);
      setFeedback({
        open: true,
        message: 'Erro ao excluir treino. Por favor, tente novamente.',
        type: 'error'
      });
    } finally {
      setDialogOpen(false);
      setTreinoParaExcluir(null);
    }
  };

  const copiarTreino = async (treinoId) => {
    try {
      setLoading(true);
      
      // Mostrar feedback de que a operação está em andamento
      setFeedback({
        open: true,
        message: 'Preparando treino para cópia...',
        type: 'info'
      });
      
      const response = await api.get(`/treinos/${treinoId}/copiar`);
      
      // Verificar se a resposta contém os dados necessários
      if (!response.data || !response.data.nome || !response.data.diaSemana) {
        throw new Error('Os dados do treino retornados estão incompletos');
      }
      
      // Armazenar os dados do treino no localStorage para uso na página de criação
      localStorage.setItem('treinoCopia', JSON.stringify(response.data));
      
      // Informar sucesso antes de redirecionar
      setFeedback({
        open: true,
        message: 'Treino pronto para cópia! Redirecionando...',
        type: 'success'
      });
      
      // Pequeno delay para o usuário ver a mensagem de sucesso
      setTimeout(() => {
        // Redirecionar para a página de criação de treino
        navigate('/criar-treino?copia=true');
      }, 1000);
      
    } catch (err) {
      console.error('Erro ao copiar treino:', err);
      setFeedback({
        open: true,
        message: `Erro ao copiar treino: ${err.response?.data?.mensagem || err.message || 'Erro desconhecido'}`,
        type: 'error'
      });
      setLoading(false);
    }
  };

  const visualizarTreino = (treinoId) => {
    navigate(`/visualizar-treino/${treinoId}`);
  };

  const fecharFeedback = () => {
    setFeedback({ ...feedback, open: false });
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h6" mt={4}>Carregando treinos...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Todos os Treinos
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/criar-treino')}
          >
            Criar Novo Treino
          </Button>
          
          <TextField
            placeholder="Pesquisar treinos..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ minWidth: '250px', flexGrow: 1, maxWidth: '400px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {treinos.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Você ainda não criou nenhum treino.
          </Alert>
        ) : treinosFiltrados.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Nenhum treino encontrado para a pesquisa "{searchTerm}".
          </Alert>
        ) : (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {treinosFiltrados.map((treino) => (
              <Grid item xs={12} sm={6} md={4} key={treino._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                      {treino.nome}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      {diasSemana[treino.diaSemana]}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {treino.exercicios.length} exercícios
                    </Typography>
                    {treino.aluno && (
                      <Chip 
                        label={`Aluno: ${treino.aluno.nome}`}
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                  <CardActions>
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => visualizarTreino(treino._id)}
                      title="Visualizar Treino"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => editarTreino(treino._id)}
                      title="Editar Treino"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => confirmarExclusao(treino)}
                      title="Excluir Treino"
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="secondary" 
                      onClick={() => copiarTreino(treino._id)}
                      title="Copiar Treino"
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o treino "{treinoParaExcluir?.nome}"? 
            {treinoParaExcluir?.aluno && (
              <>
                <br />
                Esse treino está associado ao aluno <strong>{treinoParaExcluir.aluno.nome}</strong>.
                <br />
                A exclusão removerá o treino desse aluno.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={excluirTreino} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback ao usuário */}
      <Snackbar 
        open={feedback.open} 
        autoHideDuration={6000} 
        onClose={fecharFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={fecharFeedback} severity={feedback.type} sx={{ width: '100%' }}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ListaTreinos; 