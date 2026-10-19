import type { CurrencyOption, PlanSettings } from './types';

export const DEFAULT_CURRENCIES: CurrencyOption[] = [
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', label: 'Brazilian Real' },
  { code: 'CNY', symbol: '¥', label: 'Chinese Yuan' },
];

export function formatPlanPrice(
  amount: number,
  currency: CurrencyOption | undefined
): string {
  const symbol = currency?.symbol || currency?.code || '€';
  const rounded =
    amount % 1 === 0 ? String(Math.round(amount)) : amount.toFixed(2);
  return `${symbol} ${rounded}`;
}

/** Parse legacy free-text prices like "€ 36", "$24.99", "0.50 USD". */
export function parseLegacyPrice(price: string): {
  amount: number;
  currencyCode: string;
} {
  const raw = (price || '').trim();
  if (!raw) return { amount: 0, currencyCode: 'EUR' };

  const upper = raw.toUpperCase();
  let currencyCode = 'EUR';
  if (raw.includes('€') || upper.includes('EUR')) currencyCode = 'EUR';
  else if (raw.includes('$') || upper.includes('USD')) currencyCode = 'USD';
  else if (raw.includes('£') || upper.includes('GBP')) currencyCode = 'GBP';
  else if (upper.includes('CHF')) currencyCode = 'CHF';
  else if (upper.includes('JPY') || raw.includes('¥')) currencyCode = 'JPY';

  const numMatch = raw.replace(',', '.').match(/(\d+(\.\d+)?)/);
  const amount = numMatch ? Number(numMatch[1]) : 0;
  return { amount: Number.isFinite(amount) ? amount : 0, currencyCode };
}

export function normalizePlanPricing(
  plan: PlanSettings,
  currencies: CurrencyOption[]
): PlanSettings {
  const amount =
    typeof plan.amount === 'number' && Number.isFinite(plan.amount)
      ? plan.amount
      : parseLegacyPrice(plan.price || '').amount;
  const currencyCode = (
    plan.currencyCode ||
    parseLegacyPrice(plan.price || '').currencyCode ||
    'EUR'
  )
    .trim()
    .toUpperCase();
  const currency =
    currencies.find((c) => c.code === currencyCode) ||
    currencies.find((c) => c.code === 'EUR');
  return {
    ...plan,
    amount,
    currencyCode: currency?.code || 'EUR',
    price: formatPlanPrice(amount, currency),
  };
}
