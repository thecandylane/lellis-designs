# L. Ellis Designs - Production Setup Guide

## Prerequisites

- Supabase project created
- Stripe account (with test mode for development)
- Vercel account (or other hosting platform)

---

## 1. Database Setup

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text UNIQUE NOT NULL,
  stripe_payment_intent_id text,
  customer_email text NOT NULL,
  needed_by_date date NOT NULL,
  items jsonb NOT NULL,
  total_amount_cents integer NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'complete')),
  ambassador_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ambassadors table
CREATE TABLE ambassadors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  email text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Contact requests table
CREATE TABLE contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'responded')),
  created_at timestamptz DEFAULT now()
);

-- Performance indexes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_ambassador_code ON orders(ambassador_code);
CREATE INDEX idx_contact_requests_status ON contact_requests(status);
CREATE INDEX idx_ambassadors_code ON ambassadors(code);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
```

---

## 2. Create Admin User

1. Go to **Supabase Dashboard → Authentication → Users**
2. Click **Add User → Create New User**
3. Enter owner's email and a strong password
4. Save credentials securely

---

## 3. Environment Variables

### Required Variables

| Variable | Description | Where to find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase → Settings → API |
| `STRIPE_SECRET_KEY` | Stripe API secret key | Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Stripe → Developers → Webhooks |

### Local Development (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 4. Stripe Webhook Setup

### Local Development

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Linux: See https://stripe.com/docs/stripe-cli#install

# Login
stripe login

# Forward webhooks (keep this running while testing)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` secret to your `.env.local`

### Production

1. Deploy your app first
2. Go to **Stripe Dashboard → Developers → Webhooks**
3. Click **Add endpoint**
4. URL: `https://yourdomain.com/api/webhooks/stripe`
5. Events: Select `checkout.session.completed`
6. Click **Add endpoint**
7. Copy **Signing secret** to your production env vars

---

## 5. Deployment (Vercel)

### Initial Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Add Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Add all variables from section 3 for Production environment.

### Custom Domain

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Update DNS records as instructed

---

## 6. Post-Deployment Verification

### Auth Flow
- [ ] Visit `/admin` → redirected to `/admin/login`
- [ ] Login with admin credentials → redirected to dashboard
- [ ] Click Sign Out → redirected to login

### Order Flow
- [ ] Complete a test purchase (use Stripe test card `4242 4242 4242 4242`)
- [ ] Check Stripe Dashboard for successful payment
- [ ] Check `/admin/orders` for new order
- [ ] View order details
- [ ] Mark order as complete

### Product Management
- [ ] Create a new category
- [ ] Create a new button in that category
- [ ] Verify button appears on public site
- [ ] Edit button, toggle active off
- [ ] Verify button is hidden on public site

### Contact Form
- [ ] Submit contact form on `/contact`
- [ ] Check `/admin/requests` for new request
- [ ] Mark as responded

### Ambassador Tracking
- [ ] Create test ambassador in `/admin/ambassadors`
- [ ] Visit site with `?ref=testcode`
- [ ] Complete checkout
- [ ] Verify order shows ambassador code

---

## 7. Going Live Checklist

### Stripe
- [ ] Switch from test to live API keys
- [ ] Create production webhook endpoint
- [ ] Update `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in production

### Security
- [ ] Verify all admin routes require authentication
- [ ] Ensure service role key is never exposed client-side
- [ ] Set up Supabase email rate limiting (Auth → Settings)

### Monitoring
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Enable Vercel Analytics
- [ ] Set up uptime monitoring

### Backups
- [ ] Enable Supabase Point-in-Time Recovery (paid plans)
- [ ] Or schedule regular database exports

---

## 8. Maintenance

### Regular Tasks
- Check for new orders daily
- Respond to contact requests
- Review ambassador performance monthly

### Updates
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## Troubleshooting

### "Unauthorized" errors on admin pages
- Clear browser cookies and login again
- Check that admin user exists in Supabase Auth

### Webhook not receiving events
- Verify webhook URL is correct in Stripe Dashboard
- Check webhook signing secret matches
- Check Stripe webhook logs for errors

### Orders not appearing
- Check Stripe webhook logs
- Verify `checkout.session.completed` event is enabled
- Check Supabase logs for database errors

### Contact form not saving
- Verify `contact_requests` table exists
- Check browser console for errors
- Verify service role key is set

---

## Support

For issues with:
- **Supabase**: https://supabase.com/docs
- **Stripe**: https://stripe.com/docs
- **Next.js**: https://nextjs.org/docs
- **Vercel**: https://vercel.com/docs
