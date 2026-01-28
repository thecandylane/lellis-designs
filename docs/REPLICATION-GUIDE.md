# E-Commerce Site Replication Guide

> A comprehensive guide to recreate this e-commerce platform for a new business. This document contains all technical specifications, dependencies, database schemas, and configuration details needed to bootstrap a new project.

---

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [External Services Required](#external-services-required)
3. [Dependencies](#dependencies)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Environment Variables](#environment-variables)
7. [API Routes](#api-routes)
8. [Core Features](#core-features)
9. [Email Templates](#email-templates)
10. [Admin Dashboard](#admin-dashboard)
11. [Setup Instructions](#setup-instructions)
12. [Security Considerations](#security-considerations)

---

## Tech Stack Overview

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 16+ (App Router) | Full-stack React framework with server components |
| **Language** | TypeScript 5 | Type-safe JavaScript |
| **CMS** | Payload CMS 3.0 | Headless CMS with embedded admin panel |
| **Database** | PostgreSQL (Neon) | Relational database with auto-scaling |
| **Payments** | Stripe | Checkout sessions, webhooks, automatic tax |
| **Email** | Resend | Transactional emails |
| **Hosting** | Vercel | Edge deployment with serverless functions |
| **Media Storage** | Vercel Blob | Cloud image storage |
| **State Management** | Zustand | Client-side cart persistence |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **UI Components** | shadcn/ui + Radix UI | Accessible component library |
| **Animations** | Framer Motion, GSAP | Smooth animations and transitions |

---

## External Services Required

### 1. Neon (PostgreSQL Database)
- **URL**: https://neon.tech
- **Free tier**: 0.5 GB storage, 1 compute hour/month
- **Setup**: Create project → Copy connection string
- **Features used**: Auto-suspend, branching for development

### 2. Stripe (Payments)
- **URL**: https://stripe.com
- **Setup**:
  1. Create account and verify business
  2. Enable automatic tax collection in settings
  3. Get API keys (test + live)
  4. Create webhook endpoint pointing to `/api/webhooks/stripe`
  5. Subscribe to `checkout.session.completed` event
- **Features used**: Checkout Sessions, Webhooks, Automatic Tax

### 3. Vercel (Hosting)
- **URL**: https://vercel.com
- **Setup**: Connect GitHub repo → Auto-deploy on push
- **Features used**: Edge deployment, Blob storage, Environment variables

### 4. Resend (Email)
- **URL**: https://resend.com
- **Free tier**: 3,000 emails/month
- **Setup**:
  1. Create account
  2. Verify sending domain (DNS records)
  3. Get API key
- **Features used**: Transactional emails, HTML templates

---

## Dependencies

### package.json

```json
{
  "name": "cookie-business-ecommerce",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "payload": "payload",
    "generate:types": "payload generate:types"
  },
  "dependencies": {
    "@payloadcms/db-postgres": "^3.0.0",
    "@payloadcms/next": "^3.0.0",
    "@payloadcms/richtext-lexical": "^3.0.0",
    "@payloadcms/storage-vercel-blob": "^3.0.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "date-fns": "^4.1.0",
    "dotenv": "^17.2.0",
    "embla-carousel-react": "^8.5.0",
    "framer-motion": "^12.0.0",
    "gsap": "^3.14.0",
    "lucide-react": "^0.400.0",
    "next": "^16.0.0",
    "next-themes": "^0.4.0",
    "payload": "^3.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-icons": "^5.4.0",
    "resend": "^6.0.0",
    "sharp": "^0.33.0",
    "sonner": "^2.0.0",
    "stripe": "^20.0.0",
    "tailwind-merge": "^2.7.0",
    "three": "^0.180.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.0.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "bcryptjs": "^3.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.0.0",
    "postcss": "^4.0.0",
    "shadcn": "^3.0.0",
    "tailwindcss": "^4.0.0",
    "tsx": "^4.0.0",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### shadcn/ui Components to Install

```bash
npx shadcn@latest init
npx shadcn@latest add button badge separator sheet select carousel skeleton dialog label avatar tabs card input textarea
```

---

## Project Structure

```
project-root/
├── app/
│   ├── (payload)/
│   │   └── admin/[[...segments]]/   # Payload CMS admin UI
│   │       ├── page.tsx
│   │       └── not-found.tsx
│   ├── admin/                        # Custom admin dashboard
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx           # Admin layout with sidebar
│   │   │   ├── page.tsx             # Dashboard home
│   │   │   ├── orders/page.tsx      # Order management
│   │   │   ├── products/page.tsx    # Product management
│   │   │   ├── categories/page.tsx  # Category management
│   │   │   ├── settings/page.tsx    # Site settings
│   │   │   ├── requests/page.tsx    # Custom requests & contact
│   │   │   └── upload/page.tsx      # Bulk upload
│   │   └── login/page.tsx           # Admin login
│   ├── api/
│   │   ├── checkout/route.ts        # Create Stripe session
│   │   ├── webhooks/
│   │   │   └── stripe/route.ts      # Stripe webhook handler
│   │   ├── admin/
│   │   │   ├── stats/route.ts       # Dashboard statistics
│   │   │   ├── orders/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── status/route.ts
│   │   │   ├── products/
│   │   │   │   ├── route.ts
│   │   │   │   ├── bulk/route.ts
│   │   │   │   └── reorder/route.ts
│   │   │   ├── categories/
│   │   │   │   └── reorder/route.ts
│   │   │   ├── custom-requests/
│   │   │   │   └── [id]/
│   │   │   │       ├── convert-to-order/route.ts
│   │   │   │       └── cancel-order/route.ts
│   │   │   └── media/upload/route.ts
│   │   ├── products/route.ts
│   │   ├── categories/route.ts
│   │   ├── contact/route.ts
│   │   ├── custom-request/route.ts
│   │   └── settings/pricing/route.ts
│   ├── cart/page.tsx                 # Shopping cart
│   ├── category/[slug]/page.tsx      # Category listing
│   ├── checkout/
│   │   └── success/page.tsx          # Post-payment success
│   ├── contact/page.tsx              # Contact form
│   ├── custom-request/page.tsx       # Custom order form
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Homepage
│   └── globals.css                   # Global styles
├── collections/                       # Payload CMS schemas
│   ├── Users.ts
│   ├── Media.ts
│   ├── Categories.ts
│   ├── Products.ts                   # (Buttons.ts equivalent)
│   ├── Orders.ts
│   ├── CustomRequests.ts
│   ├── ContactRequests.ts
│   ├── Ambassadors.ts
│   └── index.ts
├── globals/                          # Payload CMS globals
│   ├── SiteSettings.ts
│   └── index.ts
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── admin/                        # Admin-specific components
│   ├── home/                         # Homepage components
│   └── cart/                         # Cart components
├── lib/
│   ├── stripe.ts                     # Stripe client
│   ├── email.ts                      # Email templates
│   ├── payload.ts                    # Payload client
│   ├── auth.ts                       # Auth utilities
│   ├── store.ts                      # Zustand cart store
│   ├── theme.ts                      # Theme management
│   ├── utils.ts                      # General utilities
│   └── types/
│       └── payload-types.ts          # Generated types
├── public/                           # Static assets
├── payload.config.ts                 # Payload CMS config
├── next.config.ts                    # Next.js config
├── tsconfig.json
└── .env.example
```

---

## Database Schema

### Users Collection (Admin Authentication)

```typescript
// collections/Users.ts
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true, // Enables Payload authentication
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      defaultValue: 'editor',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
    },
  ],
}
```

### Media Collection (Image Uploads)

```typescript
// collections/Media.ts
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    imageSizes: [
      { name: 'thumbnail', width: 200, height: 200, position: 'centre' },
      { name: 'card', width: 400, height: 400, position: 'centre' },
      { name: 'full', width: 1200, height: undefined, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
```

### Categories Collection (Hierarchical)

```typescript
// collections/Categories.ts
import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'textarea' },
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] },
    { name: 'aliases', type: 'array', fields: [{ name: 'alias', type: 'text' }] },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
    },
    { name: 'colorPrimary', type: 'text', admin: { description: 'Hex color code' } },
    { name: 'colorSecondary', type: 'text' },
    { name: 'icon', type: 'upload', relationTo: 'media' },
    { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    { name: 'active', type: 'checkbox', defaultValue: true },
    { name: 'featured', type: 'checkbox', defaultValue: false },
  ],
  hooks: {
    beforeChange: [
      // Auto-generate slug from name
      // Validate unique slug within parent
    ],
  },
}
```

### Products Collection

```typescript
// collections/Products.ts
import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'active'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true, index: true },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
    },
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] },
    { name: 'price', type: 'number', defaultValue: 5, min: 0 },
    { name: 'leadTimeDays', type: 'number', defaultValue: 7 },
    {
      name: 'customization',
      type: 'select',
      options: [
        { label: 'As Is', value: 'as_is' },
        { label: 'Customizable', value: 'customizable' },
      ],
      defaultValue: 'as_is',
    },
    { name: 'active', type: 'checkbox', defaultValue: true, index: true },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    { name: 'sku', type: 'text', unique: true },
  ],
}
```

### Orders Collection

```typescript
// collections/Orders.ts
import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'customerEmail',
    defaultColumns: ['id', 'customerEmail', 'status', 'total', 'createdAt'],
  },
  access: {
    create: () => true, // Webhook creates orders
    read: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'orderType',
      type: 'select',
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: 'standard',
    },
    {
      name: 'customRequestId',
      type: 'relationship',
      relationTo: 'custom-requests',
      hasMany: false,
    },
    {
      name: 'paymentMethod',
      type: 'select',
      options: [
        { label: 'Stripe', value: 'stripe' },
        { label: 'Cash', value: 'cash' },
        { label: 'Venmo', value: 'venmo' },
        { label: 'Check', value: 'check' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'stripe',
    },
    { name: 'stripeSessionId', type: 'text', admin: { readOnly: true } },
    { name: 'customerEmail', type: 'email', required: true },
    { name: 'customerName', type: 'text' },
    { name: 'customerPhone', type: 'text' },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Production', value: 'production' },
        { label: 'Ready', value: 'ready' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Completed', value: 'completed' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'shippingMethod',
      type: 'select',
      options: [
        { label: 'Local Pickup', value: 'pickup' },
        { label: 'UPS Shipping', value: 'ups' },
      ],
      defaultValue: 'pickup',
    },
    { name: 'shippingAddress', type: 'json' },
    { name: 'trackingNumber', type: 'text' },
    { name: 'items', type: 'json', required: true },
    { name: 'subtotal', type: 'number' },
    { name: 'shippingCost', type: 'number', defaultValue: 0 },
    { name: 'total', type: 'number', required: true },
    { name: 'neededByDate', type: 'date' },
    { name: 'productionDeadline', type: 'date' },
    { name: 'ambassadorCode', type: 'text' },
    { name: 'notes', type: 'textarea' },
  ],
  defaultSort: '-createdAt',
}
```

### Custom Requests Collection

```typescript
// collections/CustomRequests.ts
import type { CollectionConfig } from 'payload'

