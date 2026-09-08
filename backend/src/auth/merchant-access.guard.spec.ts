import 'reflect-metadata';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { MerchantAccessGuard } from './merchant-access.guard';
import { BookingController } from '../booking/booking.controller';
import { BookingService } from '../booking/booking.service';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('booking management authorization', () => {
  const auth = { validateToken: jest.fn(), maybeRefreshToken: jest.fn() };
  const prisma = { booking: { findFirst: jest.fn() }, merchant: { findUnique: jest.fn() } };
  const guard = new MerchantAccessGuard(auth as unknown as AuthService, prisma as unknown as PrismaService, new Reflector());
  const controller = new BookingController({} as BookingService);
  function context(method: keyof BookingController, request: Record<string, unknown>) {
    return { getHandler: () => controller[method], getClass: () => BookingController,
      switchToHttp: () => ({ getRequest: () => request, getResponse: () => ({ setHeader: jest.fn() }) }) } as unknown as ExecutionContext;
  }
  beforeEach(() => { jest.resetAllMocks(); delete process.env.NLA_SERVICE_KEY; delete process.env.NLA_MERCHANT_ID;
    auth.validateToken.mockResolvedValue({ merchant: { id: 'owner' }, payload: {} }); });
  it('rejects unauthenticated list requests', async () => {
    await expect(guard.canActivate(context('findAll', { headers: {}, query: { merchantId: 'owner' }, method: 'GET' }))).rejects.toThrow();
    expect(prisma.booking.findFirst).not.toHaveBeenCalled();
  });
  it('accepts the authenticated merchant and rejects another merchant list', async () => {
    const req = { headers: { authorization: 'Bearer valid' }, query: { merchantId: 'owner' }, method: 'GET' };
    await expect(guard.canActivate(context('findAll', req))).resolves.toBe(true);
    await expect(guard.canActivate(context('findAll', { ...req, query: { merchantId: 'other' } }))).rejects.toThrow('Resource unavailable');
  });
  it('rejects missing merchant scope rather than listing all merchants', async () => {
    await expect(guard.canActivate(context('findAll', { headers: { authorization: 'Bearer valid' }, query: {}, method: 'GET' }))).rejects.toThrow('merchantId is required');
  });
  it('scopes status changes and deletion by both booking and merchant', async () => {
    prisma.booking.findFirst.mockResolvedValue(null);
    for (const method of ['updateStatus', 'remove'] as const) {
      await expect(guard.canActivate(context(method, { headers: { authorization: 'Bearer valid' }, params: { id: 'foreign-booking' }, body: { status: 'CANCELLED' }, method: method === 'remove' ? 'DELETE' : 'PATCH' }))).rejects.toThrow();
    }
    expect(prisma.booking.findFirst).toHaveBeenCalledWith({ where: { id: 'foreign-booking', merchantId: 'owner' }, select: { id: true } });
  });
  it('accepts a configured bridge key only for its assigned merchant', async () => {
    process.env.NLA_SERVICE_KEY = 'test-only-key-'.repeat(4); process.env.NLA_MERCHANT_ID = 'owner';
    prisma.merchant.findUnique.mockResolvedValue({ id: 'owner', plan: 'GRANDFATHERED' });
    const req = { headers: { 'x-nla-service-key': process.env.NLA_SERVICE_KEY }, query: { merchantId: 'owner' }, method: 'GET' };
    await expect(guard.canActivate(context('findAll', req))).resolves.toBe(true);
    await expect(guard.canActivate(context('findAll', { ...req, query: { merchantId: 'other' } }))).rejects.toThrow();
    await expect(guard.canActivate(context('findAll', { ...req, headers: { 'x-nla-service-key': 'wrong' } }))).rejects.toThrow();
  });
  it('rejects attempts to reassign ownership through additional JSON fields', async () => {
    await expect(guard.canActivate(context('updateStatus', { headers: { authorization: 'Bearer valid' }, params: { id: 'booking' }, body: { status: 'CANCELLED', merchantId: 'other' }, method: 'PATCH' }))).rejects.toThrow('Unexpected request fields');
  });
  it('keeps public creation and availability outside management authentication', () => {
    expect(Reflect.getMetadata('__guards__', controller.create)).toBeUndefined();
    expect(Reflect.getMetadata('__guards__', controller.getAvailableSlots)).toBeUndefined();
  });
});
