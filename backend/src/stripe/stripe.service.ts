import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private platformStripe: Stripe | null = null;

  constructor(private readonly prisma: PrismaService) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (secretKey) {
      this.platformStripe = new Stripe(secretKey);
      this.logger.log('Platform Stripe configured');
    } else {
      this.logger.warn('STRIPE_SECRET_KEY not set — Stripe payments disabled');
    }
  }

  // ── Stripe Connect OAuth ────────────────────────────────

  getConnectUrl(merchantId: string): string {
    const clientId = process.env.STRIPE_CLIENT_ID;
    const redirectUri = process.env.STRIPE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      throw new BadRequestException('Stripe Connect is not configured (missing STRIPE_CLIENT_ID or STRIPE_REDIRECT_URI)');
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: 'read_write',
      state: merchantId,
      redirect_uri: redirectUri,
    });

    return `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
  }

  async handleConnectCallback(code: string, state: string) {
    const stripe = this.ensurePlatformStripe();

    // Exchange authorization code for tokens
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    const { stripe_user_id, access_token, stripe_publishable_key } = response;

    if (!stripe_user_id) {
      throw new BadRequestException('Stripe OAuth failed — no account ID returned');
    }

    // Store Connect credentials on the merchant
    await this.prisma.merchant.update({
      where: { id: state },
      data: {
        stripeAccountId: stripe_user_id,
        stripeAccessToken: access_token ?? null,
        stripePublishableKey: stripe_publishable_key ?? null,
        stripeConnected: true,
        stripeConnectedAt: new Date(),
      },
    });

    this.logger.log(`Stripe Connect completed for merchant ${state} → ${stripe_user_id}`);

    return { stripeAccountId: stripe_user_id };
  }

  async disconnect(merchantId: string) {
    const stripe = this.ensurePlatformStripe();
    const clientId = process.env.STRIPE_CLIENT_ID;

    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant?.stripeAccountId) {
      throw new BadRequestException('Merchant is not connected to Stripe');
    }

    // Deauthorize on Stripe's side
    await stripe.oauth.deauthorize({
      client_id: clientId!,
      stripe_user_id: merchant.stripeAccountId,
    });

    // Clear local fields
    await this.prisma.merchant.update({
      where: { id: merchantId },
      data: {
        stripeAccountId: null,
        stripeAccessToken: null,
        stripePublishableKey: null,
        stripeConnected: false,
        stripeConnectedAt: null,
      },
    });

    this.logger.log(`Stripe disconnected for merchant ${merchantId}`);
  }

  async getConnectStatus(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        stripeConnected: true,
        stripePublishableKey: true,
        stripeConnectedAt: true,
      },
    });

    return {
      connected: merchant?.stripeConnected ?? false,
      stripePublishableKey: merchant?.stripePublishableKey ?? null,
      connectedAt: merchant?.stripeConnectedAt ?? null,
    };
  }

  // ── Payment Intent (multi-tenant) ───────────────────────

  async createPaymentIntent(
    merchantId: string,
    amountCents: number,
    currency: string = 'usd',
    description?: string,
    metadata?: Record<string, string>,
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    // Use merchant's connected account via Stripe-Account header (recommended),
    // fall back to merchant's access_token, then to global env var
    const stripe = this.ensurePlatformStripe();

    const intentParams: Stripe.PaymentIntentCreateParams = {
      amount: amountCents,
      currency,
      description,
      metadata,
      automatic_payment_methods: { enabled: true },
    };

    let options: Stripe.RequestOptions | undefined;

    if (merchant?.stripeAccountId) {
      // Stripe-Account header — recommended for Standard Connect
      options = { stripeAccount: merchant.stripeAccountId };
    }

    const paymentIntent = await stripe.paymentIntents.create(intentParams, options);

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }

  async confirmPayment(paymentIntentId: string, stripeAccountId?: string): Promise<{ status: string }> {
    const stripe = this.ensurePlatformStripe();

    const options: Stripe.RequestOptions | undefined = stripeAccountId
      ? { stripeAccount: stripeAccountId }
      : undefined;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, options);
    return { status: paymentIntent.status };
  }

  async constructWebhookEvent(
    payload: Buffer,
    signature: string,
  ): Promise<Stripe.Event> {
    const stripe = this.ensurePlatformStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not set');
    }
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  private ensurePlatformStripe(): Stripe {
    if (!this.platformStripe) {
      throw new BadRequestException('Stripe is not configured. Set STRIPE_SECRET_KEY.');
    }
    return this.platformStripe;
  }
}
