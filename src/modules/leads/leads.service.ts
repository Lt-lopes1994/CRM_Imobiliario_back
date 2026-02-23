import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadSource, LeadStage, Prisma, TriageStatus } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStageDto } from './dto/update-lead-stage.dto';
import { TriageIntakeDto } from './dto/triage-intake.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        source: dto.source ?? LeadSource.MANUAL,
        interestType: dto.interestType,
        budgetMin:
          dto.budgetMin !== undefined
            ? new Prisma.Decimal(dto.budgetMin)
            : null,
        budgetMax:
          dto.budgetMax !== undefined
            ? new Prisma.Decimal(dto.budgetMax)
            : null,
        cityPreference: dto.cityPreference,
        notes: dto.notes,
      },
    });
  }

  async list(stage?: LeadStage) {
    return this.prisma.lead.findMany({
      where: stage ? { stage } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async kanban() {
    const leads = await this.prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const grouped = Object.values(LeadStage).reduce(
      (accumulator, current) => ({
        ...accumulator,
        [current]: leads.filter((lead) => lead.stage === current),
      }),
      {} as Record<LeadStage, typeof leads>,
    );

    return grouped;
  }

  async updateStage(id: string, dto: UpdateLeadStageDto) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    return this.prisma.lead.update({
      where: { id },
      data: { stage: dto.stage },
    });
  }

  async triage(id: string, dto: TriageIntakeDto) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    const score = this.calculateScore(dto);
    const status =
      score >= 60 ? TriageStatus.QUALIFIED : TriageStatus.DISQUALIFIED;

    const nextStage =
      score >= 60
        ? LeadStage.QUALIFIED
        : lead.stage === LeadStage.NEW
          ? LeadStage.CONTACTED
          : lead.stage;

    await this.prisma.triageSession.create({
      data: {
        leadId: id,
        qualification: score,
        status,
        aiSummary: dto.summary,
      },
    });

    return this.prisma.lead.update({
      where: { id },
      data: {
        score,
        stage: nextStage,
        interestType: dto.interestType ?? lead.interestType,
        cityPreference: dto.cityPreference ?? lead.cityPreference,
      },
    });
  }

  private calculateScore(dto: TriageIntakeDto): number {
    let score = 0;

    if ((dto.budget ?? 0) >= 300000) score += 25;
    if (dto.financingApproved) score += 20;
    if ((dto.urgency ?? 0) >= 4) score += 25;
    if (dto.cityPreference) score += 15;
    if (dto.interestType) score += 15;

    return Math.min(score, 100);
  }
}
