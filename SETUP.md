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
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Note: Pickup address is configured in Admin → Site Settings
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

## Part 2: Production Deployment (Vercel + Neon)

### Prerequisites

- Vercel account (vercel.com)
- Neon account (neon.tech) for PostgreSQL
- GitHub repository connected
- Domain name ready
- Client's Stripe account (live mode)
- Client's Resend account with verified domain

### 1. Neon Database Setup

1. Create new project in Neon
2. Create a database (e.g., `lellis_designs`)
3. Copy the connection string from the dashboard

### 2. Vercel Setup

1. Import project from GitHub in Vercel dashboard
2. Connect to your GitHub repository
3. Vercel will auto-detect Next.js

### 3. Vercel Blob Storage Setup

1. In Vercel Dashboard → Storage → Create Database
2. Select "Blob" → Create
3. Copy the `BLOB_READ_WRITE_TOKEN` from the `.env.local` tab

This stores all product images in Vercel's cloud (1GB free, then pay-as-you-go).

### 4. Environment Variables

In Vercel → Settings → Environment Variables, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Neon connection string | From Neon dashboard |
| `PAYLOAD_SECRET` | Generate new 32+ char string | **Different from dev** |
| `BLOB_READ_WRITE_TOKEN` | From Vercel Blob | **Required for images** |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Client's live key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Stripe dashboard |
| `RESEND_API_KEY` | `re_...` | Client's Resend key |
| `ADMIN_EMAIL` | Client's email | Order notifications |
| `FROM_EMAIL` | `Business <orders@domain.com>` | Verified in Resend |
| `NEXT_PUBLIC_SITE_URL` | `https://domain.com` | Production URL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Client's live key |

**Note:** Pickup address is configured in Admin → Site Settings, not as an environment variable.

### 5. Stripe Webhook (Production)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click **Add endpoint**
3. URL: `https://yourdomain.com/api/webhooks/stripe`
4. Events: Select `checkout.session.completed`
5. Copy **Signing secret** to `STRIPE_WEBHOOK_SECRET`

### 6. Domain Setup

1. Vercel → Settings → Domains
2. Add custom domain
3. Configure DNS:
   - CNAME record pointing to `cname.vercel-dns.com`
   - Or use Vercel's nameservers

### 7. First Deployment

Vercel auto-deploys on push to main branch. First deploy will:
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
   - You configure DNS to point to Vercel

### What You Manage

- Vercel hosting
- Neon database (automatic backups included)
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

- Create new Vercel project
- Create new Neon database
- Connect GitHub repo
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

### Build Failures on Vercel

1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Run `pnpm build` locally to catch errors

---

## Maintenance

### Regular Tasks

- Monitor order notifications
- Check error logs weekly
- Update dependencies monthly (`pnpm update`)
- Database backups (Neon handles this automatically)

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

Vercel auto-deploys on push to main.

---

## Part 6: Git Workflow

### Branch Strategy

```
main (production)
  └── develop (integration/staging)
        ├── feature/new-feature
        ├── fix/bug-description
        └── chore/maintenance-task
```

### Branch Purposes

| Branch | Purpose | Deploys To |
|--------|---------|------------|
| `main` | Production-ready code | lellisdesigns.com |
| `develop` | Integration/testing | Preview URL |
| `feature/*` | New features | PR preview |
| `fix/*` | Bug fixes | PR preview |

### Development Workflow

**1. Starting new work:**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/add-wishlist
```

**2. During development:**
```bash
# Make changes, commit often
git add <files>
git commit -m "Add wishlist button to product page"
```

**3. When ready for review:**
```bash
git push -u origin feature/add-wishlist
# Create PR to develop on GitHub
```

**4. After PR approval:**
- Merge PR into `develop`
- Test on preview deployment
- Delete feature branch

### Production Releases

When `develop` is tested and ready:

```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```

Or create a PR from `develop` → `main` for formal review.

### Rules

1. **Never push directly to `main`** - Always go through `develop`
2. **Keep `develop` deployable** - Don't merge broken code
3. **Small, focused PRs** - Easier to review and revert
4. **Delete merged branches** - Keep repo clean

### GitHub Branch Protection (Recommended)

**For `main` branch:**
- Require pull request before merging
- Require status checks to pass (Vercel build)
- No direct pushes

**For `develop` branch:**
- Require pull request before merging
- Allow squash merging

### Vercel Configuration

Vercel automatically creates preview deployments for:
- Every PR gets a unique preview URL
- `develop` branch can have a stable preview URL

Configure in Vercel → Settings → Git:
- Production Branch: `main`
- Preview Branches: All other branches
