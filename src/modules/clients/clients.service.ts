import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadStage } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateClientFromLeadDto } from './dto/create-client-from-lead.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromLead(leadId: string, dto: CreateClientFromLeadDto) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });

    if (!lead) throw new NotFoundException('Lead não encontrado');

    const client = await this.prisma.client.upsert({
      where: { leadId },
      update: {
        preferredChannel: dto.preferredChannel ?? 'whatsapp',
        tags: dto.tags ?? [],
      },
      create: {
        leadId,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        preferredChannel: dto.preferredChannel ?? 'whatsapp',
        tags: dto.tags ?? [],
      },
    });

    await this.prisma.lead.update({
      where: { id: leadId },
      data: { stage: LeadStage.WON },
    });

    return client;
  }

  async list() {
    return this.prisma.client.findMany({
      include: { lead: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async sendMessage(clientId: string, dto: SendMessageDto) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) throw new NotFoundException('Cliente não encontrado');

    return this.prisma.outboundMessage.create({
      data: {
        clientId,
        channel: dto.channel,
        content: dto.content,
        status: 'sent',
        sentAt: new Date(),
      },
    });
  }
}
