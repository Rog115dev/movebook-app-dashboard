'use client';

import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import { formatPlanPrice } from '@/lib/currency';
import { convertAmount, roundMoney } from '@/lib/fx';
import { plansI18nKeys } from '@/lib/contentI18n';
import type { CurrencyOption, PlanSettings, PricingSettings } from '@/lib/types';

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanSettings[]>([]);
  const [pricing, setPricing] = useState<PricingSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [convertingIdx, setConvertingIdx] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [showAddCurrency, setShowAddCurrency] = useState(false);
  const [newCurrency, setNewCurrency] = useState({
    code: '',
    symbol: '',
    label: '',
  });

  async function load() {
    const s = await fetchSettings();
    setPricing(s.pricing);
    setPlans(s.plans.map((p) => ({ ...p })));
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  function updatePlan(idx: number, patch: Partial<PlanSettings>) {
    if (!pricing) return;
    setPlans((prev) => {
      const next = [...prev];
      const merged = { ...next[idx], ...patch };
      const currency = pricing.currencies.find(
        (c) => c.code === merged.currencyCode
      );
      next[idx] = {
        ...merged,
        price: formatPlanPrice(merged.amount, currency),
      };
      return next;
    });
  }

  /** When admin changes currency, convert amount with live FX rates. */
  async function onCurrencyChange(idx: number, nextCode: string) {
    if (!pricing) return;
    const plan = plans[idx];
    if (!plan) return;
    const from = (plan.currencyCode || 'EUR').toUpperCase();
    const to = nextCode.toUpperCase();
    if (from === to) return;

    const sourceAmount = Number(plan.amount) || 0;
    setConvertingIdx(idx);
    setMessage('');
    try {
      const converted = await convertAmount(sourceAmount, from, to);
      const nextAmount = roundMoney(converted);
      const currency = pricing.currencies.find((c) => c.code === to);
      setPlans((prev) => {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          currencyCode: to,
          amount: nextAmount,
          price: formatPlanPrice(nextAmount, currency),
        };
        return next;
      });
      setMessage(
        `Converted ${from} ${sourceAmount} → ${to} ${nextAmount} (live FX).`
      );
    } catch (err) {
      const currency = pricing.currencies.find((c) => c.code === to);
      setPlans((prev) => {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          currencyCode: to,
          price: formatPlanPrice(next[idx].amount || 0, currency),
        };
        return next;
      });
      const detail = err instanceof Error ? err.message : 'FX unavailable';
      setMessage(
        `Currency set to ${to}, but amount was not converted (${detail}).`
      );
    } finally {
      setConvertingIdx(null);
    }
  }

  function addCurrency() {
    if (!pricing) return;
    const code = newCurrency.code.trim().toUpperCase();
    const symbol = newCurrency.symbol.trim() || code;
    const label = newCurrency.label.trim() || code;
    if (!code || code.length < 2) {
      setMessage('Currency code is required (e.g. EUR, USD).');
      return;
    }
    if (pricing.currencies.some((c) => c.code === code)) {
      setMessage(`Currency ${code} already exists.`);
      return;
    }
    const item: CurrencyOption = { code, symbol, label };
    setPricing({
      ...pricing,
      currencies: [...pricing.currencies, item],
    });
    setNewCurrency({ code: '', symbol: '', label: '' });
    setShowAddCurrency(false);
    setMessage(`Currency ${code} added — save to keep it.`);
  }

  async function onSave() {
    if (!pricing) return;
    setSaving(true);
    setMessage('');
    try {
      const normalized = plans.map((plan) => {
        const currency = pricing.currencies.find(
          (c) => c.code === plan.currencyCode
        );
        return {
          ...plan,
          amount: Number.isFinite(plan.amount) ? plan.amount : 0,
          currencyCode: plan.currencyCode || 'EUR',
          price: formatPlanPrice(plan.amount || 0, currency),
        };
      });
      await saveSettings({
        plans: normalized,
        pricing,
        i18n: { en: plansI18nKeys(normalized) },
      });
      setPlans(normalized);
      setMessage('Plans & currencies saved (English translations updated).');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!plans.length || !pricing) {
    return <p className="text-zinc-400">Loading plans…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-semibold">Subscription plans</h1>
      <p className="mt-2 text-zinc-400">
        Amounts are stored with their currency (base for FX is{' '}
        <span className="text-[#FF7800]">EUR</span>). Mobile converts to the
        user’s local currency via location + free FX rates.
      </p>

      <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium text-white">Currencies</h2>
            <p className="text-xs text-zinc-500">
              Used in the Price currency selector. Add custom codes if missing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddCurrency((v) => !v)}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:border-[#FF7800]"
          >
            {showAddCurrency ? 'Cancel' : '+ Add currency'}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {pricing.currencies.map((c) => (
            <span
              key={c.code}
              className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300"
            >
              {c.symbol} {c.code}
              <span className="text-zinc-500"> · {c.label}</span>
            </span>
          ))}
        </div>

        {showAddCurrency ? (
          <div className="mt-4 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 sm:grid-cols-3">
            <Field
              label="Code"
              value={newCurrency.code}
              onChange={(code) => setNewCurrency({ ...newCurrency, code })}
              hint="e.g. NOK"
            />
            <Field
              label="Symbol"
              value={newCurrency.symbol}
              onChange={(symbol) => setNewCurrency({ ...newCurrency, symbol })}
              hint="e.g. kr"
            />
            <Field
              label="Label"
              value={newCurrency.label}
              onChange={(label) => setNewCurrency({ ...newCurrency, label })}
              hint="e.g. Norwegian Krone"
            />
            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={addCurrency}
                className="rounded-lg bg-[#FF7800] px-4 py-2 text-sm font-semibold text-black"
              >
                Add to list
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <div className="mt-6 space-y-6">
        {plans.map((plan, idx) => (
          <div
            key={plan.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-medium text-[#FF7800]">{plan.name}</h2>
              <span className="text-xs text-zinc-500">id: {plan.id}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Name"
                value={plan.name}
                onChange={(v) => updatePlan(idx, { name: v })}
              />

              <label className="block space-y-1.5 sm:col-span-2">
                <span className="text-sm font-medium text-zinc-200">Price</span>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={Number.isFinite(plan.amount) ? plan.amount : 0}
                    onChange={(e) =>
                      updatePlan(idx, {
                        amount: Number(e.target.value) || 0,
                      })
                    }
                    className="w-36 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-[#FF7800] focus:ring-2"
                  />
                  <select
                    value={plan.currencyCode || 'EUR'}
                    disabled={convertingIdx === idx}
                    onChange={(e) => onCurrencyChange(idx, e.target.value)}
                    className="min-w-[160px] rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-[#FF7800] focus:ring-2 disabled:opacity-50"
                  >
                    {pricing.currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} {c.code} — {c.label}
                      </option>
                    ))}
                  </select>
                  <span className="self-center text-sm text-zinc-400">
                    {convertingIdx === idx
                      ? 'Converting…'
                      : `Preview: ${plan.price}`}
                  </span>
                </div>
                <span className="text-xs text-zinc-500">
                  Changing currency converts the amount with live FX rates
                  (Frankfurter, EUR base). Mobile still converts for the user’s
                  location.
                </span>
              </label>

              <Field
                label="Subtitle"
                value={plan.subtitle}
                onChange={(v) => updatePlan(idx, { subtitle: v })}
              />
              <Field
                label="CTA"
                value={plan.cta}
                onChange={(v) => updatePlan(idx, { cta: v })}
              />
              <Field
                label="Badge"
                value={plan.badge || ''}
                onChange={(v) =>
                  updatePlan(idx, { badge: v || undefined })
                }
              />
            </div>

            <h3 className="mb-2 mt-5 text-sm font-medium text-zinc-300">
              Features (one per line)
            </h3>
            <textarea
              value={plan.features.map((f) => f.text).join('\n')}
              onChange={(e) => {
                const lines = e.target.value.split('\n');
                updatePlan(idx, {
                  features: lines.map((text, i) => ({
                    text,
                    included: true,
                    highlight: plan.features[i]?.highlight,
                  })),
                });
              }}
              rows={8}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-[#FF7800] focus:ring-2"
            />
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
