import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as webpush from 'web-push';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private configured = false;

  constructor(private readonly prisma: PrismaService) {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const contact = process.env.VAPID_CONTACT || 'mailto:ray@victoryrush.dev';

    if (publicKey && privateKey) {
      webpush.setVapidDetails(contact, publicKey, privateKey);
      this.configured = true;
      this.logger.log('VAPID configured — push notifications enabled');
    } else {
      this.logger.warn('VAPID keys not set — push notifications disabled');
    }
  }

  async subscribe(data: {
    merchantId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    deviceLabel?: string;
  }) {
    return this.prisma.pushSubscription.upsert({
      where: {
        merchantId_endpoint: {
          merchantId: data.merchantId,
          endpoint: data.endpoint,
        },
      },
      update: {
        p256dh: data.p256dh,
        auth: data.auth,
        deviceLabel: data.deviceLabel,
      },
      create: data,
    });
  }

  async unsubscribe(merchantId: string, endpoint: string) {
    return this.prisma.pushSubscription.deleteMany({
      where: { merchantId, endpoint },
    });
  }

  async sendToMerchant(
    merchantId: string,
    payload: { title: string; body: string; url?: string },
  ) {
    if (!this.configured) {
      this.logger.warn('Push not configured — skipping notification');
      return;
    }

    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { merchantId },
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
        );
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          this.logger.log(`Removing stale subscription ${sub.id}`);
          await this.prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          this.logger.error(`Push failed for ${sub.id}: ${err.message}`);
        }
      }
    }
  }

  async testPush(merchantId: string) {
    return this.sendToMerchant(merchantId, {
      title: 'Who's Next? Test',
      body: 'Push notifications are working!',
      url: '/dashboard/bookings',
    });
  }
}
