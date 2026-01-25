import { Resend } from 'resend'

// Lazy-load Resend client to avoid build-time evaluation
let resendInstance: Resend | null = null

function getResend() {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

// Admin email - where order notifications are sent
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'orders@lellisdesigns.com'
// Note: For development, use Resend's test domain. For production, verify lellisdesigns.com in Resend.
const FROM_EMAIL = process.env.FROM_EMAIL || 'L. Ellis Designs <onboarding@resend.dev>'

type OrderItem = {
  name: string
  quantity: number
  personName?: string
  personNumber?: string
  notes?: string
}

type OrderEmailData = {
  orderId: string
  customerEmail: string
  customerName?: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  total: number
  neededByDate?: string
  shippingMethod: 'pickup' | 'ups'
  shippingAddress?: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
  }
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function generateItemsHtml(items: OrderItem[]): string {
  return items.map(item => {
    const customizations = [
      item.personName && `Name: ${item.personName}`,
      item.personNumber && `Number/Class: ${item.personNumber}`,
      item.notes && `Notes: ${item.notes}`,
    ].filter(Boolean).join('<br>')

    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong>
          ${customizations ? `<br><span style="color: #666; font-size: 14px;">${customizations}</span>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      </tr>
    `
  }).join('')
}

// Email to customer when order is placed
export async function sendOrderConfirmation(data: OrderEmailData) {
  const { orderId, customerEmail, items, subtotal, shippingCost, total, neededByDate, shippingMethod } = data

  const shippingText = shippingMethod === 'pickup'
    ? 'Local Pickup (address provided when ready)'
    : 'UPS Shipping'

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #E11D48 0%, #BE123C 100%); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Your Order!</h1>
      </div>

      <div style="padding: 32px; background: #fff;">
        <p style="font-size: 16px; color: #333;">
          Your order has been received and we're getting started on your custom buttons!
        </p>

        <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Order ID:</strong> ${orderId.slice(0, 8).toUpperCase()}</p>
          ${neededByDate ? `<p style="margin: 0 0 8px 0;"><strong>Needed By:</strong> ${formatDate(neededByDate)}</p>` : ''}
          <p style="margin: 0;"><strong>Delivery Method:</strong> ${shippingText}</p>
        </div>

        <h2 style="font-size: 18px; border-bottom: 2px solid #E11D48; padding-bottom: 8px;">Order Details</h2>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 12px; text-align: left;">Item</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${generateItemsHtml(items)}
          </tbody>
        </table>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #eee;">
          <p style="display: flex; justify-content: space-between; margin: 8px 0;">
            <span>Subtotal:</span>
            <span>${formatCurrency(subtotal)}</span>
          </p>
          <p style="display: flex; justify-content: space-between; margin: 8px 0;">
            <span>Shipping:</span>
            <span>${shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}</span>
          </p>
          <p style="display: flex; justify-content: space-between; margin: 16px 0; font-size: 20px; font-weight: bold;">
            <span>Total:</span>
            <span style="color: #E11D48;">${formatCurrency(total)}</span>
          </p>
        </div>

        <p style="margin-top: 32px; color: #666; font-size: 14px;">
          We'll send you another email when your order is ready${shippingMethod === 'pickup' ? ' for pickup' : ' to ship'}!
        </p>
      </div>

      <div style="background: #333; padding: 24px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 14px;">
          L. Ellis Designs • Custom 3" Buttons • Louisiana
        </p>
      </div>
    </div>
  `

  const resend = getResend()
  return resend.emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `Order Confirmed - ${orderId.slice(0, 8).toUpperCase()}`,
    html,
  })
}

// Email to admin when new order comes in
export async function sendAdminOrderNotification(data: OrderEmailData) {
  const { orderId, customerEmail, items, total, neededByDate, shippingAddress } = data

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  const addressHtml = shippingAddress
    ? `<p><strong>Ship To:</strong><br>
       ${shippingAddress.line1}<br>
       ${shippingAddress.line2 ? shippingAddress.line2 + '<br>' : ''}
       ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}</p>`
    : '<p><strong>Pickup:</strong> Local pickup requested</p>'

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px;">
      <h1 style="color: #E11D48;">🎉 New Order!</h1>

      <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 18px;"><strong>${formatCurrency(total)}</strong> • ${totalQuantity} buttons</p>
      </div>

      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Customer:</strong> ${customerEmail}</p>
      ${neededByDate ? `<p><strong>Needed By:</strong> ${formatDate(neededByDate)}</p>` : ''}
      ${addressHtml}

      <h2 style="margin-top: 24px;">Items</h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${items.map(item => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
              <strong>${item.name}</strong> × ${item.quantity}
              ${item.personName ? `<br>Name: ${item.personName}` : ''}
              ${item.personNumber ? `<br>Number: ${item.personNumber}` : ''}
              ${item.notes ? `<br>Notes: ${item.notes}` : ''}
            </td>
          </tr>
        `).join('')}
      </table>

      <p style="margin-top: 24px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/orders"
           style="background: #E11D48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View in Admin Panel
        </a>
      </p>
    </div>
  `

  const resend = getResend()
  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `🛒 New Order: ${formatCurrency(total)} - ${totalQuantity} buttons`,
    html,
  })
}

// Email to customer when order is ready for pickup
export async function sendReadyForPickup(data: {
  orderId: string
  customerEmail: string
  pickupAddress: string
  pickupInstructions?: string
}) {
  const { orderId, customerEmail, pickupAddress, pickupInstructions } = data

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Your Order is Ready! 🎉</h1>
      </div>

      <div style="padding: 32px; background: #fff;">
        <p style="font-size: 16px; color: #333;">
          Great news! Your custom buttons are ready for pickup.
        </p>

        <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h2 style="margin: 0 0 12px 0; color: #16a34a;">Pickup Location</h2>
          <p style="margin: 0; font-size: 16px; white-space: pre-line;">${pickupAddress}</p>
          ${pickupInstructions ? `<p style="margin: 12px 0 0 0; color: #666;">${pickupInstructions}</p>` : ''}
        </div>

        <p style="margin: 0;"><strong>Order ID:</strong> ${orderId.slice(0, 8).toUpperCase()}</p>

        <p style="margin-top: 24px; color: #666;">
          Please reply to this email to coordinate pickup time, or text us if you have our number!
        </p>
      </div>

      <div style="background: #333; padding: 24px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 14px;">
          L. Ellis Designs • Custom 3" Buttons • Louisiana
        </p>
      </div>
    </div>
  `

  const resend = getResend()
  return resend.emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `Your Buttons are Ready for Pickup! - ${orderId.slice(0, 8).toUpperCase()}`,
    html,
  })
}

