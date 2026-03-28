import { Controller, Post, Delete, Body, UseGuards, Req } from '@nestjs/common';
import { PushService } from './push.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('subscribe')
  @UseGuards(AuthGuard)
  async subscribe(
    @Req() req: any,
    @Body() body: { endpoint: string; p256dh: string; auth: string; deviceLabel?: string },
  ) {
    const merchantId = req.merchant.id;
    await this.pushService.subscribe({
      merchantId,
      endpoint: body.endpoint,
      p256dh: body.p256dh,
      auth: body.auth,
      deviceLabel: body.deviceLabel,
    });
    return { ok: true };
  }

  @Delete('subscribe')
  @UseGuards(AuthGuard)
  async unsubscribe(
    @Req() req: any,
    @Body() body: { endpoint: string },
  ) {
    const merchantId = req.merchant.id;
    await this.pushService.unsubscribe(merchantId, body.endpoint);
    return { ok: true };
  }

  @Post('test')
  @UseGuards(AuthGuard)
  async test(@Req() req: any) {
    const merchantId = req.merchant.id;
    await this.pushService.testPush(merchantId);
    return { ok: true, message: 'Test notification sent' };
  }
}
