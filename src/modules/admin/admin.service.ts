import { Injectable } from '@nestjs/common';
import { LeadStage, TriageStatus } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const totalLeads = await this.prisma.lead.count();
    const wonLeads = await this.prisma.lead.count({
      where: { stage: LeadStage.WON },
    });

    const qualifiedSessions = await this.prisma.triageSession.count({
      where: { status: TriageStatus.QUALIFIED },
    });

    const leadsByStage = await this.prisma.lead.groupBy({
      by: ['stage'],
      _count: { stage: true },
    });

    return {
      totalLeads,
      wonLeads,
      conversionRate:
        totalLeads > 0 ? Number(((wonLeads / totalLeads) * 100).toFixed(2)) : 0,
      qualifiedSessions,
      leadsByStage,
    };
  }
}
