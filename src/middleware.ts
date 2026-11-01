import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'mb_admin_session';

/** Path-only redirect — avoids host:port being treated as a relative path. */
function redirectToPath(path: string) {
  return new NextResponse(null, {
    status: 307,
    headers: {
      Location: path.startsWith('/') ? path : `/${path}`,
    },
  });
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const loggedIn = Boolean(token && token.includes('.'));

  if (pathname === '/') {
    return redirectToPath(loggedIn ? '/dashboard' : '/login');
  }

  const isDashboard = pathname.startsWith('/dashboard');
  const isLogin = pathname === '/login';

  if (isDashboard && !loggedIn) {
    return redirectToPath('/login');
  }

  if (isLogin && loggedIn) {
    return redirectToPath('/dashboard');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login'],
};
