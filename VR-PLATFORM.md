# VR-PLATFORM.md — Victory Rush Platform Documentation

This is the organizational source of truth for all Victory Rush client projects and internal products. It instructs Claude Code sessions on architecture, standards, workflows, and deployment across every Victory Rush build.

**Active projects:** Next Level Audio (NLA), Bad Decisions Custom Cycles & Boats (BDCCB), BayReady PWA (being renamed — see warning below), VictoryBot.

---

> ⚠️ **MIGRATION IN PROGRESS — READ BEFORE TOUCHING ANY BAYREADY CODE**
>
> BayReady is being renamed to **Who's Next?** (`getwhosnext.com`)
> A new repo (`whos-next`) is being built in parallel with the following changes:
> - Package names: `@victory-rush/bayready-*` → `@victory-rush/whos-next-*`
> - Branding: "Powered by BayReady" → "Powered by Who's Next?"
> - UI: Dark glassmorphic Variant design system (amber accent, JetBrains Mono)
> - Distribution: PWA + Capacitor (iOS App Store submission)
> - Pricing: Freemium $39/mo — Ben, Billy, Felipe grandfathered for life
>
> **Do NOT modify the live `bayready-core` deployment on Railway.**
> Ben (NLA) and Billy (BDCCB) depend on it.
> Live backend: `bayready-core-production.up.railway.app`
> Live frontend: `bayready-core.vercel.app`
>
> **Update this document AFTER:**
> 1. `whos-next` repo confirmed working end-to-end
> 2. Ben, Billy, and Felipe migrated to new deployment
> 3. Legacy BayReady instances decommissioned on Railway + Vercel
>
> Until then, all references to "BayReady" in this document
> describe the live system. "Who's Next?" describes the replacement.

---

## Table of Contents

