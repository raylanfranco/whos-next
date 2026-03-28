import {
  Controller, Get, Post, Delete, Body, Query, Req, Res,
  Headers, BadRequestException, Logger, UseGuards,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { AuthGuard } from '../auth/auth.guard';
import type { Request, Response } from 'express';

@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(private readonly stripeService: StripeService) {}

  // ── Stripe Connect OAuth ────────────────────────────────

  /**
   * Returns the Stripe Connect OAuth URL for the logged-in merchant.
   */
  @Get('connect')
  @UseGuards(AuthGuard)
  getConnectUrl(@Req() req: Request) {
    const merchant = (req as any).merchant;
    const url = this.stripeService.getConnectUrl(merchant.id);
    return { url };
  }

  /**
   * OAuth callback — receives code + state from Stripe, exchanges for tokens.
   * Redirects to frontend dashboard on success.
   */
  @Get('connect/callback')
  async connectCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL?.split(',')[0]?.trim() || 'http://localhost:5173';

    if (error) {
      this.logger.warn(`Stripe Connect denied: ${error} — ${errorDescription}`);
      return res.redirect(`${frontendUrl}/dashboard/settings?stripe=error&message=${encodeURIComponent(errorDescription || error)}`);
    }

    if (!code || !state) {
      return res.redirect(`${frontendUrl}/dashboard/settings?stripe=error&message=Missing+code+or+state`);
    }

    try {
      await this.stripeService.handleConnectCallback(code, state);
      return res.redirect(`${frontendUrl}/dashboard/settings?merchant=${state}&stripe=connected`);
    } catch (err) {
      this.logger.error(`Stripe Connect callback failed: ${err}`);
      const message = err instanceof Error ? err.message : 'Unknown error';
      return res.redirect(`${frontendUrl}/dashboard/settings?stripe=error&message=${encodeURIComponent(message)}`);
    }
  }

  /**
   * Returns connect status + publishable key for a merchant.
   * Public endpoint (no auth) — only returns safe-to-expose data.
   */
  @Get('connect/status')
  getConnectStatus(@Query('merchantId') merchantId: string) {
    if (!merchantId) {
      throw new BadRequestException('merchantId is required');
    }
    return this.stripeService.getConnectStatus(merchantId);
  }

  /**
   * Disconnect a merchant's Stripe account.
   */
  @Delete('disconnect')
  @UseGuards(AuthGuard)
  async disconnect(@Req() req: Request) {
    const merchant = (req as any).merchant;
    await this.stripeService.disconnect(merchant.id);
    return { success: true };
  }

  // ── Payment Endpoints ───────────────────────────────────

  /**
   * Create a PaymentIntent for deposit collection (multi-tenant).
   */
  @Post('create-intent')
  async createIntent(
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

  @Post('confirm')
  async confirm(
    @Body() body: { paymentIntentId: string; stripeAccountId?: string },
  ) {
    if (!body.paymentIntentId) {
      throw new BadRequestException('paymentIntentId is required');
    }
    return this.stripeService.confirmPayment(body.paymentIntentId, body.stripeAccountId);
  }

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
      throw new BadRequestException('Raw body not available — ensure rawBody is enabled in NestFactory');
    }

    const event = await this.stripeService.constructWebhookEvent(rawBody, signature);

    switch (event.type) {
      case 'payment_intent.succeeded':
        this.logger.log(`Payment succeeded: ${(event.data.object as any).id}`);
        break;
      case 'payment_intent.payment_failed':
        this.logger.warn(`Payment failed: ${(event.data.object as any).id}`);
        break;
      default:
        this.logger.log(`Unhandled event: ${event.type}`);
    }

    return { received: true };
  }
}
