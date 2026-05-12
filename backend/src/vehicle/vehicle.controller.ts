import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import type { VehicleType } from '@prisma/client';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  findAll(@Query('customerId') customerId: string) {
    return this.vehicleService.findByCustomer(customerId);
  }

  @Post()
  create(@Body() body: {
    customerId: string;
    type?: VehicleType;
    year?: number;
    make?: string;
    model?: string;
    trim?: string;
    notes?: string;
    photos?: string[];
  }) {
    return this.vehicleService.create(body);
  }
}
