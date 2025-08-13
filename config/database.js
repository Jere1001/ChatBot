const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.BASEDEDADOS, {
      serverSelectionTimeoutMS: 10000,  // Aumenta timeout para 10 segundos
      socketTimeoutMS: 60000,           // Timeout de socket aumentado
      family: 4                         // Força IPv4
    });
    console.log('✅ Conexão com MongoDB estabelecida.');
  } catch (err) {
    console.error('❌ Erro ao conectar no MongoDB:', err.message);
    console.log('⚠️ Tentando novamente em 5 segundos...');
    setTimeout(connectDB, 5000);  // Reconexão automática
  }
};

module.exports = connectDB;