export const CustomRequests: CollectionConfig = {
  slug: 'custom-requests',
  admin: {
    useAsTitle: 'customerName',
  },
  access: {
    create: () => true,
    read: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    // Customer Info
    { name: 'customerName', type: 'text', required: true },
    { name: 'customerEmail', type: 'email', required: true },
    { name: 'customerPhone', type: 'text', required: true },
    {
      name: 'preferredContact',
      type: 'select',
      options: ['email', 'phone', 'text'],
      defaultValue: 'email',
    },
    // Status
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Approved', value: 'approved' },
        { label: 'Production', value: 'production' },
        { label: 'Completed', value: 'completed' },
        { label: 'Declined', value: 'declined' },
      ],
      defaultValue: 'new',
    },
    { name: 'isRush', type: 'checkbox', defaultValue: false },
    // Design Details
    {
      name: 'designDetails',
      type: 'group',
      fields: [
        { name: 'description', type: 'textarea' },
        { name: 'eventType', type: 'text' },
        { name: 'colorPreferences', type: 'text' },
      ],
    },
    // Text Options
    {
      name: 'textOptions',
      type: 'group',
      fields: [
        {
          name: 'wantsText',
          type: 'select',
          options: ['no', 'yes', 'help'],
          defaultValue: 'no',
        },
        { name: 'textContent', type: 'textarea' },
        {
          name: 'fontPreference',
          type: 'select',
          options: ['none', 'bold', 'script', 'playful', 'elegant', 'modern'],
        },
      ],
    },
    // Reference Images
    {
      name: 'referenceImages',
      type: 'array',
      maxRows: 10,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'description', type: 'text' },
      ],
    },
    // Order Details
    {
      name: 'orderDetails',
      type: 'group',
      fields: [
        { name: 'quantity', type: 'number', min: 1 },
        { name: 'neededByDate', type: 'date', required: true },
        {
          name: 'isFlexibleDate',
          type: 'select',
          options: ['flexible', 'somewhat', 'firm'],
        },
        {
          name: 'deliveryPreference',
          type: 'select',
          options: ['pickup', 'ship', 'either'],
        },
      ],
    },
    { name: 'additionalInfo', type: 'textarea' },
    // Converted Order Link
    {
      name: 'convertedOrderId',
      type: 'relationship',
      relationTo: 'orders',
      admin: { readOnly: true },
    },
    // Admin Section
    {
      name: 'adminSection',
      type: 'group',
      fields: [
        { name: 'quotedPrice', type: 'number' },
        { name: 'rushFee', type: 'number' },
        { name: 'notes', type: 'textarea' },
        { name: 'followUpDate', type: 'date' },
      ],
    },
  ],
  defaultSort: '-createdAt',
}
```

### Contact Requests Collection

```typescript
// collections/ContactRequests.ts
import type { CollectionConfig } from 'payload'

