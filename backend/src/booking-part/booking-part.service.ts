import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { PartStatus } from '@prisma/client';

@Injectable()
export class BookingPartService {
  constructor(private readonly prisma: PrismaService) {}

  async findByBooking(bookingId: string) {
    return this.prisma.bookingPart.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: {
    bookingId: string;
    partName: string;
    partNumber?: string;
    notes?: string;
  }) {
    return this.prisma.bookingPart.create({ data });
  }

  async updateStatus(id: string, status: PartStatus) {
    const part = await this.prisma.bookingPart.findUnique({ where: { id } });
    if (!part) throw new NotFoundException(`BookingPart ${id} not found`);

    const now = new Date();
    return this.prisma.bookingPart.update({
      where: { id },
      data: {
        status,
        orderedAt: status === 'ORDERED' ? now : part.orderedAt,
        receivedAt: status === 'RECEIVED' ? now : part.receivedAt,
      },
    });
  }

  async update(id: string, data: { partName?: string; partNumber?: string; notes?: string }) {
    const part = await this.prisma.bookingPart.findUnique({ where: { id } });
    if (!part) throw new NotFoundException(`BookingPart ${id} not found`);

    return this.prisma.bookingPart.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const part = await this.prisma.bookingPart.findUnique({ where: { id } });
    if (!part) throw new NotFoundException(`BookingPart ${id} not found`);

    return this.prisma.bookingPart.delete({ where: { id } });
  }

  async allPartsReceived(bookingId: string): Promise<boolean> {
    const parts = await this.prisma.bookingPart.findMany({
      where: { bookingId },
    });
    if (parts.length === 0) return true;
    return parts.every((p) => p.status === 'RECEIVED');
  }
}
