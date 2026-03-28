export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'WAITING_ON_PARTS'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type PartStatus = 'NEEDED' | 'ORDERED' | 'RECEIVED';

export type QuestionType = 'RADIO' | 'CHECKBOX' | 'TEXT' | 'SELECT' | 'TINT_ZONE';

export interface IntakeQuestion {
  id: string;
  serviceId: string;
  question: string;
  type: QuestionType;
  options: string[] | null;
  required: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Merchant {
  id: string;
  cloverMerchantId?: string | null;
  email?: string | null;
  name: string;
  timezone: string;
  shopHours: Record<string, { open: string; close: string }> | null;
  settings: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  services?: Service[];
  availabilityRules?: AvailabilityRule[];
  blockedDates?: BlockedDate[];
}

export interface Service {
  id: string;
  merchantId: string;
  cloverItemId: string | null;
  name: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  durationMins: number;
  priceCents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  intakeQuestions?: IntakeQuestion[];
}

export interface Customer {
  id: string;
  merchantId: string;
  cloverCustomerId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  vehicles?: Vehicle[];
  bookings?: Booking[];
  _count?: { vehicles: number; bookings: number };
}

export interface Vehicle {
  id: string;
  customerId: string;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingPart {
  id: string;
  bookingId: string;
  partName: string;
  partNumber: string | null;
  status: PartStatus;
  notes: string | null;
  orderedAt: string | null;
  receivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  merchantId: string;
  serviceId: string;
  customerId: string;
  vehicleId: string | null;
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  isWalkIn: boolean;
  cloverOrderId: string | null;
  intakeData: Record<string, unknown> | null;
  notes: string | null;
  depositAmountCents: number | null;
  depositPaidAt: string | null;
  cloverChargeId: string | null;
  createdAt: string;
  updatedAt: string;
  service?: Service;
  customer?: Customer;
  vehicle?: Vehicle | null;
  parts?: BookingPart[];
}

export interface BookingStats {
  revenueBookedCents: number;
  revenueCompletedCents: number;
  bookingsTotal: number;
  bookingsCompleted: number;
  bookingsCancelled: number;
  bookingsNoShow: number;
  completionRate: number;
  walkInCount: number;
  walkInRatio: number;
}

export interface AvailabilityRule {
  id: string;
  merchantId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isBlocked: boolean;
}

export interface BlockedDate {
  id: string;
  merchantId: string;
  date: string;
  reason: string | null;
}
