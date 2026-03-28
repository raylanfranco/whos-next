import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private fromAddress: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromAddress = process.env.RESEND_FROM_EMAIL || "Who's Next? <notifications@resend.dev>";

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend email client initialized');
    } else {
      this.logger.warn('RESEND_API_KEY not set — email notifications disabled');
    }
  }

  async sendBookingConfirmation(params: {
    customerEmail: string;
    customerName: string;
    serviceName: string;
    date: string;
    time: string;
    merchantName: string;
    merchantEmail?: string;
  }): Promise<boolean> {
    if (!this.resend) return false;

    const { customerEmail, customerName, serviceName, date, time, merchantName, merchantEmail } = params;
    const firstName = customerName.split(' ')[0];

    try {
      await this.resend.emails.send({
        from: `${merchantName} via Who's Next? <${this.fromAddress.match(/<(.+)>/)?.[1] || 'notifications@resend.dev'}>`,
        replyTo: merchantEmail || undefined,
        to: customerEmail,
        subject: `Booking Confirmed — ${serviceName}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
            <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #1a1a1a;">Your appointment is booked!</h2>
            <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              Hi ${firstName}, your appointment has been received. Here are the details:
            </p>
            <div style="background: #f9f9f9; border-left: 3px solid #FFB347; padding: 16px; margin: 0 0 20px 0;">
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Service:</strong> ${serviceName}</p>
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Date:</strong> ${date}</p>
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Time:</strong> ${time}</p>
              <p style="margin: 0; font-size: 14px;"><strong>Shop:</strong> ${merchantName}</p>
            </div>
            <p style="color: #555; font-size: 13px; line-height: 1.5;">
              You may receive a confirmation call or text from ${merchantName} before your appointment.
              If you need to reschedule or cancel, please contact the shop directly.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #aaa; font-size: 11px; margin: 0;">Powered by Who's Next?</p>
          </div>
        `,
      });
      this.logger.log(`Booking confirmation email sent to ${customerEmail}`);
      return true;
    } catch (err) {
      this.logger.error(`Email failed to ${customerEmail}: ${err}`);
      return false;
    }
  }

  async sendStatusUpdate(params: {
    customerEmail: string;
    customerName: string;
    serviceName: string;
    status: string;
    merchantName: string;
    merchantEmail?: string;
  }): Promise<boolean> {
    if (!this.resend) return false;

    const { customerEmail, customerName, serviceName, status, merchantName, merchantEmail } = params;
    const firstName = customerName.split(' ')[0];

    const statusMessages: Record<string, { subject: string; body: string }> = {
      CONFIRMED: {
        subject: `Appointment Confirmed — ${serviceName}`,
        body: `Hi ${firstName}, your appointment for <strong>${serviceName}</strong> at <strong>${merchantName}</strong> has been confirmed. See you soon!`,
      },
      COMPLETED: {
        subject: `Service Complete — ${serviceName}`,
        body: `Hi ${firstName}, your <strong>${serviceName}</strong> service at <strong>${merchantName}</strong> is complete. Your vehicle is ready for pickup!`,
      },
      CANCELLED: {
        subject: `Appointment Cancelled — ${serviceName}`,
        body: `Hi ${firstName}, your appointment for <strong>${serviceName}</strong> at <strong>${merchantName}</strong> has been cancelled. Please contact the shop if you have questions.`,
      },
    };

    const msg = statusMessages[status];
    if (!msg) return false;

    try {
      await this.resend.emails.send({
        from: `${merchantName} via Who's Next? <${this.fromAddress.match(/<(.+)>/)?.[1] || 'notifications@resend.dev'}>`,
        replyTo: merchantEmail || undefined,
        to: customerEmail,
        subject: msg.subject,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
            <p style="color: #555; font-size: 14px; line-height: 1.6;">${msg.body}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #aaa; font-size: 11px; margin: 0;">Powered by Who's Next?</p>
          </div>
        `,
      });
      this.logger.log(`Status email (${status}) sent to ${customerEmail}`);
      return true;
    } catch (err) {
      this.logger.error(`Status email failed to ${customerEmail}: ${err}`);
      return false;
    }
  }
}
