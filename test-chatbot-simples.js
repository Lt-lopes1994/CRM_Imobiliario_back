/**
 * TESTE SIMPLES DO CHATBOT - SEM TELEGRAM, SEM N8N
 *
 * Este script simula uma conversa completa com o chatbot
 * para você ver como funciona antes de integrar com Telegram.
 */

const http = require('http');

// Pega o secret do .env (ou use um valor de teste)
const WEBHOOK_SECRET = 'change-me-n8n-secret';

// Simula um usuário conversando
const usuario = {
  chatId: '999888777', // ID fictício do chat
  nome: 'Bruno Teste',
  telefone: '11999887766',
};

// Cores para o terminal
const cores = {
  reset: '\x1b[0m',
  verde: '\x1b[32m',
  azul: '\x1b[34m',
  amarelo: '\x1b[33m',
  vermelho: '\x1b[31m',
};

console.log('\n' + '='.repeat(60));
console.log('🤖 SIMULADOR DE CONVERSAÇÃO COM CHATBOT');
console.log('='.repeat(60) + '\n');

// Função para enviar mensagem ao chatbot
function enviarMensagem(mensagem, callback) {
  const payload = JSON.stringify({
    chatId: usuario.chatId,
    message: mensagem,
    name: usuario.nome,
    phone: usuario.telefone,
    channel: 'TEST',
  });

  const options = {
    hostname: 'localhost',
    port: 4000,
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
      if (res.statusCode === 200 || res.statusCode === 201) {
        const resposta = JSON.parse(data);
        callback(null, resposta);
      } else {
        callback(new Error(`Status ${res.statusCode}: ${data}`), null);
      }
    });
  });

  req.on('error', (error) => {
    callback(error, null);
  });

  req.write(payload);
  req.end();
}

// Simula uma conversa completa
function simularConversa() {
  const perguntas = [
    'Oi, quero comprar um apartamento',
    'R$ 500.000',
    'São Paulo',
    'Sim, preciso',
    '5',
  ];

  let indice = 0;

  function proximaPergunta() {
    if (indice >= perguntas.length) {
      console.log('\n' + '='.repeat(60));
      console.log('✅ CONVERSA FINALIZADA!');
      console.log('='.repeat(60));
      console.log('\n💡 Agora verifique no banco de dados:');
      console.log('   - Um LEAD foi criado com pontuação');
      console.log('   - Uma SESSÃO DE TRIAGEM foi salva');
      console.log('\nPróximo passo: Integrar com Telegram!\n');
      return;
    }

    const mensagemUsuario = perguntas[indice];
    console.log(`\n${cores.azul}👤 VOCÊ: ${mensagemUsuario}${cores.reset}`);

    enviarMensagem(mensagemUsuario, (erro, resposta) => {
      if (erro) {
        console.error(
          `\n${cores.vermelho}❌ ERRO: ${erro.message}${cores.reset}`,
        );
        console.log('\n🔍 POSSÍVEIS CAUSAS:');
        console.log('   1. Backend não está rodando (rode: yarn start:dev)');
        console.log('   2. x-webhook-secret incorreto no .env');
        console.log('   3. Porta 4000 ocupada\n');
        return;
      }

      console.log(`${cores.verde}🤖 BOT: ${resposta.reply}${cores.reset}`);

      if (resposta.done) {
        console.log(
          `\n${cores.amarelo}📊 PONTUAÇÃO FINAL: ${resposta.score} pontos${cores.reset}`,
        );
        console.log(
          `${cores.amarelo}🎯 ESTÁGIO: ${resposta.stage}${cores.reset}`,
        );
      }

      indice++;
      setTimeout(proximaPergunta, 1000); // Pausa de 1s entre mensagens
    });
  }

  proximaPergunta();
}

// Inicia a simulação
console.log(`${cores.amarelo}⚙️  Configuração:${cores.reset}`);
console.log(`   Chat ID: ${usuario.chatId}`);
console.log(`   Nome: ${usuario.nome}`);
console.log(`   Telefone: ${usuario.telefone}`);
console.log(`   Webhook Secret: ${WEBHOOK_SECRET}\n`);

simularConversa();
