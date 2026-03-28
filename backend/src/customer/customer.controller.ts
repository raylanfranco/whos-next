import { Controller, Get, Post, Patch, Query, Param, Body } from '@nestjs/common';
import { CustomerService } from './customer.service';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  findAll(@Query('merchantId') merchantId: string) {
    return this.customerService.findByMerchant(merchantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Post()
  create(@Body() body: {
    merchantId: string;
    name: string;
    email?: string;
    phone?: string;
  }) {
    return this.customerService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: {
    name?: string;
    email?: string;
    phone?: string;
  }) {
    return this.customerService.update(id, body);
  }
}
