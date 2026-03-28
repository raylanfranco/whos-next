import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

interface JwtPayload {
  sub: string; // merchant id
  email: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register a new merchant with email/password.
   */
  async register(email: string, password: string, businessName: string) {
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
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

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

      return merchant;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private signToken(merchantId: string, email: string): string {
    return jwt.sign(
      { sub: merchantId, email } satisfies JwtPayload,
      JWT_SECRET,
      { expiresIn: '7d' },
    );
  }
}
