import { Global, Module } from '@nestjs/common';
import { MerchantAccessGuard } from './merchant-access.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, MerchantAccessGuard],
  exports: [AuthService, MerchantAccessGuard],
})
export class AuthModule {}
