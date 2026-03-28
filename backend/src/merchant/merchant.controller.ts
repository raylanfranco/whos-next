import { Controller, Get, Patch, Post, Delete, Param, Body } from '@nestjs/common';
import { MerchantService } from './merchant.service';

@Controller('merchants')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get()
  findAll() {
    return this.merchantService.findAll();
  }

  @Get('by-clover-id/:cloverMerchantId')
  findByCloverMerchantId(@Param('cloverMerchantId') cloverMerchantId: string) {
    return this.merchantService.findByCloverMerchantId(cloverMerchantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.merchantService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      timezone?: string;
      shopHours?: Record<string, unknown>;
      settings?: Record<string, unknown>;
    },
  ) {
    return this.merchantService.update(id, body);
  }

  @Patch(':id/availability')
  updateAvailability(
    @Param('id') id: string,
    @Body() body: {
      rules: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isBlocked?: boolean;
      }[];
    },
  ) {
    return this.merchantService.updateAvailability(id, body.rules);
  }

  @Post(':id/blocked-dates')
  addBlockedDate(
    @Param('id') id: string,
    @Body() body: { date: string; reason?: string },
  ) {
    return this.merchantService.addBlockedDate(id, body.date, body.reason);
  }

  @Delete('blocked-dates/:blockedDateId')
  removeBlockedDate(@Param('blockedDateId') blockedDateId: string) {
    return this.merchantService.removeBlockedDate(blockedDateId);
  }
}
