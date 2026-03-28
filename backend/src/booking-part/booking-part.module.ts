import { Module } from '@nestjs/common';
import { BookingPartController } from './booking-part.controller';
import { BookingPartService } from './booking-part.service';

@Module({
  controllers: [BookingPartController],
  providers: [BookingPartService],
  exports: [BookingPartService],
})
export class BookingPartModule {}
