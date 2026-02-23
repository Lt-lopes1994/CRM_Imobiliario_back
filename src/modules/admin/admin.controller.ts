import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/metrics')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  overview() {
    return this.adminService.overview();
  }
}
