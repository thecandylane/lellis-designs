import { NextResponse, type NextRequest } from 'next/server'

// Security headers applied to all responses
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  // Enable XSS filter in older browsers
  response.headers.set('X-XSS-Protection', '1; mode=block')
  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Permissions policy - restrict sensitive APIs
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  return response
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get('payload-token')?.value

  // Redirect /admin/dashboard to /admin/orders
  if (path === '/admin/dashboard' || path === '/admin/dashboard/') {
    const response = NextResponse.redirect(new URL('/admin/orders', request.url))
    return addSecurityHeaders(response)
  }

  // Custom admin routes that need auth
  const customAdminRoutes = ['/admin/orders', '/admin/requests', '/admin/upload', '/admin/buttons', '/admin/categories']
  const isCustomAdminRoute = customAdminRoutes.some(route => path.startsWith(route))

  if (isCustomAdminRoute && !token) {
    // Redirect to admin login page
    const response = NextResponse.redirect(new URL('/admin/login', request.url))
    return addSecurityHeaders(response)
  }

  // After login, redirect from Payload admin root to our orders page
  // But allow /admin/api/* for Payload API and /admin for login
  if (path === '/admin' && token) {
    const response = NextResponse.redirect(new URL('/admin/orders', request.url))
    return addSecurityHeaders(response)
  }

  const response = NextResponse.next()
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    // Apply to all routes except static files and api routes (which handle their own headers)
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
