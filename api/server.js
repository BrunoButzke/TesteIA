const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const treinoRoutes = require('./routes/treinos');
const usuarioRoutes = require('./routes/usuarios');
const { supabase } = require('./config/supabaseClient');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/treinos', treinoRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

// Exporta o app para uso com Vercel
module.exports = app; 