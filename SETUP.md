# Development & Deployment Guide

This guide covers local development setup and production deployment. Use this as a template for similar e-commerce projects.

---

## Part 1: Local Development

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker (for PostgreSQL)
- Stripe CLI (for webhook testing)

### 1. Database Setup

```bash
# Create and start PostgreSQL container
docker run -d --name lellis-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lellis_designs \
  -p 5432:5432 \
  postgres:16

# Verify it's running
docker ps
```

**Managing the database:**
```bash
docker start lellis-postgres   # Start
docker stop lellis-postgres    # Stop
docker logs lellis-postgres    # View logs
```

### 2. Environment Configuration

Create `.env.local`:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lellis_designs

# Payload CMS (generate a random string)
PAYLOAD_SECRET=generate-a-random-32-char-string-here

# Stripe (use test keys for development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe CLI

# Email (Resend)
RESEND_API_KEY=re_...
ADMIN_EMAIL=your@email.com
FROM_EMAIL=Your Business <onboarding@resend.dev>

# Optional
PICKUP_ADDRESS=123 Main St, City, ST 12345
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Install & Run

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit http://localhost:3000/admin to create your first admin user.

### 4. Stripe Webhook Testing

In a separate terminal:

```bash
# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` secret to `STRIPE_WEBHOOK_SECRET` in `.env.local`.

**Test cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry, any CVC

---

## Part 2: Production Deployment (Railway)

### Prerequisites

- Railway account (railway.app)
- GitHub repository connected
- Domain name ready
- Client's Stripe account (live mode)
- Client's Resend account with verified domain

### 1. Railway Setup

1. Create new project in Railway
2. Add **PostgreSQL** service
3. Add **GitHub Repo** service (your repo)

### 2. Environment Variables

In Railway → Variables, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Auto-set by Railway | PostgreSQL connection |
| `PAYLOAD_SECRET` | Generate new 32+ char string | **Different from dev** |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Client's live key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Stripe dashboard |
| `RESEND_API_KEY` | `re_...` | Client's Resend key |
| `ADMIN_EMAIL` | Client's email | Order notifications |
| `FROM_EMAIL` | `Business <orders@domain.com>` | Verified in Resend |
| `PICKUP_ADDRESS` | Full address | For pickup orders |
| `NEXT_PUBLIC_SITE_URL` | `https://domain.com` | Production URL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Client's live key |

### 3. Stripe Webhook (Production)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click **Add endpoint**
3. URL: `https://yourdomain.com/api/webhooks/stripe`
4. Events: Select `checkout.session.completed`
5. Copy **Signing secret** to `STRIPE_WEBHOOK_SECRET`

### 4. Domain Setup

1. Railway → Settings → Domains
2. Add custom domain
3. Configure DNS:
   - CNAME record pointing to Railway URL
   - Or use Railway's nameservers

### 5. First Deployment

Railway auto-deploys on push to main branch. First deploy will:
- Run database migrations automatically
- Build the Next.js app
- Start the server

Visit `/admin` to create the production admin user.

---

## Part 3: Post-Deployment Checklist

### Verify Core Flows

- [ ] Homepage loads correctly
- [ ] Categories display products
- [ ] Add to cart works
- [ ] Checkout completes (test with Stripe test mode first if needed)
- [ ] Order appears in admin
- [ ] Order status updates work
- [ ] Emails send correctly

### Admin Setup

- [ ] Create admin user at `/admin`
- [ ] Add root categories (cities/regions)
- [ ] Add subcategories (schools/teams)
- [ ] Upload initial products
- [ ] Configure site settings (colors, business info)

### Security Checklist

- [ ] PAYLOAD_SECRET is unique and secure
- [ ] All API routes require auth where needed
- [ ] CORS configured for production domain
- [ ] Rate limiting considered for public endpoints

---

## Part 4: Client Handoff

### Accounts Client Needs to Create

1. **Stripe Account**
   - Client creates at stripe.com
   - Verify business information
   - Get live API keys

2. **Resend Account**
   - Client creates at resend.com
   - Add and verify their domain
   - Get API key

3. **Domain Registration**
   - Client purchases domain (Namecheap, Google Domains, etc.)
   - You configure DNS to point to Railway

### What You Manage

- Railway hosting (bill client monthly)
- Database backups
- Code updates and maintenance

### Client Training

Provide walkthrough of:
- `/admin` - Payload CMS for content
- `/admin/orders` - Order fulfillment
- `/admin/requests` - Custom quote requests
- How to mark orders ready/shipped
- How to add new products and categories

---

## Part 5: Replication Template

To create a similar site for another client:

### 1. Fork/Copy Repository

```bash
# Clone this project
git clone <this-repo> new-client-name
cd new-client-name

# Remove git history, start fresh
rm -rf .git
git init
```

### 2. Customize for Client

Files to update:
- `app/page.tsx` - Homepage content, branding
- `app/globals.css` - Brand colors (CSS variables)
- `public/logo.png` - Client logo
- `lib/store.ts` - Pricing tiers
- `lib/email.ts` - Email templates
- `payload.config.ts` - Admin branding
- `.env.local` - All environment variables

### 3. Database

Create new PostgreSQL instance:
```bash
docker run -d --name newclient-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=newclient_db \
  -p 5433:5432 \  # Different port
  postgres:16
```

### 4. Stripe & Resend

- Create new Stripe account or use client's
- Set up new Resend domain
- Update webhook endpoints

### 5. Deploy

- Create new Railway project
- Connect new GitHub repo
- Configure environment variables
- Add custom domain

---

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View PostgreSQL logs
docker logs lellis-postgres

# Connect directly to verify
docker exec -it lellis-postgres psql -U postgres -d lellis_designs
```

### Webhook Not Receiving Events

1. Check Stripe CLI is running (dev) or webhook URL is correct (prod)
2. Verify `STRIPE_WEBHOOK_SECRET` matches
3. Check Stripe Dashboard → Webhooks → Recent Events for errors

### Emails Not Sending

1. Verify `RESEND_API_KEY` is set
2. Check domain is verified in Resend (production)
3. For dev, use `onboarding@resend.dev` as FROM_EMAIL

### Build Failures on Railway

1. Check build logs in Railway dashboard
2. Ensure all environment variables are set
3. Run `pnpm build` locally to catch errors

---

## Maintenance

### Regular Tasks

- Monitor order notifications
- Check error logs weekly
- Update dependencies monthly (`pnpm update`)
- Database backups (Railway handles this)

### Updating the Site

```bash
# Make changes locally
pnpm dev

# Test thoroughly
pnpm build

# Push to deploy
git add .
git commit -m "Description of changes"
git push
```

Railway auto-deploys on push to main.
