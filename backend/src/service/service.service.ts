import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  async findByMerchant(merchantId: string, activeOnly = false) {
    return this.prisma.service.findMany({
      where: {
        merchantId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { intakeQuestions: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!service) throw new NotFoundException(`Service ${id} not found`);
    return service;
  }

  async create(data: {
    merchantId: string;
    name: string;
    description?: string;
    category?: string;
    imageUrl?: string;
    durationMins: number;
    priceCents: number;
  }) {
    return this.prisma.service.create({ data });
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    category?: string;
    imageUrl?: string;
    durationMins?: number;
    priceCents?: number;
    isActive?: boolean;
  }) {
    await this.findOne(id);
    return this.prisma.service.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.service.delete({ where: { id } });
  }
}
