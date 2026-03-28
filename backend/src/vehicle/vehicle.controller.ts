import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { VehicleService } from './vehicle.service';

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
    year?: number;
    make?: string;
    model?: string;
    trim?: string;
    notes?: string;
  }) {
    return this.vehicleService.create(body);
  }
}
