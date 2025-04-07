const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../config/supabaseClient');
const { v4: uuidv4 } = require('uuid');

// Obter todos os treinos do personal logado
router.get('/personal', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Verificar se o usuário é um personal
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .eq('tipo', 'personal')
      .single();

    if (userError || !usuario) {
      return res.status(401).json({ mensagem: 'Acesso negado. Usuário não é um personal trainer' });
    }

    // Buscar treinos criados pelo personal
    const { data: treinos, error: treinosError } = await supabase
      .from('treinos')
      .select(`
        *,
        aluno:aluno_id (
          id,
          nome
        )
      `)
      .eq('personal_id', userId);

    if (treinosError) {
      console.error('Erro ao buscar treinos:', treinosError);
      return res.status(500).json({ mensagem: 'Erro ao buscar treinos' });
    }

    // Buscar exercícios para cada treino
    for (let treino of treinos) {
      const { data: exercicios, error: exerciciosError } = await supabase
        .from('exercicios')
        .select('*')
        .eq('treino_id', treino.id)
        .order('ordem', { ascending: true });

      if (exerciciosError) {
        console.error('Erro ao buscar exercícios:', exerciciosError);
        continue;
      }

      treino.exercicios = exercicios || [];
    }

    res.json(treinos);
  } catch (error) {
    console.error('Erro ao buscar treinos:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
});

// Obter todos os treinos de um aluno específico
router.get('/aluno/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const alunoId = req.params.id;

    // Verificar permissão (deve ser o próprio aluno ou seu personal)
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !usuario) {
      return res.status(401).json({ mensagem: 'Usuário não encontrado' });
    }

    // Verificar permissão
    let autorizado = false;
    if (usuario.tipo === 'personal') {
      // Verificar se o aluno pertence a este personal
      const { data: aluno, error: alunoError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', alunoId)
        .eq('personal_id', userId)
        .single();

      autorizado = !alunoError && aluno;
    } else if (usuario.tipo === 'aluno' && userId === alunoId) {
      autorizado = true;
    }

    if (!autorizado) {
      return res.status(403).json({ mensagem: 'Sem permissão para acessar estes treinos' });
    }

    // Buscar treinos do aluno
    const { data: treinos, error: treinosError } = await supabase
      .from('treinos')
      .select('*')
      .eq('aluno_id', alunoId);

    if (treinosError) {
      console.error('Erro ao buscar treinos:', treinosError);
      return res.status(500).json({ mensagem: 'Erro ao buscar treinos' });
    }

    // Buscar exercícios para cada treino
    for (let treino of treinos) {
      const { data: exercicios, error: exerciciosError } = await supabase
        .from('exercicios')
        .select('*')
        .eq('treino_id', treino.id)
        .order('ordem', { ascending: true });

      if (exerciciosError) {
        console.error('Erro ao buscar exercícios:', exerciciosError);
        continue;
      }

      treino.exercicios = exercicios || [];
    }

    res.json(treinos);
  } catch (error) {
    console.error('Erro ao buscar treinos do aluno:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
});

