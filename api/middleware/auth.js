const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');

module.exports = async (req, res, next) => {
  try {
    // Verificar se o token está presente no cabeçalho
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ mensagem: 'Autenticação necessária' });
    }
    
    // Verificar a validade do token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.user || !decoded.user.id) {
      return res.status(401).json({ mensagem: 'Token inválido' });
    }
    
    // Verificar se o usuário existe no Supabase
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', decoded.user.id)
      .single();
    
    if (error || !usuario) {
      return res.status(401).json({ mensagem: 'Usuário não encontrado' });
    }
    
    // Salvar informações do usuário no request para uso nas rotas
    req.user = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo
    };
    
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ mensagem: 'Token inválido' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ mensagem: 'Token expirado' });
    }
    
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
}; 