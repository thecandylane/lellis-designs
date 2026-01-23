# L. Ellis Designs - Owner's Guide

Welcome to your new website! This guide covers everything you need to manage your button business online.

---

## Quick Links

| What | Where |
|------|-------|
| **Your Website** | https://lellisdesigns.com (after domain setup) |
| **Admin Panel** | https://lellisdesigns.com/admin |
| **Stripe Dashboard** | https://dashboard.stripe.com |

---

## Getting Started Checklist

Complete these one-time setup steps:

- [ ] Purchase domain name (lellisdesigns.com or similar)
- [ ] Create Stripe account and connect bank account
- [ ] Create Resend account for email notifications
- [ ] Log into admin panel and explore

---

## Daily Tasks

### Processing Orders

When a customer places an order, you'll receive an email notification. Here's what to do:

1. **Log into Admin Panel** → Go to `/admin`
2. **View Orders** → Click "Orders" in the sidebar
3. **Check Order Status:**
   - `Paid` = Payment received, ready to make
   - `In Production` = You're working on it
   - `Ready` / `Shipped` = Customer notified

4. **Fulfill the Order:**
   - Make the buttons
   - Update status to "In Production"
   - When complete:
     - **For Pickup Orders**: Click "Mark Ready" → Enter your pickup address → Customer receives email with location
     - **For UPS Orders**: Click "Mark Shipped" → Enter tracking number → Customer receives email with tracking link

### Responding to Custom Requests

Customers can submit custom button requests through your site.

1. Go to Admin → Custom Requests
2. Review the request details (quantity, design description, deadline)
3. Contact the customer via email/phone to discuss
4. Create a quote or convert to an order

---

## Adding Products

### Adding a New Button

1. Go to Admin → Buttons → Create New
2. Fill in the details:
   - **Name**: Button name (e.g., "LSU Tigers Game Day")
   - **Image**: Upload a photo of the button
   - **Category**: Select where it belongs (e.g., Baton Rouge → LSU → Football)
   - **Price**: Default is $5.00
   - **Customization**:
     - "As-is" = Customer buys exactly as shown
     - "Customizable" = Customer can request modifications
   - **Active**: Check this to make it visible on the site

3. Click Save

### Managing Categories

Categories are organized in a hierarchy:

```
Baton Rouge (City)
  └── LSU (School)
       ├── Football (Team/Event)
       ├── Chi Omega (Organization)
       └── Baseball
Oxford (City)
  └── Ole Miss (School)
       └── Chi Omega (different from LSU's)
```

**To add a category:**
1. Go to Admin → Categories → Create New
2. Enter name and URL slug (e.g., "football")
3. Select parent category (or leave empty for root/city level)
4. Optionally set custom colors for the category header

---

## Understanding Your Pricing

Your site automatically calculates bulk discounts:

| Quantity | Price Each | Example |
|----------|------------|---------|
| 1-99 | $5.00 | 10 buttons = $50 |
| 100-199 | $4.50 | 100 buttons = $450 |
| 200+ | $4.00 | 200 buttons = $800 |

Shipping:
- **Local Pickup**: FREE
- **UPS Shipping**: $8 flat rate

---

## Order Status Flow

```
Customer Places Order
        ↓
      [Paid] ← You see this first
        ↓
  [In Production] ← Update when you start making buttons
        ↓
   ┌────┴────┐
   ↓         ↓
[Ready]   [Shipped]
(Pickup)    (UPS)
   ↓         ↓
[Completed] [Completed]
```

---

## Email Notifications

Your site automatically sends emails:

| Event | Who Gets Email | What It Says |
|-------|----------------|--------------|
| New Order | You + Customer | Order confirmation with details |
| Order Ready (Pickup) | Customer | Pickup address and instructions |
| Order Shipped (UPS) | Customer | Tracking number and link |
| Custom Request | You | New custom request details |

---

## Seasonal Tips

### Before Football Season (August)
- [ ] Add new team/event buttons
- [ ] Update any outdated designs
- [ ] Test place an order yourself to make sure everything works
- [ ] Stock up on button supplies

### During Game Weeks
- Check orders frequently (especially Friday-Saturday)
- Respond to custom requests quickly
- Keep pickup availability updated

### Off-Season
- Add new categories for upcoming events
- Review which buttons sold well
- Plan new designs

---

## Getting Help

**Website Issues:**
Contact your developer

**Payment Issues:**
Log into Stripe Dashboard → Payments → Find the specific payment

**Email Delivery Issues:**
Check Resend dashboard for delivery status

---

## Account Information

Keep this information secure:

| Service | Login Email | Purpose |
|---------|-------------|---------|
| Admin Panel | _____________ | Manage products & orders |
| Stripe | _____________ | View payments & payouts |
| Resend | _____________ | Email delivery status |
| Domain Registrar | _____________ | Renew domain yearly |

---

## Costs Overview

| Service | Cost | Billed |
|---------|------|--------|
| Domain | ~$12 | Yearly |
| Stripe | 2.9% + $0.30 | Per transaction |
| Hosting (Vercel) | Free* | - |
| Database (Neon) | Free* | - |
| Email (Resend) | Free* | - |

*Free tiers are generous and should cover a small business. You'll only pay more if traffic grows significantly.

---

*Last updated: January 2026*
