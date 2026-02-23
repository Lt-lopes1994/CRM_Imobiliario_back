import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LeadStage } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLeadDto } from './dto/create-lead.dto';
import { TriageIntakeDto } from './dto/triage-intake.dto';
import { UpdateLeadStageDto } from './dto/update-lead-stage.dto';
import { LeadsService } from './leads.service';

@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @Get()
  list(@Query('stage') stage?: LeadStage) {
    return this.leadsService.list(stage);
  }

  @Get('kanban')
  kanban() {
    return this.leadsService.kanban();
  }

  @Patch(':id/stage')
  updateStage(@Param('id') id: string, @Body() dto: UpdateLeadStageDto) {
    return this.leadsService.updateStage(id, dto);
  }

  @Post(':id/triage')
  triage(@Param('id') id: string, @Body() dto: TriageIntakeDto) {
    return this.leadsService.triage(id, dto);
  }
}
