import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
// DEPRECATED: Clover module kept for backward compat — this fork uses AuthModule + StripeModule instead
import { CloverModule } from './clover/clover.module';
import { AuthModule } from './auth/auth.module';
import { StripeModule } from './stripe/stripe.module';
import { MerchantModule } from './merchant/merchant.module';
import { ServiceModule } from './service/service.module';
import { CustomerModule } from './customer/customer.module';
import { BookingModule } from './booking/booking.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { PaymentModule } from './payment/payment.module';
import { FitmentModule } from './fitment/fitment.module';
import { BookingPartModule } from './booking-part/booking-part.module';
import { IntakeQuestionModule } from './intake-question/intake-question.module';
import { NotificationModule } from './notification/notification.module';
import { PushModule } from './push/push.module';
import { PlanModule } from './plan/plan.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    StripeModule,
    CloverModule, // DEPRECATED in this fork — kept for backward compat
    MerchantModule,
    ServiceModule,
    CustomerModule,
    BookingModule,
    VehicleModule,
    PaymentModule,
    FitmentModule,
    BookingPartModule,
    IntakeQuestionModule,
    NotificationModule,
    PushModule,
    PlanModule,
    BillingModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
