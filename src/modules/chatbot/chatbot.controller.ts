import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatbotWebhookDto } from './dto/chatbot-webhook.dto';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot/n8n')
export class ChatbotController {
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly configService: ConfigService,
  ) {}

  @Post('webhook')
  async webhook(
    @Body() dto: ChatbotWebhookDto,
    @Headers('x-webhook-secret') webhookSecret?: string,
  ) {
    const expectedSecret = this.configService.get<string>('N8N_WEBHOOK_SECRET');

    if (expectedSecret && webhookSecret !== expectedSecret) {
      throw new UnauthorizedException('Webhook secret inválido');
    }

    return this.chatbotService.processIncomingMessage(dto);
  }
}
