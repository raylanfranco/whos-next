import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { CustomerModule } from '../customer/customer.module';
import { VehicleModule } from '../vehicle/vehicle.module';
import { NotificationModule } from '../notification/notification.module';
import { PushModule } from '../push/push.module';

@Module({
  imports: [CustomerModule, VehicleModule, NotificationModule, PushModule],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
