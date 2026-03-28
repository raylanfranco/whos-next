import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async health() {
    // Quick DB connectivity check — count merchants (works with adapter)
    const count = await this.prisma.merchant.count();

    return {
      status: 'ok',
      service: 'whosnext-api',
      merchants: count,
      timestamp: new Date().toISOString(),
    };
  }
}
