const Sintoma = require('../model/sintomas.model');

// Normaliza texto (remove acentos, pontuação, espaços extras e deixa em minúsculo)
const normalizeText = (text) => {
  return text
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, '')
    .toLowerCase()
    .trim();
};

// Buscar sintomas
async function buscarSintomas(mensagem) {
  try {
    const textoNormalizado = normalizeText(mensagem);
    return await Sintoma.find({
      sintomas: { $in: [textoNormalizado] }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar sintomas:', error);
    return [];
  }
}

// Adicionar novo sintoma
async function adicionarSintoma(sintomaText) {
  try {
    const sintomaNormalizado = normalizeText(sintomaText);
    
    const existe = await Sintoma.findOne({ sintomas: sintomaNormalizado });
    if (existe) {
      console.log(`⚠ Sintoma já existe: ${sintomaText}`);
      return null;
    }

    const novoSintoma = await Sintoma.create({
      sintomas: [sintomaNormalizado],
    });

    console.log(`➕ Novo sintoma adicionado: ${sintomaText}`);
    return novoSintoma;
  } catch (error) {
    console.error('❌ Erro ao adicionar sintoma:', error);
    return null;
  }
}

// Atualizar resposta
async function atualizarResposta(sintomaText, respostaTexto) {
  try {
    const sintomaNormalizado = normalizeText(sintomaText);
    
    const atualizado = await Sintoma.updateOne(
      { sintomas: sintomaNormalizado },
      { resposta: respostaTexto }
    );

    return atualizado.modifiedCount > 0;
  } catch (error) {
    console.error('❌ Erro ao atualizar resposta:', error);
    return false;
  }
}

module.exports = {
  buscarSintomas,
  adicionarSintoma,
  atualizarResposta,
  normalizeText,
};