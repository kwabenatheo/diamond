import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isOwnerRoute = pathname.startsWith('/owner');
  const isStaffRoute = pathname.startsWith('/staff');

  if (isOwnerRoute || isStaffRoute) {
    const token = request.cookies.get('dj_token')?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Decode JWT payload (base64 URL)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));

      // Check owner route: strictly role === 'owner'
      if (isOwnerRoute && payload.role !== 'owner') {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('unauthorized', 'owner');
        return NextResponse.redirect(redirectUrl);
      }

      // Check staff route: role === 'staff' or role === 'owner'
      if (isStaffRoute && payload.role !== 'staff' && payload.role !== 'owner') {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('unauthorized', 'staff');
        return NextResponse.redirect(redirectUrl);
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/owner/:path*', '/staff/:path*'],
};