export const ContactRequests: CollectionConfig = {
  slug: 'contact-requests',
  admin: {
    useAsTitle: 'subject',
  },
  access: {
    create: () => true,
    read: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'subject', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Responded', value: 'responded' },
      ],
      defaultValue: 'new',
    },
  ],
  defaultSort: '-createdAt',
}
```

### Ambassadors Collection (Referrals)

```typescript
// collections/Ambassadors.ts
import type { CollectionConfig } from 'payload'

export const Ambassadors: CollectionConfig = {
  slug: 'ambassadors',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true, // Public for code validation
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'code', type: 'text', required: true, unique: true },
    { name: 'email', type: 'email' },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
}
```

### Site Settings Global

```typescript
// globals/SiteSettings.ts
import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  fields: [
    // Brand Colors
    {
      name: 'colors',
      type: 'group',
      fields: [
        { name: 'primaryColor', type: 'text', defaultValue: '#14b8a6' },
        { name: 'secondaryColor', type: 'text', defaultValue: '#ec4899' },
        { name: 'accentColor', type: 'text', defaultValue: '#84cc16' },
      ],
    },
    // Seasonal Themes
    {
      name: 'themes',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'primaryColor', type: 'text' },
        { name: 'secondaryColor', type: 'text' },
        { name: 'accentColor', type: 'text' },
        {
          name: 'heroStyle',
          type: 'select',
          options: ['ballpit', 'gradient', 'solid'],
        },
        { name: 'description', type: 'textarea' },
      ],
    },
    { name: 'activeTheme', type: 'text' },
    // Appearance
    {
      name: 'appearance',
      type: 'group',
      fields: [
        {
          name: 'heroStyle',
          type: 'select',
          options: ['ballpit', 'gradient', 'solid'],
          defaultValue: 'ballpit',
        },
        {
          name: 'cardStyle',
          type: 'select',
          options: ['shadow', 'border', 'flat'],
          defaultValue: 'shadow',
        },
        {
          name: 'buttonStyle',
          type: 'select',
          options: ['rounded', 'pill', 'square'],
          defaultValue: 'rounded',
        },
        {
          name: 'animationIntensity',
          type: 'select',
          options: ['none', 'subtle', 'full'],
          defaultValue: 'full',
        },
      ],
    },
    // Business Info
    {
      name: 'business',
      type: 'group',
      fields: [
        { name: 'businessName', type: 'text', required: true },
        { name: 'tagline', type: 'text' },
        { name: 'pickupAddress', type: 'textarea' },
      ],
    },
    // Pricing
    {
      name: 'pricing',
      type: 'group',
      fields: [
        { name: 'singlePrice', type: 'number', defaultValue: 5 },
        { name: 'tier1Price', type: 'number', defaultValue: 4.5 },
        { name: 'tier1Threshold', type: 'number', defaultValue: 100 },
        { name: 'tier2Price', type: 'number', defaultValue: 4 },
        { name: 'tier2Threshold', type: 'number', defaultValue: 200 },
        { name: 'shippingCost', type: 'number', defaultValue: 8 },
      ],
    },
  ],
}
```

---

## Environment Variables

### .env.example

```bash
# ===================
# DATABASE (Neon)
# ===================
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# ===================
# PAYLOAD CMS
# ===================
# Generate with: openssl rand -hex 32
PAYLOAD_SECRET=your-32-character-secret-here