// Email to customer when order is shipped
export async function sendShippedNotification(data: {
  orderId: string
  customerEmail: string
  trackingNumber: string
  trackingUrl?: string
}) {
  const { orderId, customerEmail, trackingNumber, trackingUrl } = data

  const trackingLink = trackingUrl || `https://www.ups.com/track?tracknum=${trackingNumber}`

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Your Order Has Shipped! 📦</h1>
      </div>

      <div style="padding: 32px; background: #fff;">
        <p style="font-size: 16px; color: #333;">
          Your custom buttons are on their way!
        </p>

        <div style="background: #eff6ff; border: 1px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h2 style="margin: 0 0 12px 0; color: #2563eb;">Tracking Information</h2>
          <p style="margin: 0 0 8px 0;"><strong>Carrier:</strong> UPS</p>
          <p style="margin: 0 0 16px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
          <a href="${trackingLink}"
             style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Track Your Package
          </a>
        </div>

        <p style="margin: 0;"><strong>Order ID:</strong> ${orderId.slice(0, 8).toUpperCase()}</p>
      </div>

      <div style="background: #333; padding: 24px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 14px;">
          L. Ellis Designs • Custom 3" Buttons • Louisiana
        </p>
      </div>
    </div>
  `

  const resend = getResend()
  return resend.emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `Your Order Has Shipped! - ${orderId.slice(0, 8).toUpperCase()}`,
    html,
  })
}

// Email to admin when someone uses the contact form
export async function sendAdminContactNotification(data: {
  name: string
  email: string
  subject: string
  message: string
}) {
  const { name, email, subject, message } = data

  const subjectLabels: Record<string, string> = {
    order: '📦 Order Question',
    custom: '🎨 Custom Inquiry',
    pricing: '💰 Pricing/Bulk',
    general: '💬 General',
    other: '📝 Other',
  }

  const subjectLabel = subjectLabels[subject] || '📬 Contact'

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px;">
      <h1 style="color: #0D9488;">${subjectLabel}</h1>

      <div style="background: #f0fdfa; border: 1px solid #0D9488; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <p style="margin: 0;"><strong>From:</strong> ${name}</p>
        <p style="margin: 8px 0 0 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      </div>

      <h2 style="margin-top: 0;">Message</h2>
      <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; white-space: pre-wrap; line-height: 1.6;">${message}</div>

      <p style="margin-top: 24px;">
        <a href="mailto:${email}?subject=Re: Your message to L. Ellis Designs"
           style="background: #0D9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reply to ${name}
        </a>
      </p>

      <p style="color: #666; font-size: 14px; margin-top: 24px;">
        This message was sent from the L. Ellis Designs contact form.
      </p>
    </div>
  `

  const resend = getResend()
  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    replyTo: email,
    subject: `${subjectLabel} from ${name}`,
    html,
  })
}

