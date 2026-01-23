# Production Launch Roadmap

## L. Ellis Designs - Launch Checklist

---

## Phase 1: Pre-Meeting Prep (You Do This)

### Code Finalization
- [x] Fix all lint errors
- [x] Add authentication to admin APIs
- [x] Add custom request email notifications
- [x] Remove duplicate contact page
- [x] Update README and documentation
- [ ] Run full build test (`pnpm build`)
- [ ] Test complete checkout flow locally
- [ ] Test all email notifications

### Railway Account Setup
- [ ] Create Railway account (under your management)
- [ ] Create new project for L. Ellis Designs
- [ ] Add PostgreSQL service
- [ ] Note the DATABASE_URL for later

### Prepare for Meeting
- [ ] List of questions for client (see below)
- [ ] Demo script ready
- [ ] This checklist printed/ready

---

## Phase 2: Client Meeting

### Information to Collect from L. Ellis

**Business Details:**
- [ ] Exact business name for Stripe
- [ ] Business email address
- [ ] Phone number
- [ ] Physical address (for Stripe verification)
- [ ] Pickup location address (for customers)

**Domain:**
- [ ] Preferred domain name (check availability together)
- [ ] Where to register (recommend Namecheap or Google Domains)

**Branding (if changes needed):**
- [ ] Logo file (PNG, high resolution)
- [ ] Brand colors (or keep current rose/pink theme)
- [ ] Any text changes on homepage

### Accounts to Create Together

**1. Stripe Account (~15 min)**
```
1. Go to stripe.com
2. Click "Start now"
3. Enter business email
4. Verify email
5. Complete business profile
6. Get API keys (Developers → API keys)
   - Publishable key: pk_live_...
   - Secret key: sk_live_...
```

**2. Resend Account (~10 min)**
```
1. Go to resend.com
2. Sign up with business email
3. Add domain (after domain is purchased)
4. Verify domain via DNS records
5. Get API key
```

**3. Domain Registration (~10 min)**
```
1. Go to namecheap.com (or preferred registrar)
2. Search for domain
3. Purchase domain
4. Note: DNS configuration happens after Railway deploy
```

### Demo for Client

Walk through:
1. **Customer Flow**
   - Homepage → Categories → Products → Cart → Checkout

2. **Admin Flow**
   - `/admin` login
   - Order management (status updates)
   - Custom request handling
   - Adding new products/categories

3. **Email Examples**
   - Show email templates
   - Explain when each sends

---

## Phase 3: Deployment (You Do After Meeting)

### Railway Deployment

```bash
# 1. Push code to GitHub (if not already)
git add .
git commit -m "Prepare for production deployment"
git push origin main

# 2. In Railway Dashboard:
# - Connect GitHub repo
# - Railway will auto-detect Next.js
```

### Environment Variables

Set these in Railway → Variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | (Auto-set by Railway PostgreSQL) |
| `PAYLOAD_SECRET` | `openssl rand -base64 32` |
| `STRIPE_SECRET_KEY` | Client's `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | (Set after webhook creation) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client's `pk_live_...` |
| `RESEND_API_KEY` | Client's `re_...` |
| `ADMIN_EMAIL` | Client's email |
| `FROM_EMAIL` | `L. Ellis Designs <orders@domain.com>` |
| `PICKUP_ADDRESS` | Actual pickup address |
| `NEXT_PUBLIC_SITE_URL` | `https://domain.com` |

### Stripe Webhook Setup

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://domain.com/api/webhooks/stripe`
3. Select event: `checkout.session.completed`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### Domain DNS Configuration

Add these DNS records at registrar:

| Type | Name | Value |
|------|------|-------|
| CNAME | @ | Railway-provided URL |
| CNAME | www | Railway-provided URL |

Or use Railway's custom nameservers.

### Resend Domain Verification

Add DNS records Resend provides (typically TXT and MX records).

---

## Phase 4: Go-Live Verification

### Test Everything on Production

- [ ] Homepage loads
- [ ] All categories visible
- [ ] Products display correctly
- [ ] Cart persists items
- [ ] **Test purchase with real card** (small amount, can refund)
- [ ] Order appears in admin
- [ ] Email received (admin notification)
- [ ] Can update order status
- [ ] Customer emails send correctly
- [ ] Custom request form works
- [ ] Admin receives custom request notification

### Create Production Admin User

1. Visit `https://domain.com/admin`
2. Create first user form appears
3. Use client's email and strong password
4. Document password securely for client

### Initial Content Setup

- [ ] Verify logo displays correctly
- [ ] Add initial categories
- [ ] Add sample products (or help client add first batch)
- [ ] Configure site settings if needed

---

## Phase 5: Client Training & Handoff

### Training Session (~30 min)

**Order Management:**
- How to view new orders
- Status workflow (paid → production → ready/shipped)
- Sending pickup/shipping notifications
- Viewing order details

**Product Management:**
- Adding new buttons
- Creating categories
- Uploading images
- Setting prices and options

**Custom Requests:**
- Viewing new requests
- Updating quotes
- Converting to orders

### Documentation to Provide

- Admin login URL: `https://domain.com/admin`
- Admin credentials (securely)
- Your contact for support
- Monthly hosting cost and payment method

---

## Ongoing Management

### Your Responsibilities

- [ ] Set up monthly invoicing for hosting (~$75-100/mo suggested)
- [ ] Monitor Railway for issues
- [ ] Respond to support requests
- [ ] Apply security updates as needed

### Client Responsibilities

- [ ] Monitor orders daily
- [ ] Fulfill orders promptly
- [ ] Respond to custom requests
- [ ] Provide product photos/content
- [ ] Pay monthly hosting invoice

---

## Quick Reference

### Important URLs

| Environment | URL |
|-------------|-----|
| Production Site | `https://domain.com` |
| Production Admin | `https://domain.com/admin` |
| Railway Dashboard | `https://railway.app/project/xxx` |
| Stripe Dashboard | `https://dashboard.stripe.com` |
| Resend Dashboard | `https://resend.com/emails` |

### Emergency Contacts

- Railway Status: https://status.railway.app
- Stripe Status: https://status.stripe.com
- Your Contact: [your email/phone]

---

## Timeline Estimate

| Phase | Duration |
|-------|----------|
| Pre-meeting prep | 1-2 hours |
| Client meeting | 1-2 hours |
| Deployment | 2-3 hours |
| Testing & fixes | 1-2 hours |
| Training | 30-60 min |
| **Total** | **6-10 hours** |
