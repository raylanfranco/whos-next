import { Controller, Get, Post, Patch, Delete, Query, Param, Body } from '@nestjs/common';
import { BookingService } from './booking.service';
import type { BookingStatus } from '@prisma/client';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  findAll(
    @Query('merchantId') merchantId: string,
    @Query('status') status?: BookingStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.bookingService.findByMerchant(merchantId, { status, from, to });
  }

  @Get('stats')
  getStats(
    @Query('merchantId') merchantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.bookingService.getStats(merchantId, from, to);
  }

  @Get('available-slots')
  getAvailableSlots(
    @Query('merchantId') merchantId: string,
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    return this.bookingService.getAvailableSlots(merchantId, serviceId, date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Post()
  create(@Body() body: {
    merchantId: string;
    serviceId: string;
    date: string;
    time: string;
    customer: { name: string; email?: string; phone?: string };
    vehicle?: { year?: number; make?: string; model?: string; trim?: string };
    intakeData?: Record<string, unknown>;
    notes?: string;
    depositAmountCents?: number;
    cloverChargeId?: string;
    isWalkIn?: boolean;
  }) {
    return this.bookingService.create(body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: BookingStatus },
  ) {
    return this.bookingService.updateStatus(id, body.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingService.remove(id);
  }
}
