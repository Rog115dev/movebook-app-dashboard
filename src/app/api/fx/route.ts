import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type FrankfurterResponse = {
  base?: string;
  rates?: Record<string, number>;
};

/**
 * Server-side FX proxy (avoids browser CORS / redirect issues).
 * Frankfurter free API — EUR base.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = (searchParams.get('from') || 'EUR').toUpperCase();
  const to = (searchParams.get('to') || '').toUpperCase();
  const amountParam = searchParams.get('amount');
  const amount = amountParam != null ? Number(amountParam) : null;

  try {
    const url =
      from === 'EUR'
        ? 'https://api.frankfurter.dev/v1/latest?from=EUR'
        : `https://api.frankfurter.dev/v1/latest?from=${encodeURIComponent(from)}`;

    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 1800 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `FX upstream ${res.status}` },
        { status: 502 }
      );
    }
    const data = (await res.json()) as FrankfurterResponse;
    const rates = { ...(data.rates || {}) };
    if (from === 'EUR') rates.EUR = 1;
    else rates[from] = 1;

    if (amount != null && Number.isFinite(amount) && to) {
      let converted = amount;
      if (from === to) {
        converted = amount;
      } else if (from === 'EUR') {
        const rate = rates[to];
        if (!rate) {
          return NextResponse.json(
            { error: `No rate for ${to}` },
            { status: 400 }
          );
        }
        converted = amount * rate;
      } else if (to === 'EUR') {
        // from X: need EUR rates — refetch EUR base and invert
        const eurRes = await fetch(
          'https://api.frankfurter.dev/v1/latest?from=EUR',
          { headers: { Accept: 'application/json' } }
        );
        const eurData = (await eurRes.json()) as FrankfurterResponse;
        const fromRate = eurData.rates?.[from];
        if (!fromRate) {
          return NextResponse.json(
            { error: `No rate for ${from}` },
            { status: 400 }
          );
        }
        converted = amount / fromRate;
      } else {
        const eurRes = await fetch(
          'https://api.frankfurter.dev/v1/latest?from=EUR',
          { headers: { Accept: 'application/json' } }
        );
        const eurData = (await eurRes.json()) as FrankfurterResponse;
        const fromRate = eurData.rates?.[from];
        const toRate = eurData.rates?.[to];
        if (!fromRate || !toRate) {
          return NextResponse.json(
            { error: `No rate for ${from}→${to}` },
            { status: 400 }
          );
        }
        converted = (amount / fromRate) * toRate;
      }

      return NextResponse.json(
        {
          from,
          to,
          amount,
          converted,
          rates: { EUR: 1, ...(data.base === 'EUR' ? data.rates : rates) },
        },
        {
          headers: {
            'Cache-Control': 'no-store',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    return NextResponse.json(
      {
        base: data.base || from,
        rates: { EUR: 1, ...rates },
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'FX failed';
    return NextResponse.json(
      { error: message },
      {
        status: 502,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Accept, Content-Type',
    },
  });
}
