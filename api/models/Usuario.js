const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  senha: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['aluno', 'personal'],
    required: true
  },
  codigoPersonal: {
    type: String,
    required: function() {
      return this.tipo === 'aluno';
    }
  },
  desvinculado: {
    type: Boolean,
    default: false
  },
  alunos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }],
  personal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: function() {
      return this.tipo === 'aluno';
    }
  }
}, {
  timestamps: true
});

// Gerar código personal trainer antes de salvar
usuarioSchema.pre('save', async function(next) {
  if (this.tipo === 'personal') {
    let codigoUnico = false;
    let codigo;
    
    while (!codigoUnico) {
      // Gerar código de 6 dígitos
      codigo = Math.floor(100000 + Math.random() * 900000).toString();
      // Verificar se o código já existe entre os personal trainers
      const codigoExistente = await this.constructor.findOne({ 
        codigoPersonal: codigo,
        tipo: 'personal'
      });
      if (!codigoExistente) {
        codigoUnico = true;
      }
    }
    
    this.codigoPersonal = codigo;
  }
  next();
});

// Hash da senha antes de salvar
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senhas
usuarioSchema.methods.compararSenha = async function(senha) {
  return bcrypt.compare(senha, this.senha);
};

// Removemos todos os índices complexos para evitar conflitos
// O único índice que precisamos é o de email que já é criado automaticamente pela propriedade unique: true

module.exports = mongoose.model('Usuario', usuarioSchema); 