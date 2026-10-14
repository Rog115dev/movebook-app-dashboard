import { NextResponse } from 'next/server';
import { readSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

/** Public endpoint for the mobile app to fetch live content/config. */
export async function GET() {
  const settings = await readSettings();
  return NextResponse.json(settings, {
    headers: {
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
