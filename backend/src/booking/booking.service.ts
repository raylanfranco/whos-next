import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomerService } from '../customer/customer.service';
import { VehicleService } from '../vehicle/vehicle.service';
import { NotificationService } from '../notification/notification.service';
import { PushService } from '../push/push.service';
import { EmailService } from '../notification/email.service';
import type { BookingStatus } from '@prisma/client';

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CHECKED_IN', 'CANCELLED', 'NO_SHOW'],
  CHECKED_IN: ['IN_PROGRESS', 'WAITING_ON_PARTS', 'CANCELLED', 'NO_SHOW'],
  WAITING_ON_PARTS: ['CHECKED_IN'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

const BOOKING_INCLUDE = {
  service: true,
  customer: true,
  vehicle: true,
  parts: true,
} as const;

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customerService: CustomerService,
    private readonly vehicleService: VehicleService,
    private readonly notificationService: NotificationService,
    private readonly pushService: PushService,
    private readonly emailService: EmailService,
  ) {}

  async findByMerchant(merchantId: string, filters?: {
    status?: BookingStatus;
    from?: string;
    to?: string;
  }) {
    return this.prisma.booking.findMany({
      where: {
        merchantId,
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.from || filters?.to
          ? {
              startsAt: {
                ...(filters.from ? { gte: new Date(filters.from) } : {}),
                ...(filters.to ? { lte: new Date(filters.to) } : {}),
              },
            }
          : {}),
      },
      include: BOOKING_INCLUDE,
      orderBy: { startsAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: BOOKING_INCLUDE,
    });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    return booking;
  }

  async create(data: {
    merchantId: string;
    serviceId: string;
    date: string;       // "2026-02-15"
    time: string;       // "10:00"
    customer: { name: string; email?: string; phone?: string };
    vehicle?: { year?: number; make?: string; model?: string; trim?: string };
    intakeData?: Record<string, unknown>;
    notes?: string;
    depositAmountCents?: number;
    cloverChargeId?: string;
    isWalkIn?: boolean;
  }) {
    // Get service to know duration
    const service = await this.prisma.service.findUnique({ where: { id: data.serviceId } });
    if (!service) throw new NotFoundException(`Service ${data.serviceId} not found`);

    // Find or create customer
    const customer = await this.customerService.findOrCreate(data.merchantId, data.customer);

    // Create vehicle if provided
    let vehicleId: string | undefined;
    if (data.vehicle && (data.vehicle.make || data.vehicle.model)) {
      const vehicle = await this.vehicleService.create({
        customerId: customer.id,
        ...data.vehicle,
      });
      vehicleId = vehicle.id;
    }

    // Calculate start/end times
    const startsAt = new Date(`${data.date}T${data.time}:00`);
    const endsAt = new Date(startsAt.getTime() + service.durationMins * 60 * 1000);

    // Check for overlapping bookings
    const overlap = await this.prisma.booking.findFirst({
      where: {
        merchantId: data.merchantId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        OR: [
          { startsAt: { lt: endsAt }, endsAt: { gt: startsAt } },
        ],
      },
    });
    if (overlap) {
      throw new BadRequestException('This time slot overlaps with an existing booking');
    }

    const booking = await this.prisma.booking.create({
      data: {
        merchantId: data.merchantId,
        serviceId: data.serviceId,
        customerId: customer.id,
        vehicleId,
        startsAt,
        endsAt,
        isWalkIn: data.isWalkIn ?? false,
        intakeData: data.intakeData ? (data.intakeData as Record<string, string | string[]>) : undefined,
        notes: data.notes,
        depositAmountCents: data.depositAmountCents,
        cloverChargeId: data.cloverChargeId,
        depositPaidAt: data.cloverChargeId ? new Date() : undefined,
      },
      include: BOOKING_INCLUDE,
    });

    // Fire-and-forget push notification to merchant
    this.pushService.sendToMerchant(data.merchantId, {
      title: 'New Booking',
      body: `${customer.name} booked ${service.name} for ${data.date} at ${data.time}`,
      url: '/dashboard/bookings',
    }).catch(() => {});

    // Fire-and-forget booking confirmation email to customer
    if (customer.email) {
      const merchant = await this.prisma.merchant.findUnique({ where: { id: data.merchantId } });
      this.emailService.sendBookingConfirmation({
        customerEmail: customer.email,
        customerName: customer.name,
        serviceName: service.name,
        date: data.date,
        time: data.time,
        merchantName: merchant?.name || 'Your Shop',
        merchantEmail: merchant?.email || undefined,
      }).catch(() => {});
    }

    return booking;
  }

  async updateStatus(id: string, status: BookingStatus) {
    const booking = await this.findOne(id);

    const allowed = VALID_TRANSITIONS[booking.status];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Cannot transition from ${booking.status} to ${status}`,
      );
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status },
      include: BOOKING_INCLUDE,
    });

    // Fire-and-forget SMS notification
    this.notificationService.onStatusChange(id, status).catch(() => {});

    // Fire-and-forget push notification to merchant
    this.pushService.sendToMerchant(updated.merchantId, {
      title: `Booking ${status.toLowerCase().replace(/_/g, ' ')}`,
      body: `${updated.customer.name} — ${updated.service.name}`,
      url: '/dashboard/bookings',
    }).catch(() => {});

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.booking.delete({ where: { id } });
  }

  /**
   * Compute weekly/daily stats for the revenue sidebar.
   */
  async getStats(merchantId: string, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const bookings = await this.prisma.booking.findMany({
      where: {
        merchantId,
        startsAt: { gte: fromDate, lte: toDate },
      },
      include: { service: true },
    });

    const nonCancelled = bookings.filter(
      (b) => b.status !== 'CANCELLED' && b.status !== 'NO_SHOW',
    );
    const completed = bookings.filter((b) => b.status === 'COMPLETED');
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED');
    const noShow = bookings.filter((b) => b.status === 'NO_SHOW');
    const walkIns = nonCancelled.filter((b) => b.isWalkIn);

    const revenueBookedCents = nonCancelled.reduce(
      (sum, b) => sum + (b.service?.priceCents ?? 0),
      0,
    );
    const revenueCompletedCents = completed.reduce(
      (sum, b) => sum + (b.service?.priceCents ?? 0),
      0,
    );

    return {
      revenueBookedCents,
      revenueCompletedCents,
      bookingsTotal: bookings.length,
      bookingsCompleted: completed.length,
      bookingsCancelled: cancelled.length,
      bookingsNoShow: noShow.length,
      completionRate: nonCancelled.length > 0
        ? completed.length / nonCancelled.length
        : 0,
      walkInCount: walkIns.length,
      walkInRatio: nonCancelled.length > 0
        ? walkIns.length / nonCancelled.length
        : 0,
    };
  }

  /**
   * Compute available time slots for a given merchant, service, and date.
   * Returns array of "HH:MM" strings.
   */
  async getAvailableSlots(merchantId: string, serviceId: string, date: string): Promise<string[]> {
    // Get service duration
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new NotFoundException(`Service ${serviceId} not found`);

    // Get the day of week (0=Sunday)
    const dateObj = new Date(date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();

    // Check if this date is blocked
    const blocked = await this.prisma.blockedDate.findFirst({
      where: {
        merchantId,
        date: dateObj,
      },
    });
    if (blocked) return [];

    // Get availability rule for this day
    const rule = await this.prisma.availabilityRule.findUnique({
      where: { merchantId_dayOfWeek: { merchantId, dayOfWeek } },
    });
    if (!rule || rule.isBlocked) return [];

    // Parse start/end times
    const [startH, startM] = rule.startTime.split(':').map(Number);
    const [endH, endM] = rule.endTime.split(':').map(Number);
    const dayStart = startH * 60 + startM;
    const dayEnd = endH * 60 + endM;

    // Get existing bookings for this date
    const dayStartDate = new Date(date + 'T00:00:00');
    const dayEndDate = new Date(date + 'T23:59:59');
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        merchantId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        startsAt: { gte: dayStartDate, lte: dayEndDate },
      },
    });

    // Build occupied intervals (in minutes from midnight)
    const occupied = existingBookings.map((b) => ({
      start: b.startsAt.getHours() * 60 + b.startsAt.getMinutes(),
      end: b.endsAt.getHours() * 60 + b.endsAt.getMinutes(),
    }));

    // Generate 30-minute interval slots
    const slots: string[] = [];
    const slotInterval = 30;
    for (let t = dayStart; t + service.durationMins <= dayEnd; t += slotInterval) {
      const slotEnd = t + service.durationMins;
      const hasOverlap = occupied.some(
        (o) => t < o.end && slotEnd > o.start,
      );
      if (!hasOverlap) {
        const hh = String(Math.floor(t / 60)).padStart(2, '0');
        const mm = String(t % 60).padStart(2, '0');
        slots.push(`${hh}:${mm}`);
      }
    }

    return slots;
  }
}
