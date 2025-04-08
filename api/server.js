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

// Rota de teste para verificar se a API está funcionando
app.get('/api/check', (req, res) => {
  res.json({ status: 'API funcionando!', timestamp: new Date().toISOString() });
});

// Testar conexão com Supabase
app.get('/api/check-db', async (req, res) => {
  try {
    const { data, error, status } = await supabase
      .from('usuarios')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      return res.status(500).json({ 
        message: 'Erro ao conectar com o banco de dados',
        error: error.message,
        status
      });
    }
    
    return res.json({ 
      message: 'Conexão com o banco de dados estabelecida com sucesso',
      status
    });
  } catch (err) {
    return res.status(500).json({ 
      message: 'Erro ao verificar conexão com o banco de dados',
      error: err.message
    });
  }
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/treinos', treinoRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na API:', err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

// Exporta o app para uso com Vercel
module.exports = app; 