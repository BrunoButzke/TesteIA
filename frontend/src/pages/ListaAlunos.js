import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  FormControlLabel,
  Switch,
  Divider,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const ListaAlunos = () => {
  const [alunos, setAlunos] = useState([]);
  const [alunosInativos, setAlunosInativos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [alunoParaRemover, setAlunoParaRemover] = useState(null);
  const [feedback, setFeedback] = useState({ open: false, message: '', type: 'success' });
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    carregarAlunos();
  }, []);

  const carregarAlunos = async () => {
    setLoading(true);
    try {
      // Carregar alunos ativos
      const responseAtivos = await api.get('/usuarios/alunos');
      setAlunos(responseAtivos.data);
      
      // Carregar alunos inativos, se necessário
      const responseInativos = await api.get('/usuarios/alunos/inativos');
      setAlunosInativos(responseInativos.data);
      
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar alunos:', err);
      setError('Não foi possível carregar a lista de alunos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const verTreinosAluno = (alunoId) => {
    navigate(`/alunos/${alunoId}/treinos`);
  };

  const confirmarRemocao = (aluno) => {
    setAlunoParaRemover(aluno);
    setDialogoAberto(true);
  };

  const removerAluno = async () => {
    try {
      await api.delete(`/usuarios/alunos/${alunoParaRemover._id}`);
      setFeedback({
        open: true,
        message: 'Aluno removido com sucesso!',
        type: 'success'
      });
      
      // Mover o aluno da lista de ativos para inativos
      const alunoRemovido = alunos.find(a => a._id === alunoParaRemover._id);
      if (alunoRemovido) {
        setAlunos(alunos.filter(a => a._id !== alunoParaRemover._id));
        setAlunosInativos([...alunosInativos, {...alunoRemovido, desvinculado: true}]);
      }
    } catch (err) {
      console.error('Erro ao remover aluno:', err);
      setFeedback({
        open: true,
        message: 'Erro ao remover aluno. Por favor, tente novamente.',
        type: 'error'
      });
    } finally {
      setDialogoAberto(false);
      setAlunoParaRemover(null);
    }
  };

  const reativarAluno = async (alunoId) => {
    try {
      await api.post(`/usuarios/alunos/${alunoId}/reativar`);
      
      // Mover o aluno da lista de inativos para ativos
      const alunoReativado = alunosInativos.find(a => a._id === alunoId);
      if (alunoReativado) {
        setAlunosInativos(alunosInativos.filter(a => a._id !== alunoId));
        setAlunos([...alunos, {...alunoReativado, desvinculado: false}]);
      }
      
      setFeedback({
        open: true,
        message: 'Aluno reativado com sucesso!',
        type: 'success'
      });
    } catch (err) {
      console.error('Erro ao reativar aluno:', err);
      setFeedback({
        open: true,
        message: 'Erro ao reativar aluno. Por favor, tente novamente.',
        type: 'error'
      });
    }
  };

  const handleToggleInativos = (event) => {
    setMostrarInativos(event.target.checked);
  };

  const fecharFeedback = () => {
    setFeedback({ ...feedback, open: false });
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h6" mt={4}>Carregando alunos...</Typography>
      </Container>
    );
  }

  // Determinar quais alunos exibir com base no filtro
  const alunosParaExibir = mostrarInativos ? alunosInativos : alunos;

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Meus Alunos
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={mostrarInativos}
                onChange={handleToggleInativos}
                color="primary"
              />
            }
            label="Mostrar alunos inativos"
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {alunosParaExibir.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            {mostrarInativos 
              ? 'Você não tem alunos inativos.' 
              : 'Você ainda não tem alunos registrados com seu código.'}
          </Alert>
        ) : (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {alunosParaExibir.map((aluno) => (
              <Grid item xs={12} sm={6} md={4} key={aluno._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        {aluno.nome}
                      </Typography>
                    </Box>
                    <Typography color="text.secondary" gutterBottom>
                      {aluno.email}
                    </Typography>
                    
                    {mostrarInativos && (
                      <Chip 
                        label="Inativo" 
                        color="error" 
                        size="small" 
                        sx={{ mt: 1 }} 
                      />
                    )}
                  </CardContent>
                  <CardActions>
                    {!mostrarInativos ? (
                      <>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => verTreinosAluno(aluno._id)}
                        >
                          Ver Treinos
                        </Button>
                        <IconButton
                          color="error"
                          onClick={() => confirmarRemocao(aluno)}
                          title="Remover Aluno"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    ) : (
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => reativarAluno(aluno._id)}
                      >
                        Reativar Aluno
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Diálogo de confirmação de remoção */}
      <Dialog
        open={dialogoAberto}
        onClose={() => setDialogoAberto(false)}
      >
        <DialogTitle>Confirmar remoção</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover o aluno "{alunoParaRemover?.nome}"?
            <br /><br />
            <strong>Atenção:</strong> Todos os treinos associados a este aluno serão excluídos.
            <br />
            O aluno será desvinculado de você e precisará informar um novo código de personal ao fazer login.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoAberto(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={removerAluno} color="error">
            Remover
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

export default ListaAlunos; 