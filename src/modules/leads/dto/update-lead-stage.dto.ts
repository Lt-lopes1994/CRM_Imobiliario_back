import { LeadStage } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateLeadStageDto {
  @IsEnum(LeadStage)
  stage: LeadStage;
}
