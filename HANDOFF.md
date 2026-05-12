# Handoff — BDCC Powersports Vertical Launch

**From:** Claude Code session in `~/Desktop/bad-decisions` (2026-05-12)
**To:** Next Claude Code session opened in `~/Desktop/whos-next`

This is a context bridge between two sessions. The bad-decisions session's
chat/memory is path-keyed and won't auto-load here, so this doc captures the
state of the world, what's still TODO, and the surprises worth knowing.

---

## TL;DR

We stood up `MerchantVertical.POWERSPORTS` end-to-end for Bad Decisions Custom
Cycles & Boats (Billy / BDCCB). The booking flow loads inside an iframe on
baddecisionscustoms.com and reaches the new BookingPage on
`whos-next-frontend.vercel.app`. **Two things left:**

1. **Seed BDCC services** for Billy's existing merchant (he registered via UI;
   his merchant has no services yet — see *Pending #1* below).
2. **UI revamp** of the BookingPage to match the Variant designs Ray has.

---

## Live system state

| Surface | URL / ID |
|---|---|
| Bad Decisions main site | `https://bad-decisions.vercel.app` (Vercel) |
| Who's Next? frontend | `https://whos-next-frontend.vercel.app` (Vercel) |
| Who's Next? backend | `https://whos-next-production.up.railway.app` (Railway) |
| BDCC merchant ID | `cmp31v2fr000001qti6qhla6w` |
| BDCC vertical | `POWERSPORTS` |
| BDCC booking URL | `https://whos-next-frontend.vercel.app/book/cmp31v2fr000001qti6qhla6w` |
| Env var on bad-decisions | `NEXT_PUBLIC_BAYREADY_BOOKING_URL` → booking URL above |

Billy's auth credentials: he registered through the new RegisterPage UI, so
**Ray knows his email and password**, not this doc. Ray will tell you if you
need them.

---

## What shipped (commits)

### whos-next (this repo)

```
bd67457 Allow seeding BDCC services against an existing merchant
0d295fd Add vertical picker to merchant registration
be52dc6 Add POWERSPORTS vertical adapter + Vercel Blob photo uploads (BDCC)
b84c4f6 Add POWERSPORTS vertical + VehicleType enum
```

Plus 12 dashboard-UI commits Ray pushed from his home machine earlier in the
session (Settings/Customers/Bookings page rewrites, iOS safe-area fixes).

### bad-decisions

```
c4108eb feat(booking): wire BayReady/whos-next booking modal globally
77e8f54 chore: scrap stale bayready/ dist (extracted to bayready-core)
1445d18 fix(hero): remove duplicate SSR placeholder causing double headings
```

---

## Architecture decisions (worth knowing before you touch anything)

### 1. `bayready-core` is OFF-LIMITS

Per `VR-PLATFORM.md` (Ray has it locally; in `~/Desktop/whos-next/VR-PLATFORM.md`
and `~/Desktop/bad-decisions/VR-PLATFORM.md`, gitignored from both):

> **Do NOT modify the live `bayready-core` deployment on Railway.**
> Ben (NLA) and Billy (BDCCB) depend on it.

`bayready-core` is the legacy live system. `whos-next` is the replacement
being built in parallel. Despite the warning, **Billy is now on whos-next**
(not bayready-core) — Ray cut him over fresh rather than migrating data.

If a future agent suggests touching bayready-core: stop and ask Ray.

### 2. Powersports lives as an adapter, not core

Per the platform doc's vertical-adapter pattern:

```
frontend/src/adapters/powersports/
  VehicleSelector.tsx   ← type-first picker (motorcycle/boat/ATV/UTV/snowmobile/other)
                          + freeform year/make/model/trim
```

Core (`BookingPage.tsx`) branches by `merchant.vertical`. Don't put
vertical-specific logic in core unless you're generalising across verticals.

### 3. Photos use Vercel Blob (not S3, not the placeholder)

`backend/src/uploads/uploads.controller.ts` — public `POST /uploads/blob-token`
using `@vercel/blob`'s `handleUpload`. Path-prefix gated (`booking-intake/`),
image-only content type allowlist, 15MB cap.

`frontend/src/components/DynamicIntakeForm.tsx` — `PHOTO_UPLOAD` question type
now actually uploads via `@vercel/blob/client.upload()` and stores blob URLs.
Previously it was a stub that only stored filenames.

`BLOB_READ_WRITE_TOKEN` is set on **Railway** (the backend reads it). It's
also injected into the whos-next-frontend Vercel project by the Blob
integration but isn't used there — the frontend calls the backend.

### 4. Deposits are off for BDCC (intentional)

`merchant.settings.depositPercent: 0` — consult-and-quote model, no upfront
payment step. Stripe Connect onboarding is irrelevant for BDCC until Billy
asks for deposits. The booking flow's `requiresDeposit` check sees 0 and
skips the payment step entirely.

