import { Controller, Post, Delete, Body, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { PushService } from './push.service';
import { AuthGuard } from '../auth/auth.guard';
import { PlanGuard, REQUIRED_PLAN_KEY } from '../plan/plan.guard';

@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('subscribe')
  @UseGuards(AuthGuard, PlanGuard)
  @SetMetadata(REQUIRED_PLAN_KEY, 'PRO')
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

  @Post('subscribe-native')
  @UseGuards(AuthGuard, PlanGuard)
  @SetMetadata(REQUIRED_PLAN_KEY, 'PRO')
  async subscribeNative(
    @Req() req: any,
    @Body() body: { token: string; platform: string; merchantId: string },
  ) {
    const merchantId = req.merchant.id;
    await this.pushService.subscribeNative({
      merchantId,
      token: body.token,
      platform: body.platform,
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
  @UseGuards(AuthGuard, PlanGuard)
  @SetMetadata(REQUIRED_PLAN_KEY, 'PRO')
  async test(@Req() req: any) {
    const merchantId = req.merchant.id;
    await this.pushService.testPush(merchantId);
    return { ok: true, message: 'Test notification sent' };
  }
}
