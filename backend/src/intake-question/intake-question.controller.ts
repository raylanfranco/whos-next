import { MerchantAccess } from '../auth/merchant-access.guard';
import { Controller, Get, Post, Patch, Delete, Query, Param, Body, UseGuards, SetMetadata } from '@nestjs/common';
import { PlanGuard, REQUIRED_PLAN_KEY } from '../plan/plan.guard';
import { IntakeQuestionService } from './intake-question.service';
import type { QuestionType } from '@prisma/client';

@Controller('intake-questions')
export class IntakeQuestionController {
  constructor(private readonly intakeQuestionService: IntakeQuestionService) {}

  @Get()
  findByService(@Query('serviceId') serviceId: string) {
    return this.intakeQuestionService.findByService(serviceId);
  }

  @Post()
  @MerchantAccess('service', 'body', 'serviceId')
  @UseGuards(PlanGuard)
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
  @MerchantAccess('intakeQuestion', 'body', 'ids', true)
  reorder(@Body() body: { ids: string[] }) {
    return this.intakeQuestionService.reorder(body.ids);
  }

  @Patch(':id')
  @MerchantAccess('intakeQuestion', 'params', 'id')
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
  @MerchantAccess('intakeQuestion', 'params', 'id')
  remove(@Param('id') id: string) {
    return this.intakeQuestionService.remove(id);
  }
}
