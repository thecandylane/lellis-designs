import { NextRequest, NextResponse } from 'next/server'
import { sendAdminContactNotification } from '@/lib/email'
import { getPayload } from '@/lib/payload'
import { checkRateLimit, contactRateLimiter } from '@/lib/security'

export async function POST(request: NextRequest) {
  const rateLimitResult = checkRateLimit(request, contactRateLimiter)
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: rateLimitResult.error },
      { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
    )
  }

  try {
    const body = await request.json()

    const { name, email, subject, message } = body

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    // Save contact request to database
    const payload = await getPayload()
    await payload.create({
      collection: 'contact-requests',
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject?.trim() || undefined,
        message: message.trim(),
      },
    })

    // Send notification email to admin
    try {
      await sendAdminContactNotification({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject?.trim() || 'General Inquiry',
        message: message.trim(),
      })
    } catch (emailError) {
      console.error('Failed to send contact notification:', emailError)
      // Still return success - the contact request is saved to the database
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent! We\'ll get back to you soon.',
    })
  } catch (error) {
    console.error('Contact form submission error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again or email us directly.' },
      { status: 500 }
    )
  }
}
