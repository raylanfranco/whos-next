import { Controller, Post, Body, BadRequestException, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CloverService } from '../clover/clover.service';
import { StripeService } from '../stripe/stripe.service';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly cloverService: CloverService,
    private readonly stripeService: StripeService,
  ) {}

  /**
   * DEPRECATED: Clover charge endpoint — kept for backward compat.
   * Use POST /stripe/create-intent instead.
   */
  @Post('charge')
  async charge(
    @Body() body: {
      merchantId: string;
      amountCents: number;
      source: string;
      description?: string;
    },
    @Req() req: Request,
  ) {
    if (!body.merchantId || !body.amountCents || !body.source) {
      throw new BadRequestException('merchantId, amountCents, and source are required');
    }

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const charge = await this.cloverService.createCharge(
      body.merchantId,
      body.amountCents,
      body.source,
      body.description,
      clientIp,
    );

    return { chargeId: charge.id, status: charge.status };
  }

  /**
   * Create a Stripe PaymentIntent for deposit collection (multi-tenant).
   * Delegates to StripeService which uses per-merchant credentials.
   */
  @Post('stripe-intent')
  async stripeIntent(
    @Body() body: {
      merchantId: string;
      amountCents: number;
      currency?: string;
      description?: string;
      metadata?: Record<string, string>;
    },
  ) {
    if (!body.merchantId || !body.amountCents) {
      throw new BadRequestException('merchantId and amountCents are required');
    }

    return this.stripeService.createPaymentIntent(
      body.merchantId,
      body.amountCents,
      body.currency,
      body.description,
      body.metadata,
    );
  }
}
