import { Module } from '@nestjs/common';
import { FitmentController } from './fitment.controller';
import { FitmentService } from './fitment.service';

@Module({
  controllers: [FitmentController],
  providers: [FitmentService],
  exports: [FitmentService],
})
export class FitmentModule {}
