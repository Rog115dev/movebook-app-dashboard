'use client';

import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { PlanEditor, formatUsd } from '@/components/PlanEditor';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import { plansI18nKeys } from '@/lib/contentI18n';
import { DEFAULT_CURRENCIES } from '@/lib/currency';
import { ensurePlanMatrix } from '@/lib/planMatrix';
import type { PaywallSettings, PaywallTier, PlanSettings } from '@/lib/types';

/** Extract a numeric amount from legacy strings like "0.50 USD", "$28.00". */
function parseUsdNumber(raw: string): string {
  const match = String(raw || '')
    .replace(/,/g, '')
    .match(/-?\d+(?:\.\d+)?/);
  if (!match) return '0';
  const n = Number(match[0]);
  if (!Number.isFinite(n) || n < 0) return '0';
  return String(n);
}

/** Allow only digits and a single decimal point while typing. */
function sanitizeUsdInput(raw: string): string {
  let next = raw.replace(/[^\d.]/g, '');
  const firstDot = next.indexOf('.');
  if (firstDot !== -1) {
    next =
      next.slice(0, firstDot + 1) +
      next.slice(firstDot + 1).replace(/\./g, '');
  }
  if (firstDot !== -1) {
    const [whole, frac = ''] = next.split('.');
    next = `${whole}.${frac.slice(0, 1)}`;
  }
  return next;
}

function formatUsdStored(raw: string): string {
  const n = Number(parseUsdNumber(raw));
  if (!Number.isFinite(n) || n < 0) return '0 USD';
  const rounded = Math.round(n * 10) / 10;
  const text =
    Math.abs(rounded - Math.round(rounded)) < 0.05
      ? String(Math.round(rounded))
      : rounded.toFixed(1);
  return `${text} USD`;
}

