import { MerchantAccess } from '../auth/merchant-access.guard';
import { Controller, Get, Post, Patch, Delete, Query, Param, Body } from '@nestjs/common';
import { BookingService } from './booking.service';
import type { BookingStatus } from '@prisma/client';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  @MerchantAccess('merchant', 'query', 'merchantId')
  findAll(
    @Query('merchantId') merchantId: string,
    @Query('status') status?: BookingStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.bookingService.findByMerchant(merchantId, { status, from, to });
  }

  @Get('stats')
  @MerchantAccess('merchant', 'query', 'merchantId')
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
  @MerchantAccess('booking', 'params', 'id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Post()
  async create(@Body() body: {
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
    const booking = await this.bookingService.create(body);
    // Confirmation needs only the new reservation identifier. Never return an
    // existing customer's contact record to an unauthenticated booker.
    return { id: booking.id, status: booking.status, startsAt: booking.startsAt, endsAt: booking.endsAt };
  }

  @Patch(':id/status')
  @MerchantAccess('booking', 'params', 'id')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: BookingStatus },
  ) {
    return this.bookingService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @MerchantAccess('booking', 'params', 'id')
  remove(@Param('id') id: string) {
    return this.bookingService.remove(id);
  }
}
