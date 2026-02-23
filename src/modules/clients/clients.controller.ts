import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClientsService } from './clients.service';
import { CreateClientFromLeadDto } from './dto/create-client-from-lead.dto';
import { SendMessageDto } from './dto/send-message.dto';

@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post('from-lead/:leadId')
  createFromLead(
    @Param('leadId') leadId: string,
    @Body() dto: CreateClientFromLeadDto,
  ) {
    return this.clientsService.createFromLead(leadId, dto);
  }

  @Get()
  list() {
    return this.clientsService.list();
  }

  @Post(':clientId/messages')
  sendMessage(
    @Param('clientId') clientId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.clientsService.sendMessage(clientId, dto);
  }
}
