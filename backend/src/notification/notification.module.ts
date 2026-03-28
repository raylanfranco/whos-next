import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SmsService } from './sms.service';
import { EmailService } from './email.service';
import { NotificationService } from './notification.service';
import { ReminderService } from './reminder.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [SmsService, EmailService, NotificationService, ReminderService],
  exports: [NotificationService, EmailService],
})
export class NotificationModule {}
