import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function Registro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('');
  const [codigoPersonal, setCodigoPersonal] = useState('');
  const [erro, setErro] = useState('');
  const { registro } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    try {
      await registro(nome, email, senha, tipo, tipo === 'aluno' ? codigoPersonal : null);
      navigate('/dashboard');
    } catch (error) {
      setErro(error.message);
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Registro
          </Typography>

          {erro && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erro}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              margin="normal"
              required
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Tipo de Usuário</InputLabel>
              <Select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                label="Tipo de Usuário"
                required
              >
                <MenuItem value="personal">Personal Trainer</MenuItem>
                <MenuItem value="aluno">Aluno</MenuItem>
              </Select>
            </FormControl>

            {tipo === 'aluno' && (
              <TextField
                fullWidth
                label="Código do Personal Trainer"
                value={codigoPersonal}
                onChange={(e) => setCodigoPersonal(e.target.value)}
                margin="normal"
                required
                helperText="Digite o código de 6 dígitos fornecido pelo seu Personal Trainer"
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
            >
              Registrar
            </Button>
          </form>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Já tem uma conta?{' '}
              <Link component={RouterLink} to="/login" underline="hover">
                Faça login
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
      
      {/* Rodapé */}
      <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Desenvolvido por Bruno Butzke
        </Typography>
      </Box>
    </Container>
  );
} 