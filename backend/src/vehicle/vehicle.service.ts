import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
    year?: number;
    make?: string;
    model?: string;
    trim?: string;
    notes?: string;
  }) {
    return this.prisma.vehicle.create({ data });
  }
}
