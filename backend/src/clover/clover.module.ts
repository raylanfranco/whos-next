import { Module } from '@nestjs/common';
import { CloverController } from './clover.controller';
import { CloverService } from './clover.service';

@Module({
  controllers: [CloverController],
  providers: [CloverService],
  exports: [CloverService],
})
export class CloverModule {}
