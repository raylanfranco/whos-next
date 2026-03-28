import { Controller, Post, Get, Body, Req, UseGuards, BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; businessName: string },
  ) {
    if (!body.email || !body.password || !body.businessName) {
      throw new BadRequestException('email, password, and businessName are required');
    }

    return this.authService.register(body.email, body.password, body.businessName);
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
  ) {
    if (!body.email || !body.password) {
      throw new BadRequestException('email and password are required');
    }

    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: Request) {
    // AuthGuard attaches merchant to the request
    return (req as any).merchant;
  }
}