# ===================
# STRIPE
# ===================
# Test keys for development (pk_test_... and sk_test_...)
# Live keys for production (pk_live_... and sk_live_...)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
# Webhook signing secret from Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_...

# ===================
# RESEND (Email)
# ===================
RESEND_API_KEY=re_...
# Email address for admin notifications
ADMIN_EMAIL=orders@yourdomain.com
# Sender address (must be verified domain in Resend)
# For development, use: onboarding@resend.dev
FROM_EMAIL=Cookie Business <orders@yourdomain.com>

# ===================
# VERCEL
# ===================
# Blob storage token (auto-provided on Vercel)
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# ===================
# SITE
# ===================
# Production URL (no trailing slash)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## API Routes

### Public Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/checkout` | POST | Create Stripe checkout session |
| `/api/webhooks/stripe` | POST | Handle Stripe webhook events |
| `/api/products` | GET | List products with filters |
| `/api/categories` | GET | List categories |
| `/api/settings/pricing` | GET | Get pricing tiers |
| `/api/contact` | POST | Submit contact form |
| `/api/custom-request` | POST | Submit custom request |

### Admin Routes (Protected)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/stats` | GET | Dashboard statistics |
| `/api/admin/orders` | GET | List all orders |
| `/api/admin/orders/[id]` | PATCH | Update order |
| `/api/admin/orders/[id]/status` | PATCH | Change order status |
| `/api/admin/orders/bulk-status` | PATCH | Bulk update statuses |
| `/api/admin/products/bulk` | POST | Bulk upload products |
| `/api/admin/products/reorder` | POST | Reorder products |
| `/api/admin/categories/reorder` | POST | Reorder categories |
| `/api/admin/custom-requests` | GET | List custom requests |
| `/api/admin/custom-requests/[id]/convert-to-order` | POST | Convert quote to order |
| `/api/admin/media/upload` | POST | Upload media |

