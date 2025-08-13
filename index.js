require('dotenv').config();
const qrcode = require ('qrcode-terminal');
const { Client, LocalAuth, AuthStrategy } = require ('whatsapp-web.js');
const { buscarSintomas, adicionarSintoma, atualizarResposta, normalizeText } = require('./service/sintomasService');
const connectDB = require('./config/database');

// Conecta ao banco de dados
connectDB();

client = new Client({
    AuthStrategy: new LocalAuth({
        puppeteer:{ headless: true, args: ['--no-sandbox']}
    })
})

const delay = ms => new Promise(res => setTimeout(res, ms));

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp conectado e pronto.');
});

client.on('message', async msg => {
  const rawNumber = msg.from;
  const messageText = msg.body;
  const number244 = ` ${rawNumber.replace("@c.us", "")}`;
  console.log(` Mensagem recebida de ${rawNumber}: ${messageText}`);
  const numeroValidacao = process.env.NUMERO_VALIDACAO;

  
  // Atualização de resposta via número de validação
  if (msg.from === numeroValidacao) {
    const [sintomaTexto, respostaTexto] = msg.body.split('::').map(t => t && t.trim());

    if (sintomaTexto && respostaTexto) {
      const ok = await atualizarResposta(sintomaTexto, respostaTexto);
      if (ok) {
        await msg.reply(`✅ Resposta cadastrada para: "${sintomaTexto}"`);
      } else {
        await msg.reply(`⚠ Sintoma não encontrado: "${sintomaTexto}"`);
      }
    } else {
      await msg.reply(`⚠ Formato inválido. Use: Sintoma :: Resposta`);
    }
    return;
  }

  // Normaliza o texto da mensagem
  const textoNormalizado = normalizeText(msg.body);

  // Verifica sintomas
  const sintomasEncontrados = await buscarSintomas(textoNormalizado);

  const chat = await msg.getChat();
  await chat.sendStateTyping();
  await delay(1200);

  if (sintomasEncontrados.length > 0) {
    const respostaEncontrada = sintomasEncontrados.find(e => e.resposta)?.resposta;
    if (respostaEncontrada) {
      await client.sendMessage(msg.from, respostaEncontrada);
    } else {
      await client.sendMessage(msg.from, "Sintomas identificados, mas resposta ainda não cadastrada.");
    }
  } else {
    await client.sendMessage(msg.from,
      'Obrigado por usar o serviço “A Sua Saúde a Um Click” da Clínica Andefil.\n🩺 Em até 24h retornaremos com um pré-diagnóstico.\nRecomendamos fortemente avaliação médica presencial.'
    );

    const novoSintoma = await adicionarSintoma(msg.body.trim());

    if (novoSintoma) {
      const contato = await msg.getContact();
      const nomeContato = contato.pushname || contato.number;

      await client.sendMessage(
        numeroValidacao,
        `📢 *Novo sintoma para análise*\n\n` +
        `👤 *Paciente:* ${nomeContato}\n` +
        `📅 *Data/Hora:* ${new Date().toLocaleString('pt-PT')}\n` +
        `💬 *Sintoma:* ${msg.body.trim()}\n` +
        `📱 *Origem:* ${msg.from}`
      );
    }
  }
});

client.initialize();

// Tratamento de erros globais
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Rejeição não tratada em:', promise, 'motivo:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Exceção não tratada:', err);
  process.exit(1);
});
client.on('message', async msg => {

    if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola)/i) && msg.from.endsWith('@c.us')) {

        const chat = await msg.getChat();

        await delay(3000); //delay de 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000); //Delay de 3000 milisegundos mais conhecido como 3 segundos
        const contact = await msg.getContact(); //Pegando o contato
        const name = contact.pushname; //Pegando o nome do contato
        await client.sendMessage(msg.from,'Olá! '+ name.split(" ")[0] + ' tudo bem? quem te enviou essa mensagem foi o robô que acabamos de criar, incrível né😎'); //Primeira mensagem de texto
        await delay(3000); //delay de 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await client.sendMessage(msg.from,'A versão grátis do robô automatiza apenas mensagens de texto.'); //Primeira mensagem de texto
        await delay(3000); //delay de 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await client.sendMessage(msg.from, 'Na versão PRO: desbloqueie tudo!\n\n' +
            '✍️ Envio de textos\n' +
            '🎙️ Áudios\n' +
            '🖼️ Imagens\n' +
            '🎥 Vídeos\n' +
            '📂 Arquivos\n\n' +
            '💡 Simulação de "digitando..." e "gravando áudio"\n' +
            '🚀 Envio de mensagens em massa\n' +
            '📇 Captura automática de contatos\n' +
            '💻 Aprenda como deixar o robô funcionando 24 hrs, com o PC desligado\n' +
            '✅ E 3 Bônus exclusivos\n\n' +
            '🔥 Adquira a versão PRO agora: https://pay.kiwify.com.br/FkTOhRZ?src=pro'
        );
        

    }







});