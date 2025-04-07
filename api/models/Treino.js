const mongoose = require('mongoose');

const exercicioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    enum: [
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
    ]
  },
  series: {
    type: Number,
    required: true
  },
  repeticoes: {
    type: Number,
    required: true
  },
  observacoes: String,
  concluido: {
    type: Boolean,
    default: false
  }
});

const treinoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  diaSemana: {
    type: String,
    required: true,
    enum: ['segunda-feira', 'terca-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sabado', 'domingo']
  },
  personal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  aluno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  exercicios: [exercicioSchema],
  dataCriacao: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Treino', treinoSchema); 