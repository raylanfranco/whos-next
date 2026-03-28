import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MerchantService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.merchant.findMany({
      include: { services: true, availabilityRules: true },
    });
  }

  async findOne(id: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
      include: {
        services: true,
        availabilityRules: true,
        blockedDates: true,
      },
    });

    if (!merchant) {
      throw new NotFoundException(`Merchant ${id} not found`);
    }

    return merchant;
  }

  async findByCloverMerchantId(cloverMerchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { cloverMerchantId },
      include: { services: true, availabilityRules: true },
    });

    if (!merchant) {
      throw new NotFoundException(
        `Merchant with Clover ID ${cloverMerchantId} not found`,
      );
    }

    return merchant;
  }

  async update(id: string, data: {
    name?: string;
    timezone?: string;
    shopHours?: Record<string, unknown>;
    settings?: Record<string, unknown>;
  }) {
    const merchant = await this.findOne(id); // throws if not found

    // Merge settings so partial updates don't overwrite existing keys
    let mergedSettings: Prisma.InputJsonValue | undefined;
    if (data.settings) {
      const existing = (merchant.settings as Record<string, unknown>) ?? {};
      mergedSettings = { ...existing, ...data.settings } as Prisma.InputJsonValue;
    }

    return this.prisma.merchant.update({
      where: { id },
      data: {
        name: data.name,
        timezone: data.timezone,
        shopHours: data.shopHours as Prisma.InputJsonValue ?? undefined,
        settings: mergedSettings,
      },
    });
  }

  async updateAvailability(merchantId: string, rules: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isBlocked?: boolean;
  }[]) {
    await this.findOne(merchantId); // throws if not found

    // Upsert each rule
    const results = await Promise.all(
      rules.map((rule) =>
        this.prisma.availabilityRule.upsert({
          where: {
            merchantId_dayOfWeek: {
              merchantId,
              dayOfWeek: rule.dayOfWeek,
            },
          },
          create: {
            merchantId,
            dayOfWeek: rule.dayOfWeek,
            startTime: rule.startTime,
            endTime: rule.endTime,
            isBlocked: rule.isBlocked ?? false,
          },
          update: {
            startTime: rule.startTime,
            endTime: rule.endTime,
            isBlocked: rule.isBlocked ?? false,
          },
        }),
      ),
    );

    return results;
  }

  async addBlockedDate(merchantId: string, date: string, reason?: string) {
    await this.findOne(merchantId);

    return this.prisma.blockedDate.create({
      data: {
        merchantId,
        date: new Date(date),
        reason,
      },
    });
  }

  async removeBlockedDate(id: string) {
    return this.prisma.blockedDate.delete({ where: { id } });
  }
}
