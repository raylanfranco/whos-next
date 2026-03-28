import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FitmentService {
  constructor(private readonly prisma: PrismaService) {}

  async lookup(
    year: number,
    make: string,
    model: string,
    trim?: string,
    category?: string,
  ) {
    return this.prisma.fitmentEntry.findMany({
      where: {
        year,
        make: { equals: make, mode: 'insensitive' },
        model: { equals: model, mode: 'insensitive' },
        ...(trim ? { trim: { equals: trim, mode: 'insensitive' } } : {}),
        ...(category
          ? { category: { equals: category, mode: 'insensitive' } }
          : {}),
      },
      orderBy: [{ category: 'asc' }, { partName: 'asc' }],
    });
  }

  async create(data: {
    year: number;
    make: string;
    model: string;
    trim?: string;
    category: string;
    partNumber: string;
    partName: string;
    brand?: string;
    notes?: string;
  }) {
    return this.prisma.fitmentEntry.create({ data });
  }

  async bulkCreate(
    entries: {
      year: number;
      make: string;
      model: string;
      trim?: string;
      category: string;
      partNumber: string;
      partName: string;
      brand?: string;
      notes?: string;
    }[],
  ) {
    return this.prisma.fitmentEntry.createMany({ data: entries });
  }

  async findAll(filters?: { make?: string; category?: string }) {
    return this.prisma.fitmentEntry.findMany({
      where: {
        ...(filters?.make
          ? { make: { equals: filters.make, mode: 'insensitive' as const } }
          : {}),
        ...(filters?.category
          ? {
              category: {
                equals: filters.category,
                mode: 'insensitive' as const,
              },
            }
          : {}),
      },
      orderBy: [{ year: 'desc' }, { make: 'asc' }, { model: 'asc' }],
    });
  }

  async remove(id: string) {
    const entry = await this.prisma.fitmentEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException(`Fitment entry ${id} not found`);
    return this.prisma.fitmentEntry.delete({ where: { id } });
  }
}
