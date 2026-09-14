import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('dms_token')?.value;
  const path = request.nextUrl.pathname;

  // Protect these root paths and all subpaths
  const protectedPaths = ['/admin', '/driver', '/passenger'];
  const isProtectedPath = protectedPaths.some((p) => path.startsWith(p));

  // If path is protected and no token, redirect to login
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isProtectedPath) {
    try {
      // Decode JWT payload without verifying signature (since we are on Edge runtime)
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const role = decodedPayload.role.toLowerCase(); // 'admin', 'driver', 'passenger'

      // Check role constraints
      if (path.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL(`/${role}`, request.url));
      }
      
      if (path.startsWith('/driver') && role !== 'driver') {
        return NextResponse.redirect(new URL(`/${role}`, request.url));
      }
      
      if (path.startsWith('/passenger') && role !== 'passenger') {
        return NextResponse.redirect(new URL(`/${role}`, request.url));
      }
    } catch (e) {
      // If token decoding fails or is malformed, clear cookie by redirecting to login
      // Actually we can just redirect to login and they'll get a fresh session.
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect root to role specific dashboard if logged in, otherwise passenger dashboard if not?
  // Wait, root `/` is the landing page. We don't protect it.
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/driver/:path*', '/passenger/:path*'],
};