---

## Core Features

### 1. Shopping Cart (Zustand)

```typescript
// lib/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
  // Customization fields
  personName?: string
  personNumber?: string
  notes?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  clearCart: () => void
  getTotalQuantity: () => number
  getTotalPrice: () => number
}

// Unique key: productId-personName-personNumber-notes
const getItemKey = (item: CartItem) =>
  `${item.productId}-${item.personName || ''}-${item.personNumber || ''}-${item.notes || ''}`

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => set((state) => {
        const key = getItemKey(newItem)
        const existing = state.items.find(i => getItemKey(i) === key)
        if (existing) {
          return {
            items: state.items.map(i =>
              getItemKey(i) === key
                ? { ...i, quantity: i.quantity + newItem.quantity }
                : i
            )
          }
        }
        return { items: [...state.items, newItem] }
      }),
      removeItem: (key) => set((state) => ({
        items: state.items.filter(i => getItemKey(i) !== key)
      })),
      updateQuantity: (key, quantity) => set((state) => ({
        items: state.items.map(i =>
          getItemKey(i) === key ? { ...i, quantity } : i
        )
      })),
      clearCart: () => set({ items: [] }),
      getTotalQuantity: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getTotalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
)
```

### 2. Dynamic Pricing

```typescript
// lib/usePricing.ts
export function calculatePrice(quantity: number, pricing: PricingTiers): number {
  if (quantity >= pricing.tier2Threshold) {
    return pricing.tier2Price
  } else if (quantity >= pricing.tier1Threshold) {
    return pricing.tier1Price
  }
  return pricing.singlePrice
}
```

