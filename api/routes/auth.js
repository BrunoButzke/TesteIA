const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabaseClient');

// Gerador de código aleatório para personal
function gerarCodigoPersonal() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Registro
router.post('/registro', async (req, res) => {
  try {
    const { nome, email, senha, tipo, codigoPersonal } = req.body;

    // Validar campos
    if (!nome || !email || !senha || !tipo) {
      return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });
    }

    // Verificar se o email já está registrado
    const { data: usuarios, error: checkError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('Erro ao verificar email:', checkError);
      return res.status(500).json({ mensagem: 'Erro ao verificar email' });
    }

    if (usuarios) {
      return res.status(400).json({ mensagem: 'Email já está em uso' });
    }

    // Criptografar senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    let personalId = null;
    let codigoGerado = null;

    // Se for aluno, verificar código do personal
    if (tipo === 'aluno') {
      if (!codigoPersonal) {
        return res.status(400).json({ mensagem: 'Código do personal é obrigatório para alunos' });
      }

      // Buscar personal pelo código
      const { data: personais, error: personalError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('codigo_personal', codigoPersonal)
        .eq('tipo', 'personal')
        .maybeSingle();

      if (personalError) {
        console.error('Erro ao buscar personal:', personalError);
        return res.status(500).json({ mensagem: 'Erro ao verificar código do personal' });
      }

      if (!personais) {
        return res.status(400).json({ mensagem: 'Código de personal inválido' });
      }

      personalId = personais.id;
    } else if (tipo === 'personal') {
      // Gerar código único para o personal
      codigoGerado = gerarCodigoPersonal();
    }

    // Criar usuário no Supabase
    const { data: novoUsuario, error: insertError } = await supabase
      .from('usuarios')
      .insert([{
        nome,
        email,
        senha: senhaHash,
        tipo,
        codigo_personal: tipo === 'personal' ? codigoGerado : null,
        personal_id: tipo === 'aluno' ? personalId : null,
        data_criacao: new Date()
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao criar usuário:', insertError);
      return res.status(500).json({ mensagem: 'Erro ao criar usuário' });
    }

    // Criar token JWT
    const payload = {
      user: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        tipo: novoUsuario.tipo
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          usuario: {
            id: novoUsuario.id,
            nome: novoUsuario.nome,
            email: novoUsuario.email,
            tipo: novoUsuario.tipo,
            codigoPersonal: novoUsuario.codigo_personal
          }
        });
      }
    );
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha, novoCodigoPersonal } = req.body;

    // Validar campos
    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });
    }

    // Buscar usuário pelo email
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      console.error('Erro ao buscar usuário:', userError);
      return res.status(500).json({ mensagem: 'Erro ao buscar usuário' });
    }

    if (!usuario) {
      return res.status(400).json({ mensagem: 'Credenciais inválidas' });
    }

    // Verificar senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(400).json({ mensagem: 'Credenciais inválidas' });
    }

    // Verificar se é um aluno com personal_id nulo (desvinculado)
    if (usuario.tipo === 'aluno' && !usuario.personal_id) {
      // Se foi fornecido um novo código de personal
      if (novoCodigoPersonal) {
        // Buscar personal pelo código
        const { data: personal, error: personalError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('codigo_personal', novoCodigoPersonal)
          .eq('tipo', 'personal')
          .maybeSingle();

        if (personalError) {
          console.error('Erro ao buscar personal:', personalError);
          return res.status(500).json({ mensagem: 'Erro ao verificar código do personal' });
        }

        if (!personal) {
          return res.status(400).json({ mensagem: 'Código de personal inválido' });
        }

        // Vincular aluno ao personal
        const { error: updateError } = await supabase
          .from('usuarios')
          .update({ personal_id: personal.id })
          .eq('id', usuario.id);

        if (updateError) {
          console.error('Erro ao vincular aluno ao personal:', updateError);
          return res.status(500).json({ mensagem: 'Erro ao vincular ao personal' });
        }

        usuario.personal_id = personal.id;
      } else {
        return res.status(400).json({
          desvinculado: true,
          mensagem: 'Você não está vinculado a nenhum personal. Por favor, forneça um código de personal válido.'
        });
      }
    }

    // Criar token JWT
    const payload = {
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo: usuario.tipo,
            codigoPersonal: usuario.codigo_personal
          }
        });
      }
    );
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
});

module.exports = router; 