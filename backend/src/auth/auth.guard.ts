import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpCtx = context.switchToHttp();
    const request = httpCtx.getRequest();
    const response = httpCtx.getResponse();
    const authHeader = request.headers['authorization'] as string | undefined;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(7);
    const { merchant, payload } = await this.authService.validateToken(token);

    // Attach merchant to request for downstream use
    request.merchant = merchant;

    // Slide the session forward: if the token is old but still valid, hand back
    // a fresh one via a response header. The frontend swaps it into storage so
    // an active user never has to log in again.
    const refreshed = this.authService.maybeRefreshToken(payload);
    if (refreshed) {
      response.setHeader('X-Refreshed-Token', refreshed);
    }

    return true;
  }
}
