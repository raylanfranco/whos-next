import { Module } from '@nestjs/common';
import { IntakeQuestionController } from './intake-question.controller';
import { IntakeQuestionService } from './intake-question.service';

@Module({
  controllers: [IntakeQuestionController],
  providers: [IntakeQuestionService],
  exports: [IntakeQuestionService],
})
export class IntakeQuestionModule {}
