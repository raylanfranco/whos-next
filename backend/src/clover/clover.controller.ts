import { Controller, Get, Query, Res, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { CloverService } from './clover.service';

@Controller('auth/clover')
export class CloverController {
  private readonly logger = new Logger(CloverController.name);

  constructor(private readonly cloverService: CloverService) {}

  /**
   * GET /auth/clover/authorize
   * Redirects the merchant to Clover's OAuth authorization page.
   */
  @Get('authorize')
  authorize(@Res() res: Response) {
    const url = this.cloverService.getAuthorizationUrl();
    this.logger.log(`Redirecting to Clover OAuth: ${url}`);
    return res.redirect(url);
  }

  /**
   * GET /auth/clover/callback
   * Clover redirects here after the merchant authorizes.
   * Query params: ?code=xxx&merchant_id=xxx
   */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('merchant_id') merchantId: string,
    @Res() res: Response,
  ) {
    if (!code || !merchantId) {
      this.logger.warn('OAuth callback missing code or merchant_id');
      return res.status(400).json({
        error: 'Missing required parameters: code and merchant_id',
      });
    }

    try {
      const merchant = await this.cloverService.handleOAuthCallback(code, merchantId);

      this.logger.log(`OAuth complete for ${merchant.name}`);

      // Redirect to the Who's Next? dashboard after successful auth
      const dashboardUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${dashboardUrl}/dashboard?merchant=${merchant.id}`);
    } catch (error) {
      this.logger.error(`OAuth callback failed: ${error}`);
      return res.status(500).json({
        error: 'OAuth authorization failed',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
