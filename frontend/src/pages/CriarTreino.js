import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Box,
  Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../services/api';

const EXERCICIOS = [
  'Agachamento Livre', 'Agachamento Hack', 'Cadeira Extensora dropset',
  'Afundo com halteres', 'Leg press45', 'Panturrilha sentado',
  'Puxada Supinada', 'Remada Baixa com triangulo', 'remada curva na polia com corda',
  'serrote', 'Rosca direta com halteres', 'Abdominal remador',
  'Mesa flexora', 'Stiff com halteres', 'bulgaro', 'terra sumô',
  'Gluteo na polia', 'Elevação pelvica com barra', 'Supino Inclinado com halteres',
  'Desenvolvimento com barra no banco', 'elevação lateral', 'elevação frontal',
  'triceps coice com halter unilateral', 'triceps polia barra reta',
  'abdominal prancha', 'abdominal bicicleta', 'agachamento barra livre',
  'stiff com barra', 'mesa flexora', 'cadeira extensora unilateral',
  'abdução de quadril na polia', 'elevação pelvica na barra'
];

const DIAS_SEMANA = [
  'segunda-feira', 'terca-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sabado', 'domingo'
];

export default function CriarTreino() {
  const [nome, setNome] = useState('');
  const [diaSemana, setDiaSemana] = useState('');
  const [alunoId, setAlunoId] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [exercicios, setExercicios] = useState([]);
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [modoCopia, setModoCopia] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // Obtém o ID do treino da URL, se existir
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isCopia = searchParams.get('copia') === 'true';

  useEffect(() => {
    carregarAlunos();
    
    // Se tiver um ID na URL, carrega o treino para edição
    if (id) {
      setModoEdicao(true);
      carregarTreino(id);
    } 
    // Se estiver no modo cópia, carrega os dados do treino do localStorage
    else if (isCopia) {
      carregarTreinoCopia();
    }
  }, [id, isCopia]);

  async function carregarTreino(treinoId) {
    setIsLoading(true);
    try {
      const response = await api.get(`/treinos/${treinoId}`);
      const treino = response.data;
      
      setNome(treino.nome);
      setDiaSemana(treino.diaSemana);
      setAlunoId(treino.aluno?._id || '');
      setExercicios(treino.exercicios);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar treino:', error);
      setErro('Não foi possível carregar o treino para edição');
      setIsLoading(false);
    }
  }

  const carregarTreinoCopia = () => {
    try {
      setModoCopia(true);
      const treinoCopiaJSON = localStorage.getItem('treinoCopia');
      
      if (!treinoCopiaJSON) {
        console.warn('Não há dados de treino para cópia no localStorage');
        return;
      }
      
      const treinoCopia = JSON.parse(treinoCopiaJSON);
      console.log('Treino a ser copiado:', treinoCopia);
      
      // Limpar o localStorage após carregar para não interferir em futuras operações
      localStorage.removeItem('treinoCopia');
      
      // Verificar se os dados necessários estão presentes
      if (!treinoCopia.nome || !treinoCopia.diaSemana) {
        console.warn('Dados do treino incompletos:', treinoCopia);
        setErro('Dados do treino para cópia estão incompletos');
        return;
      }
      
      // Preencher o formulário com os dados do treino
      setNome(treinoCopia.nome || '');
      setDiaSemana(treinoCopia.diaSemana || '');
      setAlunoId(treinoCopia.aluno?._id || '');
      
      // Verificar se há exercícios e processá-los corretamente
      if (treinoCopia.exercicios && Array.isArray(treinoCopia.exercicios) && treinoCopia.exercicios.length > 0) {
        console.log('Processando exercícios:', treinoCopia.exercicios);
        
        // Mapear cada exercício para garantir que todos os campos sejam extraídos corretamente
        const exerciciosMapeados = treinoCopia.exercicios.map(ex => {
          // Se o exercício não tem os campos necessários, criar um objeto vazio
          if (!ex || typeof ex !== 'object') {
            console.warn('Exercício inválido:', ex);
            return { nome: '', series: '', repeticoes: '', observacoes: '' };
          }
          
          // Para cada campo, verificar se existe e é válido
          const exercicioProcessado = {
            nome: typeof ex.nome === 'string' ? ex.nome : '',
            series: ex.series !== undefined ? ex.series : '',
            repeticoes: ex.repeticoes !== undefined ? ex.repeticoes : '',
            observacoes: typeof ex.observacoes === 'string' ? ex.observacoes : ''
          };
          
          console.log('Exercício processado:', exercicioProcessado);
          return exercicioProcessado;
        });
        
        console.log('Exercícios processados para cópia:', exerciciosMapeados);
        setExercicios(exerciciosMapeados);
        setErro(''); // Limpar erro se tudo estiver ok
      } else {
        console.warn('Não foram encontrados exercícios válidos no treino a ser copiado');
        setExercicios([]);
      }
      
      // Se chegou até aqui, a cópia foi bem-sucedida
      setErro(''); // Garantir que não há erro
      
    } catch (error) {
      console.error('Erro ao carregar treino para cópia:', error);
      setErro('Erro ao processar dados do treino para cópia. Por favor, tente novamente.');
    }
  };

  async function carregarAlunos() {
    try {
      console.log('Headers antes de carregar alunos:', api.defaults.headers);
      const response = await api.get('/usuarios/alunos');
      console.log('Resposta de carregar alunos:', response.data);
      setAlunos(response.data);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      setErro(error.response?.data?.mensagem || 'Erro ao carregar lista de alunos');
    }
  }

  function adicionarExercicio() {
    setExercicios([
      ...exercicios,
      {
        nome: '',
        series: '',
        repeticoes: '',
        observacoes: ''
      }
    ]);
  }

  function removerExercicio(index) {
    setExercicios(exercicios.filter((_, i) => i !== index));
  }

  function atualizarExercicio(index, campo, valor) {
    const novosExercicios = [...exercicios];
    
    // Validação para séries e repetições
    if (campo === 'series' || campo === 'repeticoes') {
      const num = parseInt(valor);
      if (num < 0 || num > 99) {
        return; // Não atualiza se o valor estiver fora do intervalo
      }
    }
    
    novosExercicios[index] = {
      ...novosExercicios[index],
      [campo]: valor
    };
    setExercicios(novosExercicios);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    try {
      // Validar séries e repetições antes de enviar
      const exerciciosValidados = exercicios.map(ex => {
        const series = parseInt(ex.series);
        const repeticoes = parseInt(ex.repeticoes);
        
        if (series < 0 || series > 99 || repeticoes < 0 || repeticoes > 99) {
          throw new Error('Séries e repetições devem estar entre 0 e 99');
        }
        
        return {
          ...ex,
          series,
          repeticoes
        };
      });

      const dadosTreino = {
        nome,
        diaSemana,
        alunoId,
        exercicios: exerciciosValidados
      };

      let response;
      
      if (modoEdicao) {
        // Atualizar treino existente
        response = await api.put(`/treinos/${id}`, dadosTreino);
      } else {
        // Criar novo treino
        response = await api.post('/treinos', dadosTreino);
      }

      console.log('Resposta da operação:', response.data);
      navigate('/lista-treinos');
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
      setErro(error.response?.data?.mensagem || error.message || 'Erro ao salvar treino');
    }
  }

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6">Carregando treino...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {modoEdicao 
            ? 'Editar Treino' 
            : modoCopia 
              ? 'Copiar Treino' 
              : 'Criar Novo Treino'
          }
        </Typography>

        {erro && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {erro}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome do Treino"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Dia da Semana</InputLabel>
                <Select
                  value={diaSemana}
                  onChange={(e) => setDiaSemana(e.target.value)}
                  label="Dia da Semana"
                >
                  {DIAS_SEMANA.map((dia) => (
                    <MenuItem key={dia} value={dia}>
                      {dia.charAt(0).toUpperCase() + dia.slice(1).replace('-feira', '')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Aluno</InputLabel>
                <Select
                  value={alunoId}
                  onChange={(e) => setAlunoId(e.target.value)}
                  label="Aluno"
                >
                  {alunos.map((aluno) => (
                    <MenuItem key={aluno._id} value={aluno._id}>
                      {aluno.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Exercícios
              </Typography>
              {exercicios.map((exercicio, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth required>
                        <InputLabel>Exercício</InputLabel>
                        <Select
                          value={exercicio.nome}
                          onChange={(e) => atualizarExercicio(index, 'nome', e.target.value)}
                          label="Exercício"
                        >
                          {EXERCICIOS.map((ex) => (
                            <MenuItem key={ex} value={ex}>
                              {ex}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Séries"
                        type="number"
                        value={exercicio.series}
                        onChange={(e) => atualizarExercicio(index, 'series', e.target.value)}
                        inputProps={{ min: 0, max: 99 }}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Repetições"
                        type="number"
                        value={exercicio.repeticoes}
                        onChange={(e) => atualizarExercicio(index, 'repeticoes', e.target.value)}
                        inputProps={{ min: 0, max: 99 }}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Observações"
                        value={exercicio.observacoes}
                        onChange={(e) => atualizarExercicio(index, 'observacoes', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={1}>
                      <IconButton
                        color="error"
                        onClick={() => removerExercicio(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}

              <Button
                startIcon={<AddIcon />}
                onClick={adicionarExercicio}
                sx={{ mb: 2 }}
              >
                Adicionar Exercício
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/lista-treinos')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={exercicios.length === 0}
                >
                  {modoEdicao ? 'Salvar Alterações' : modoCopia ? 'Copiar Treino' : 'Criar Treino'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
} 