// Criar novo treino
router.post('/', auth, async (req, res) => {
  try {
    const { nome, diaSemana, alunoId, exercicios } = req.body;
    const personalId = req.user.id;

    // Verificar se o usuário é um personal
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', personalId)
      .eq('tipo', 'personal')
      .single();

    if (userError || !usuario) {
      return res.status(401).json({ mensagem: 'Apenas personal trainers podem criar treinos' });
    }

    // Se tem alunoId, verificar se o aluno pertence a este personal
    if (alunoId) {
      const { data: aluno, error: alunoError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', alunoId)
        .eq('personal_id', personalId)
        .single();

      if (alunoError || !aluno) {
        return res.status(400).json({ mensagem: 'Aluno não encontrado ou não pertence a este personal' });
      }
    }

    // Inserir treino
    const { data: novoTreino, error: treinoError } = await supabase
      .from('treinos')
      .insert([{
        nome,
        dia_semana: diaSemana,
        personal_id: personalId,
        aluno_id: alunoId || null,
        data_criacao: new Date()
      }])
      .select()
      .single();

    if (treinoError) {
      console.error('Erro ao criar treino:', treinoError);
      return res.status(500).json({ mensagem: 'Erro ao criar treino' });
    }

    // Inserir exercícios
    if (exercicios && exercicios.length > 0) {
      const exerciciosParaInserir = exercicios.map((ex, index) => ({
        treino_id: novoTreino.id,
        nome: ex.nome,
        series: ex.series,
        repeticoes: ex.repeticoes,
        observacoes: ex.observacoes || '',
        concluido: false,
        ordem: index
      }));

      const { data: novosExercicios, error: exerciciosError } = await supabase
        .from('exercicios')
        .insert(exerciciosParaInserir)
        .select();

      if (exerciciosError) {
        console.error('Erro ao inserir exercícios:', exerciciosError);
        // Não retornar erro, apenas registrar, já que o treino foi criado
      }

      novoTreino.exercicios = novosExercicios || [];
    } else {
      novoTreino.exercicios = [];
    }

    res.status(201).json(novoTreino);
  } catch (error) {
    console.error('Erro ao criar treino:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
});

// Obter um treino específico
router.get('/:id', auth, async (req, res) => {
  try {
    const treinoId = req.params.id;
    const userId = req.user.id;

    // Buscar o treino
    const { data: treino, error: treinoError } = await supabase
      .from('treinos')
      .select(`
        *,
        aluno:aluno_id (
          id,
          nome
        )
      `)
      .eq('id', treinoId)
      .single();

    if (treinoError || !treino) {
      return res.status(404).json({ mensagem: 'Treino não encontrado' });
    }

    // Verificar permissão (deve ser o personal do treino ou o aluno vinculado)
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !usuario) {
      return res.status(401).json({ mensagem: 'Usuário não encontrado' });
    }

    let autorizado = false;
    if (usuario.tipo === 'personal' && treino.personal_id === userId) {
      autorizado = true;
    } else if (usuario.tipo === 'aluno' && treino.aluno_id === userId) {
      autorizado = true;
    }

    if (!autorizado) {
      return res.status(403).json({ mensagem: 'Sem permissão para acessar este treino' });
    }

    // Buscar exercícios do treino
    const { data: exercicios, error: exerciciosError } = await supabase
      .from('exercicios')
      .select('*')
      .eq('treino_id', treinoId)
      .order('ordem', { ascending: true });

    if (exerciciosError) {
      console.error('Erro ao buscar exercícios:', exerciciosError);
      return res.status(500).json({ mensagem: 'Erro ao buscar exercícios do treino' });
    }

    treino.exercicios = exercicios || [];

    res.json(treino);
  } catch (error) {
    console.error('Erro ao buscar treino:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
});

// Atualizar treino
router.put('/:id', auth, async (req, res) => {
  try {
    const { nome, diaSemana, alunoId, exercicios } = req.body;
    const treinoId = req.params.id;
    const userId = req.user.id;

    // Verificar se o treino existe e se pertence ao personal
    const { data: treino, error: treinoError } = await supabase
      .from('treinos')
      .select('*')
      .eq('id', treinoId)
      .eq('personal_id', userId)
      .single();

    if (treinoError || !treino) {
      return res.status(404).json({ mensagem: 'Treino não encontrado ou sem permissão para editar' });
    }

    // Se tem alunoId, verificar se o aluno pertence a este personal
    if (alunoId) {
      const { data: aluno, error: alunoError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', alunoId)
        .eq('personal_id', userId)
        .single();

      if (alunoError || !aluno) {
        return res.status(400).json({ mensagem: 'Aluno não encontrado ou não pertence a este personal' });
      }
    }

    // Atualizar treino
    const { data: treinoAtualizado, error: updateError } = await supabase
      .from('treinos')
      .update({
        nome,
        dia_semana: diaSemana,
        aluno_id: alunoId || null,
        data_atualizacao: new Date()
      })
      .eq('id', treinoId)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar treino:', updateError);
      return res.status(500).json({ mensagem: 'Erro ao atualizar treino' });
    }

    // Excluir exercícios antigos
    const { error: deleteError } = await supabase
      .from('exercicios')
      .delete()
      .eq('treino_id', treinoId);

    if (deleteError) {
      console.error('Erro ao excluir exercícios antigos:', deleteError);
      return res.status(500).json({ mensagem: 'Erro ao atualizar exercícios' });
    }

    // Inserir novos exercícios
    if (exercicios && exercicios.length > 0) {
      const exerciciosParaInserir = exercicios.map((ex, index) => ({
        treino_id: treinoId,
        nome: ex.nome,
        series: ex.series,
        repeticoes: ex.repeticoes,
        observacoes: ex.observacoes || '',
        concluido: false,
        ordem: index
      }));

      const { data: novosExercicios, error: exerciciosError } = await supabase
        .from('exercicios')
        .insert(exerciciosParaInserir)
        .select();

      if (exerciciosError) {
        console.error('Erro ao inserir novos exercícios:', exerciciosError);
        return res.status(500).json({ mensagem: 'Erro ao atualizar exercícios' });
      }

      treinoAtualizado.exercicios = novosExercicios;
    } else {
      treinoAtualizado.exercicios = [];
    }

    res.json(treinoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar treino:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
});

// Excluir treino
router.delete('/:id', auth, async (req, res) => {
  try {
    const treinoId = req.params.id;
    const userId = req.user.id;

    // Verificar se o treino existe e se pertence ao personal
    const { data: treino, error: treinoError } = await supabase
      .from('treinos')
      .select('*')
      .eq('id', treinoId)
      .eq('personal_id', userId)
      .single();

    if (treinoError || !treino) {
      return res.status(404).json({ mensagem: 'Treino não encontrado ou sem permissão para excluir' });
    }

    // Excluir exercícios vinculados
    const { error: exerciciosError } = await supabase
      .from('exercicios')
      .delete()
      .eq('treino_id', treinoId);

    if (exerciciosError) {
      console.error('Erro ao excluir exercícios:', exerciciosError);
      return res.status(500).json({ mensagem: 'Erro ao excluir exercícios do treino' });
    }

    // Excluir treino
    const { error: deleteError } = await supabase
      .from('treinos')
      .delete()
      .eq('id', treinoId);

    if (deleteError) {
      console.error('Erro ao excluir treino:', deleteError);
      return res.status(500).json({ mensagem: 'Erro ao excluir treino' });
    }

    res.json({ mensagem: 'Treino excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir treino:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
});

// Marcar exercício como concluído ou não concluído
router.patch('/:treinoId/exercicios/:exercicioId/concluir', auth, async (req, res) => {
  try {
    const { treinoId, exercicioId } = req.params;
    const { concluido } = req.body;
    const userId = req.user.id;

    // Verificar se o treino existe
    const { data: treino, error: treinoError } = await supabase
      .from('treinos')
      .select('*')
      .eq('id', treinoId)
      .single();

    if (treinoError || !treino) {
      return res.status(404).json({ mensagem: 'Treino não encontrado' });
    }

    // Verificar permissão (deve ser o aluno do treino ou seu personal)
    let autorizado = false;
    if (treino.personal_id === userId) {
      autorizado = true;
    } else if (treino.aluno_id === userId) {
      autorizado = true;
    }

    if (!autorizado) {
      return res.status(403).json({ mensagem: 'Sem permissão para marcar exercício como concluído' });
    }

    // Verificar se o exercício existe e pertence ao treino
    const { data: exercicio, error: exercicioError } = await supabase
      .from('exercicios')
      .select('*')
      .eq('id', exercicioId)
      .eq('treino_id', treinoId)
      .single();

    if (exercicioError || !exercicio) {
      return res.status(404).json({ mensagem: 'Exercício não encontrado neste treino' });
    }

    // Atualizar o exercício
    const { data: exercicioAtualizado, error: updateError } = await supabase
      .from('exercicios')
      .update({ concluido: concluido })
      .eq('id', exercicioId)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar exercício:', updateError);
      return res.status(500).json({ mensagem: 'Erro ao atualizar exercício' });
    }

    res.json(exercicioAtualizado);
  } catch (error) {
    console.error('Erro ao marcar exercício como concluído:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
});

// Resetar conclusão dos exercícios de um treino
router.post('/:id/resetar-conclusao', auth, async (req, res) => {
  try {
    const treinoId = req.params.id;
    const userId = req.user.id;

    // Verificar se o treino existe
    const { data: treino, error: treinoError } = await supabase
      .from('treinos')
      .select('*')
      .eq('id', treinoId)
      .single();

    if (treinoError || !treino) {
      return res.status(404).json({ mensagem: 'Treino não encontrado' });
    }

    // Verificar permissão (deve ser o aluno do treino ou seu personal)
    let autorizado = false;
    if (treino.personal_id === userId) {
      autorizado = true;
    } else if (treino.aluno_id === userId) {
      autorizado = true;
    }

    if (!autorizado) {
      return res.status(403).json({ mensagem: 'Sem permissão para resetar este treino' });
    }

    // Resetar todos os exercícios
    const { error: updateError } = await supabase
      .from('exercicios')
      .update({ concluido: false })
      .eq('treino_id', treinoId);

    if (updateError) {
      console.error('Erro ao resetar exercícios:', updateError);
      return res.status(500).json({ mensagem: 'Erro ao resetar exercícios' });
    }

    // Buscar o treino atualizado com exercícios
    const { data: treinoAtualizado, error: getTreinoError } = await supabase
      .from('treinos')
      .select('*')
      .eq('id', treinoId)
      .single();

    if (getTreinoError) {
      console.error('Erro ao buscar treino atualizado:', getTreinoError);
      return res.status(500).json({ mensagem: 'Erro ao buscar treino atualizado' });
    }

    // Buscar exercícios atualizados
    const { data: exercicios, error: exerciciosError } = await supabase
      .from('exercicios')
      .select('*')
      .eq('treino_id', treinoId)
      .order('ordem', { ascending: true });

    if (exerciciosError) {
      console.error('Erro ao buscar exercícios atualizados:', exerciciosError);
      return res.status(500).json({ mensagem: 'Erro ao buscar exercícios atualizados' });
    }

    treinoAtualizado.exercicios = exercicios || [];

    res.json(treinoAtualizado);
  } catch (error) {
    console.error('Erro ao resetar conclusão do treino:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
});

// Obter dados para cópia de treino
router.get('/:id/copiar', auth, async (req, res) => {
  try {
    const treinoId = req.params.id;
    const userId = req.user.id;

    // Verificar se o treino existe
    const { data: treino, error: treinoError } = await supabase
      .from('treinos')
      .select(`
        *,
        aluno:aluno_id (
          id,
          nome
        )
      `)
      .eq('id', treinoId)
      .single();

    if (treinoError || !treino) {
      return res.status(404).json({ mensagem: 'Treino não encontrado' });
    }

    // Verificar permissão (deve ser o personal do treino)
    if (treino.personal_id !== userId) {
      return res.status(403).json({ mensagem: 'Sem permissão para copiar este treino' });
    }

    // Buscar exercícios
    const { data: exercicios, error: exerciciosError } = await supabase
      .from('exercicios')
      .select('*')
      .eq('treino_id', treinoId)
      .order('ordem', { ascending: true });

    if (exerciciosError) {
      console.error('Erro ao buscar exercícios:', exerciciosError);
      return res.status(500).json({ mensagem: 'Erro ao buscar exercícios do treino' });
    }

    // Preparar dados para cópia
    const dadosCopia = {
      nome: `Cópia de ${treino.nome}`,
      diaSemana: treino.dia_semana,
      aluno: treino.aluno || null,
      exercicios: exercicios.map(ex => ({
        nome: ex.nome,
        series: ex.series,
        repeticoes: ex.repeticoes,
        observacoes: ex.observacoes || ''
      }))
    };

    res.json(dadosCopia);
  } catch (error) {
    console.error('Erro ao copiar treino:', error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
});

module.exports = router; 