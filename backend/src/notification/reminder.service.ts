import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from './sms.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
  ) {}

  /**
   * 24-hour appointment reminders — runs every hour.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendReminders() {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        startsAt: { gte: in24h, lt: in25h },
      },
      include: { customer: true, service: true, merchant: true },
    });

    for (const booking of bookings) {
      const settings = booking.merchant.settings as Record<string, unknown> | null;
      if (!settings?.smsEnabled) continue;
      if (!booking.customer.phone) continue;

      const customerName = booking.customer.name.split(' ')[0];
      const timeStr = booking.startsAt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });

      const message = `Reminder: Hi ${customerName}, your appointment for ${booking.service?.name ?? 'your service'} is tomorrow at ${timeStr}. — ${booking.merchant.name}`;
      await this.smsService.send(booking.customer.phone, message);
    }

    if (bookings.length > 0) {
      this.logger.log(`Sent ${bookings.length} appointment reminder(s)`);
    }
  }

  /**
   * Review requests — runs at 10 AM daily for yesterday's completed bookings.
   */
  @Cron('0 10 * * *')
  async sendReviewRequests() {
    const now = new Date();
    const yesterdayStart = new Date(now);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: 'COMPLETED',
        updatedAt: { gte: yesterdayStart, lte: yesterdayEnd },
      },
      include: { customer: true, merchant: true },
    });

    for (const booking of bookings) {
      const settings = booking.merchant.settings as Record<string, unknown> | null;
      if (!settings?.smsEnabled) continue;
      if (!booking.customer.phone) continue;

      const customerName = booking.customer.name.split(' ')[0];
      let message = `Hi ${customerName}! Thanks for visiting ${booking.merchant.name}. We'd love your feedback!`;

      if (settings?.googleReviewUrl) {
        message += ` Leave us a review: ${settings.googleReviewUrl}`;
      }

      await this.smsService.send(booking.customer.phone, message);
    }

    if (bookings.length > 0) {
      this.logger.log(`Sent ${bookings.length} review request(s)`);
    }
  }
}
