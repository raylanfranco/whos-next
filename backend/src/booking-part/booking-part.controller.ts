import { Controller, Get, Post, Patch, Delete, Query, Param, Body } from '@nestjs/common';
import { BookingPartService } from './booking-part.service';
import type { PartStatus } from '@prisma/client';

@Controller('booking-parts')
export class BookingPartController {
  constructor(private readonly bookingPartService: BookingPartService) {}

  @Get()
  findByBooking(@Query('bookingId') bookingId: string) {
    return this.bookingPartService.findByBooking(bookingId);
  }

  @Post()
  create(@Body() body: {
    bookingId: string;
    partName: string;
    partNumber?: string;
    notes?: string;
  }) {
    return this.bookingPartService.create(body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: PartStatus },
  ) {
    return this.bookingPartService.updateStatus(id, body.status);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { partName?: string; partNumber?: string; notes?: string },
  ) {
    return this.bookingPartService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingPartService.remove(id);
  }
}