function UsdNumberField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-zinc-200">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[#FF7800]">$</span>
        <input
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.]?[0-9]?"
          value={value}
          onChange={(e) => onChange(sanitizeUsdInput(e.target.value))}
          onBlur={() => {
            if (value === '' || value === '.') onChange('0');
            else onChange(parseUsdNumber(value));
          }}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-[#FF7800] focus:ring-2"
          placeholder="0.0"
        />
        <span className="shrink-0 text-xs text-zinc-500">USD</span>
      </div>
      {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}

function normalizeTiers(tiers: PaywallTier[]): PaywallTier[] {
  return tiers.map((tier) => ({
    ...tier,
    price: formatUsdStored(tier.price),
    original: formatUsdStored(tier.original),
  }));
}

function normalizePlans(plans: PlanSettings[]): PlanSettings[] {
  return ensurePlanMatrix(plans).map((plan) => ({
    ...plan,
    amount: Number.isFinite(plan.amount) ? plan.amount : 0,
    currencyCode: 'USD',
    price: formatUsd(Number.isFinite(plan.amount) ? plan.amount : 0),
  }));
}

export default function PaywallPage() {
  const [paywall, setPaywall] = useState<PaywallSettings | null>(null);
  const [plans, setPlans] = useState<PlanSettings[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('free-athlete');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const s = await fetchSettings();
    setPaywall({
      ...s.paywall,
      tiers: s.paywall.tiers.map((tier) => ({
        ...tier,
        price: parseUsdNumber(tier.price),
        original: parseUsdNumber(tier.original),
      })),
    });
    const nextPlans = normalizePlans(s.plans);
    setPlans(nextPlans);
    if (!nextPlans.some((p) => p.id === selectedPlanId) && nextPlans[0]) {
      setSelectedPlanId(nextPlans[0].id);
    }
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once
  }, []);

  function updateTier(idx: number, patch: Partial<PaywallTier>) {
    if (!paywall) return;
    const tiers = [...paywall.tiers];
    tiers[idx] = { ...tiers[idx], ...patch };
    setPaywall({ ...paywall, tiers });
  }

  function updatePlan(idx: number, patch: Partial<PlanSettings>) {
    setPlans((prev) => {
      const next = [...prev];
      const merged = { ...next[idx], ...patch, currencyCode: 'USD' };
      next[idx] = {
        ...merged,
        price: formatUsd(
          Number.isFinite(merged.amount) ? merged.amount : 0
        ),
      };
      return next;
    });
  }

  async function onSave() {
    if (!paywall) return;
    setSaving(true);
    setMessage('');
    try {
      const cleanedPaywall: PaywallSettings = {
        ...paywall,
        tiers: normalizeTiers(paywall.tiers),
      };
      const cleanedPlans = normalizePlans(plans);
      const en: Record<string, string> = {
        'paywall.brandName': cleanedPaywall.brandName,
        'paywall.brandSub': cleanedPaywall.brandSub,
        'paywall.claimDiscount': cleanedPaywall.claimDiscountLabel,
        'paywall.startTrial': cleanedPaywall.startTrialLabel,
        'paywall.trust1': cleanedPaywall.trustLine1,
        'paywall.trust2': cleanedPaywall.trustLine2,
        ...plansI18nKeys(cleanedPlans),
      };
      cleanedPaywall.tiers.forEach((tier) => {
        if (tier.id === '1m') en['paywall.tier1m'] = tier.label;
        if (tier.id === '3m') en['paywall.tier3m'] = tier.label;
        if (tier.id === '12m') en['paywall.tier12m'] = tier.label;
      });
      await saveSettings({
        paywall: cleanedPaywall,
        plans: cleanedPlans,
        pricing: {
          baseCurrency: 'USD',
          currencies: DEFAULT_CURRENCIES,
        },
        i18n: { en },
      });
      setPaywall({
        ...cleanedPaywall,
        tiers: cleanedPaywall.tiers.map((tier) => ({
          ...tier,
          price: parseUsdNumber(tier.price),
          original: parseUsdNumber(tier.original),
        })),
      });
      setPlans(cleanedPlans);
      setMessage(
        'Paywall + Free/Base/Premium/Professional × user types saved (USD).'
      );
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!paywall) return <p className="text-zinc-400">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Paywall</h1>
      <p className="mt-2 text-zinc-400">
        Edit mobile version cards:{' '}
        <span className="text-[#FF7800]">
          Free · Base · Premium · Professional
        </span>{' '}
        for each user type (
        <span className="text-[#FF7800]">
          Athlete · Coach · Team · Club · Group
        </span>
        ). Prices are USD; mobile converts after country selection.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Version plans</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Pick the type of user, then the version. Mobile shows only the 4
        versions that match the role chosen on the first form.
      </p>
      <div className="mt-4">
        <PlanEditor
          plans={plans}
          selectedId={selectedPlanId}
          onSelect={setSelectedPlanId}
          onChange={updatePlan}
        />
      </div>

      <h2 className="mt-10 text-xl font-semibold">Offer copy</h2>
      <div className="mt-4 grid gap-4">
        <Field
          label="Brand name"
          value={paywall.brandName}
          onChange={(v) => setPaywall({ ...paywall, brandName: v })}
        />
        <Field
          label="Brand subtitle"
          value={paywall.brandSub}
          onChange={(v) => setPaywall({ ...paywall, brandSub: v })}
        />
        <Field
          label="Claim discount label"
          value={paywall.claimDiscountLabel}
          onChange={(v) => setPaywall({ ...paywall, claimDiscountLabel: v })}
        />
        <Field
          label="Start trial label"
          value={paywall.startTrialLabel}
          onChange={(v) => setPaywall({ ...paywall, startTrialLabel: v })}
        />
        <Field
          label="Trust line 1"
          value={paywall.trustLine1}
          onChange={(v) => setPaywall({ ...paywall, trustLine1: v })}
        />
        <Field
          label="Trust line 2"
          value={paywall.trustLine2}
          onChange={(v) => setPaywall({ ...paywall, trustLine2: v })}
        />
        <Field
          label="Athletes image URL"
          value={paywall.athletesImageUrl}
          onChange={(v) => setPaywall({ ...paywall, athletesImageUrl: v })}
        />
      </div>

      <h2 className="mt-10 text-xl font-semibold">Duration tiers</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Shown after the user taps Choose on a version plan.
      </p>
      <div className="mt-4 space-y-4">
        {paywall.tiers.map((tier, idx) => (
          <div
            key={tier.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-medium text-[#FF7800]">{tier.label}</p>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={tier.popular}
                  onChange={(e) => {
                    const tiers = paywall.tiers.map((t, i) => ({
                      ...t,
                      popular: i === idx ? e.target.checked : false,
                    }));
                    setPaywall({ ...paywall, tiers });
                  }}
                />
                Most popular
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Label"
                value={tier.label}
                onChange={(v) => updateTier(idx, { label: v })}
              />
              <UsdNumberField
                label="Price (USD)"
                value={tier.price}
                onChange={(v) => updateTier(idx, { price: v })}
                hint="Numbers only — no letters or currency symbols."
              />
              <UsdNumberField
                label="Original price (USD)"
                value={tier.original}
                onChange={(v) => updateTier(idx, { original: v })}
                hint="List / strike-through price in USD."
              />
              <Field
                label="Discount badge"
                value={tier.discount}
                onChange={(v) => updateTier(idx, { discount: v })}
              />
            </div>
          </div>
        ))}
      </div>

      <SaveBar
        saving={saving}
        message={message}
        onSave={onSave}
        onReset={() => load()}
      />
    </div>
  );
}
