import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { VehicleType, Prisma } from '@prisma/client';

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCustomer(customerId: string) {
    return this.prisma.vehicle.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    customerId: string;
    type?: VehicleType;
    year?: number;
    make?: string;
    model?: string;
    trim?: string;
    notes?: string;
    photos?: string[];
  }) {
    const { photos, ...rest } = data;
    return this.prisma.vehicle.create({
      data: {
        ...rest,
        photos: photos ? (photos as Prisma.InputJsonValue) : undefined,
      },
    });
  }
}
