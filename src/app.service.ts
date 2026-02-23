import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): { status: string; service: string; version: string } {
    return {
      status: 'ok',
      service: 'crm-imob-backend',
      version: 'v1',
    };
  }
}
