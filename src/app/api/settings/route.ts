import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { patchSettings, readSettings } from '@/lib/settings';
import type { MobileAppSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const settings = await readSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as Partial<MobileAppSettings>;
  const saved = await patchSettings(body);
  return NextResponse.json(saved);
}
