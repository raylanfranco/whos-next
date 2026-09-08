# Booking foundation

Management of bookings, customers, vehicles, services, intake questions, parts and merchant settings now checks authentication and merchant ownership. Missing merchant IDs fail closed. Unknown mutation fields are rejected to prevent relation/ownership reassignment through inline TypeScript DTOs. Existing intake plan checks are retained.

Public booking creation, available slots, service/intake reads and merchant information retain their existing public access. The public booking creation response is limited to reservation ID, status and timestamps; it no longer returns an existing customer's contact record. This is a focused management-boundary change, not a full public endpoint security audit.

NLA's server proxy authenticates with `X-NLA-Service-Key`. Configure a random `NLA_SERVICE_KEY` of at least 32 characters plus the fixed `NLA_MERCHANT_ID`. NLA stores the same key as `WHOS_NEXT_SERVICE_KEY`. A key cannot select another merchant. Do not put this key in frontend environment variables. Existing Who's Next dashboard clients continue using their merchant JWT.

Deploy together with NLA's `fix/booking-foundation` changes; the old unauthenticated NLA proxy will be rejected by this backend. NLA's status select now uses the `allowedStatuses` returned by the booking list instead of duplicating the state machine.

Verification: `npm ci`, `npm run build:backend`, `npm test --workspace backend -- --runInBand`. Tests use fake persistence/auth and do not touch a live database or payment processor.

Slot reservation/payment reconciliation, concurrency-safe scheduling, backend merchant timezone handling, public DTO validation and the unified admin UI remain separate follow-up work. The existing Prisma secret omission remains unchanged.
