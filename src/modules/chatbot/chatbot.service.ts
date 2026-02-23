import { Injectable } from '@nestjs/common';
import {
  LeadSource,
  LeadStage,
  PropertyType,
  TriageStatus,
  type Prisma,
} from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { ChatbotWebhookDto } from './dto/chatbot-webhook.dto';

type Step =
  | 'ASK_INTEREST'
  | 'ASK_BUDGET'
  | 'ASK_CITY'
  | 'ASK_FINANCING'
  | 'ASK_URGENCY'
  | 'DONE';

type TriageAnswers = {
  interestType?: PropertyType;
  budget?: number;
  cityPreference?: string;
  financingApproved?: boolean;
  urgency?: number;
};

@Injectable()
export class ChatbotService {
  constructor(private readonly prisma: PrismaService) {}

  async processIncomingMessage(dto: ChatbotWebhookDto) {
    const lead = await this.findOrCreateLead(dto);

    const session = await this.findOrCreateSession(
      lead.id,
      dto.chatId,
      dto.channel ?? 'telegram',
    );

    const currentStep = (session.currentStep as Step) ?? 'ASK_INTEREST';
    const currentAnswers = (session.answers as TriageAnswers | null) ?? {};

    const nextState = this.handleStep(currentStep, dto.message, currentAnswers);

    const score = this.calculateScore(nextState.answers);
    const status =
      score >= 60 ? TriageStatus.QUALIFIED : TriageStatus.DISQUALIFIED;

    await this.prisma.triageSession.update({
      where: { id: session.id },
      data: {
        currentStep: nextState.nextStep,
        answers: nextState.answers as Prisma.InputJsonValue,
        qualification:
          nextState.nextStep === 'DONE' ? score : session.qualification,
        status: nextState.nextStep === 'DONE' ? status : session.status,
        aiSummary: nextState.summary,
        completedAt: nextState.nextStep === 'DONE' ? new Date() : null,
      },
    });

    if (nextState.nextStep === 'DONE') {
      await this.prisma.lead.update({
        where: { id: lead.id },
        data: {
          source: LeadSource.WHATSAPP,
          score,
          stage: score >= 60 ? LeadStage.QUALIFIED : LeadStage.CONTACTED,
          interestType: nextState.answers.interestType,
          cityPreference: nextState.answers.cityPreference,
          notes: nextState.summary,
        },
      });
    }

    return {
      leadId: lead.id,
      done: nextState.nextStep === 'DONE',
      nextStep: nextState.nextStep,
      reply: nextState.reply,
      score: nextState.nextStep === 'DONE' ? score : undefined,
      stage:
        nextState.nextStep === 'DONE'
          ? score >= 60
            ? LeadStage.QUALIFIED
            : LeadStage.CONTACTED
          : lead.stage,
    };
  }

  private async findOrCreateLead(dto: ChatbotWebhookDto) {
    const normalizedPhone = this.normalizePhone(dto.phone ?? dto.chatId);

    const existing = await this.prisma.lead.findFirst({
      where: { phone: normalizedPhone },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.lead.create({
      data: {
        name: dto.name ?? 'Lead Telegram',
        phone: normalizedPhone,
        email: undefined,
        source: LeadSource.MANUAL,
        stage: LeadStage.NEW,
      },
    });
  }

  private async findOrCreateSession(
    leadId: string,
    chatId: string,
    channel: string,
  ) {
    const session = await this.prisma.triageSession.findFirst({
      where: {
        leadId,
        completedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (session) return session;

    return this.prisma.triageSession.create({
      data: {
        leadId,
        channel,
        externalChatId: chatId,
        currentStep: 'ASK_INTEREST',
        status: TriageStatus.OPEN,
      },
    });
  }

  private handleStep(step: Step, message: string, answers: TriageAnswers) {
    const trimmed = message.trim();

    if (step === 'ASK_INTEREST') {
      const interestType = this.parseInterestType(trimmed);
      return {
        nextStep: 'ASK_BUDGET' as Step,
        answers: { ...answers, interestType },
        reply: 'Perfeito. Qual a sua faixa de orçamento? (ex: 350000)',
        summary: null,
      };
    }

    if (step === 'ASK_BUDGET') {
      const budget = this.parseNumber(trimmed);
      return {
        nextStep: 'ASK_CITY' as Step,
        answers: { ...answers, budget },
        reply: 'Qual cidade ou região você prefere?',
        summary: null,
      };
    }

    if (step === 'ASK_CITY') {
      return {
        nextStep: 'ASK_FINANCING' as Step,
        answers: { ...answers, cityPreference: trimmed },
        reply: 'Você já tem financiamento aprovado? (sim/não)',
        summary: null,
      };
    }

    if (step === 'ASK_FINANCING') {
      const financingApproved = ['sim', 's', 'yes', 'y'].includes(
        trimmed.toLowerCase(),
      );
      return {
        nextStep: 'ASK_URGENCY' as Step,
        answers: { ...answers, financingApproved },
        reply: 'Qual sua urgência para fechar negócio? (1 a 5)',
        summary: null,
      };
    }

    const urgency = Math.min(Math.max(this.parseNumber(trimmed), 1), 5);
    const finalAnswers = { ...answers, urgency };

    return {
      nextStep: 'DONE' as Step,
      answers: finalAnswers,
      reply:
        'Obrigado! Nosso time comercial vai continuar seu atendimento com as melhores opções.',
      summary: this.buildSummary(finalAnswers),
    };
  }

  private buildSummary(answers: TriageAnswers): string {
    return `Interesse: ${answers.interestType ?? 'não informado'} | Orçamento: ${answers.budget ?? 'não informado'} | Cidade: ${answers.cityPreference ?? 'não informada'} | Financiamento: ${answers.financingApproved ? 'sim' : 'não'} | Urgência: ${answers.urgency ?? 'não informada'}`;
  }

  private calculateScore(answers: TriageAnswers): number {
    let score = 0;

    if ((answers.budget ?? 0) >= 300000) score += 25;
    if (answers.financingApproved) score += 20;
    if ((answers.urgency ?? 0) >= 4) score += 25;
    if (answers.cityPreference) score += 15;
    if (answers.interestType) score += 15;

    return Math.min(score, 100);
  }

  private parseInterestType(value: string): PropertyType | undefined {
    const normalized = value.toLowerCase();

    if (normalized.includes('casa')) return PropertyType.HOUSE;
    if (normalized.includes('apart')) return PropertyType.APARTMENT;
    if (normalized.includes('comercial')) return PropertyType.COMMERCIAL;
    if (normalized.includes('terreno')) return PropertyType.LAND;
    if (normalized.includes('studio')) return PropertyType.STUDIO;

    return undefined;
  }

  private parseNumber(value: string): number {
    const parsed = Number(value.replace(/[^0-9]/g, ''));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/[^0-9]/g, '');
  }
}
