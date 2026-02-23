import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { ChatbotService } from '../chatbot/chatbot.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot;
  private enabled = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly chatbotService: ChatbotService,
  ) {}

  onModuleInit(): void {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    if (!token || token === 'disabled') {
      this.logger.warn(
        '⚠️  Telegram Bot desabilitado. Configure TELEGRAM_BOT_TOKEN no .env para ativar.',
      );
      return;
    }

    try {
      // Cria o bot
      this.bot = new TelegramBot(token, { polling: true });
      this.enabled = true;

      this.logger.log('🤖 Telegram Bot inicializado com sucesso!');

      // Configura handlers
      this.setupHandlers();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Erro ao inicializar Telegram Bot: ${errorMessage}`);
    }
  }

  private setupHandlers() {
    // Handler para mensagens de texto
    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      // Ignora mensagens sem texto ou sem remetente
      if (!text || !msg.from) return;

      const nome =
        msg.from.first_name +
        (msg.from.last_name ? ' ' + msg.from.last_name : '');
      const username = msg.from.username || undefined;

      this.logger.log(`👤 ${nome} (${chatId}): ${text}`);

      // Mostra indicador de digitação
      await this.bot.sendChatAction(chatId, 'typing');

      try {
        // Envia para o chatbot service
        const resposta = await this.chatbotService.processIncomingMessage({
          chatId: chatId.toString(),
          message: text,
          name: nome,
          phone: username,
          channel: 'TELEGRAM',
        });

        // Envia resposta ao usuário
        await this.bot.sendMessage(chatId, resposta.reply);
        this.logger.log(`🤖 Bot: ${resposta.reply}`);

        // Se concluiu a qualificação
        if (resposta.done) {
          this.logger.log(
            `✅ Lead qualificado! ID: ${resposta.leadId}, Score: ${resposta.score}, Stage: ${resposta.stage}`,
          );
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`❌ Erro ao processar mensagem: ${errorMessage}`);
        await this.bot.sendMessage(
          chatId,
          'Desculpe, ocorreu um erro. Tente novamente em instantes.',
        );
      }
    });

    // Handler para erros
    this.bot.on('polling_error', (error: Error) => {
      this.logger.error(`❌ Erro no polling: ${error.message}`);
    });

    // Comando /start
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      void this.bot.sendMessage(
        chatId,
        '🏠 *Bem-vindo ao CRM Imobiliário!*\n\n' +
          'Olá! Posso te ajudar a encontrar o imóvel ideal.\n\n' +
          'Digite o que você está procurando para começarmos!',
        { parse_mode: 'Markdown' },
      );
    });

    // Comando /help
    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      void this.bot.sendMessage(
        chatId,
        '🤖 *Como posso ajudar?*\n\n' +
          '*Comandos disponíveis:*\n' +
          '/start - Iniciar conversa\n' +
          '/help - Ver esta mensagem\n\n' +
          '*Como funciona:*\n' +
          '1. Me diga o que você procura\n' +
          '2. Vou fazer algumas perguntas\n' +
          '3. Nosso time entrará em contato com as melhores opções!',
        { parse_mode: 'Markdown' },
      );
    });

    this.logger.log('✅ Handlers do Telegram configurados');
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}
