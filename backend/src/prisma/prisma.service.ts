import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool as any);
    super({
      adapter,
      // Never leak secrets to API consumers. Merchant objects are returned
      // straight to the frontend (GET /merchants/:id, GET /auth/me), so strip
      // the password hash and third-party access tokens globally. Any query
      // that genuinely needs one (e.g. login's bcrypt.compare) opts back in
      // per-call with `omit: { passwordHash: false }`.
      omit: {
        merchant: {
          passwordHash: true,
          cloverAccessToken: true,
          cloverRefreshToken: true,
          stripeAccessToken: true,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
