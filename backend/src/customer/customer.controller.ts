import { MerchantAccess } from '../auth/merchant-access.guard';
import { Controller, Get, Post, Patch, Query, Param, Body } from '@nestjs/common';
import { CustomerService } from './customer.service';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @MerchantAccess('merchant', 'query', 'merchantId')
  findAll(@Query('merchantId') merchantId: string) {
    return this.customerService.findByMerchant(merchantId);
  }

  @Get(':id')
  @MerchantAccess('customer', 'params', 'id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Post()
  @MerchantAccess('merchant', 'body', 'merchantId')
  create(@Body() body: {
    merchantId: string;
    name: string;
    email?: string;
    phone?: string;
  }) {
    return this.customerService.create(body);
  }

  @Patch(':id')
  @MerchantAccess('customer', 'params', 'id')
  update(@Param('id') id: string, @Body() body: {
    name?: string;
    email?: string;
    phone?: string;
  }) {
    return this.customerService.update(id, body);
  }
}
