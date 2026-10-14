import { NextResponse } from 'next/server';
import {
  COOKIE_NAME,
  createSessionToken,
  verifyCredentials,
} from '@/lib/auth';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
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
