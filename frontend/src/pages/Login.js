import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [novoCodigoPersonal, setNovoCodigoPersonal] = useState('');
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [mensagemDesvinculo, setMensagemDesvinculo] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const resultado = await login(email, senha);
      
      if (resultado.success) {
        navigate('/dashboard');
      } else if (resultado.desvinculado) {
        setMensagemDesvinculo(resultado.mensagem);
        setDialogoAberto(true);
      } else {
        setError('Email ou senha inválidos. Tente novamente.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNovoPersonal = async () => {
    setLoading(true);
    setError(null);

    try {
      const resultado = await login(email, senha, novoCodigoPersonal);
      
      if (resultado.success) {
        setDialogoAberto(false);
        navigate('/dashboard');
      } else {
        setError('Código de personal inválido. Tente novamente.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="senha"
              label="Senha"
              type="password"
              id="senha"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <Grid container justifyContent="center">
              <Grid item>
                <Link to="/registro" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Ainda não tem uma conta? Registre-se
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>

      {/* Rodapé */}
      <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Desenvolvido por Bruno Butzke
        </Typography>
      </Box>

      {/* Diálogo para alunos desvinculados */}
      <Dialog open={dialogoAberto} onClose={() => setDialogoAberto(false)}>
        <DialogTitle>Novo Código de Personal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {mensagemDesvinculo}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="codigoPersonal"
            label="Código do Personal"
            type="text"
            fullWidth
            variant="outlined"
            value={novoCodigoPersonal}
            onChange={(e) => setNovoCodigoPersonal(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoAberto(false)}>Cancelar</Button>
          <Button onClick={handleSubmitNovoPersonal} variant="contained" disabled={loading}>
            {loading ? 'Processando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login; 