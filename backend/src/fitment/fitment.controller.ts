import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Body,
} from '@nestjs/common';
import { FitmentService } from './fitment.service';

@Controller('fitment')
export class FitmentController {
  constructor(private readonly fitmentService: FitmentService) {}

  // Public lookup — called by chatbot
  @Get()
  lookup(
    @Query('year') year: string,
    @Query('make') make: string,
    @Query('model') model: string,
    @Query('trim') trim?: string,
    @Query('category') category?: string,
  ) {
    return this.fitmentService.lookup(
      parseInt(year, 10),
      make,
      model,
      trim,
      category,
    );
  }

  // Admin — list entries with optional filters
  @Get('all')
  findAll(
    @Query('make') make?: string,
    @Query('category') category?: string,
  ) {
    return this.fitmentService.findAll({ make, category });
  }

  // Admin — create one entry
  @Post()
  create(
    @Body()
    body: {
      year: number;
      make: string;
      model: string;
      trim?: string;
      category: string;
      partNumber: string;
      partName: string;
      brand?: string;
      notes?: string;
    },
  ) {
    return this.fitmentService.create(body);
  }

  // Admin — bulk create entries
  @Post('bulk')
  bulkCreate(
    @Body()
    body: {
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
      }[];
    },
  ) {
    return this.fitmentService.bulkCreate(body.entries);
  }

  // Admin — delete entry
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fitmentService.remove(id);
  }
}
