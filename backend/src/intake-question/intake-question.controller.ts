import { Controller, Get, Post, Patch, Delete, Query, Param, Body, UseGuards, SetMetadata } from '@nestjs/common';
import { IntakeQuestionService } from './intake-question.service';
import { AuthGuard } from '../auth/auth.guard';
import { PlanGuard, REQUIRED_PLAN_KEY } from '../plan/plan.guard';
import type { QuestionType } from '@prisma/client';

@Controller('intake-questions')
export class IntakeQuestionController {
  constructor(private readonly intakeQuestionService: IntakeQuestionService) {}

  @Get()
  findByService(@Query('serviceId') serviceId: string) {
    return this.intakeQuestionService.findByService(serviceId);
  }

  @Post()
  @UseGuards(AuthGuard, PlanGuard)
  @SetMetadata(REQUIRED_PLAN_KEY, 'PRO')
  create(@Body() body: {
    serviceId: string;
    question: string;
    type: QuestionType;
    options?: string[];
    required?: boolean;
    sortOrder?: number;
  }) {
    return this.intakeQuestionService.create(body);
  }

  @Patch('reorder')
  reorder(@Body() body: { ids: string[] }) {
    return this.intakeQuestionService.reorder(body.ids);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: {
    question?: string;
    type?: QuestionType;
    options?: string[];
    required?: boolean;
    sortOrder?: number;
  }) {
    return this.intakeQuestionService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.intakeQuestionService.remove(id);
  }
}
