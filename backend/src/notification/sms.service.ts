import { Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private client: twilio.Twilio | null = null;
  private fromNumber: string | null = null;

  constructor() {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const phone = process.env.TWILIO_PHONE_NUMBER;

    if (sid && token && phone) {
      this.client = twilio(sid, token);
      this.fromNumber = phone;
      this.logger.log('Twilio SMS client initialized');
    } else {
      this.logger.warn('Twilio credentials not set — SMS disabled');
    }
  }

  async send(to: string, body: string): Promise<boolean> {
    if (!this.client || !this.fromNumber) {
      this.logger.warn(`SMS not sent (no client): ${body.substring(0, 50)}...`);
      return false;
    }

    try {
      await this.client.messages.create({
        to,
        from: this.fromNumber,
        body,
      });
      this.logger.log(`SMS sent to ${to}`);
      return true;
    } catch (err) {
      this.logger.error(`SMS failed to ${to}: ${err}`);
      return false;
    }
  }
}
