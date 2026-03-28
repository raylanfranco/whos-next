# Who's Next? — Deploy & Migration Runbook

**Status:** Ready for deployment
**Risk to live BayReady:** Zero — parallel build, migrate after confirmed working

---

## Phase 7 — Deploy New Infrastructure

### 1. Railway Backend

```bash
# Create new Railway project
railway new whos-next-backend

# Link repo
railway link --project whos-next-backend

# Set environment variables (see backend/.env.example for full list)
railway variables set \
  DATABASE_URL="postgresql://..." \
  JWT_SECRET="$(openssl rand -hex 32)" \
  FRONTEND_URL="https://whos-next.vercel.app" \
  STRIPE_SECRET_KEY="sk_live_..." \
  STRIPE_CLIENT_ID="ca_..." \
  STRIPE_REDIRECT_URI="https://whos-next-backend.up.railway.app/stripe/connect/callback" \
  STRIPE_WEBHOOK_SECRET="whsec_..." \
  STRIPE_PRO_PRICE_ID="price_..." \
  STRIPE_BILLING_WEBHOOK_SECRET="whsec_..." \
  RESEND_API_KEY="re_..." \
  VAPID_CONTACT="mailto:ray@victoryrush.dev"

# Generate VAPID keys
npx web-push generate-vapid-keys
# Then set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in Railway

# Deploy
railway up
```

### 2. Run Database Migration

```bash
# In Railway console or via railway run:
npx prisma migrate deploy
```

This runs all three migrations in order:
1. `20260325040417_init` — Base schema
2. `20260326_add_stripe_connect` — Stripe Connect fields
3. `20260328_add_plan_vertical_adapters` — Plan, vertical, adapter records, new question types

### 3. Vercel Frontend

```bash
# Create new Vercel project
vercel --name whos-next

# Set environment variables
vercel env add VITE_API_URL          # → https://whos-next-backend.up.railway.app
vercel env add VITE_VAPID_PUBLIC_KEY # → from VAPID keys generated above
vercel env add VITE_STRIPE_PUBLISHABLE_KEY # → pk_live_... (fallback for non-connected merchants)

# Deploy
vercel --prod
```

### 4. Stripe Setup

1. **Create Pro Plan Product + Price in Stripe Dashboard:**
   - Product: "Who's Next? Pro"
   - Price: $39/month recurring
   - Copy the `price_xxxxx` ID → set as `STRIPE_PRO_PRICE_ID`

2. **Create Billing Webhook in Stripe Dashboard:**
   - URL: `https://whos-next-backend.up.railway.app/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy webhook secret → set as `STRIPE_BILLING_WEBHOOK_SECRET`

3. **Create Payments Webhook (existing Connect flow):**
   - URL: `https://whos-next-backend.up.railway.app/stripe/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook secret → set as `STRIPE_WEBHOOK_SECRET`

### 5. Smoke Test

```bash
# Register a test merchant
curl -X POST https://whos-next-backend.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@victoryrush.dev","password":"testpass123","businessName":"Test Shop"}'

# Verify frontend loads
open https://whos-next.vercel.app

# Login with test credentials
# Create a service, create a booking, verify everything works
```

---

## Phase 8 — Client Migration

### Pre-Migration: Grandfather Existing Clients

Run this SQL against the **new** Who's Next? database AFTER merchants are created/migrated:

```sql
-- ═══════════════════════════════════════════════════════════
-- Client Migration — Grandfather Ben, Billy, Felipe
-- Run AFTER deploying and AFTER creating their accounts
-- ═══════════════════════════════════════════════════════════

-- Ben — Next Level Audio (automotive)
UPDATE merchants
SET plan = 'GRANDFATHERED',
    plan_activated_at = NOW(),
    vertical = 'AUTOMOTIVE'
WHERE email = 'ben@nextlevelaudio.com'; -- Replace with actual email

-- Billy — Bad Decisions Custom Cycles & Boats (generic/automotive)
UPDATE merchants
SET plan = 'GRANDFATHERED',
    plan_activated_at = NOW(),
    vertical = 'AUTOMOTIVE'
WHERE email = 'billy@baddecisionscustoms.com'; -- Replace with actual email

-- Felipe — Who Am II Studio (tattoo)
UPDATE merchants
SET plan = 'GRANDFATHERED',
    plan_activated_at = NOW(),
    vertical = 'TATTOO'
WHERE email = 'felipe@whoamiistudio.com'; -- Replace with actual email

-- Verify
SELECT id, name, email, plan, vertical, plan_activated_at
FROM merchants
WHERE plan = 'GRANDFATHERED';
```

### URL Swaps

After confirming the new deployment works:

| Client | Old URL | New URL | Where |
|--------|---------|---------|-------|
| NLA (Ben) | `bayready-core.vercel.app/book/xxx` | `whos-next.vercel.app/book/xxx` | NLA BookingWizardModal |
| BDCCB (Billy) | `bayready-core.vercel.app/book/xxx` | `whos-next.vercel.app/book/xxx` | BDCCB booking embed |

### Post-Migration Monitoring

- [ ] Monitor for 48 hours after URL swaps
- [ ] Verify booking flow end-to-end for Ben (automotive)
- [ ] Verify booking flow end-to-end for Billy (automotive)
- [ ] Verify push notifications still work
- [ ] Verify Stripe Connect payments still work
- [ ] Check Railway logs for errors
- [ ] Check Vercel function logs

### Decommission Legacy

**Only after 48 hours of confirmed stability:**

1. Remove old Railway project (`bayready-core-production`)
2. Remove old Vercel project (`bayready-core`)
3. Update DNS if applicable

---

## Phase 9 — Publish & App Store

### GitHub Packages

```bash
# Bump version
npm version minor  # → 1.1.0

# Push tag (triggers publish workflow)
git push origin main --tags
```

### iOS App Store

```bash
# On macOS:
cd frontend
npm run build
npx cap sync
npx cap open ios

# In Xcode:
# 1. Set signing team (Apple Developer account required)
# 2. Enable Push Notification entitlement
# 3. Archive → Upload to App Store Connect
# 4. Submit for review (~24-48hr)
```

### App Store Checklist

- [ ] App name: "Who's Next?"
- [ ] Bundle ID: `com.victoryrush.whosnext`
- [ ] Category: Business
- [ ] Screenshots: iPhone 15 Pro, iPad Pro
- [ ] Description: "Booking & scheduling for appointment-based businesses"
- [ ] Privacy URL: TBD
- [ ] Support URL: TBD