### 3. Stripe Checkout

```typescript
// app/api/checkout/route.ts
import Stripe from 'stripe'

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const { items, email, neededByDate, shippingMethod, ambassadorCode } = await req.json()

  const lineItems = items.map((item: CartItem) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.productName,
        images: [item.productImage],
        metadata: {
          productId: item.productId,
          personName: item.personName || '',
          personNumber: item.personNumber || '',
          notes: item.notes || '',
        },
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }))

  // Add shipping if UPS
  if (shippingMethod === 'ups') {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'UPS Shipping' },
        unit_amount: 800, // $8.00
      },
      quantity: 1,
    })
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    automatic_tax: { enabled: true },
    shipping_address_collection: shippingMethod === 'ups'
      ? { allowed_countries: ['US'] }
      : undefined,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
    metadata: {
      customerEmail: email,
      neededByDate,
      shippingMethod,
      items: JSON.stringify(items),
      ambassadorCode: ambassadorCode || '',
    },
  })

  return Response.json({ url: session.url })
}
```

### 4. Stripe Webhook

```typescript
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe'
import { getPayload } from '@/lib/payload'

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const payload = await getPayload()

    const items = JSON.parse(session.metadata?.items || '[]')
    const shippingAddress = session.shipping_details?.address

    await payload.create({
      collection: 'orders',
      data: {
        stripeSessionId: session.id,
        customerEmail: session.metadata?.customerEmail || session.customer_details?.email,
        customerName: session.customer_details?.name,
        status: 'paid',
        shippingMethod: session.metadata?.shippingMethod || 'pickup',
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
        items,
        subtotal: (session.amount_subtotal || 0) / 100,
        total: (session.amount_total || 0) / 100,
        neededByDate: session.metadata?.neededByDate,
        ambassadorCode: session.metadata?.ambassadorCode,
      },
    })

    // Send confirmation emails
    await sendOrderConfirmation(/* ... */)
    await sendAdminOrderNotification(/* ... */)
  }

  return Response.json({ received: true })
}
```

---

## Email Templates

Email templates are HTML strings sent via Resend. Key templates to implement:

1. **Order Confirmation** - Sent to customer after payment
2. **Admin Order Notification** - Sent to admin on new order
3. **Ready for Pickup** - Sent when order status → 'ready'
4. **Shipped Notification** - Sent when status → 'shipped' with tracking
5. **Custom Request Quote** - Sent to customer with quote details
6. **Quote Notification** - Initial quote notification
7. **Production Started** - Status update email
8. **Order Completed** - Thank you email
9. **Admin Custom Request Alert** - New custom request notification
10. **Admin Contact Alert** - Contact form submission notification

```typescript
// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmation(order: Order) {
  await resend.emails.send({
    from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
    to: order.customerEmail,
    subject: `Order Confirmed - #${order.id.slice(-6).toUpperCase()}`,
    html: `<!-- HTML template -->`,
  })
}

export async function sendAdminOrderNotification(order: Order) {
  await resend.emails.send({
    from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
    to: process.env.ADMIN_EMAIL || 'admin@example.com',
    subject: `New Order - $${order.total}`,
    html: `<!-- HTML template -->`,
  })
}

// ... additional email functions
```

---

## Admin Dashboard

### Dashboard Features

1. **Statistics Overview**
   - Total orders (all time, this month)
   - Revenue (all time, this month)
   - Pending orders count
   - Products count

2. **Order Management**
   - List with filtering (status, date range)
   - Status updates with email triggers
   - Bulk status updates
   - Order details view

3. **Product Management**
   - CRUD operations
   - Bulk upload (CSV/JSON)
   - Drag-and-drop reordering
   - Category assignment

4. **Category Management**
   - Hierarchical structure
   - Color customization
   - Icon uploads
   - Sort ordering

5. **Custom Requests**
   - Quote management
   - Convert to order workflow
   - Status tracking
   - Admin notes

6. **Contact Requests**
   - View submissions
   - Mark as responded
   - Reply via email link

7. **Site Settings**
   - Brand colors
   - Theme management
   - Pricing tiers
   - Business info

---

## Setup Instructions

### 1. Create New Project

```bash
# Create Next.js project
npx create-next-app@latest cookie-business --typescript --tailwind --app --src-dir=false

