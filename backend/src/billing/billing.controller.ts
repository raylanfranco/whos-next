import {
  Controller, Post, Req, Headers, UseGuards,
  BadRequestException, Logger,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { AuthGuard } from '../auth/auth.guard';
import type { Request } from 'express';

@Controller('billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);

  constructor(private readonly billingService: BillingService) {}

  /**
   * POST /billing/create-checkout
   * Creates a Stripe Checkout Session for the Pro plan.
   * Returns { url } — redirect the merchant there.
   */
  @Post('create-checkout')
  @UseGuards(AuthGuard)
  async createCheckout(@Req() req: Request) {
    const merchant = (req as any).merchant;
    return this.billingService.createCheckoutSession(merchant.id);
  }

  /**
   * POST /billing/webhook
   * Stripe webhook for subscription lifecycle events.
   * Uses a separate webhook secret from the payments webhook.
   */
  @Post('webhook')
  async webhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      throw new BadRequestException('Raw body not available');
    }

    try {
      const event = this.billingService.constructEvent(rawBody, signature);
      await this.billingService.handleWebhookEvent(event);
      return { received: true };
    } catch (err) {
      this.logger.error(`Billing webhook error: ${err}`);
      throw new BadRequestException('Webhook verification failed');
    }
  }
}