### 5. `NEXT_PUBLIC_*` is build-time on Next.js

Ray hit this twice. If you change `NEXT_PUBLIC_BAYREADY_BOOKING_URL` on
bad-decisions, **trigger a redeploy**. Setting the env var alone doesn't
take effect.

### 6. Railway doesn't auto-run migrations

Bit Ray in the ass — bookings dashboard 500'd because the
`20260511_add_powersports_vehicle_type` migration hadn't run.

**Recommendation for future sessions**: edit Railway's start command to
`npx prisma migrate deploy && node dist/src/main` so migrations apply on
every deploy. Not yet done.

---

## Pending — start here

### 1. Seed BDCC services for Billy's existing merchant

He registered through the UI, which only creates the merchant row. The 6
services + intake questions + availability rules live in the seed script.

The seed now supports targeting an existing merchant via env var (commit
`bd67457`). Run:

```bash
cd ~/Desktop/whos-next/backend
DATABASE_URL="<railway-postgres-url>" \
  BDCC_MERCHANT_ID="cmp31v2fr000001qti6qhla6w" \
  npm run db:seed
```

Or via Railway CLI:
```bash
railway run --service whos-next-backend npm run db:seed
# (then set BDCC_MERCHANT_ID in the service's env vars before running)
```

After it succeeds, refresh the booking modal on bad-decisions — the 6 services
should appear on step 1.

### 2. BookingPage UI revamp (Variant designs)

Ray has Variant exports for the booking flow. The current state (per the
screenshot Ray showed at end of last session): functional but visually
unfinished, doesn't match the dashboard's dark-amber Variant design system.

The relevant file: `frontend/src/pages/BookingPage.tsx` (~1030 lines).
It already uses the design tokens (`var(--color-accent)`,
`premium-input`, `premium-card-static`, etc.) but the layout / typography /
visual treatment likely needs more love per the Variant comps.

Ray will paste the designs at the start of the next session. Don't speculate
on the design from this doc — wait for the comps.

### 3. (Optional) Wire Railway migrations into deploy

See *Architecture decision #6* above. One-line change to the start command.
Worth doing before the next schema migration.

---

## Things in flight that DIDN'T ship this session

- **Stripe Connect for BDCC** — deferred per Ray's decision. No deposit step.
- **Vehicle photos stored on `Vehicle.photos`** — the column exists but the
  booking flow stores photos in `Booking.intakeData[questionId]` instead.
  Could be reconciled later if there's a UX reason to attach photos to the
  vehicle record long-term.
- **Refactoring the dual `VehicleSelector.tsx` files** — there's one in
  `frontend/src/components/` (legacy) and one in
  `frontend/src/adapters/automotive/`. BookingPage imports the legacy one.
  Harmless but the adapter version should win once someone has the time.

---

## File map (where things live)

```
whos-next/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma                                   ← POWERSPORTS + VehicleType
│   │   ├── seed.ts                                         ← BDCC seed (supports BDCC_MERCHANT_ID)
│   │   └── migrations/20260511_add_powersports_vehicle_type/migration.sql
│   └── src/
│       ├── auth/                                           ← vertical picker hooked into /auth/register
│       ├── booking/booking.service.ts                      ← vehicle DTO includes type + photos
│       ├── uploads/                                        ← NEW: Vercel Blob route
│       │   ├── uploads.controller.ts                       ← POST /uploads/blob-token
│       │   └── uploads.module.ts
│       └── vehicle/                                        ← DTOs extended with type + photos
└── frontend/
    └── src/
        ├── adapters/powersports/                           ← NEW: vertical adapter
        │   └── VehicleSelector.tsx                         ← type picker + freeform fields
        ├── components/DynamicIntakeForm.tsx                ← PHOTO_UPLOAD now actually uploads
        ├── pages/
        │   ├── BookingPage.tsx                             ← branches on vertical, ~1030 lines
        │   └── RegisterPage.tsx                            ← vertical picker added
        └── types.ts                                        ← VehicleType + POWERSPORTS in union
```

---

## How to verify the booking flow end-to-end

After running the BDCC services seed (Pending #1):

1. Visit `https://bad-decisions.vercel.app` → click any "Book a Build" CTA.
2. Modal opens with the whos-next BookingPage iframe.
3. Step 1: 6 services appear (Custom Paint, Powder Coating, Metal Fabrication,
   Motorcycle Repair, Boat Work, Powersports Service).
4. Pick one → Step 2 shows the **powersports** vehicle picker (type chips first).
5. Step 3: per-service intake questions, including a `PHOTO_UPLOAD` field —
   upload a test image and confirm it lands at
   `blob.vercel-storage.com/booking-intake/.../...`.
6. Submit → confirmation appears in Billy's dashboard Bookings page.

If any step breaks, check Railway logs first
(`railway logs --service whos-next-backend`) — Prisma errors usually print
the underlying SQL issue.
