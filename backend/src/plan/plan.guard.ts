import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Custom decorator key for plan requirements.
 * Usage: @SetMetadata('requiredPlan', 'PRO')
 */
export const REQUIRED_PLAN_KEY = 'requiredPlan';

/**
 * Guard that checks if the authenticated merchant's plan meets
 * the minimum requirement set via @SetMetadata('requiredPlan', 'PRO').
 *
 * Must be used AFTER AuthGuard (which attaches `request.merchant`).
 */
@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlan = this.reflector.get<string>(
      REQUIRED_PLAN_KEY,
      context.getHandler(),
    );

    // No plan requirement on this endpoint — allow
    if (!requiredPlan) return true;

    const request = context.switchToHttp().getRequest();
    const merchant = request.merchant;

    if (!merchant) {
      throw new UnauthorizedException('Authentication required');
    }

    const plan = merchant.plan;

    // GRANDFATHERED and PRO can access everything
    if (plan === 'GRANDFATHERED' || plan === 'PRO') return true;

    // FREE can only access FREE-tier endpoints
    if (plan === 'FREE' && requiredPlan === 'FREE') return true;

    throw new ForbiddenException(
      'Upgrade to Pro to access this feature',
    );
  }
}
