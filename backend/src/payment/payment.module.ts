import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { CloverModule } from '../clover/clover.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [CloverModule, StripeModule],
  controllers: [PaymentController],
})
export class PaymentModule {}
