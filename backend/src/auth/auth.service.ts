import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

// Require a real secret in production; fall back only for local dev.
// A weak/known secret lets anyone forge tokens for any merchant.
const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    return 'dev-secret-change-me';
  }
  return secret;
})();

interface JwtPayload {
  sub: string; // merchant id
  email: string;
  iat?: number; // issued-at (seconds), set by jsonwebtoken
}

const TOKEN_TTL = '30d';
// Re-issue a fresh token once the current one is older than this, so an active
// user's session slides forward and effectively never expires.
const REFRESH_AFTER_SECONDS = 24 * 60 * 60; // 1 day

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register a new merchant with email/password.
   */
  async register(
    email: string,
    password: string,
    businessName: string,
    vertical?: 'GENERIC' | 'AUTOMOTIVE' | 'TATTOO' | 'BEAUTY' | 'POWERSPORTS',
  ) {
    // Check if email already exists
    const existing = await this.prisma.merchant.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException('A merchant with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const merchant = await this.prisma.merchant.create({
      data: {
        email,
        passwordHash,
        name: businessName,
        // Schema default is GENERIC; we let callers override at signup so the
        // booking flow (vehicle vs. tattoo vs. powersports adapter) is correct
        // from the merchant's first login.
        ...(vertical ? { vertical } : {}),
      },
    });

    const token = this.signToken(merchant.id, email);

    return {
      token,
      merchant: {
        id: merchant.id,
        email: merchant.email,
        name: merchant.name,
      },
    };
  }

  /**
   * Login with email/password.
   */
  async login(email: string, password: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { email },
      // Global omit strips passwordHash; opt back in here so we can compare it.
      omit: { passwordHash: false },
    });

    if (!merchant || !merchant.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, merchant.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.signToken(merchant.id, email);

    return {
      token,
      merchant: {
        id: merchant.id,
        email: merchant.email,
        name: merchant.name,
      },
    };
  }

  /**
   * Validate a JWT token and return the merchant.
   */
  async validateToken(token: string) {
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const merchant = await this.prisma.merchant.findUnique({
      where: { id: payload.sub },
      include: {
        services: true,
        availabilityRules: true,
        blockedDates: true,
      },
    });

    if (!merchant) {
      throw new UnauthorizedException('Merchant not found');
    }

    return { merchant, payload };
  }

  /**
   * Given a still-valid token's payload, return a freshly-signed token if the
   * current one is old enough to warrant sliding the session forward, else null.
   * Lets an active user stay logged in indefinitely without a refresh-token store.
   */
  maybeRefreshToken(payload: JwtPayload): string | null {
    if (!payload.iat) return null;
    const ageSeconds = Math.floor(Date.now() / 1000) - payload.iat;
    if (ageSeconds < REFRESH_AFTER_SECONDS) return null;
    return this.signToken(payload.sub, payload.email);
  }

  private signToken(merchantId: string, email: string): string {
    return jwt.sign(
      { sub: merchantId, email } satisfies JwtPayload,
      JWT_SECRET,
      { expiresIn: TOKEN_TTL },
    );
  }
}
