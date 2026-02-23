/**
 * BOT DO TELEGRAM - Integração Direta com o Chatbot
 *
 * COMO USAR:
 * 1. Crie um bot com @BotFather no Telegram
 * 2. Cole o token no arquivo .env: TELEGRAM_BOT_TOKEN=seu_token_aqui
 * 3. Instale: npm install node-telegram-bot-api dotenv
 * 4. Execute: node telegram-bot.js
 * 5. Envie mensagem para seu bot!
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

// ========== CONFIGURAÇÃO ==========
// Token do Telegram (vem do arquivo .env)
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Secret do webhook (mesmo do .env)
const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || 'change-me-n8n-secret';

// Porta do backend
const BACKEND_PORT = 4000;
// ==================================

// Cores para o console
const cores = {
  reset: '\x1b[0m',
  verde: '\x1b[32m',
  azul: '\x1b[34m',
  amarelo: '\x1b[33m',
  vermelho: '\x1b[31m',
  magenta: '\x1b[35m',
};

// Verifica se o token foi configurado
if (!TELEGRAM_TOKEN || TELEGRAM_TOKEN === 'disabled') {
  console.error(
    `\n${cores.vermelho}❌ ERRO: Configure o TELEGRAM_BOT_TOKEN no arquivo .env!${cores.reset}`,
  );
  console.log(`\n${cores.amarelo}📋 Passos:${cores.reset}`);
  console.log('   1. Abra o Telegram e procure por @BotFather');
  console.log('   2. Envie: /newbot');
  console.log('   3. Siga as instruções e copie o token');
  console.log(
    '   4. Cole o token no arquivo .env: TELEGRAM_BOT_TOKEN=seu_token_aqui\n',
  );
  process.exit(1);
}

// Cria o bot
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

console.log('\n' + '='.repeat(60));
console.log(
  `${cores.verde}🤖 BOT DO TELEGRAM INICIADO COM SUCESSO!${cores.reset}`,
);
console.log('='.repeat(60));
console.log(
  `\n${cores.azul}📱 Procure seu bot no Telegram e envie uma mensagem${cores.reset}`,
);
console.log(
  `${cores.azul}💬 O bot vai fazer 5 perguntas para qualificar o lead${cores.reset}\n`,
);

// Estatísticas
let totalMensagens = 0;
let leadsQualificados = 0;

// Quando receber uma mensagem
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const mensagem = msg.text;

  // Ignora mensagens que não são texto
  if (!mensagem) return;

  const nome =
    msg.from.first_name + (msg.from.last_name ? ' ' + msg.from.last_name : '');
  const username = msg.from.username || null;

  totalMensagens++;

  console.log(`${cores.azul}👤 ${nome} (${chatId}): ${mensagem}${cores.reset}`);

  // Mostra indicador de digitação
  bot.sendChatAction(chatId, 'typing');

  // Envia para o nosso chatbot
  const payload = JSON.stringify({
    chatId: chatId.toString(),
    message: mensagem,
    name: nome,
    phone: username,
    channel: 'TELEGRAM',
  });

  const options = {
    hostname: 'localhost',
    port: BACKEND_PORT,
    path: '/v1/chatbot/n8n/webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'x-webhook-secret': WEBHOOK_SECRET,
    },
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode !== 200 && res.statusCode !== 201) {
        console.error(
          `${cores.vermelho}❌ Erro HTTP ${res.statusCode}: ${data}${cores.reset}`,
        );
        bot.sendMessage(
          chatId,
          'Desculpe, ocorreu um erro técnico. Nosso time já foi notificado.',
        );
        return;
      }

      try {
        const resposta = JSON.parse(data);

        // Envia a resposta do bot para o usuário
        bot.sendMessage(chatId, resposta.reply);
        console.log(`${cores.verde}🤖 Bot: ${resposta.reply}${cores.reset}`);

        // Se concluiu a qualificação
        if (resposta.done) {
          leadsQualificados++;
          console.log(`\n${cores.magenta}${'='.repeat(60)}${cores.reset}`);
          console.log(`${cores.magenta}✅ LEAD QUALIFICADO!${cores.reset}`);
          console.log(`${cores.magenta}   Cliente: ${nome}${cores.reset}`);
          console.log(
            `${cores.magenta}   Lead ID: ${resposta.leadId}${cores.reset}`,
          );
          console.log(
            `${cores.magenta}   Pontuação: ${resposta.score} pontos${cores.reset}`,
          );
          console.log(
            `${cores.magenta}   Estágio: ${resposta.stage}${cores.reset}`,
          );
          console.log(`${cores.magenta}${'='.repeat(60)}${cores.reset}\n`);

          console.log(
            `${cores.amarelo}📊 Estatísticas: ${totalMensagens} mensagens | ${leadsQualificados} leads qualificados${cores.reset}\n`,
          );
        }
      } catch (erro) {
        console.error(
          `${cores.vermelho}❌ Erro ao processar resposta: ${erro.message}${cores.reset}`,
        );
        bot.sendMessage(
          chatId,
          'Desculpe, tive dificuldade em processar sua mensagem. Pode repetir?',
        );
      }
    });
  });

  req.on('error', (error) => {
    console.error(
      `${cores.vermelho}❌ Erro na requisição: ${error.message}${cores.reset}`,
    );
    console.log(
      `\n${cores.amarelo}💡 Verifique se o backend está rodando:${cores.reset}`,
    );
    console.log(`   curl http://localhost:${BACKEND_PORT}/v1/health\n`);

    bot.sendMessage(
      chatId,
      'Desculpe, estou com problemas de conexão. Tente novamente em instantes.',
    );
  });

  req.write(payload);
  req.end();
});

// Tratamento de erros
bot.on('polling_error', (erro) => {
  console.error(
    `${cores.vermelho}❌ Erro no polling: ${erro.message}${cores.reset}`,
  );
});

// Comando /status para ver estatísticas
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `📊 *Estatísticas do Bot*\n\n` +
      `💬 Mensagens recebidas: ${totalMensagens}\n` +
      `✅ Leads qualificados: ${leadsQualificados}\n` +
      `🎯 Taxa de qualificação: ${totalMensagens > 0 ? ((leadsQualificados / totalMensagens) * 100).toFixed(1) : 0}%`,
    { parse_mode: 'Markdown' },
  );
});

// Comando /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `🤖 *Olá! Sou o assistente do CRM Imobiliário*\n\n` +
      `Posso te ajudar a encontrar o imóvel ideal!\n\n` +
      `*Como funciona:*\n` +
      `1. Envie uma mensagem dizendo o que procura\n` +
      `2. Vou fazer algumas perguntas\n` +
      `3. Nosso time entrará em contato com as melhores opções\n\n` +
      `*Comandos:*\n` +
      `/start - Iniciar conversa\n` +
      `/help - Ver esta mensagem\n` +
      `/status - Ver estatísticas`,
    { parse_mode: 'Markdown' },
  );
});

console.log(
  `${cores.verde}✅ Bot pronto para receber mensagens!${cores.reset}\n`,
);
