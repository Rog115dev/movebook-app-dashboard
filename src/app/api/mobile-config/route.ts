import { NextResponse } from 'next/server';
import { buildLocalizedConfig, readSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

/** Public endpoint for the mobile app to fetch live content/config. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') || 'en';
  const settings = await readSettings();
  const payload = buildLocalizedConfig(settings, lang);

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
