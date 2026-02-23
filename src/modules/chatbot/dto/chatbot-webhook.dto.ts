import { IsOptional, IsString, MinLength } from 'class-validator';

export class ChatbotWebhookDto {
  @IsString()
  @MinLength(2)
  chatId: string;

  @IsString()
  @MinLength(1)
  message: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  channel?: string;
}