// Email to customer with quote and payment link
export async function sendCustomerQuote(data: {
  requestId: string
  customerEmail: string
  customerName: string
  quotedPrice: number
  rushFee?: number
  quantity: number
  description: string
  paymentUrl: string
  neededByDate?: string
  shippingMethod?: 'pickup' | 'ups'
  shippingCost?: number
}) {
  const { requestId, customerEmail, customerName, quotedPrice, rushFee, quantity, description, paymentUrl, neededByDate, shippingMethod, shippingCost } = data

  const total = quotedPrice + (rushFee || 0) + (shippingCost || 0)
  const firstName = customerName.split(' ')[0]

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #E11D48 0%, #BE123C 100%); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Your Custom Quote is Ready!</h1>
      </div>

      <div style="padding: 32px; background: #fff;">
        <p style="font-size: 16px; color: #333;">
          Hi ${firstName}! We've prepared a quote for your custom button order.
        </p>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #333;">Order Summary</h2>
          <p style="margin: 8px 0;"><strong>Quantity:</strong> ${quantity} buttons</p>
          <p style="margin: 8px 0;"><strong>Description:</strong> ${description.substring(0, 200)}${description.length > 200 ? '...' : ''}</p>
          ${neededByDate ? `<p style="margin: 8px 0;"><strong>Needed By:</strong> ${formatDate(neededByDate)}</p>` : ''}
          <p style="margin: 8px 0;"><strong>Delivery:</strong> ${shippingMethod === 'ups' ? 'UPS Shipping' : 'Local Pickup'}</p>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #16a34a;">Quote Breakdown</h2>
          <p style="display: flex; justify-content: space-between; margin: 8px 0;">
            <span>Custom Buttons (${quantity}):</span>
            <span>${formatCurrency(quotedPrice)}</span>
          </p>
          ${rushFee ? `
          <p style="display: flex; justify-content: space-between; margin: 8px 0;">
            <span>Rush Fee:</span>
            <span>${formatCurrency(rushFee)}</span>
          </p>
          ` : ''}
          ${shippingCost ? `
          <p style="display: flex; justify-content: space-between; margin: 8px 0;">
            <span>Shipping:</span>
            <span>${formatCurrency(shippingCost)}</span>
          </p>
          ` : ''}
          <hr style="border: none; border-top: 1px solid #22c55e; margin: 16px 0;" />
          <p style="display: flex; justify-content: space-between; margin: 8px 0; font-size: 20px; font-weight: bold;">
            <span>Total:</span>
            <span style="color: #16a34a;">${formatCurrency(total)}</span>
          </p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${paymentUrl}"
             style="display: inline-block; background: linear-gradient(135deg, #E11D48 0%, #BE123C 100%); color: white; padding: 16px 48px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold;">
            Pay Now
          </a>
        </div>

        <p style="color: #666; font-size: 14px; text-align: center;">
          Questions? Reply to this email or contact us at any time.
        </p>
      </div>

      <div style="background: #333; padding: 24px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 14px;">
          L. Ellis Designs • Custom 3" Buttons • Louisiana
        </p>
        <p style="color: #666; margin: 8px 0 0 0; font-size: 12px;">
          Request ID: ${requestId.slice(0, 8).toUpperCase()}
        </p>
      </div>
    </div>
  `

  const resend = getResend()
  return resend.emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `Your Custom Button Quote - ${formatCurrency(total)}`,
    html,
  })
}

// Email to resend payment link
export async function sendPaymentLink(data: {
  customerEmail: string
  customerName: string
  total: number
  paymentUrl: string
  orderId: string
}) {
  const { customerEmail, customerName, total, paymentUrl, orderId } = data
  const firstName = customerName.split(' ')[0]

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Payment Link</h1>
      </div>

      <div style="padding: 32px; background: #fff;">
        <p style="font-size: 16px; color: #333;">
          Hi ${firstName}! Here's your payment link for your custom button order.
        </p>

        <div style="background: #eff6ff; border: 1px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">Amount Due</p>
          <p style="margin: 0; font-size: 32px; font-weight: bold; color: #2563eb;">${formatCurrency(total)}</p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${paymentUrl}"
             style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 16px 48px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold;">
            Complete Payment
          </a>
        </div>

        <p style="color: #666; font-size: 14px; text-align: center;">
          Questions? Reply to this email or contact us at any time.
        </p>
      </div>

      <div style="background: #333; padding: 24px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 14px;">
          L. Ellis Designs • Custom 3" Buttons • Louisiana
        </p>
        <p style="color: #666; margin: 8px 0 0 0; font-size: 12px;">
          Order ID: ${orderId.slice(0, 8).toUpperCase()}
        </p>
      </div>
    </div>
  `

  const resend = getResend()
  return resend.emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `Payment Link - ${formatCurrency(total)} - L. Ellis Designs`,
    html,
  })
}

