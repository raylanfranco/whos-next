import { Controller, Get, Post, Patch, Delete, Query, Param, Body } from '@nestjs/common';
import { ServiceService } from './service.service';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  findAll(
    @Query('merchantId') merchantId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.serviceService.findByMerchant(merchantId, activeOnly === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

  @Post()
  create(@Body() body: {
    merchantId: string;
    name: string;
    description?: string;
    category?: string;
    imageUrl?: string;
    durationMins: number;
    priceCents: number;
  }) {
    return this.serviceService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: {
    name?: string;
    description?: string;
    category?: string;
    imageUrl?: string;
    durationMins?: number;
    priceCents?: number;
    isActive?: boolean;
  }) {
    return this.serviceService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceService.remove(id);
  }
}
