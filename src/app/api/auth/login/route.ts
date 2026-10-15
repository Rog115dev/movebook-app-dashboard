import { NextResponse } from 'next/server';
import {
  COOKIE_NAME,
  createSessionToken,
  verifyCredentials,
} from '@/lib/auth';
import { loginMobileUser } from '@/lib/mobileAuth';

export const dynamic = 'force-dynamic';

/**
 * Dual login:
 * - Mobile app sends { identifier, password } → JWT user session (MongoDB)
 * - Admin dashboard sends { username, password } → cookie session
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Mobile end-user login
  if (typeof body.identifier === 'string' && body.identifier.trim()) {
    try {
      const password = String(body.password || '');
      if (!password) {
        return NextResponse.json(
          { error: 'Password is required' },
          { status: 400 }
        );
      }
      const result = await loginMobileUser(body.identifier, password);
      return NextResponse.json({
        token: result.token,
        accessToken: result.token,
        user: result.user,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Login failed.';
      const isAuth = message.toLowerCase().includes('invalid');
      return NextResponse.json(
        { error: message },
        { status: isAuth ? 401 : 500 }
      );
    }
  }

  // Admin CMS login
  const username = String(body.username || '');
  const password = String(body.password || '');

  if (!verifyCredentials(username, password)) {
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    );
  }

  const token = createSessionToken(username);
  const res = NextResponse.json({ ok: true, username });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
