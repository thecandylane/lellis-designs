# L. Ellis Designs - Launch Meeting Checklist

## Before the Meeting (Your Prep Work)

### Technical Verification
- [ ] Visit https://lellis-designs.vercel.app and verify site loads
- [ ] Test checkout flow with test card `4242 4242 4242 4242`
- [ ] Verify order appears in admin panel
- [ ] Test mobile responsiveness (scrolling, tapping buttons)
- [ ] Verify favicon shows in browser tab (use incognito window)
- [ ] Log into admin at `/admin` - create your test admin account if needed

### Documents to Have Ready
- [ ] This checklist (printed or on screen)
- [ ] `docs/OWNER-GUIDE.md` (for handoff)
- [ ] `docs/QUICK-REFERENCE.md` (print for client)

### Information to Collect FROM Client
| Info Needed | Example | Notes |
|-------------|---------|-------|
| Desired domain name | lellisdesigns.com | Check availability beforehand |
| Business email | lauren@lellisdesigns.com | For admin login & notifications |
| Phone number | (225) 555-1234 | For Stripe verification |
| Bank account info | Routing + Account # | For Stripe payouts |
| EIN or SSN | For Stripe | Business or personal tax ID |
| Pickup address | 123 Main St, Baton Rouge | For "ready for pickup" emails |
| Admin password | Their choice | Secure, memorable |

---

## During the Meeting

### Step 1: Domain Purchase (~10 min)
**Client does this (you guide):**

1. Go to [Namecheap](https://namecheap.com) or [Google Domains](https://domains.google)
2. Search for desired domain (e.g., `lellisdesigns.com`)
3. Purchase domain (~$12/year)
4. **Save the login credentials** - they'll need to renew yearly

**You note down:**
- [ ] Domain name purchased: _______________________
- [ ] Registrar used: _______________________

---

### Step 2: Connect Domain to Vercel (~5 min)
**You do this:**

1. Go to [Vercel Dashboard](https://vercel.com) → lellis-designs project
2. Settings → Domains → Add domain
3. Enter the purchased domain
4. Vercel will show DNS records to add

**Client does this (at their domain registrar):**

1. Go to domain registrar → DNS settings
2. Add the records Vercel shows:
   - Type: `A` Record → `76.76.21.21`
   - Type: `CNAME` → `cname.vercel-dns.com`
3. Wait for propagation (usually 5-30 min)

- [ ] Domain connected and verified in Vercel

---

### Step 3: Create Stripe Account (~15 min)
**Client does this (you guide):**

1. Go to [Stripe](https://stripe.com) → Create account
2. Use business email for login
3. Complete business verification:
   - Business type (likely "Individual/Sole Proprietor")
   - Business name: "L. Ellis Designs"
   - Business address
   - EIN or SSN
   - Bank account for payouts
4. Once verified, go to Developers → API Keys

**You note down:**
- [ ] Publishable key (starts with `pk_live_`): _______________________
- [ ] Secret key (starts with `sk_live_`): _______________________

---

### Step 4: Create Stripe Webhook (~5 min)
**You do this in Stripe Dashboard:**

1. Go to Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://[their-domain]/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
4. Create webhook
5. Copy the webhook signing secret

- [ ] Webhook secret (starts with `whsec_`): _______________________

---

### Step 5: Create Resend Account (~5 min)
**Client does this (you guide):**

1. Go to [Resend](https://resend.com) → Sign up
2. Verify email
3. Go to API Keys → Create API Key
4. **Domain verification** (for custom sender):
   - Add domain → Follow DNS instructions
   - Or use `onboarding@resend.dev` temporarily

**You note down:**
- [ ] Resend API key (starts with `re_`): _______________________

---

### Step 6: Update Vercel Environment Variables (~5 min)
**You do this:**

Go to Vercel → lellis-designs → Settings → Environment Variables

Update these values with PRODUCTION keys:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `RESEND_API_KEY` | `re_...` |
| `ADMIN_EMAIL` | client's email |
| `FROM_EMAIL` | `L. Ellis Designs <orders@lellisdesigns.com>` |
| `NEXT_PUBLIC_SITE_URL` | `https://lellisdesigns.com` |

**Note:** Pickup address is set in Admin → Site Settings (not an env variable).

- [ ] All environment variables updated
- [ ] Triggered redeploy in Vercel

---

### Step 7: Create Admin Account (~2 min)
**Client does this (you guide):**

1. Go to `https://[their-domain]/admin`
2. First user registration:
   - Email: their business email
   - Password: their secure password
3. Log in and explore

- [ ] Admin account created
- [ ] Client can log in

---

### Step 8: Add Initial Content (~15 min)
**Client does this (you guide):**

Walk them through adding:
1. **One root category** (e.g., "Baton Rouge")
2. **One subcategory** (e.g., "LSU")
3. **One button** with image

Show them:
- How to upload images
- How to set category colors
- How to mark buttons as active

- [ ] Test category created
- [ ] Test button created
- [ ] Client understands the process

---

### Step 9: Test Live Payment (~5 min)
**You do this (with client watching):**

1. Add a button to cart
2. Complete checkout with a REAL card (small amount)
3. Verify:
   - Payment appears in Stripe Dashboard
   - Order appears in admin panel
   - Confirmation email received
4. **Refund the test payment** in Stripe Dashboard

- [ ] Live payment successful
- [ ] Order created in system
- [ ] Emails sent correctly
- [ ] Test payment refunded

---

### Step 10: Training Walkthrough (~10 min)
**Cover these with client:**

- [ ] How to view and process orders
- [ ] How to mark orders "Ready" (pickup) vs "Shipped" (UPS)
- [ ] How to add new buttons
- [ ] How to add new categories
- [ ] How to respond to custom requests
- [ ] Where to check Stripe for payments/payouts

---

## After the Meeting

### Your Follow-up Tasks
- [ ] Send client the `OWNER-GUIDE.md` document via email
- [ ] Verify DNS propagation complete (site loads on their domain)
- [ ] Remove test content (or leave for their reference)
- [ ] Delete your test admin account (client should have their own)
- [ ] Monitor for any errors in Vercel logs for first 24 hours

### Client's First Week Tasks
Share this list with them:

- [ ] Add all root categories (cities/regions)
- [ ] Add subcategories (schools, events)
- [ ] Upload button inventory with photos
- [ ] Set category colors to match schools/themes
- [ ] Do a test order themselves to understand the flow
- [ ] Set up Stripe mobile app for payment notifications

---

## Emergency Contacts

| Issue | Where to Look |
|-------|---------------|
| Website down | Vercel Dashboard → Deployments |
| Payment issues | Stripe Dashboard → Payments |
| Email not sending | Resend Dashboard → Emails |
| Domain issues | Domain registrar account |

---

## Credentials Summary (Fill During Meeting)

```
DOMAIN
  Registrar: _______________________
  Domain: _______________________
  Login email: _______________________

STRIPE
  Login email: _______________________
  Publishable key: pk_live_...
  Secret key: sk_live_...
  Webhook secret: whsec_...

RESEND
  Login email: _______________________
  API key: re_...

ADMIN PANEL
  URL: https://[domain]/admin
  Email: _______________________
  Password: (client knows)
```

**Keep this document secure - it contains sensitive access information.**
