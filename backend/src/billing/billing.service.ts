import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: Stripe | null = null;

  constructor(private readonly prisma: PrismaService) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (secretKey) {
      this.stripe = new Stripe(secretKey);
    } else {
      this.logger.warn('STRIPE_SECRET_KEY not set — billing disabled');
    }
  }

  private ensureStripe(): Stripe {
    if (!this.stripe) {
      throw new BadRequestException('Stripe billing is not configured');
    }
    return this.stripe;
  }

  /**
   * Create a Stripe Checkout Session for the Pro plan.
   * Redirects the merchant to Stripe's hosted checkout page.
   */
  async createCheckoutSession(merchantId: string): Promise<{ url: string }> {
    const stripe = this.ensureStripe();
    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    const frontendUrl = process.env.FRONTEND_URL?.split(',')[0]?.trim() || 'http://localhost:5173';

    if (!priceId) {
      throw new BadRequestException('STRIPE_PRO_PRICE_ID not configured');
    }

    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new BadRequestException('Merchant not found');
    }

    if (merchant.plan === 'PRO' || merchant.plan === 'GRANDFATHERED') {
      throw new BadRequestException('Already on Pro or Grandfathered plan');
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendUrl}/dashboard/settings?merchant=${merchantId}&billing=success`,
      cancel_url: `${frontendUrl}/dashboard/settings?merchant=${merchantId}&billing=cancelled`,
      client_reference_id: merchantId,
      customer_email: merchant.email || undefined,
      metadata: { merchantId },
    });

    return { url: session.url! };
  }

  /**
   * Handle Stripe webhook events for subscription lifecycle.
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const merchantId = session.client_reference_id || session.metadata?.merchantId;
        if (!merchantId) {
          this.logger.warn('checkout.session.completed without merchantId');
          return;
        }

        await this.prisma.merchant.update({
          where: { id: merchantId },
          data: {
            plan: 'PRO',
            planActivatedAt: new Date(),
            stripeSubscriptionId: session.subscription as string,
          },
        });

        this.logger.log(`Merchant ${merchantId} upgraded to PRO`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const merchant = await this.prisma.merchant.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (merchant && merchant.plan !== 'GRANDFATHERED') {
          await this.prisma.merchant.update({
            where: { id: merchant.id },
            data: {
              plan: 'FREE',
              stripeSubscriptionId: null,
            },
          });

          this.logger.log(`Merchant ${merchant.id} downgraded to FREE (subscription cancelled)`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;
        const merchant = await this.prisma.merchant.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        });

        if (merchant) {
          this.logger.warn(`Payment failed for merchant ${merchant.id} — subscription ${subscriptionId}`);
        }
        break;
      }

      default:
        this.logger.log(`Unhandled billing event: ${event.type}`);
    }
  }

  /**
   * Construct and verify a Stripe webhook event.
   */
  constructEvent(payload: Buffer, signature: string): Stripe.Event {
    const stripe = this.ensureStripe();
    const secret = process.env.STRIPE_BILLING_WEBHOOK_SECRET;
    if (!secret) {
      throw new BadRequestException('STRIPE_BILLING_WEBHOOK_SECRET not configured');
    }
    return stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
