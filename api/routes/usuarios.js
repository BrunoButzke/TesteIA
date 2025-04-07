const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../config/supabaseClient');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Treino = require('../models/Treino');

// Middleware para verificar token
const verificarToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ mensagem: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta');
    req.usuarioId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ mensagem: 'Token inválido' });
  }
};

// Rota para remover índices problemáticos (apenas para desenvolvimento)
router.delete('/remover-indices', async (req, res) => {
  try {
    // Obter conexão direta com a coleção
    const collection = mongoose.connection.collection('usuarios');
    
    // Listar índices atuais
    const indices = await collection.indexes();
    console.log('Índices atuais:', indices);
    
    // Remover o índice específico que está causando problemas
    await collection.dropIndex('codigoPersonal_1_tipo_1');
    
    res.json({ 
      mensagem: 'Índice removido com sucesso',
      novosIndices: await collection.indexes()
    });
  } catch (error) {
    console.error('Erro ao remover índice:', error);
    res.status(500).json({ mensagem: 'Erro ao remover índice', erro: error.message });
  }
});

// Rota para limpar o banco de dados (apenas para desenvolvimento)
router.delete('/limpar-banco', async (req, res) => {
  try {
    await Usuario.deleteMany({});
    res.json({ mensagem: 'Banco de dados limpo com sucesso' });
  } catch (error) {
    console.error('Erro ao limpar banco:', error);
    res.status(500).json({ mensagem: 'Erro ao limpar banco de dados' });
  }
});

// Buscar alunos do personal trainer
router.get('/alunos', auth, async (req, res) => {
  try {
    const personalId = req.user.id;
    
    // Verificar se o usuário é um personal
    const { data: personal, error: personalError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', personalId)
      .eq('tipo', 'personal')
      .single();
    
    if (personalError || !personal) {
      return res.status(403).json({ mensagem: 'Apenas personal trainers podem acessar esta rota' });
    }
    
    // Buscar alunos vinculados a este personal
    const { data: alunos, error: alunosError } = await supabase
      .from('usuarios')
      .select('id, nome, email')
      .eq('personal_id', personalId)
      .eq('tipo', 'aluno')
      .order('nome');
    
    if (alunosError) {
      console.error('Erro ao buscar alunos:', alunosError);
      return res.status(500).json({ mensagem: 'Erro ao buscar alunos' });
    }
    
    res.json(alunos || []);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
});

// Buscar informações de um aluno específico
router.get('/aluno/:id', auth, async (req, res) => {
  try {
    const alunoId = req.params.id;
    const userId = req.user.id;
    
    // Buscar o aluno
    const { data: aluno, error: alunoError } = await supabase
      .from('usuarios')
      .select('id, nome, email, tipo, personal_id')
      .eq('id', alunoId)
      .eq('tipo', 'aluno')
      .single();
    
    if (alunoError || !aluno) {
      return res.status(404).json({ mensagem: 'Aluno não encontrado' });
    }
    
    // Verificar permissão (deve ser o personal do aluno ou o próprio aluno)
    const ehProprio = userId === alunoId;
    const ehPersonalDoAluno = aluno.personal_id === userId;
    
    if (!ehProprio && !ehPersonalDoAluno) {
      return res.status(403).json({ mensagem: 'Sem permissão para acessar este aluno' });
    }
    
    res.json(aluno);
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
});

// Desvincular um aluno do personal
router.delete('/alunos/:id', auth, async (req, res) => {
  try {
    const alunoId = req.params.id;
    const personalId = req.user.id;
    
    // Verificar se o usuário é um personal
    const { data: personal, error: personalError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', personalId)
      .eq('tipo', 'personal')
      .single();
    
    if (personalError || !personal) {
      return res.status(403).json({ mensagem: 'Apenas personal trainers podem realizar esta ação' });
    }
    
    // Verificar se o aluno existe e está vinculado a este personal
    const { data: aluno, error: alunoError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', alunoId)
      .eq('personal_id', personalId)
      .single();
    
    if (alunoError || !aluno) {
      return res.status(404).json({ mensagem: 'Aluno não encontrado ou não está vinculado a você' });
    }
    
    // Desvincular aluno (remover personal_id)
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ personal_id: null })
      .eq('id', alunoId);
    
    if (updateError) {
      console.error('Erro ao desvincular aluno:', updateError);
      return res.status(500).json({ mensagem: 'Erro ao desvincular aluno' });
    }
    
    // Excluir treinos associados ao aluno
    const { error: deleteTreinosError } = await supabase
      .from('treinos')
      .delete()
      .eq('aluno_id', alunoId)
      .eq('personal_id', personalId);
    
    if (deleteTreinosError) {
      console.error('Erro ao excluir treinos do aluno:', deleteTreinosError);
      // Não retornar erro, apenas registrar
    }
    
    res.json({ mensagem: 'Aluno desvinculado com sucesso' });
  } catch (error) {
    console.error('Erro ao desvincular aluno:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
});

// Buscar alunos inativos do personal trainer
router.get('/alunos/inativos', verificarToken, async (req, res) => {
  try {
    // Buscar o personal trainer
    const personal = await Usuario.findById(req.usuarioId);
    if (!personal || personal.tipo !== 'personal') {
      return res.status(403).json({ mensagem: 'Apenas personal trainers podem acessar esta rota' });
    }

    const alunosInativos = await Usuario.find({ 
      personal: personal._id,
      desvinculado: true
    })
      .select('nome email desvinculado')
      .sort('nome');
    
    res.json(alunosInativos);
  } catch (error) {
    console.error('Erro ao buscar alunos inativos:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar alunos inativos' });
  }
});

// Reativar um aluno previamente desvinculado
router.post('/alunos/:id/reativar', verificarToken, async (req, res) => {
  try {
    const alunoId = req.params.id;
    const personalId = req.usuarioId;
    
    // Verificar se o personal existe
    const personal = await Usuario.findById(personalId);
    if (!personal || personal.tipo !== 'personal') {
      return res.status(403).json({ mensagem: 'Você não tem permissão para realizar esta ação' });
    }
    
    // Verificar se o aluno existe e está vinculado ao personal logado
    const aluno = await Usuario.findOne({ 
      _id: alunoId, 
      personal: personal._id,
      desvinculado: true
    });
    
    if (!aluno) {
      return res.status(404).json({ 
        mensagem: 'Aluno não encontrado ou não está desvinculado' 
      });
    }
    
    // Reativar o aluno
    aluno.desvinculado = false;
    await aluno.save();
    
    res.json({ 
      mensagem: 'Aluno reativado com sucesso',
      aluno: {
        id: aluno._id,
        nome: aluno.nome,
        email: aluno.email,
        desvinculado: false
      }
    });
  } catch (error) {
    console.error('Erro ao reativar aluno:', error);
    res.status(500).json({ mensagem: 'Erro ao reativar o aluno' });
  }
});

module.exports = router; 