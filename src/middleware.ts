import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'mb_admin_session';

/**
 * Absolute redirect with explicit http(s) origin.
 * Avoids: (1) Invalid URL from relative Location in middleware
 *         (2) host:port without scheme becoming a relative path loop
 */
function redirectToPath(req: NextRequest, path: string) {
  const dest = path.startsWith('/') ? path : `/${path}`;
  const host =
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    req.nextUrl.host;
  const protoHeader = req.headers.get('x-forwarded-proto');
  const proto = (
    protoHeader ||
    req.nextUrl.protocol.replace(':', '') ||
    'http'
  ).split(',')[0].trim();

  // Always include scheme so Location is never "ip:port/path" (relative).
  const base = `${proto}://${host}`;
  return NextResponse.redirect(new URL(dest, base));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const loggedIn = Boolean(token && token.includes('.'));

  if (pathname === '/') {
    return redirectToPath(req, loggedIn ? '/dashboard' : '/login');
  }

  const isDashboard = pathname.startsWith('/dashboard');
  const isLogin = pathname === '/login';

  if (isDashboard && !loggedIn) {
    return redirectToPath(req, '/login');
  }

  if (isLogin && loggedIn) {
    return redirectToPath(req, '/dashboard');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login'],
};
