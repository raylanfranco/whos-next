import { Module } from '@nestjs/common';
import { IntakeQuestionController } from './intake-question.controller';
import { IntakeQuestionService } from './intake-question.service';
import { AuthModule } from '../auth/auth.module';
import { PlanModule } from '../plan/plan.module';

@Module({
  imports: [AuthModule, PlanModule],
  controllers: [IntakeQuestionController],
  providers: [IntakeQuestionService],
  exports: [IntakeQuestionService],
})
export class IntakeQuestionModule {}
