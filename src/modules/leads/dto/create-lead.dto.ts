import { LeadSource, PropertyType } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @IsOptional()
  @IsEnum(PropertyType)
  interestType?: PropertyType;

  @IsOptional()
  @IsNumber()
  budgetMin?: number;

  @IsOptional()
  @IsNumber()
  budgetMax?: number;

  @IsOptional()
  @IsString()
  cityPreference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
