import { IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  channel: string;

  @IsString()
  @MinLength(2)
  content: string;
}