1. [Victory Rush — Organization Overview](#1-victory-rush--organization-overview)
2. [Standards & Defaults](#2-standards--defaults)
3. [Repository Architecture](#3-repository-architecture)
4. [BayReady Core](#4-bayready-core)
5. [VictoryBot](#5-victorybot)
6. [Design Workflow — Variant → Claude Code](#6-design-workflow--variant--claude-code)
7. [Third-Party Integrations](#7-third-party-integrations)
8. [SEO & GEO Infrastructure](#8-seo--geo-infrastructure)
9. [i18n Standard](#9-i18n-standard)
10. [Client Onboarding Playbook](#10-client-onboarding-playbook)
11. [Victory Rush Pricing Framework](#11-victory-rush-pricing-framework)
12. [Whitelabel Guide](#12-whitelabel-guide)
13. [Gotchas & Lessons Learned](#13-gotchas--lessons-learned)
14. [Accessibility & ADA Compliance](#14-accessibility--ada-compliance)

---

## 1. Victory Rush — Organization Overview

### What Victory Rush Is

Victory Rush is a solo digital infrastructure studio founded by Ray Lanfranco. It builds recurring-revenue digital systems for local and small businesses — custom websites, booking platforms, AI chatbots, e-commerce integrations, and SEO/marketing retainers — delivered at a fraction of boutique agency cost because the stack is owned, the infrastructure is templatized, and one engineer with Claude Code ships what a four-person agency produces.

### Product Philosophy

Victory Rush sells recurring infrastructure, not one-time projects. Every client engagement is structured as a monthly retainer covering active management, hosting, security monitoring, SEO, and ongoing technical support. The setup deposit covers the build. The monthly retainer covers everything after.

### Tech Philosophy

- **Own the stack.** No platform dependency. No HighLevel reseller fees. No Squarespace lock-in.
- **Templatize everything.** The tenth client build is faster than the first because every decision is documented.
- **Claude Code as co-engineer.** This document is its operating context. Every session opens this file first.
- **Compound deliberately.** Every client, every build, every core improvement compounds.

### Active Client Roster

| Client | Business | Tier | MRR | Repo | Status |
|--------|----------|------|-----|------|--------|
| Ben | Next Level Audio | Growth (Friend) | $350 → $450 | `next-level-audio` | Active — rate correction pending |
| Billy | Bad Decisions Custom Cycles & Boats | Infrastructure (Friend) | $350 → $750 | `bad-decisions` | Active — rate correction at month 3 |
| Felipe | Who Am II Studio | Infrastructure (Friend) | $0 → $750 | `who-am-i-studio` | Warm — awaiting client readiness |
| Youssef | East Coast USA Distributors | Infrastructure (Market) | $0 → $1,100 | `ecusad` | Warm — prototype delivered |
| Oliver | TBD | Growth (Market) | $0 → $650 | TBD | Warm — scope clarification needed |

### Repository Map

```
github.com/raylanfranco/
├── bayready-core          ← @victory-rush/bayready-core (booking engine)
├── victorybot             ← @victory-rush/victorybot (AI chatbot widget)
├── next-level-audio       ← NLA client site (legacy monorepo)
├── bad-decisions          ← BDCCB client site
└── [client-slug]          ← Future client repos
```

---

## 2. Standards & Defaults

### Default Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 (`@theme inline` in globals.css — no tailwind.config.js) |
| Database | Supabase (PostgreSQL) for client site data |
| Email | Resend |
| Payments | Stripe (default) — Clover is NLA legacy only |
| Auth | Email/password + JWT — Clover OAuth is NLA legacy only |
| Deployment | Vercel (frontend), Railway (BayReady backend) |
| Booking | `@victory-rush/bayready-core` (PWA) |
| Chatbot | `@victory-rush/victorybot` |
| i18n | EN/ES LocaleProvider (client-side, localStorage) |

### Non-Negotiable Standards

- Stripe is the default payment processor — Clover payments are NLA-only legacy
- Email/password + JWT is the default auth
- i18n (EN/ES) is standard on every build — not an upsell
- WCAG 2.1 AA is the accessibility standard — not optional
- SEO infrastructure is built before launch — not added afterward
- Lighthouse 90+ on mobile before any site goes live

### Deployment Defaults

| Service | Platform |
|---------|----------|
| Client site | Vercel |
| BayReady backend | Railway (Procfile required, bind `0.0.0.0`) |
| BayReady frontend | Vercel (`vercel.json` SPA rewrites required) |
| Database | Railway PostgreSQL |

---

## 3. Repository Architecture

### Philosophy

Hub-and-spoke model. Core infrastructure lives in dedicated versioned repositories. Client repos are consumers — they install and configure core packages, they do not fork them.

### Package Registry

All private packages published to **GitHub Packages** under `@victory-rush` scope.

`.npmrc`:
```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT
@victory-rush:registry=https://npm.pkg.github.com
```

**Publishing:**
```bash
npm version patch|minor|major
npm publish
```

Every publish requires a version bump and CHANGELOG entry.

### Repository Map

```
github.com/raylanfranco/
├── bayready-core          ← @victory-rush/bayready-core
│   ├── backend/           ← NestJS booking engine
│   └── frontend/          ← React + Vite PWA shell
├── victorybot             ← @victory-rush/victorybot
├── next-level-audio       ← NLA (legacy local bayready/ fork — frozen)
├── bad-decisions          ← BDCCB (legacy local bayready/ fork — frozen)
└── [client-slug]          ← Future clients (consume packages only)
```

**Legacy note:** NLA and BDCCB local `bayready/` forks are frozen — bug fixes only. Migrate to `@victory-rush/bayready-core` when package is stable.

### `client.config.ts` — The Client Config Contract

```typescript
export const clientConfig = {
  name: 'Bad Decisions Customs',
  slug: 'bad-decisions',
  domain: 'baddecisionscustoms.com',
  locale: ['en', 'es'],
  brand: {
    primaryColor: '#c22820',
    fontHeading: 'Orbitron',
    fontBody: 'IBM Plex Mono',
    borderRadius: '0px',
  },
  nap: {
    name: 'Bad Decisions Custom Cycles and Boats',
    address: '354 N 9th St Suite 2',
    city: 'Stroudsburg',
    state: 'PA',
    zip: '18360',
    phone: '(570) 213-7442',
  },
  business: {
    phone: '570-213-7442',
    email: 'baddecisionscustomcycles@gmail.com',
    hours: { mon: '9am–6pm', sat: '10am–4pm', sun: 'Closed', /* ... */ },
    googleMapsUrl: 'https://maps.google.com/?q=354+N+9th+St+Stroudsburg+PA',
  },
  seo: {
    schemaType: 'AutoRepair',
    priceRange: '$$',
    areaServed: ['Stroudsburg', 'East Stroudsburg', 'Monroe County', 'PA'],
  },
  features: {
    booking: true, ecommerce: false, chatbot: true,
    i18n: true, blog: false, sms: false,
  },
  bayready: { merchantId: '', vertical: 'automotive', bookingUrl: '' },
  victorybot: {
    persona: 'direct',
    primaryColor: '#c22820',
    greeting: "Bad decisions welcome. What can we build for you?",
    services: [],
  },
  integrations: { dragSpecialties: false, clover: false },
}
```

**This file is the first thing Claude Code reads at the start of any client session.**

### Versioning

Client repos pin to minor version range (`^1.2.0`). Breaking changes (major bumps) require CHANGELOG with migration guide and all active clients updated within 30 days.

### When to Create a New Repo

| Situation | Action |
|-----------|--------|
| New Victory Rush client | New client repo `[client-slug]` |
| New booking vertical | New adapter `@victory-rush/bayready-[vertical]` |
| New reusable tool | New `@victory-rush` scoped package |
| Client-specific one-off | Lives in client repo only |
| Feature needed by 2+ clients | Promote to core |

---

## 4. BayReady Core

### Overview

Multi-tenant booking engine. Market-agnostic by design. No automotive assumptions, no Clover assumptions, no client business logic.

**Core handles:** merchant auth, services, customers, bookings, availability, time slots, push notifications, payments, PWA shell.

**Core does NOT handle:** vehicle selectors, NHTSA API, fitment data, artist assignment, design intake, client-specific logic.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS + Prisma v7 + PostgreSQL (Railway) |
| Frontend | React 18 + Vite PWA (Vercel) |
| Auth | JWT + bcrypt (email/password default) |
| Payments | Stripe (default) |
| Push | Web Push API + VAPID (`web-push` package) |
| Clover | Optional — opt-in connect pattern only |

### Core Data Models

```
Merchant
  - id (UUID), email, passwordHash, name, timezone, settings (JSON)
  - vertical (enum: AUTOMOTIVE | BEAUTY | TATTOO | GENERIC)
  - cloverMerchantId, cloverAccessToken, cloverRefreshToken (all optional)
  - stripeCustomerId, stripeAccountId (optional)
  → has many: Service, Customer, Booking, AvailabilityRule,
               BlockedDate, PushSubscription

Service
  - id, merchantId, name, category, durationMins, priceCents, depositCents
  - intakeSchema (JSON — vertical adapter injects field definitions)

Customer
  - id, merchantId, name, email, phone
  - unique per [merchantId, email]

Booking
  - id, merchantId, serviceId, customerId
  - startsAt, endsAt, status (enum: PENDING|CONFIRMED|COMPLETED|CANCELLED|NO_SHOW)
  - intakeData (JSON), depositCents, depositPaidAt, chargeId, notes

AvailabilityRule
  - merchantId, dayOfWeek (0–6), startTime, endTime, isBlocked
  - unique per [merchantId, dayOfWeek]

BlockedDate — merchantId, date, reason

PushSubscription
  - id, merchantId, endpoint, p256dh, auth, deviceLabel

AdapterRecord (vertical extension point)
  - id, bookingId?, customerId?
  - adapterType (enum), data (JSON)
  — Core never reads this. Adapters write/read it.
```

### Backend Module Structure

```
backend/src/
├── auth/          ← JWT, bcrypt, register/login/me
├── merchant/      ← CRUD, settings
├── service/       ← CRUD, intake schema
├── customer/      ← Find-or-create, CRUD
├── booking/       ← CRUD, slot calculation, overlap detection
├── availability/  ← Rules + blocked dates
├── payment/       ← Stripe PaymentIntent create + confirm
├── push/          ← Web Push subscribe, unsubscribe, send
├── clover/        ← OPTIONAL — not imported by default
├── adapter/       ← AdapterRecord CRUD
├── prisma/        ← PrismaService (Prisma v7 adapter pattern)
└── main.ts        ← import 'dotenv/config' MUST be first line
```

### Backend API Endpoints

**Auth:** POST `/auth/register` | POST `/auth/login` | GET `/auth/me`

**Merchants:** GET/PATCH `/merchants/:id`

**Services:** GET/POST `/merchants/:id/services` | PATCH/DELETE `/services/:id`

**Customers:** GET/POST `/merchants/:id/customers` | GET `/customers/:id`

**Bookings:** GET/POST `/merchants/:id/bookings` | PATCH `/bookings/:id/status` | GET `/merchants/:id/bookings/slots`

**Availability:** GET/PUT `/merchants/:id/availability` | GET/POST `/merchants/:id/blocked-dates` | DELETE `/blocked-dates/:id`

**Payments (Stripe):** POST `/payments/create-intent` | POST `/payments/confirm` | POST `/payments/webhook`

**Push:** POST `/push/subscribe` | DELETE `/push/subscribe` | POST `/push/test`

**Adapters:** POST/PATCH `/adapter-records` | GET `/adapter-records/:bookingId`

**Clover (opt-in):** GET `/clover/authorize` | GET `/clover/oauth/callback` | POST `/clover/charge`

### PWA Frontend Structure

```
frontend/src/
├── pages/
│   ├── LoginPage.tsx, RegisterPage.tsx
│   ├── BookingPage.tsx        ← Public 5-step wizard
│   └── dashboard/             ← Bookings, Services, Customers, Settings
├── components/
│   ├── CalendarGrid.tsx, BookingBlock.tsx, BookingDetail.tsx
│   ├── IntakeForm.tsx          ← Renders from service.intakeSchema
│   ├── StripeCardForm.tsx
│   └── PushPrompt.tsx         ← Must be triggered by user gesture
├── adapters/
│   ├── automotive/VehicleSelector.tsx
│   ├── beauty/ArtistSelector.tsx
│   └── tattoo/DesignIntake.tsx
└── contexts/AuthContext.tsx, MerchantContext.tsx
```

### Booking Wizard (5 Steps)

```
1. Service Selection → category → service (price + duration shown)
2. Date & Time → CalendarGrid → slot fetch from API
3. Intake → IntakeForm + vertical adapter component
4. Customer Info → find-or-create
5. Confirm + Deposit → StripeCardForm → POST booking → push fires
```

### Vertical Adapter Interface

```typescript
interface VerticalAdapter {
  type: 'automotive' | 'beauty' | 'tattoo' | 'generic'
  IntakeComponent: React.FC<{
    serviceId: string
    value: Record<string, unknown>
    onChange: (data: Record<string, unknown>) => void
  }>
  validateIntake: (data: Record<string, unknown>) => boolean
  serializeIntake: (data: Record<string, unknown>) => Record<string, unknown>
  DetailComponent: React.FC<{ adapterData: Record<string, unknown> }>
}
```

### Optional Clover Connect Pattern

```
Dashboard → Settings → "Connect to Clover"
  → GET /clover/authorize → OAuth flow
  → Tokens stored in Merchant record
  → "Clover Connected" badge — payment module can now use Clover
```

Additive, never required. NLA is the only current Clover-native merchant.

### Push Notification Implementation

```typescript
async sendToMerchant(merchantId: string, payload: { title: string; body: string; url?: string }) {
  const subscriptions = await this.prisma.pushSubscription.findMany({ where: { merchantId } })
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await this.prisma.pushSubscription.delete({ where: { id: sub.id } })
      }
    }
  }
}
```

**Trigger points:** new booking created, booking status updated, new VictoryBot lead.

### PWA Setup

**`public/manifest.json`:**
```json
{
  "name": "BayReady", "short_name": "BayReady",
  "start_url": "/dashboard", "display": "standalone",
  "background_color": "#0D0B0A", "theme_color": "#FFB347",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**iOS `index.html` additions:**
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="BayReady">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
```

**Installing:** iOS: Safari → Share → Add to Home Screen. Android: Chrome → Menu → Add to Home Screen.

### Environment Variables

```bash
# Backend (Railway)
DATABASE_URL=
JWT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_CONTACT=              # mailto:ray@victoryrush.dev
FRONTEND_URL=               # Comma-separated CORS origins
PORT=                       # Railway assigns automatically

# Optional Clover connect
CLOVER_APP_ID=
CLOVER_APP_SECRET=
CLOVER_API_BASE_URL=
CLOVER_ECOMM_PRIVATE_KEY=

# Frontend (Vercel)
VITE_API_URL=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_VAPID_PUBLIC_KEY=
```

### Deployment

```
Backend (Railway):
  Build: prisma generate && nest build
  Start: node dist/src/main (Procfile)
  main.ts: app.listen(PORT, '0.0.0.0')

Frontend (Vercel):
  vercel.json: { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }

First deploy sequence:
1. Deploy backend → get Railway URL
2. Set VITE_API_URL → deploy frontend → get Vercel URL
3. Set FRONTEND_URL in Railway (CORS)
4. Generate VAPID keys (npx web-push generate-vapid-keys) → set in both envs
5. Set Stripe keys in both envs
6. npx prisma migrate deploy (Railway shell)
7. Register first merchant via POST /auth/register
8. Test push via POST /push/test
```

---

## 5. VictoryBot

### Overview

Pluggable, whitelabelable AI chatbot widget. Drop into any client site with one import and one config object.

```tsx
import { VictoryBot } from '@victory-rush/victorybot'
import { clientConfig } from '@/client.config'
<VictoryBot config={clientConfig.victorybot} />
```

Communicates with two client-repo API routes: `/api/victorybot/chat` (AI proxy) and `/api/victorybot/lead` (lead capture). API key never reaches the browser.

### Config Object Spec

```typescript
interface VictoryBotConfig {
  businessName: string
  persona: 'friendly' | 'direct' | 'professional' | 'edgy'
  greeting: string
  avatarUrl?: string
  primaryColor: string
  fontFamily?: string
  borderRadius?: string
  business: {
    phone: string; email: string; address: string
    hours: Record<string, string>; googleMapsUrl: string
    services: VictoryBotService[]
  }
  screens: { welcome: boolean; quote: boolean; contact: boolean; map: boolean; chat: boolean }
  quoteFlow: {
    steps: QuoteStep[]
    submitLabel: string; successMessage: string; notifyEndpoint: string
  }
  ai: {
    endpoint: string          // '/api/victorybot/chat'
    model: string             // 'claude-sonnet-4-6' — always Sonnet 4, no exceptions
    maxTokens: number         // 500
    systemPromptAddendum?: string
  }
  booking?: { enabled: boolean; bookingUrl: string; ctaLabel: string }
}
```

### Screens

- **Welcome** — greeting + quick action buttons routing to enabled screens
- **Quote Wizard** — configurable multi-step form from `quoteFlow.steps`
- **Contact** — Call / Text / Email + hours
- **Map** — Google Maps iframe + directions link
- **Chat** — AI conversation streaming from `/api/victorybot/chat`

### AI Integration

```typescript
// app/api/victorybot/chat/route.ts
import Anthropic from '@anthropic-ai/sdk'
import { clientConfig } from '@/client.config'

const client = new Anthropic()

export async function POST(req: Request) {
  const { messages } = await req.json()
  const response = await client.messages.create({
    model: clientConfig.victorybot.ai.model,
    max_tokens: clientConfig.victorybot.ai.maxTokens,
    system: buildSystemPrompt(clientConfig.victorybot),
    messages,
  })
  return Response.json({
    content: response.content[0].type === 'text' ? response.content[0].text : '',
  })
}
```

**Persona definitions:**
- `friendly` — warm, conversational, casual
- `direct` — short answers, no filler
- `professional` — formal, complete sentences
- `edgy` — personality-forward, matches brands like Bad Decisions

### Theming

```typescript
style={{
  '--vb-primary': config.primaryColor,
  '--vb-font': config.fontFamily ?? 'inherit',
  '--vb-radius': config.borderRadius ?? '12px',
}}
```

### Lead Capture Payload

```typescript
{
  source: 'victorybot', screen: 'quote' | 'chat', timestamp: string,
  businessName: string,
  contact: { name?: string; email?: string; phone?: string },
  data: Record<string, unknown>,
}
```

### Environment Variables

```bash
ANTHROPIC_API_KEY=    # Server-side only — NEVER use NEXT_PUBLIC_ prefix
```

---

## 6. Design Workflow — Variant → Claude Code

### Philosophy

**Variant is the creative director. Claude Code is the executor. These roles never swap.**

### Phase 1 — Variant Prompt Construction

**Anatomy of a strong prompt:**
```
[Business type + name]
[Visual tone — 3+ keywords or sensory references]
[Palette — base + one accent maximum with descriptive name]
[Typography — display treatment + body pairing]
[Anti-instructions — at least 2 explicit exclusions]
[Sections in page order]
[Closing "feels like" sentence]
```

**Save every prompt as `design/variant-prompt.md` and commit it.** This is the creative brief.

### Variant Prompt Checklist

```
[ ] Business type and name
[ ] Visual tone — 3+ specific keywords
[ ] Background color (hex or anchor)
[ ] Accent color — one only with descriptive name
[ ] Typography direction
[ ] At least 2 anti-instructions
[ ] Sections in page order
[ ] Closing "feels like" sentence
```

### Phase 2 — Variant Session

1. Iterate hero until direction is locked
2. Click **"New chat from design"** to lock design system
3. Build sections: `"Following this design system, create [section]. Use this copy exactly: [copy]"`
4. Use **Style Dropper** to cross-pollinate variations
5. Stop at 3–5 sections — Claude Code extrapolates the rest

**Lock in Variant:** exact hex values, font pairing, surface quality, corner radius, spatial density.

### Phase 3 — Working With Variant's Inline Styles

Variant exports HTML with inline `style={{}}` objects. These are design targets, not production code.

**Why not convert everything to Tailwind v4:** Preflight reset overrides `font-family`, `-webkit-text-stroke`, custom `line-height`, and complex animations silently.

**Three-category strategy:**

**Category 1 — Convert to Tailwind (safe):**
margin, padding, dimensions, display, flex/grid, standard colors, standard font-size/weight, borders, opacity, z-index, overflow

**Category 2 — Extract to CSS custom properties (brand tokens):**
```typescript
// Variant inline → globals.css @theme inline
// --color-accent: #FFB347;
// Usage: className="text-[var(--color-accent)]"
```

**Category 3 — Keep as inline styles (necessary):**
`-webkit-text-stroke`, `background-clip: text`, complex line-height, WebGL uniforms, complex backdrop-filter

### Phase 4 — Claude Code Handoff

**Opening brief:**
```
I'm building [CLIENT NAME]'s website. HTML from Variant = visual target, not production code.

Stack: Next.js 15 (App Router), React 19, TypeScript
Tailwind v4 (@theme inline in globals.css — no tailwind.config.js)
No rounded corners: * { border-radius: 0 !important } in globals.css
One component per section in components/
No inline styles except Category 3 (see VR-PLATFORM.md Section 6)
Extract design tokens to CSS custom properties after first 2-3 sections

Client config: [paste relevant clientConfig fields]
First section — hero: [paste Variant HTML]
```

**Design system extraction (after 2-3 sections):**
```
Extract full design system into app/globals.css:
All colors as CSS custom properties in @theme inline
All font families, animation keyframes, reusable utility classes
Document every property in a comment block at the top.
```

### Phase 5 — Final Pass Sequence

Execute in order: real copy → brand fonts → brand colors → logo → photography → animations → mobile → SEO layer → QA checklist.

### Design Artifacts

```
[client-slug]/design/
├── variant-prompt.md    ← Creative brief (required)
├── hero-v1.png          ← Chosen direction
├── palette.md           ← Hex values, fonts, contrast ratios
└── notes.md             ← Design decisions
```

---

## 7. Third-Party Integrations

### The Documentation Review Requirement

**Hard rule for Claude Code — applies to every integration:**

```
NEVER give key location instructions from memory alone.
ALWAYS fetch live documentation first.
If documentation cannot be fetched, say so and provide the URL.
```

Before any env setup:
```
Fetch current official documentation for [SERVICE], verify exact
key locations as they appear today, then provide instructions.
```

### Stripe

**Default for all new clients. Signup:** https://stripe.com | **Docs:** https://stripe.com/docs

```bash
STRIPE_SECRET_KEY=           # sk_live_... or sk_test_... (never commit)
STRIPE_WEBHOOK_SECRET=       # whsec_... — from webhook endpoint, NOT the API key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
```

Key gotchas: PaymentIntent amounts in cents. Test + live keys must always be paired. Webhook secret ≠ API secret key (starts with `whsec_`). Always verify webhook signature with `stripe.webhooks.constructEvent()`.

### Twilio

**Growth tier+. Signup:** https://twilio.com | **Docs:** https://www.twilio.com/docs

```bash
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=           # Use API sub-credential in production
TWILIO_PHONE_NUMBER=         # Provisioned sending number (~$1/month)
TWILIO_MESSAGING_SERVICE_SID=
```

Always include "Reply STOP" in every SMS. Trial accounts can only text verified numbers.

### Resend

**Default email — every build. Signup:** https://resend.com | **Docs:** https://resend.com/docs

```bash
RESEND_API_KEY=
FROM_EMAIL=      # clientdomain.com (after DNS verification — up to 48hr)
ADMIN_EMAIL=     # Merchant notification destination
```

Start domain verification on day one. Free tier: 3,000 emails/month, 100/day.

### Google Analytics 4

**Every build. Signup:** https://analytics.google.com

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=    # G-XXXXXXXXXX — safe to expose
```

Configure conversion events before launch or the data is not actionable.

### Google Search Console

**Every build.** Verify via Next.js metadata HTML tag. Submit sitemap after verification. Link to GA4.

### Anthropic API

**Every chatbot build. Signup:** https://console.anthropic.com | **Docs:** https://docs.anthropic.com

```bash
ANTHROPIC_API_KEY=    # NEVER use NEXT_PUBLIC_ — server-side only
```

Always `claude-sonnet-4-6`. Max tokens 500 for VictoryBot. API key never reaches browser.

### Web Push / VAPID

**Every BayReady PWA. No signup required.**

```bash
# Generate once: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=   # Never expose
VAPID_CONTACT=       # mailto:ray@victoryrush.dev
VITE_VAPID_PUBLIC_KEY=    # Same public key — safe to expose
```

Generate once per environment. Never rotate (invalidates all subscriptions).

### Drag Specialties / Parts Unlimited

**Powersports clients with LeMans dealer account.** Contact Andy Gelsinger: AGelsinger@parts-unltd.com

```bash
DRAG_SPECIALTIES_API_URL=
DRAG_SPECIALTIES_API_KEY=
DRAG_SPECIALTIES_DEALER_ID=
```

Implement 4-hour cache layer — never proxy every request directly. Credentials belong to the client.

### Clover POS

**NLA legacy only. New clients: Stripe default.** Full Clover documentation in original NLA CLAUDE.md.

**Token types (easy to confuse):**
| Token | Purpose |
|-------|---------|
| Merchant API Token | Inventory reads |
| Ecomm Public Key | SDK initialization |
| Ecomm Private Key | Charge endpoint |
| OAuth Access Token | Multi-merchant (BayReady DB) |

**Sandbox vs production = completely different hosts.** See Section 13 Gotchas.

### Integration Decision Matrix

| Need | Default | Use Alternative When |
|------|---------|---------------------|
| Payments | Stripe | Client explicitly uses Clover |
| Email | Resend | Never — Resend is the standard |
| SMS | Twilio | Growth tier+ only |
| Analytics | GA4 | Always |
| AI chatbot | Anthropic Sonnet 4 | Never deviate |
| Push | Web Push / VAPID | Always for BayReady PWA |
| Parts catalog | — | Powersports + LeMans dealer account |
| Booking | BayReady Core | Always for appointment businesses |

---

## 8. SEO & GEO Infrastructure

### Philosophy

SEO-first is an architectural decision, not a post-launch checklist. The 2026 extension is GEO — building for humans, crawlers, and AI models simultaneously.

**Three audiences:** humans (UX), crawlers (structured data, metadata), AI models (natural language authority, FAQ schemas, consistent NAP).

### Standard SEO Architecture

**Title format:** `[Keyword] [City] [State] | [Business Name]` — under 60 chars, city+state required for local businesses.

**Meta description:** 150–160 chars, keyword + city + value prop + soft CTA.

**Metadata factory:**
```typescript
export function generatePageMetadata({ title, description, path, ogImage = '/og/homepage.jpg' }) {
  const baseUrl = `https://${clientConfig.domain}`
  return {
    title, description,
    alternates: { canonical: `${baseUrl}${path}` },
    openGraph: { title, description, url: `${baseUrl}${path}`, siteName: clientConfig.name,
      images: [{ url: `${baseUrl}${ogImage}`, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [`${baseUrl}${ogImage}`] },
  }
}
```

### Structured Data (JSON-LD)

**Root layout — `LocalBusiness` schema on every page.**

`@type` by vertical:
| Vertical | Type |
|----------|------|
| Auto / motorcycle | `AutoRepair` |
| Tattoo | `HealthAndBeautyBusiness` |
| Hair / beauty | `BeautySalon` |
| Generic | `LocalBusiness` |

**Service pages — `Service` + `FAQPage` schemas (minimum 3 Q&A pairs).**

FAQ schema content is frequently pulled verbatim by AI models. Highest-value GEO action per page.

### Service Page Template

Every core service gets a dedicated URL.

```
URL:      /services/[slug]
Title:    [Service] [City] [State] | [Business]
H1:       [Service] in [City], PA
Body:     500–1500 words unique content
FAQ:      Min 3 Q&A pairs + FAQPage schema
Hero img: Real photo + descriptive alt text
CTA:      One clear next action
Internal: Links to 2-3 related pages
```

### GEO Layer

Write content as the authoritative reference. "Bad Decisions Customs specializes in custom Harley-Davidson paint, powder coating, and metal fabrication, with over X years serving the Pocono region" — not "WE ARE THE BEST SHOP CALL US TODAY."

**GEO tactics:** entity consistency (identical NAP everywhere), topical authority (service pages + blog), `speakable` schema, FAQ schema for AI citations.

### Citation Building Priority

- **Tier 1:** Google Business Profile, Apple Maps, Bing Places, Yelp, Facebook
- **Tier 2:** Yellow Pages, BBB, Nextdoor, Foursquare, Angi
- **Tier 3:** Vertical-specific (CycleTrader, StyleSeat, etc.)

Canonical NAP format documented in `clientConfig.nap` — must be identical everywhere.

### SEO Launch Checklist

```
[ ] Every page unique title + meta description
[ ] All titles under 60 chars, descriptions 150-160 chars
[ ] One H1 per page, logical heading hierarchy
[ ] All images have descriptive alt text
[ ] sitemap.xml accessible and valid
[ ] robots.txt disallows admin/api/dashboard
[ ] LocalBusiness JSON-LD on root layout
[ ] Service + FAQ JSON-LD on service pages
[ ] OG images for key pages (1200x630px)
[ ] Canonical URLs on all pages
[ ] GA4 installed and receiving data
[ ] Search Console verified, sitemap submitted
[ ] GBP created/claimed and fully optimized
[ ] NAP consistent across site, GBP, citations
[ ] PageSpeed 90+ on mobile
[ ] Core Web Vitals passing
```

---

## 9. i18n Standard

### Philosophy

EN/ES is default on every build. Spanish-speaking customers, Spanish-language search queries, and Spanish GEO citations are captured at essentially zero marginal cost.

### Why Not `[locale]` Route Segments

URL disruption for existing citations, disproportionate SEO complexity, middleware friction on Vercel's edge network. Client-side localStorage approach is pragmatic for local business builds.

### Implementation

**`dictionaries.ts`:**
```typescript
export type Locale = 'en' | 'es'
export const dictionaries = {
  en: { nav: { services: 'Services', ... }, hero: { ... }, /* all sections */ },
  es: { nav: { services: 'Servicios', ... }, hero: { ... }, /* all sections */ },
}
export type Dictionary = typeof dictionaries.en
// TypeScript enforces completeness — missing key = compile error
```

**`LocaleContext.tsx`:**
```typescript
'use client'
export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  useEffect(() => {
    const stored = localStorage.getItem('vr-locale') as Locale | null
    if (stored && stored in dictionaries) setLocaleState(stored)
  }, [])
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('vr-locale', newLocale)
    document.documentElement.lang = newLocale
  }
  return <LocaleContext.Provider value={{ locale, t: dictionaries[locale], setLocale }}>
    {children}
  </LocaleContext.Provider>
}
export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
```

**Usage:** `const { t } = useLocale()` → `<h1>{t.hero.headline}</h1>`

**Registration:** Wrap app in `Providers.tsx` client boundary in root `app/layout.tsx`.

### What Gets Translated

**Always:** Homepage sections, VictoryBot widget, form labels, error pages.
**Growth tier+:** Service page content.
**Never:** Admin/BayReady dashboards, API responses, JSON-LD, business NAP.

### hreflang

```typescript
export const metadata: Metadata = {
  alternates: {
    languages: {
      'en': `https://${clientConfig.domain}`,
      'es': `https://${clientConfig.domain}`,
      'x-default': `https://${clientConfig.domain}`,
    }
  }
}
```

### Extending to Additional Languages

Add to `Locale` type, add complete translation object, update `LanguageSwitcher.tsx`. TypeScript enforces completeness at build time.

---

## 10. Client Onboarding Playbook

### Target: Live site in 5 business days from signed agreement.

### Phase 0 — Pre-Engagement

```
[ ] Signed agreement (scope, rate, start date)
[ ] First payment collected
[ ] Client contact info documented
[ ] Existing digital presence audited
[ ] Access credentials requested (domain, hosting, GBP, social)
[ ] GitHub repo created: [client-slug]
[ ] client.config.ts initialized from template
```

### Phase 1 — Discovery

Every answer maps to `client.config.ts`:

```
IDENTITY: exact business name, slug, languages
BRAND: colors (or determine in Variant), fonts, corner preference
BUSINESS: phone, email, address, hours
FEATURES: booking, ecommerce, chatbot, blog, SMS
SERVICES: name, duration, price range for each
CHATBOT: persona, opening greeting
INTEGRATIONS: Clover POS? Distributor accounts?
```

Output: completely filled `client.config.ts`. No TODOs before Phase 2.

### Phase 2 — Third-Party Setup

```
Day 1 (DNS-sensitive — start immediately):
[ ] Resend domain verification (up to 48hr propagation)
[ ] Google Business Profile — claim or create
[ ] Google Analytics 4 — create property

Day 1-2:
[ ] Stripe — account + keys
[ ] Search Console — verify domain
[ ] Anthropic API — confirm key

Day 2-3 (if applicable):
[ ] Twilio — account + phone number
[ ] Distributor API — confirm credentials

Before every service setup: fetch live documentation, verify key locations.
```

Track all in gitignored `env-setup.md`.

### Phase 3 — Variant Design Session

```
[ ] Prompt written using Section 6 checklist
[ ] Saved to design/variant-prompt.md
[ ] Hero iterated until direction locked
[ ] "New chat from design" clicked
[ ] 3+ sections built in locked session
[ ] Screenshots + palette.md committed to design/
```

### Phase 4 — Development

**Claude Code opening:**
```
Read before writing any code:
1. client.config.ts
2. design/variant-prompt.md + design/palette.md
3. VR-PLATFORM.md Section 6

Stack: Next.js 15, React 19, TypeScript, Tailwind v4
[paste first Variant export]
```

**Sequence:** scaffold → homepage sections → design system extraction → service pages → integrations → SEO → real content.

### Phase 5 — BayReady Merchant Setup

```
[ ] Merchant registered, ID added to clientConfig
[ ] Services, availability, blocked dates configured
[ ] Push notifications tested on merchant's actual device
[ ] Full 5-step booking flow tested end-to-end
[ ] Confirmation email verified
```

### Phase 6 — VictoryBot Configuration

```
[ ] clientConfig.victorybot fully populated
[ ] /api/victorybot/chat/route.ts + /api/victorybot/lead/route.ts created
[ ] ANTHROPIC_API_KEY set in Vercel env
[ ] All screens tested, quote flow submits, AI responds correctly
[ ] Mobile layout verified
```

### Phase 7 — Pre-Launch QA

```
[ ] qa-launch-checklist.md — every item
[ ] SEO launch checklist (Section 8) — every item
[ ] Accessibility launch checklist (Section 14) — every item
[ ] Tested on real iPhone (Safari) + Android (Chrome)
[ ] Lighthouse 90+ on mobile
[ ] No console errors
```

### Phase 8 — Deployment

```
1. Deploy BayReady backend → Railway health check passes
   npx prisma migrate deploy (Railway shell)
2. Deploy BayReady frontend → Vercel
3. Deploy client site → Vercel, connect custom domain
4. DNS at registrar (15min–48hr propagation)
5. Post-deploy: production URL loads, forms work, GA4 receiving data
   Sitemap accessible + submitted to Search Console
   GBP website URL updated
6. Test booking end-to-end on production, confirm push, delete test booking
```

### Phase 9 — Client Handoff (30 minutes)

```
1. Site walkthrough — all pages + mobile (5 min)
2. BayReady dashboard walkthrough (10 min)
   → Install PWA to home screen DURING this call
3. What to send you — photos, copy updates, issues (5 min)
4. What you handle automatically — reports, GBP, hosting (5 min)
5. Questions (5 min)
```

### Onboarding Timeline

| Day | Phase | Output |
|-----|-------|--------|
| 1 | 0 + 1 | Repo created, config complete |
| 1 | 2 start | Accounts created, DNS submitted |
| 1–2 | 3 | Variant session, design committed |
| 2–4 | 4 | Site built, integrations wired |
| 4 | 5–6 | BayReady + VictoryBot configured |
| 4–5 | 7 | QA complete |
| 5 | 8–9 | Live + client handoff |

---

## 11. Victory Rush Pricing Framework

### Philosophy

Monthly recurring infrastructure. Setup deposit covers the build. Monthly retainer covers active management.

**Friend Rate:** referred clients, personal network, in-person relationships.
**Market Rate:** cold outreach, inbound with no referral chain. Never negotiate down from Market Rate.

### Market Value Reference

| Agency equivalent | Monthly value |
|------------------|---------------|
| Custom Next.js site | $8,000–$25,000 one-time |
| Booking platform | $200–$500/month |
| AI chatbot | $100–$300/month |
| SEO retainer | $500–$2,000/month |
| Ads + social management | $600–$1,300/month |
| **Total equivalent** | **$1,400–$4,100/month** |

### Tiers

#### Foundation
**Friend $200/mo | Market $300/mo | Setup F:$300 M:$500**

Custom Next.js site, hosting/SSL/CDN, GBP setup, GA4 + Search Console, LocalBusiness schema, monthly report, VictoryBot (welcome + contact only).

#### Growth
**Friend $450/mo | Market $650/mo | Setup F:$600 M:$1,000**

Foundation + full VictoryBot (all screens + AI), full local SEO, Google Ads management, 4 social posts/month, weekly GBP posts, 1 blog post/month, monthly strategy call, quarterly competitive analysis.

#### Infrastructure
**Friend $750/mo | Market $1,100/mo | Setup F:$1,000 M:$1,500**

Growth + BayReady PWA booking, Twilio SMS automation, e-commerce module, admin dashboard, multi-employee support, email automation, 2 blog posts/month, bi-weekly check-in.

### Add-Ons

| Add-On | Friend | Market |
|--------|--------|--------|
| BayReady (standalone) | $75 | $100 |
| VictoryBot Full (standalone) | $75 | $100 |
| Twilio SMS | $75 | $100 |
| E-commerce Module | $100 | $150 |
| Additional Blog Post | $75/post | $100/post |
| Social Media Management | $200 | $300 |
| Google Ads Management | $200 | $300 |
| Higgsfield Ad Creative | $150 | $200 |
| Distributor API Integration | $200 one-time | $350 one-time |

### Current Client Mapping

| Client | Current | Correct | Gap | Timing |
|--------|---------|---------|-----|--------|
| Ben (NLA) | $350 | $450 Growth (Friend) | +$100 | Now |
| Billy (BDCCB) | $350 | $750 Infrastructure (Friend) | +$400 | Month 3 |
| Felipe | $0 | $750 Infrastructure (Friend) | — | When ready |
| Youssef | $0 | $1,100 Infrastructure (Market) | — | Warm lead |
| Oliver | $0 | $650 Growth (Market) | — | Scope clarification |

**Full conversion MRR: ~$4,000/month. The gap from $700 is four conversations.**

### Pricing Psychology

- Lead with monthly, not setup
- Never apologize for the rate — state it, stop talking
- Comparison close: "AdIQ was $350 for less than a third of this"
- Friend Rate framing: "Because you came through Ben, I take care of you at the friend rate"

---

## 12. Whitelabel Guide

### Reference Builds

- **NLA** (`next-level-audio`) — canonical reference for Clover-integrated builds
- **BDCCB** (`bad-decisions`) — reference for non-Clover builds (Stripe, decoupled BayReady, i18n, service pages)

### What Changes Per Client

**Layer 1 — `client.config.ts`:** Every field is client-specific. Cross-contamination is a critical error.

**Layer 2 — `globals.css` `@theme inline`:** Replace all color tokens, font variables, radius values. Remove `* { border-radius: 0 }` entirely for rounded-corner builds.

**Layer 3 — `app/layout.tsx`:** Update `next/font` imports to client's fonts.

Common pairings: Cyberpunk → Orbitron + JetBrains Mono | Industrial → Bebas Neue + Space Mono | Premium → Playfair Display + Inter | Tattoo → Oswald + Space Mono

**Layer 4 — Business content:** Nav (logo, labels), Footer (all info), Hero, all section content — driven by `clientConfig` and `dictionaries.ts`.

**Layer 5 — Public assets:** `public/logo.svg`, favicon, `apple-touch-icon.png` (180x180px), OG images (1200x630px), hero + gallery photos. All via `next/image`, WebP, under 500KB.

**Layer 6 — SEO metadata:** Use `generatePageMetadata()` factory. Only title + description values change.

**Layer 7 — Structured data:** `LocalBusiness` JSON-LD fully driven by `client.config.ts`.

**Layer 8 — i18n dictionaries:** Replace all EN + ES strings. No previous client strings remain.

**Layer 9 — Environment variables:** Every client gets independent env vars. Never share keys between clients.

### Vertical Adapter Selection

| Business Type | BayReady Vertical | Adapter |
|---------------|------------------|---------|
| Auto / motorcycle | `automotive` | `VehicleSelector` |
| Tattoo | `tattoo` | `DesignIntake` |
| Hair / beauty | `beauty` | `ArtistSelector` |
| Fitness / consulting | `generic` | None |

### Complete Whitelabel Checklist

```
IDENTITY
[ ] client.config.ts has no placeholders or TODOs
[ ] No previous client data anywhere in codebase
[ ] Repo named [client-slug]

DESIGN SYSTEM
[ ] @theme inline has client-specific tokens
[ ] Font imports match client's fonts
[ ] Border radius correct (sharp vs rounded)
[ ] No hex values from previous client in any component

BUSINESS CONTENT
[ ] Logo is client's actual logo
[ ] Favicon + apple-touch-icon from client's logo
[ ] Nav + Footer correct (address, phone, hours, email)
[ ] Copyright year is dynamic
[ ] All content is client-specific

ASSETS
[ ] All images are real client photos (no placeholders)
[ ] All images optimized (WebP, under 500KB)
[ ] OG images for all key pages (1200x630px)
[ ] Descriptive alt text on every image

SEO
[ ] Every page unique title + description
[ ] LocalBusiness JSON-LD correct
[ ] Service + FAQ JSON-LD on service pages
[ ] Sitemap includes all public pages
[ ] Robots.txt disallows admin/api/dashboard
[ ] Canonical URLs set

i18n
[ ] All English strings updated for this client
[ ] All Spanish strings updated for this client
[ ] No strings from previous client in dictionaries.ts

INTEGRATIONS
[ ] GA4 is this client's property
[ ] Resend FROM_EMAIL is this client's domain
[ ] Stripe keys are this client's account
[ ] BayReady booking URL is this client's merchant
[ ] Push tested on client's device

ENVIRONMENT
[ ] All env vars set in Vercel + Railway
[ ] No env vars from a previous client

FINAL
[ ] QA checklist passed
[ ] SEO launch checklist passed
[ ] Accessibility launch checklist passed
[ ] Lighthouse 90+ on mobile
[ ] No console errors
[ ] Tested on real iPhone + Android
```

### Common Whitelabel Mistakes

1. Copying previous client's env vars as a starting point — always start blank
2. Leaving `* { border-radius: 0 }` in a rounded-corner build
3. Forgetting Spanish translations — worse than no language switcher
4. Skipping OG images — gray box on Facebook share
5. Hardcoding client data outside `client.config.ts` and `dictionaries.ts`

---

## 13. Gotchas & Lessons Learned

**This section is a living document.** Every new gotcha gets added here before the session ends.

### Tailwind CSS v4

**Preflight reset overrides Variant inline styles.** Follow the three-category strategy from Section 6. Keep `-webkit-text-stroke`, gradient text, and complex animations as inline styles.

**No `tailwind.config.js`.** All config in `app/globals.css` via `@theme inline {}`. Import: `@import "tailwindcss"`.

**CSS variable arbitrary values:** `text-[var(--color-primary)]` ✅ | `text-[--color-primary]` ❌

**Global radius reset breaks third-party components.** Scope to VR components or use `@theme inline` variables instead.

### Next.js App Router

**Server components don't need `'use client'` to render client components.** Only add it to components that directly use browser APIs, hooks, or event handlers.

**`useSearchParams()` requires Suspense boundary.**

**API routes use `NextRequest`/`NextResponse`.**
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ success: true })
}
```

**`next/image` requires explicit dimensions or `fill` prop.**

**Metadata title template:**
```typescript
export const metadata = { title: { template: '%s | Business Name', default: 'Business — Tagline' } }
```

### Prisma v7

**No `datasourceUrl` in `new PrismaClient()`.** Use adapter pattern:
```typescript
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
```

**`prisma generate` before `nest build`.** Build command: `prisma generate && nest build`

**NestJS doesn't auto-load `.env`.** `import 'dotenv/config'` must be the absolute first line of `main.ts`.

**Railway migrations require manual execution:** `npx prisma migrate deploy` in Railway shell after deploy.

### Stripe

**Always verify webhook signatures:** `stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)`

**Webhook secret ≠ API secret.** Starts with `whsec_`. Found in Stripe Dashboard → Developers → Webhooks → endpoint.

**Test + live keys must always be paired.** Never mix modes.

**Amounts in cents:** `Math.round(dollars * 100)`

### BayReady PWA & Web Push

**iOS push requires Safari 16.4+ (iOS 16.4, March 2023).** Check `'PushManager' in window` before subscribing.

**`pushManager.subscribe()` must be called from a user gesture.** Wire to button click in `PushPrompt.tsx`. Never call on page load — iOS Safari silently ignores it.

**VAPID keys must never be rotated.** Rotation invalidates every stored subscription. Generate once, store in password manager.

**Clean up stale subscriptions on 410/404 responses:**
```typescript
catch (err) {
  if (err.statusCode === 410 || err.statusCode === 404) {
    await prisma.pushSubscription.delete({ where: { id: sub.id } })
  }
}
```

**Service worker must be at root path.** `public/sw.js` — not `src/`. Registration: `navigator.serviceWorker.register('/sw.js')`.

### i18n

**Hydration mismatch.** Use `mounted` gate on visually significant components:
```typescript
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return <HeroSkeleton />
```

**Server components cannot use `useLocale()`.** Convert to client component or pass strings as props.

**Missing Spanish translations with TypeScript enforcement:** use placeholder with TODO — never leave key missing.

### NestJS

**Railway requires `0.0.0.0` binding:** `await app.listen(process.env.PORT ?? 3001, '0.0.0.0')`

**CORS must include all client origins:**
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL.split(',').map(url => url.trim()),
  credentials: true,
})
```

**Circular dependency between modules.** Use `EventEmitter2` pattern — emit event on booking creation, push service listens. Decouples modules entirely.

### Clover POS (NLA Legacy)

**`ready` event throws uncaught error.** Never listen for it. Use `blur`, `change`, `focus`, `paymentMethod` only.

**`createToken()` returns `{ token?, errors? }` — not a string.** Extract `result.token`.

**Sandbox + production charge URLs are completely different hosts:**
```
Sandbox:    scl-sandbox.dev.clover.com/v1/charges
Production: scl.clover.com/v1/charges
```

**Card elements require DOM before mounting.** Use `setTimeout(() => element.mount('#id'), 100)` in useEffect.

### Drag Specialties

**Must implement caching layer.** 4-hour TTL. Never proxy every request directly.

**Dealer credentials belong to the client.** Store in client's environment only. Never shared.

### General Development

**Use `npm install --save-exact` for new packages.** Review lockfile diffs before committing.

**Vercel env vars don't apply to preview deployments by default.** Scope explicitly: production keys → Production environment only.

**Railway build-time env vars need "Available during build" enabled** for `DATABASE_URL` (needed for `prisma generate`).

**`git push` to `main` triggers immediate production deploy.** Establish branch strategy: `main` → production, `dev` → preview. Add `vercel.json` specifying production branch.

---

## 14. Accessibility & ADA Compliance

### Philosophy

Accessibility is not an upsell. It is a baseline quality standard and it is the law. ADA demand letters targeting small business websites are a routine legal industry — WCAG 2.1 AA compliance is a concrete liability shield.

**The standard:** WCAG 2.1 Level AA on every Victory Rush client site. No exceptions.

Additional benefits: better SEO, better GEO (AI model parsing), better UX for all users.

### The Five Categories That Catch Most Violations

#### 1. Color Contrast

**WCAG AA:** 4.5:1 for normal text | 3:1 for large text (18pt+) and UI components.

**Victory Rush dark theme contrast table:**

| Combination | Ratio | Status |
|-------------|-------|--------|
| `#E01020` NLA red on `#0a0a0a` | ~4.2:1 | ❌ Fails body text |
| `#FFB347` VR amber on `#0D0B0A` | ~8.1:1 | ✅ Passes |
| `rgba(255,250,240,0.6)` on `#0a0a0a` | ~3.8:1 | ❌ Fails body text |
| `#FFFAF0` on `#0a0a0a` | ~18.9:1 | ✅ Passes |
| `#c22820` BDCCB red on `#0a0a0a` | ~3.9:1 | ❌ Fails body text |

**Rules for dark builds:**
- Body text: always `#FFFAF0` — never the muted secondary color
- Secondary text: `rgba(255,250,240,0.7)` minimum — do not go below 0.6
- Accent colors: acceptable for large headings (24px+), decorative borders, icons — never for body text
- Document all passing ratios in `design/palette.md`

**Tool:** https://webaim.org/resources/contrastchecker/

#### 2. Keyboard Navigation

```typescript
// ❌ Not keyboard accessible
<div onClick={handleOpen}>Book Now</div>

// ✅ Natively keyboard accessible
<button onClick={handleOpen}>Book Now</button>
```

**Focus trap in modals** — use `focus-trap-react`:
```typescript
<FocusTrap active={isOpen}>
  <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <h2 id="modal-title">Book Your Appointment</h2>
    <button onClick={close}>Close</button>
  </div>
</FocusTrap>
```

When modal opens: focus moves in. Tab cycles inside only. Escape closes. Focus returns to trigger.

#### 3. Focus States

```css
/* globals.css */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}
/* NEVER: * { outline: none } without a replacement */
```

Use `:focus-visible` not `:focus` — shows only for keyboard navigation, not mouse clicks.

#### 4. ARIA Labels

**Icon-only buttons:**
```typescript
<button onClick={closeModal} aria-label="Close modal">
  <XIcon aria-hidden="true" />
</button>
```

**Images:**
```typescript
// Informative
<Image src="/gallery-1.jpg" alt="Custom candy apple red paint on 2019 Harley Sportster" />
// Decorative
<Image src="/divider.jpg" alt="" aria-hidden="true" />
```

**Form inputs:**
```typescript
<label htmlFor="email-input">Email address</label>
<input id="email-input" type="email" aria-required="true" />
```

**Modals:**
```typescript
<div role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-desc">
  <h2 id="modal-title">Schedule a Drop-Off</h2>
</div>
```

**VictoryBot live region:**
```typescript
<div role="log" aria-live="polite" aria-label="Chat messages">
  {messages.map(msg => <div key={msg.id}>{msg.content}</div>)}
</div>
```

#### 5. Semantic HTML Structure

**Heading hierarchy:** Exactly one `<h1>` per page. Logical levels — never skip. Never use headings for visual sizing.

**Landmark regions (required on every page):**
```typescript
<header>
  <nav aria-label="Main">...</nav>
</header>
<main>
  <section aria-labelledby="section-heading">
    <h2 id="section-heading">Section Title</h2>
  </section>
</main>
<footer>
  <nav aria-label="Footer">...</nav>
</footer>
```

**Semantic elements:**

| Purpose | Use | Never Use |
|---------|-----|-----------|
| Navigate to URL | `<a href>` | `<div onClick>` |
| Trigger action | `<button>` | `<div onClick>` |
| Toggle value | `<input type="checkbox">` | Styled div |
| Submit form | `<button type="submit">` | `<div onClick>` |

The `<div>` with `onClick` pattern is the most common accessibility violation in React. Variant exports frequently contain it — correct during implementation.

### Automated Testing

Run all three before every launch:

- **Lighthouse** (Chrome DevTools) — 90+ required, run in incognito, both viewports
- **axe DevTools** (Chrome extension) — more thorough than Lighthouse, run on every page
- **WAVE** (https://wave.webaim.org) — visual overlay, useful for client explanations

### Manual Checks

```
[ ] Tab through entire page — every interactive element reachable?
[ ] Modal focus trap — opens, traps Tab, Escape closes, focus returns to trigger?
[ ] Mobile hamburger menu keyboard operable?
[ ] Form errors — associated with fields, announced by screen readers?
[ ] VictoryBot widget — all screens reachable via keyboard?
[ ] Image alt texts sensible when read aloud?
[ ] VoiceOver heading navigation (H key) — logical structure?
[ ] 200% zoom — page usable, no content lost?
[ ] Windows High Contrast mode — focus states visible?
```

### Dark Theme Contrast Resolution

**Rule 1:** Accent colors (red, amber) are for decoration and large display text — never body text.
**Rule 2:** Body text is always `#FFFAF0`. Never reduce below 0.7 opacity on dark backgrounds.
**Rule 3:** `rgba(255,250,240,0.7)` on `#0a0a0a` ≈ 9:1 — secondary text aesthetic preserved, compliant.
**Rule 4:** CTA button text — amber bg uses dark text `#1A120B` (7.2:1 ✅). Red bg uses `#FFFFFF` (4.6:1 ✅).
**Rule 5:** Verify every combination before adding to `globals.css`. Document in `design/palette.md`.

### Accessibility Statement Page

Every site includes `/accessibility`:
- Commitment to accessibility
- Standard: WCAG 2.1 Level AA
- Known limitations (if any)
- Contact method for assistance
- Date of last review

Link in footer alongside Privacy Policy.

### Accessibility Launch Checklist

```
COLOR CONTRAST
[ ] All body text verified at 4.5:1 minimum
[ ] All large text at 3:1 minimum
[ ] All UI component states verified
[ ] Contrast ratios documented in design/palette.md

KEYBOARD NAVIGATION
[ ] Full Tab navigation — every element reachable and activatable
[ ] All modals trap focus, close on Escape, return focus to trigger
[ ] Mobile navigation keyboard operable
[ ] No unintentional keyboard traps

FOCUS STATES
[ ] :focus-visible styles in globals.css
[ ] No outline: none without replacement
[ ] Focus visible on all backgrounds

ARIA & SEMANTIC HTML
[ ] One <h1> per page, logical hierarchy
[ ] <header>, <main>, <footer> present on all pages
[ ] All icon-only buttons have aria-label
[ ] All images have descriptive alt text (or alt="" for decorative)
[ ] All inputs have label or aria-label
[ ] All modals have role, aria-modal, aria-labelledby
[ ] No interactive div/span elements

AUTOMATED TESTING
[ ] Lighthouse Accessibility 90+ on all pages
[ ] axe DevTools — zero violations
[ ] WAVE — zero errors on homepage + service pages

MANUAL TESTING
[ ] VoiceOver/Narrator heading navigation passed
[ ] 200% zoom test passed
[ ] Full keyboard-only walkthrough completed

DOCUMENTATION
[ ] /accessibility page exists
[ ] Link to /accessibility in footer
[ ] Contrast ratios in design/palette.md
```

---

*Victory Rush — Digital Infrastructure for Visionary Operators.*
*victoryrush.dev | ray.lanfranco@proton.me*

*VR-PLATFORM.md — Last updated: March 24, 2026 | 14 sections*
