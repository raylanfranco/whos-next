import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CloverTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  // Clover v2 returns Unix timestamps (milliseconds)
  access_token_expiration?: number;
  refresh_token_expiration?: number;
  refresh_token?: string;
}

interface CloverMerchantInfo {
  id: string;
  name: string;
  tpiDetails?: { timezone?: string };
}

@Injectable()
export class CloverService {
  private readonly logger = new Logger(CloverService.name);

  private readonly appId = process.env.CLOVER_APP_ID!;
  private readonly appSecret = process.env.CLOVER_APP_SECRET!;
  // Browser-facing OAuth URL (sandbox.dev.clover.com)
  private readonly baseUrl = process.env.CLOVER_API_BASE_URL || 'https://sandbox.dev.clover.com';
  // API-facing URL (apisandbox.dev.clover.com for sandbox, api.clover.com for prod)
  private readonly apiBaseUrl = (process.env.CLOVER_API_BASE_URL || 'https://sandbox.dev.clover.com')
    .replace('sandbox.dev.clover.com', 'apisandbox.dev.clover.com')
    .replace('www.clover.com', 'api.clover.com');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Build the Clover OAuth authorization URL.
   * Merchant clicks this to authorize Who's Next?.
   */
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      response_type: 'code',
    });
    return `${this.baseUrl}/oauth/v2/authorize?${params}`;
  }

  /**
   * Exchange an authorization code for access + refresh tokens.
   * Called from the OAuth callback endpoint.
   */
  async exchangeCode(code: string): Promise<CloverTokenResponse> {
    const tokenUrl = `${this.apiBaseUrl}/oauth/v2/token`;
    this.logger.log(`Exchanging code at: ${tokenUrl}`);

    const payload = JSON.stringify({
      client_id: this.appId,
      client_secret: this.appSecret,
      code,
    });

    // Use redirect: 'manual' to prevent fetch from following redirects
    // (redirects strip the POST body/headers, causing 415 errors)
    let res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      redirect: 'manual',
    });

    // If Clover redirects, follow it manually with the body intact
    if (res.status >= 300 && res.status < 400) {
      const redirectUrl = res.headers.get('location');
      this.logger.warn(`Token endpoint redirected to: ${redirectUrl}`);
      if (redirectUrl) {
        res = await fetch(redirectUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          redirect: 'manual',
        });
      }
    }

    if (!res.ok) {
      const body = await res.text();
      this.logger.error(`Token exchange failed: ${res.status} ${body}`);
      throw new Error(`Clover token exchange failed: ${res.status}`);
    }

    return res.json();
  }

  /**
   * Refresh an expired access token.
   */
  async refreshAccessToken(refreshToken: string): Promise<CloverTokenResponse> {
    const res = await fetch(`${this.apiBaseUrl}/oauth/v2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.appId,
        client_secret: this.appSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      this.logger.error(`Token refresh failed: ${res.status} ${body}`);
      throw new Error(`Clover token refresh failed: ${res.status}`);
    }

    return res.json();
  }

  /**
   * Fetch merchant info from Clover using the access token.
   */
  async getMerchantInfo(merchantId: string, accessToken: string): Promise<CloverMerchantInfo> {
    const res = await fetch(
      `${this.apiBaseUrl}/v3/merchants/${merchantId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch merchant info: ${res.status}`);
    }

    return res.json();
  }

  /**
   * Handle the full OAuth callback:
   * 1. Exchange code for tokens
   * 2. Fetch merchant info from Clover
   * 3. Upsert merchant in our database
   */
  async handleOAuthCallback(code: string, merchantId: string) {
    // Exchange code for tokens
    const tokens = await this.exchangeCode(code);
    this.logger.log(`Token response keys: ${Object.keys(tokens).join(', ')}`);

    // Clover v2 returns access_token_expiration as Unix timestamp.
    // Detect seconds vs milliseconds: if < 10^12, it's seconds.
    let expiresAt: Date;
    if (tokens.access_token_expiration) {
      const ts = tokens.access_token_expiration < 1e12
        ? tokens.access_token_expiration * 1000
        : tokens.access_token_expiration;
      expiresAt = new Date(ts);
    } else if (tokens.expires_in) {
      expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    } else {
      expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    }

    // Fetch merchant details from Clover
    const merchantInfo = await this.getMerchantInfo(merchantId, tokens.access_token);

    // Upsert merchant — create if new, update tokens if existing
    const merchant = await this.prisma.merchant.upsert({
      where: { cloverMerchantId: merchantId },
      create: {
        cloverMerchantId: merchantId,
        name: merchantInfo.name,
        timezone: merchantInfo.tpiDetails?.timezone || 'America/New_York',
        cloverAccessToken: tokens.access_token,
        cloverRefreshToken: tokens.refresh_token || null,
        cloverTokenExpiry: expiresAt,
      },
      update: {
        name: merchantInfo.name,
        cloverAccessToken: tokens.access_token,
        cloverRefreshToken: tokens.refresh_token || null,
        cloverTokenExpiry: expiresAt,
      },
    });

    this.logger.log(`Merchant onboarded: ${merchant.name} (${merchant.cloverMerchantId})`);

    return merchant;
  }

  /**
   * Get a valid access token for a merchant, refreshing if expired.
   */
  async getAccessToken(merchantId: string): Promise<string> {
    const merchant = await this.prisma.merchant.findUnique({
      where: { cloverMerchantId: merchantId },
    });

    if (!merchant?.cloverAccessToken) {
      throw new Error(`No access token for merchant ${merchantId}`);
    }

    // Check if token is expired (with 5 min buffer)
    const isExpired =
      merchant.cloverTokenExpiry &&
      merchant.cloverTokenExpiry.getTime() < Date.now() + 5 * 60 * 1000;

    if (isExpired && merchant.cloverRefreshToken) {
      this.logger.log(`Refreshing token for merchant ${merchantId}`);
      const tokens = await this.refreshAccessToken(merchant.cloverRefreshToken);
      const rawExp = tokens.access_token_expiration;
      const expiresAt = rawExp
        ? new Date(rawExp < 1e12 ? rawExp * 1000 : rawExp)
        : new Date(Date.now() + (tokens.expires_in ?? 1800) * 1000);

      await this.prisma.merchant.update({
        where: { cloverMerchantId: merchantId },
        data: {
          cloverAccessToken: tokens.access_token,
          cloverRefreshToken: tokens.refresh_token || merchant.cloverRefreshToken,
          cloverTokenExpiry: expiresAt,
        },
      });

      return tokens.access_token;
    }

    return merchant.cloverAccessToken;
  }

  /**
   * Charge a card token via Clover's ecommerce charge endpoint.
   * Uses the private ecomm token (CLOVER_ECOMM_PRIVATE_KEY) for authorization.
   * Falls back to OAuth access token if private key is not set.
   */
  async createCharge(
    cloverMerchantId: string,
    amountCents: number,
    source: string,
    description?: string,
    clientIp?: string,
  ): Promise<{ id: string; amount: number; status: string }> {
    // Prefer the ecomm private key for charges (works without OAuth re-onboarding)
    const ecommPrivateKey = process.env.CLOVER_ECOMM_PRIVATE_KEY?.trim();
    const bearerToken = ecommPrivateKey || (await this.getAccessToken(cloverMerchantId));
    this.logger.log(`Charge auth: using ${ecommPrivateKey ? 'ecomm private key' : 'OAuth token'} (token prefix: ${bearerToken.substring(0, 8)}...)`);

    // Derive charge URL from CLOVER_API_BASE_URL (supports both sandbox and production)
    const isSandbox = this.baseUrl.includes('sandbox');
    const chargeBaseUrl = isSandbox
      ? 'https://scl-sandbox.dev.clover.com'
      : 'https://scl.clover.com';

    this.logger.log(`Charge request: ${chargeBaseUrl}/v1/charges | amount: ${amountCents} | source prefix: ${source.substring(0, 10)}... | ip: ${clientIp || 'none'}`);

    const res = await fetch(`${chargeBaseUrl}/v1/charges`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'authorization': `Bearer ${bearerToken}`,
        'content-type': 'application/json',
        ...(clientIp ? { 'x-forwarded-for': clientIp } : {}),
      },
      body: JSON.stringify({
        amount: amountCents,
        currency: 'usd',
        source,
        ...(description ? { description } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      this.logger.error(`Clover charge failed: ${res.status} | URL: ${chargeBaseUrl}/v1/charges | Body: ${body}`);
      throw new Error(`Clover charge failed: ${res.status} ${body}`);
    }

    return res.json();
  }

  /**
   * Make an authenticated request to the Clover API for a merchant.
   */
  async cloverFetch<T>(merchantId: string, endpoint: string, options?: RequestInit): Promise<T> {
    const accessToken = await this.getAccessToken(merchantId);

    const res = await fetch(
      `${this.apiBaseUrl}/v3/merchants/${merchantId}${endpoint}`,
      {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Clover API error: ${res.status} ${body}`);
    }

    return res.json();
  }
}
