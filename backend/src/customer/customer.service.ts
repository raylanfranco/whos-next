import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async findByMerchant(merchantId: string) {
    return this.prisma.customer.findMany({
      where: { merchantId },
      include: {
        _count: { select: { vehicles: true, bookings: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { vehicles: true, bookings: { include: { service: true }, orderBy: { startsAt: 'desc' } } },
    });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async create(data: {
    merchantId: string;
    name: string;
    email?: string;
    phone?: string;
  }) {
    return this.prisma.customer.create({ data });
  }

  async update(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
  }) {
    await this.findOne(id);
    return this.prisma.customer.update({ where: { id }, data });
  }

  async findOrCreate(merchantId: string, data: { name: string; email?: string; phone?: string }) {
    if (data.email) {
      const existing = await this.prisma.customer.findUnique({
        where: { merchantId_email: { merchantId, email: data.email } },
      });
      if (existing) return existing;
    }
    return this.prisma.customer.create({ data: { merchantId, ...data } });
  }
}
