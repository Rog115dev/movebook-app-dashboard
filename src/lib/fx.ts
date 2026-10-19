/** Client FX helper — calls our /api/fx proxy (Frankfurter, EUR base). */

export async function convertAmount(
  amount: number,
  fromCode: string,
  toCode: string
): Promise<number> {
  const from = (fromCode || 'EUR').toUpperCase();
  const to = (toCode || 'EUR').toUpperCase();
  if (!Number.isFinite(amount)) return 0;
  if (from === to) return amount;

  const qs = new URLSearchParams({
    from,
    to,
    amount: String(amount),
  });
  const res = await fetch(`/api/fx?${qs.toString()}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  const data = (await res.json().catch(() => ({}))) as {
    converted?: number;
    error?: string;
  };
  if (!res.ok || typeof data.converted !== 'number') {
    throw new Error(data.error || `FX HTTP ${res.status}`);
  }
  return data.converted;
}

/** Round money for admin display (2 decimals; whole numbers stay clean). */
export function roundMoney(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  const rounded = Math.round(amount * 100) / 100;
  return Math.abs(rounded - Math.round(rounded)) < 0.001
    ? Math.round(rounded)
    : rounded;
}
