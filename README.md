# L. Ellis Designs

Custom 3" button e-commerce platform built for a Louisiana-based small business.

## Features

- **Product Catalog** - Hierarchical categories with unlimited nesting (City → School → Team)
- **Shopping Cart** - Persistent cart with bulk pricing ($5 each, $4/ea at 5+, $4.50/ea at 100+, $4/ea at 200+)
- **Stripe Checkout** - Secure payments with automatic order creation
- **Custom Requests** - Quote request form for custom button designs with image uploads
- **Order Management** - Admin dashboard with status workflow (paid → production → ready/shipped → completed)
- **Email Notifications** - Automated emails for order confirmation, ready for pickup, and shipping
- **Local Pickup + Shipping** - Free local pickup (Baton Rouge) or $8 flat-rate UPS shipping

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| CMS | Payload CMS 3 (embedded) |
| Database | PostgreSQL |
| Styling | Tailwind CSS 4 |
| Payments | Stripe Checkout |
| Email | Resend |
| State | Zustand |

## Quick Start

```bash
# Install dependencies
pnpm install

# Start PostgreSQL (Docker)
docker run -d --name lellis-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lellis_designs \
  -p 5432:5432 postgres:16

# Copy environment file and configure
cp .env.example .env.local
# Edit .env.local with your keys

# Start development server
pnpm dev
```

Visit http://localhost:3000 - the site will be ready.

For first-time setup, visit http://localhost:3000/admin to create your admin user.

## Environment Variables

```env
# Required
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lellis_designs
PAYLOAD_SECRET=your-random-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...

# Optional
ADMIN_EMAIL=orders@yourdomain.com
FROM_EMAIL=Your Business <orders@yourdomain.com>
PICKUP_ADDRESS=123 Main St, City, ST 12345
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Project Structure

```
├── app/                    # Next.js pages and routes
│   ├── (payload)/admin/    # Payload CMS admin UI
│   ├── admin/(dashboard)/  # Custom admin pages
│   ├── api/                # API routes (checkout, webhooks)
│   ├── cart/               # Shopping cart
│   ├── category/           # Product browsing
│   └── custom-request/     # Quote request form
├── collections/            # Payload CMS schemas
├── components/             # React components
├── lib/                    # Utilities and configuration
└── payload.config.ts       # Payload configuration
```

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Technical documentation for AI agents and developers
- **[SETUP.md](./SETUP.md)** - Development setup and deployment guide

## License

Private - All rights reserved.