// Email to customer when admin saves a quote (before order/payment link)
export async function sendQuoteNotification(data: {
  requestId: string
  customerEmail: string
  customerName: string
  quotedPrice: number
  rushFee?: number
  quantity: number
  description: string
  neededByDate?: string
}) {
  const { requestId, customerEmail, customerName, quotedPrice, rushFee, quantity, description, neededByDate } = data

  const total = quotedPrice + (rushFee || 0)
  const firstName = customerName.split(' ')[0]

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Your Quote is Ready!</h1>
      </div>

      <div style="padding: 32px; background: #fff;">
        <p style="font-size: 16px; color: #333;">
          Hi ${firstName}! Thank you for your custom button request. We've prepared a quote for you.
        </p>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #333;">Order Summary</h2>
          <p style="margin: 8px 0;"><strong>Quantity:</strong> ${quantity} buttons</p>
          <p style="margin: 8px 0;"><strong>Description:</strong> ${description.substring(0, 200)}${description.length > 200 ? '...' : ''}</p>
          ${neededByDate ? `<p style="margin: 8px 0;"><strong>Needed By:</strong> ${formatDate(neededByDate)}</p>` : ''}
        </div>

        <div style="background: #f3e8ff; border: 1px solid #8B5CF6; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #7C3AED;">Quote</h2>
          <p style="display: flex; justify-content: space-between; margin: 8px 0;">
            <span>Custom Buttons (${quantity}):</span>
            <span>${formatCurrency(quotedPrice)}</span>
          </p>
          ${rushFee ? `
          <p style="display: flex; justify-content: space-between; margin: 8px 0;">
            <span>Rush Fee:</span>
            <span>${formatCurrency(rushFee)}</span>
          </p>
          ` : ''}
          <hr style="border: none; border-top: 1px solid #8B5CF6; margin: 16px 0;" />
          <p style="display: flex; justify-content: space-between; margin: 8px 0; font-size: 20px; font-weight: bold;">
            <span>Total:</span>
            <span style="color: #7C3AED;">${formatCurrency(total)}</span>
          </p>
          <p style="margin: 16px 0 0 0; font-size: 12px; color: #666;">
            * Shipping costs will be added if applicable
          </p>
        </div>

        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>Next Steps:</strong> Please reply to this email or contact us to approve this quote.
            Once approved, we'll send you a payment link to complete your order.
          </p>
        </div>

        <p style="color: #666; font-size: 14px; text-align: center;">
          Questions? Reply to this email or contact us at any time.
        </p>
      </div>

      <div style="background: #333; padding: 24px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 14px;">
          L. Ellis Designs • Custom 3" Buttons • Louisiana
        </p>
        <p style="color: #666; margin: 8px 0 0 0; font-size: 12px;">
          Request ID: ${requestId.slice(0, 8).toUpperCase()}
        </p>
      </div>
    </div>
  `

  const resend = getResend()
  return resend.emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `Your Custom Button Quote - ${formatCurrency(total)}`,
    html,
  })
}

// Email to customer when order status changes to production
export async function sendProductionStartedEmail(data: {
  orderId: string
  customerEmail: string
  customerName?: string | null
  itemCount: number
}) {
  const { orderId, customerEmail, customerName, itemCount } = data
  const firstName = customerName?.split(' ')[0] || 'there'

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">We're Making Your Buttons!</h1>
      </div>

      <div style="padding: 32px; background: #fff;">
        <p style="font-size: 16px; color: #333;">
          Hi ${firstName}! Great news - we've started working on your custom buttons.
        </p>

        <div style="background: #eff6ff; border: 1px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">Your Order</p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #2563eb;">${itemCount} button${itemCount !== 1 ? 's' : ''}</p>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">Order #${orderId.slice(0, 8).toUpperCase()}</p>
        </div>

        <p style="color: #666; font-size: 14px;">
          We'll send you another email when your order is ready${' '}for pickup or shipping!
        </p>
      </div>

      <div style="background: #333; padding: 24px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 14px;">
          L. Ellis Designs - Custom 3" Buttons - Louisiana
        </p>
      </div>
    </div>
  `

  const resend = getResend()
  return resend.emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `We're Making Your Buttons! - Order ${orderId.slice(0, 8).toUpperCase()}`,
    html,
  })
}

