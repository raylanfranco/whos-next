# Changelog

All notable changes to Who's Next? are documented here.

## [1.1.0] — 2026-03-28

### Added

**Design System (Phase 2)**
- Dark amber theme: `#0D0B0A` background, `#FFB347` accent, glass panels with backdrop-blur
- Space Grotesk (UI) + JetBrains Mono (mono) typography
- Full CSS design system: glass panels, premium cards, status colors, tech brackets, scanlines, ambient glow, skeleton loaders
- All dashboard pages restyled to dark theme

**Dashboard Pages (Phase 3)**
- BookingsPage: dark toggle pills, dark tables, status color classes, dark slide-out detail panel
- BookingBlock: semi-transparent status-colored blocks on dark background
- CalendarGrid: dark grid lines, amber today indicator, amber current-time line
- RevenueSidebar: glass panel with mono stat labels
- ServicesPage: dark table with service-row hover, glass modals, intake question management
- CustomersPage: dark table, glass detail view with booking history
- SettingsPage: glass cards with tech-bracket corners, dark info boxes, amber range slider
- PushPrompt: glass-panel-amber notification card

**Plan Enforcement (Phase 4)**
- Backend: PlanGuard (NestJS guard with `@SetMetadata`), PlanService (service/booking limits)
- Backend: BillingModule — `POST /billing/create-checkout` (Stripe Checkout for $39/mo Pro), `POST /billing/webhook` (subscription lifecycle)
- PRO-gated endpoints: push subscribe, Stripe Connect, intake questions
- Frontend: PlanGate component wraps features behind plan check
- Frontend: UpgradePrompt with "$39/month" CTA redirecting to Stripe Checkout
- "Powered by Who's Next?" footer hidden for PRO/GRANDFATHERED merchants
- FREE plan limits: 2 active services, 50 bookings/month

**Tattoo Vertical (Phase 5)**
- DesignIntake: style picker (11 styles), size estimate, new/cover-up type, color preference, description, reference photo upload, skin notes
- BodyMapPicker: interactive SVG body outline with 19 clickable zones + text input fallback
- ArtistSelector: grid of artist cards from merchant settings
- TattooIntakeSchema: constants, types, validation
- BODY_MAP and PHOTO_UPLOAD question types in DynamicIntakeForm
- BookingPage: tattoo "Design" step in booking wizard for TATTOO vertical merchants
- Organized `adapters/` directory structure (automotive, tattoo)

**Capacitor / iOS (Phase 6)**
- Capacitor 8 installed: core, CLI, iOS, push-notifications, haptics, status-bar
- `capacitor.config.ts`: app ID `com.victoryrush.whosnext`, dark status bar
- PlatformContext: React context for `isNative` / `platform` detection
- `capacitor-push.ts`: native APNS/FCM registration + notification listeners
- PushPrompt: dual-path — native push for Capacitor, web push for PWA
- Backend: `POST /push/subscribe-native` endpoint for device token storage
- `manifest.json` theme_color updated to `#0D0B0A`

**Deploy (Phase 7-8)**
- Prisma migration: `20260328_add_plan_vertical_adapters`
- `.env.example` with all environment variables documented
- `DEPLOY.md` — full deploy runbook + client migration SQL + App Store checklist

### Changed
- Vertical detection uses `merchant.vertical` field (not `settings.vertical`)
- Status colors use CSS classes from design system (not inline Tailwind)
- MerchantContext now includes `plan` and `vertical` fields

### Fixed
- LandingPage: unescaped apostrophes in single-quoted strings
- push.service.ts: smart quote in test notification title

## [1.0.0] — 2026-03-26

### Added
- Initial scaffold forked from BayReady Core
- String replacements: BayReady → Who's Next?
- Package renamed to `@victory-rush/whos-next-core`
