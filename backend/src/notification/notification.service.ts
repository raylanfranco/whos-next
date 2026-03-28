import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from './sms.service';
import { EmailService } from './email.service';
import type { BookingStatus } from '@prisma/client';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
  ) {}

  async onStatusChange(bookingId: string, newStatus: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, service: true, merchant: true },
    });

    if (!booking) return;

    // Check if merchant has SMS enabled
    const settings = booking.merchant.settings as Record<string, unknown> | null;
    if (!settings?.smsEnabled) return;

    // Need customer phone
    if (!booking.customer.phone) {
      this.logger.debug(`No phone for customer ${booking.customer.name} — skipping SMS`);
      return;
    }

    const phone = booking.customer.phone;
    const customerName = booking.customer.name.split(' ')[0]; // First name
    const serviceName = booking.service?.name ?? 'your service';
    const dateStr = booking.startsAt.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const timeStr = booking.startsAt.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    let message: string | null = null;

    switch (newStatus) {
      case 'CONFIRMED':
        message = `Hi ${customerName}! Your appointment for ${serviceName} is confirmed for ${dateStr} at ${timeStr}. See you then! — ${booking.merchant.name}`;
        break;
      case 'COMPLETED':
        message = `Hey ${customerName}! Your vehicle is ready for pickup. Thanks for choosing ${booking.merchant.name}!`;
        break;
    }

    // Email notification (fire-and-forget)
    if (booking.customer.email) {
      this.emailService.sendStatusUpdate({
        customerEmail: booking.customer.email,
        customerName: booking.customer.name,
        serviceName: serviceName,
        status: newStatus,
        merchantName: booking.merchant.name,
        merchantEmail: booking.merchant.email || undefined,
      }).catch(() => {});
    }

    if (message) {
      await this.smsService.send(phone, message);
    }
  }
}
