import { NextResponse } from 'next/server';
import { z } from 'zod';
import { registerMobileUser } from '@/lib/mobileAuth';

export const dynamic = 'force-dynamic';

const RegisterSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  username: z.string().trim().min(3, 'Username must be at least 3 characters'),
  email: z.string().trim().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  userType: z.enum([
    'athlete',
    'coaches',
    'teams',
    'clubs',
    'groups',
    'coach',
    'club',
    'team',
    'group',
  ]),
  country: z
    .string()
    .trim()
    .min(2, 'Country is required')
    .max(2, 'Use a 2-letter country code'),
  firstName: z.string().optional(),
  surname: z.string().optional(),
  gender: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const result = await registerMobileUser(parsed.data);
    return NextResponse.json({
      token: result.token,
      accessToken: result.token,
      user: result.user,
      message: 'Account created.',
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Registration failed.';
    const status = message.includes('already exists') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
