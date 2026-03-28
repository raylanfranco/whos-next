import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma, QuestionType } from '@prisma/client';

@Injectable()
export class IntakeQuestionService {
  constructor(private readonly prisma: PrismaService) {}

  async findByService(serviceId: string) {
    return this.prisma.intakeQuestion.findMany({
      where: { serviceId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(data: {
    serviceId: string;
    question: string;
    type: QuestionType;
    options?: Prisma.InputJsonValue;
    required?: boolean;
    sortOrder?: number;
  }) {
    return this.prisma.intakeQuestion.create({ data });
  }

  async update(id: string, data: {
    question?: string;
    type?: QuestionType;
    options?: Prisma.InputJsonValue;
    required?: boolean;
    sortOrder?: number;
  }) {
    const existing = await this.prisma.intakeQuestion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`IntakeQuestion ${id} not found`);
    return this.prisma.intakeQuestion.update({ where: { id }, data });
  }

  async remove(id: string) {
    const existing = await this.prisma.intakeQuestion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`IntakeQuestion ${id} not found`);
    return this.prisma.intakeQuestion.delete({ where: { id } });
  }

  async reorder(ids: string[]) {
    const updates = ids.map((id, index) =>
      this.prisma.intakeQuestion.update({
        where: { id },
        data: { sortOrder: index },
      }),
    );
    return this.prisma.$transaction(updates);
  }
}
