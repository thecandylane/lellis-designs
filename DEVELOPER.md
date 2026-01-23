# Developer Guide

Technical documentation for the L. Ellis Designs codebase.

## Project Overview

L. Ellis Designs - An e-commerce site for custom 3" buttons. Louisiana-based business with pricing of $5 each or 5 for $20.

## Commands

```bash
pnpm run dev      # Start development server (http://localhost:3000)
pnpm run build    # Production build
pnpm run start    # Start production server
pnpm run lint     # Run ESLint (eslint-config-next with TypeScript)
```

## Tech Stack

- **Framework**: Next.js 16.1.2 with App Router
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4 with shadcn-style CSS variables
- **CMS**: Payload CMS 3 (embedded in Next.js)
- **Database**: PostgreSQL (via Payload's postgres adapter)
- **Payments**: Stripe 20.1.2 (API version 2025-12-15.clover)
- **State Management**: Zustand 5 with persist middleware
- **Icons**: Lucide React
- **Email**: Resend 6.8.0

## Architecture

### Directory Structure
- `app/` - Next.js App Router pages and layouts
  - `(payload)/admin/` - Payload CMS admin UI
  - `admin/(dashboard)/` - Custom admin pages (dashboard, orders)
- `collections/` - Payload CMS collection schemas
- `globals/` - Payload CMS global schemas
- `components/` - React components (`ui/` for reusable, `cart/` for cart-specific)
- `lib/` - Shared utilities and configuration
  - `payload.ts` - Payload client helper
  - `store.ts` - Zustand cart store with localStorage persistence
  - `categories.ts` - Category utility functions for hierarchical navigation
  - `stripe.ts` - Stripe SDK instance
  - `email.ts` - Email templates and sending logic
  - `auth.ts` - Authentication utilities
  - `utils.ts` - Utility functions (cn for className merging)
  - `types/` - TypeScript type definitions
- `payload.config.ts` - Main Payload configuration

### Path Aliases
- `@/*` maps to project root (configured in tsconfig.json)
- `@payload-config` maps to `./payload.config.ts`

### Environment Variables Required
```
# Database (Payload CMS)
DATABASE_URL               # PostgreSQL connection string

# Payload CMS
PAYLOAD_SECRET             # Secret key for Payload auth (generate random string)

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# Email (Resend)
RESEND_API_KEY              # Get from resend.com
ADMIN_EMAIL                 # Where order notifications go (default: orders@lellisdesigns.com)
FROM_EMAIL                  # Sender address (default: L. Ellis Designs <orders@lellisdesigns.com>)

# Cloud Storage (Vercel Blob - required for production)
BLOB_READ_WRITE_TOKEN       # Get from Vercel Dashboard > Storage > Create Blob Store

# Optional
PICKUP_ADDRESS              # Default pickup address for "ready" emails
NEXT_PUBLIC_SITE_URL        # Production URL for email links
```

### Data Model (Payload Collections)
- **Users** - Admin users (Payload auth)
- **Media** - Image uploads with automatic optimization
- **Categories** - Hierarchical categories with self-referential parent relationship
- **Buttons** - Button products with image, price, customization options
- **Orders** - Customer orders with status workflow
- **CustomRequests** - Quote requests for custom orders
- **Ambassadors** - Referral partners with unique codes
- **ContactRequests** - Contact form submissions

### Globals
- **SiteSettings** - Brand colors, business info, pricing configuration

### Admin Routes
- `/admin` - Payload CMS admin UI (content management)
- `/admin/dashboard` - Custom dashboard with stats
- `/admin/orders` - Custom order management with status workflow
- `/admin/collections/*` - Payload admin for each collection
- `/admin/globals/site-settings` - Site settings editor

## Hierarchical Categories

Categories support unlimited nesting via `parent` relationship. Examples:
- Baton Rouge → LSU → Football
- Baton Rouge → LSU → Chi-O
- Oxford → Ole Miss → Chi-O (separate from LSU's Chi-O)

### Key Files
- `lib/categories.ts` - Utility functions:
  - `getRootCategories()` - Fetch categories where parent is null
  - `getChildCategories(parentId)` - Fetch direct children
  - `getCategoryByPath(slugPath[])` - Resolve `/baton-rouge/lsu/football` to category
  - `getCategoryTree()` - Build full tree for admin
  - `buildBreadcrumbs(category)` - Generate breadcrumb items

- `app/category/[...slug]/page.tsx` - Catch-all route supporting nested paths
- `components/ui/CategoryBreadcrumb.tsx` - Breadcrumb navigation
- `components/ui/CategoryCard.tsx` - Category cards with folder icons
- `components/ui/CategoryGrid.tsx` - Responsive grid of categories

### Category Types
```typescript
type Category = {
  id: string
  name: string
  slug: string
  parent_id: string | null     // null = root category
  sort_order: number
  active: boolean
  color_primary: string | null   // Hex color (e.g., "#6B2D5B" for purple)
  color_secondary: string | null // Hex color for accent
  background_image: string | null
}

type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[]
}

type CategoryWithAncestors = Category & {
  ancestors: Category[]
}
```

### Category Colors
Categories can have custom colors set in Payload admin. Colors are:
- **Inherited**: If a category doesn't have colors, it inherits from nearest ancestor
- **Dynamic**: The category page header, cards, and buttons all adapt to the category's colors
- **Admin-controlled**: Full color picker in Payload admin

## Shipping & Delivery

### Delivery Methods
- **Local Pickup** (FREE) - Baton Rouge area. Address is NOT revealed until admin marks order as "ready"
- **UPS Shipping** ($8 flat rate) - Stripe collects shipping address during checkout

### Order Status Flow
```
pending → paid → production → ready (pickup) or shipped (UPS) → completed
```

### Admin Actions
- **Mark as Ready** (pickup orders): Prompts for pickup address, sends email to customer with location
- **Mark as Shipped** (UPS orders): Prompts for tracking number, sends email with UPS tracking link

## Email Notifications

Uses **Resend** for transactional emails. Requires `RESEND_API_KEY` environment variable.

### Email Types
1. **Order Confirmation** - Sent to customer when order is placed
2. **Admin Notification** - Sent to `ADMIN_EMAIL` when new order comes in
3. **Ready for Pickup** - Sent to customer with pickup address (only for pickup orders)
4. **Shipped** - Sent to customer with UPS tracking number (only for UPS orders)

### Key File
- `lib/email.ts` - All email templates and sending logic

## Stripe Checkout Flow

### Flow Overview
1. **Cart Page** (`/cart`) - Collects email, needed-by date, shipping method, cart items
2. **Checkout API** (`/api/checkout`) - Creates Stripe checkout session with line items, shipping, and metadata
3. **Stripe Hosted Checkout** - Customer pays (and enters shipping address if UPS)
4. **Success Page** (`/checkout/success`) - Clears cart, shows confirmation
5. **Webhook** (`/api/webhooks/stripe`) - Creates order in Payload, sends confirmation emails

### Key Files
- `app/cart/page.tsx` - Cart UI and checkout initiation
- `app/api/checkout/route.ts` - Creates Stripe session with bulk pricing logic
- `app/api/webhooks/stripe/route.ts` - Handles Stripe webhook, creates order in Payload
- `app/checkout/success/page.tsx` - Post-checkout confirmation

### Local Testing with Stripe CLI
```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Update STRIPE_WEBHOOK_SECRET in .env.local with the CLI-provided secret
```

### Test Card Numbers
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry (e.g., `12/34`), any CVC (e.g., `123`)

## Theming

Uses CSS variables for consistent theming (defined in `app/globals.css`):
- Primary color: rose-500 (`--primary: 350 89% 60%`)
- Uses shadcn-style color system with semantic tokens (background, foreground, card, muted, etc.)
- Theme colors can be configured in Payload admin via Site Settings global

## Development Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in values
3. Run `pnpm install`
4. Ensure PostgreSQL is running and `DATABASE_URL` is set
5. Run `pnpm dev` to start development server
6. Access `/admin` to create first admin user and set up content

## Vercel Deployment

This project is deployed on Vercel with Neon PostgreSQL:
- **Hosting**: Vercel (auto-deploys from GitHub main branch)
- **Database**: Neon PostgreSQL (serverless)
- **Domain**: https://lellis-designs.vercel.app
- Configure environment variables in Vercel dashboard
- Payload will auto-run migrations on first start