// Email to customer when order is completed
export async function sendOrderCompletedEmail(data: {
  orderId: string
  customerEmail: string
  customerName?: string | null
}) {
  const { orderId, customerEmail, customerName } = data
  const firstName = customerName?.split(' ')[0] || 'there'

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Thanks for Your Order!</h1>
      </div>

      <div style="padding: 32px; background: #fff;">
        <p style="font-size: 16px; color: #333;">
          Hi ${firstName}! We hope you love your custom buttons!
        </p>

        <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
          <p style="margin: 0; font-size: 18px; color: #16a34a; font-weight: bold;">Order Complete</p>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">Order #${orderId.slice(0, 8).toUpperCase()}</p>
        </div>

        <p style="color: #333; font-size: 14px;">
          Thank you for choosing L. Ellis Designs! We'd love to hear about your event or see photos of your buttons in action.
        </p>

        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          Need more buttons for your next event? We're here to help! Just reply to this email or visit our website.
        </p>
      </div>

      <div style="background: #333; padding: 24px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 14px;">
          L. Ellis Designs - Custom 3" Buttons - Louisiana
        </p>
      </div>
    </div>
  `

  const resend = getResend()
  return resend.emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `Thanks for Your Order! - ${orderId.slice(0, 8).toUpperCase()}`,
    html,
  })
}

// Email to admin when new custom request comes in
export async function sendAdminCustomRequestNotification(data: {
  requestId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  description: string
  quantity: number
  neededByDate: string
  isRush: boolean
  eventType?: string
}) {
  const { requestId, customerName, customerEmail, customerPhone, description, quantity, neededByDate, isRush, eventType } = data

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px;">
      <h1 style="color: #E11D48;">🎨 New Custom Button Request!</h1>

      ${isRush ? `
      <div style="background: #fef2f2; border: 1px solid #ef4444; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
        <p style="margin: 0; color: #dc2626; font-weight: bold;">⚡ RUSH ORDER</p>
      </div>
      ` : ''}

      <div style="background: #f0f9ff; border: 1px solid #3b82f6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 18px;"><strong>${quantity} buttons</strong> needed by <strong>${formatDate(neededByDate)}</strong></p>
      </div>

      <h2 style="margin-top: 0;">Customer Info</h2>
      <p><strong>Name:</strong> ${customerName}</p>
      <p><strong>Email:</strong> <a href="mailto:${customerEmail}">${customerEmail}</a></p>
      <p><strong>Phone:</strong> <a href="tel:${customerPhone}">${customerPhone}</a></p>

      <h2>Request Details</h2>
      ${eventType ? `<p><strong>Event Type:</strong> ${eventType}</p>` : ''}
      <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${description}</div>

      <p style="margin-top: 24px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/requests"
           style="background: #E11D48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View Request in Admin
        </a>
      </p>

      <p style="color: #666; font-size: 14px; margin-top: 24px;">Request ID: ${requestId}</p>
    </div>
  `

  const resend = getResend()
  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `🎨 Custom Request: ${quantity} buttons - ${customerName}${isRush ? ' ⚡ RUSH' : ''}`,
    html,
  })
}
