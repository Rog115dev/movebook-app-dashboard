import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'mb_admin_session';

function secret() {
  return process.env.ADMIN_SESSION_SECRET || 'movesbook-admin-dev-secret';
}

function expectedUser() {
  return process.env.ADMIN_USERNAME || 'admin';
}

function expectedPass() {
  return process.env.ADMIN_PASSWORD || 'admin123';
}

function sign(value: string) {
  return crypto.createHmac('sha256', secret()).update(value).digest('hex');
}

export function verifyCredentials(username: string, password: string) {
  return username === expectedUser() && password === expectedPass();
}

export function createSessionToken(username: string) {
  const payload = `${username}:${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function isValidSessionToken(token: string | undefined) {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function getSession() {
  const jar = cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!isValidSessionToken(token)) return null;
  const username = token!.split(':')[0];
  return { username };
}

export function requireSession() {
  const session = getSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

export { COOKIE_NAME };
