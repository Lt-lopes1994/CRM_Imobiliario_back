import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PropertyType } from '@prisma/client';

export class TriageIntakeDto {
  @IsOptional()
  @IsEnum(PropertyType)
  interestType?: PropertyType;

  @IsOptional()
  @IsInt()
  budget?: number;

  @IsOptional()
  @IsString()
  cityPreference?: string;

  @IsOptional()
  @IsBoolean()
  financingApproved?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  urgency?: number;

  @IsOptional()
  @IsString()
  summary?: string;
}
