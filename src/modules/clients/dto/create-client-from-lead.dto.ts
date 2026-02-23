import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateClientFromLeadDto {
  @IsOptional()
  @IsString()
  preferredChannel?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
