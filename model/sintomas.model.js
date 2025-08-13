const mongoose = require('mongoose');

const sintomaSchema = new mongoose.Schema({
  sintomas: {
    type: [String],
    required: true,
    index: true,
  },
  resposta: {
    type: String,
    default: '',
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
  prioridade: {
    type: String,
    enum: ['normal', 'urgente'],
    default: 'normal',
  },
});

// Adiciona índice de texto para buscas mais eficientes
sintomaSchema.index({ sintomas: 'text' });

module.exports = mongoose.model('Sintoma', sintomaSchema);