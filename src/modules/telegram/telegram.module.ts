import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { ChatbotModule } from '../chatbot/chatbot.module';

@Module({
  imports: [ChatbotModule],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
