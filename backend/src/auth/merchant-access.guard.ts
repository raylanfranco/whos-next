import { applyDecorators, BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { timingSafeEqual } from 'node:crypto';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

type Resource = 'merchant' | 'booking' | 'customer' | 'service' | 'bookingPart' | 'intakeQuestion' | 'blockedDate';
type Scope = { resource: Resource; source: 'params' | 'query' | 'body'; key: string; many?: boolean };
const SCOPE = 'merchant-access-scope';

export function MerchantAccess(resource: Resource, source: Scope['source'], key: string, many = false) {
  return applyDecorators(SetMetadata(SCOPE, { resource, source, key, many }), UseGuards(MerchantAccessGuard));
}

@Injectable()
export class MerchantAccessGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly prisma: PrismaService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let merchantId: string;
    const bridge = request.headers['x-nla-service-key'];
    if (bridge !== undefined) {
      const expected = process.env.NLA_SERVICE_KEY;
      const configuredMerchant = process.env.NLA_MERCHANT_ID;
      if (typeof bridge !== 'string' || !expected || expected.length < 32 || !configuredMerchant ||
          Buffer.byteLength(bridge) !== Buffer.byteLength(expected) ||
          !timingSafeEqual(Buffer.from(bridge), Buffer.from(expected))) {
        throw new UnauthorizedException('Invalid service credentials');
      }
      merchantId = configuredMerchant;
      request.merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId }, select: { id: true, plan: true } });
      if (!request.merchant) throw new UnauthorizedException('Merchant unavailable');
    } else {
      const header = request.headers.authorization;
      if (typeof header !== 'string' || !header.startsWith('Bearer ')) throw new UnauthorizedException();
      const { merchant, payload } = await this.auth.validateToken(header.slice(7));
      merchantId = merchant.id;
      request.merchant = merchant;
      const refreshed = this.auth.maybeRefreshToken(payload);
      if (refreshed) context.switchToHttp().getResponse().setHeader('X-Refreshed-Token', refreshed);
    }

    const scope = this.reflector.get<Scope>(SCOPE, context.getHandler());
    if (!scope) throw new ForbiddenException('Missing resource scope');
    // Inline TypeScript DTOs do not remove extra JSON keys at runtime. Reject
    // relation/ownership changes before forwarding bodies to Prisma services.
    if (request.method !== 'GET' && request.method !== 'DELETE') {
      const fields: Record<string, string[]> = {
        BookingController: ['status'],
        CustomerController: ['name', 'email', 'phone'],
        ServiceController: ['name', 'description', 'category', 'imageUrl', 'durationMins', 'priceCents', 'isActive'],
        VehicleController: ['type', 'year', 'make', 'model', 'trim', 'notes', 'photos'],
        BookingPartController: ['partName', 'partNumber', 'notes', 'status'],
        IntakeQuestionController: ['question', 'type', 'options', 'required', 'sortOrder'],
        MerchantController: ['name', 'timezone', 'shopHours', 'settings', 'accentColor', 'rules', 'date', 'reason'],
      };
      const allowed = fields[context.getClass().name] ?? [];
      if (!request.body || Array.isArray(request.body) || Object.keys(request.body).some(key => !allowed.includes(key) && !(scope.source === 'body' && scope.key === key))) {
        throw new BadRequestException('Unexpected request fields');
      }
    }
    const value: unknown = request[scope.source]?.[scope.key];
    const ids = scope.many ? value : [value];
    if (!Array.isArray(ids) || ids.length === 0 || ids.length > 100 || ids.some(id => typeof id !== 'string' || !id.trim())) {
      throw new BadRequestException(`${scope.key} is required`);
    }
    for (const id of ids as string[]) {
      if (!await this.owns(scope.resource, id, merchantId)) throw new ForbiddenException('Resource unavailable');
    }
    return true;
  }

  private async owns(resource: Resource, id: string, merchantId: string): Promise<boolean> {
    switch (resource) {
      case 'merchant': return id === merchantId;
      case 'booking': return !!await this.prisma.booking.findFirst({ where: { id, merchantId }, select: { id: true } });
      case 'customer': return !!await this.prisma.customer.findFirst({ where: { id, merchantId }, select: { id: true } });
      case 'service': return !!await this.prisma.service.findFirst({ where: { id, merchantId }, select: { id: true } });
      case 'blockedDate': return !!await this.prisma.blockedDate.findFirst({ where: { id, merchantId }, select: { id: true } });
      case 'bookingPart': return !!await this.prisma.bookingPart.findFirst({ where: { id, booking: { merchantId } }, select: { id: true } });
      case 'intakeQuestion': return !!await this.prisma.intakeQuestion.findFirst({ where: { id, service: { merchantId } }, select: { id: true } });
    }
  }
}
