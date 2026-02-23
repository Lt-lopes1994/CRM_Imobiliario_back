/**
 * Script de teste para o webhook do chatbot via localtunnel
 *
 * Este script simula uma requisição do n8n com os headers corretos
 * para contornar a tela de senha do localtunnel.
 */

const https = require('https');

const TUNNEL_URL = 'https://three-taxis-shave.loca.lt';
const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || 'your-secret-here';

const payload = {
  chatId: '123456789',
  message: 'Olá, gostaria de comprar um apartamento',
  name: 'Bruno Teste',
  phone: '11999999999',
  channel: 'TELEGRAM',
};

const postData = JSON.stringify(payload);

const options = {
  hostname: 'three-taxis-shave.loca.lt',
  port: 443,
  path: '/v1/chatbot/n8n/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'x-webhook-secret': WEBHOOK_SECRET,
    'bypass-tunnel-reminder': 'true', // Contorna a tela de senha do localtunnel
    'User-Agent': 'n8n-webhook/1.0',
  },
};

console.log('🚀 Testando webhook do chatbot...\n');
console.log('URL:', `${TUNNEL_URL}${options.path}`);
console.log('Payload:', JSON.stringify(payload, null, 2));
console.log('\n⏳ Enviando requisição...\n');

const req = https.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log('📋 Headers de resposta:', JSON.stringify(res.headers, null, 2));
  console.log('\n📦 Resposta:\n');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));

      if (json.reply) {
        console.log('\n💬 Resposta do bot:', json.reply);
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro na requisição:', error.message);
});

req.write(postData);
req.end();