cd cookie-business

# Install dependencies (copy from package.json above)
pnpm install
```

### 2. Initialize Payload CMS

```bash
# Initialize Payload
npx create-payload-app@latest

# When prompted:
# - Choose "blank" template
# - Select PostgreSQL database
# - Configure with your Neon connection string
```

### 3. Set Up External Services

#### Neon Database
1. Create account at neon.tech
2. Create new project
3. Copy connection string to `DATABASE_URL`

#### Stripe
1. Create account at stripe.com
2. Get API keys from dashboard
3. Create webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Subscribe to `checkout.session.completed`
5. Enable automatic tax in settings

#### Resend
1. Create account at resend.com
2. Add and verify sending domain
3. Get API key

#### Vercel
1. Connect GitHub repo
2. Add environment variables
3. Enable Blob storage

### 4. Initialize shadcn/ui

```bash
npx shadcn@latest init
# Choose: New York style, Zinc color, CSS variables

npx shadcn@latest add button badge separator sheet select carousel skeleton dialog label avatar tabs card input textarea
```

### 5. Create Collections and Globals

Copy the schema files from this document into `collections/` and `globals/` directories.

### 6. Configure Payload

```typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import { Users, Media, Categories, Products, Orders, CustomRequests, ContactRequests, Ambassadors } from './collections'
import { SiteSettings } from './globals'

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Media, Categories, Products, Orders, CustomRequests, ContactRequests, Ambassadors],
  globals: [SiteSettings],
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
  }),
  editor: lexicalEditor(),
  plugins: [
    vercelBlobStorage({
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || 'dev-secret',
  typescript: {
    outputFile: 'lib/types/payload-types.ts',
  },
})
```

### 7. Run Development Server

```bash
# Generate types
pnpm generate:types

# Start dev server
pnpm dev

# In another terminal, forward Stripe webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Security Considerations

### Implemented Security

- **Authentication**: Payload CMS JWT-based auth with secure cookies
- **Authorization**: Role-based access control (admin/editor)
- **Input Validation**: Server-side validation on all endpoints
- **Webhook Security**: Stripe signature verification
- **Password Security**: bcrypt hashing
- **HTTPS**: Enforced in production

### Best Practices

- Never expose `STRIPE_SECRET_KEY` to frontend
- Use environment variables for all secrets
- Validate webhook signatures before processing
- Sanitize user input before database operations
- Implement rate limiting on public endpoints
- Regular security audits of dependencies

---

## Customization Notes for Cookie Business

When adapting this template:

1. **Replace "Products/Buttons" terminology** with "Cookies" or appropriate product name
2. **Update Categories** for cookie types (Sugar Cookies, Brownies, Seasonal, etc.)
3. **Adjust Pricing Tiers** based on cookie business model (per dozen, per cookie, etc.)
4. **Customize Email Templates** with cookie business branding
5. **Update Lead Times** based on baking/decorating schedule
6. **Modify Customization Options** for cookie-specific needs (flavors, decorations, dietary restrictions)
7. **Add Allergen Information** field to products if needed
8. **Consider Expiration/Freshness** dates for perishable items

---

## Quick Start Checklist

- [ ] Create Neon database and get connection string
- [ ] Create Stripe account and get API keys
- [ ] Create Resend account and verify domain
- [ ] Clone/create Next.js project
- [ ] Install all dependencies
- [ ] Initialize Payload CMS
- [ ] Set up collections and globals
- [ ] Configure environment variables
- [ ] Initialize shadcn/ui components
- [ ] Create API routes
- [ ] Build admin dashboard
- [ ] Set up Stripe webhook
- [ ] Configure Vercel deployment
- [ ] Test end-to-end checkout flow
- [ ] Go live!

---

*Generated from lellis-designs codebase - January 2026*
