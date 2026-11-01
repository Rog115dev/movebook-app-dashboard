'use client';

import { useEffect, useState } from 'react';
import { PlanEditor, formatUsd } from '@/components/PlanEditor';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import { DEFAULT_CURRENCIES } from '@/lib/currency';
import { plansI18nKeys } from '@/lib/contentI18n';
import { ensurePlanMatrix } from '@/lib/planMatrix';
import type { PlanSettings } from '@/lib/types';

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanSettings[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('free-athlete');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const s = await fetchSettings();
    const next = ensurePlanMatrix(s.plans).map((p) => ({
      ...p,
      currencyCode: 'USD' as const,
      amount: Number.isFinite(p.amount) ? p.amount : 0,
      price: formatUsd(Number.isFinite(p.amount) ? p.amount : 0),
    }));
    setPlans(next);
    if (!next.some((p) => p.id === selectedPlanId) && next[0]) {
      setSelectedPlanId(next[0].id);
    }
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once
  }, []);

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
    setSaving(true);
    setMessage('');
    try {
      const normalized = ensurePlanMatrix(plans).map((plan) => ({
        ...plan,
        amount: Number.isFinite(plan.amount) ? plan.amount : 0,
        currencyCode: 'USD',
        price: formatUsd(Number.isFinite(plan.amount) ? plan.amount : 0),
      }));
      await saveSettings({
        plans: normalized,
        pricing: {
          baseCurrency: 'USD',
          currencies: DEFAULT_CURRENCIES,
        },
        i18n: { en: plansI18nKeys(normalized) },
      });
      setPlans(normalized);
      setMessage('Version details saved (prices in USD).');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!plans.length) {
    return <p className="text-zinc-400">Loading plans…</p>;
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold">Version details</h1>
      <p className="mt-2 text-zinc-400">
        Free · Base · Premium · Professional for each user type (Athlete /
        Coach / Team / Club / Group). Also under{' '}
        <span className="text-[#FF7800]">Generals → Paywall</span>. Prices in
        USD; mobile converts after country selection.
      </p>

      <div className="mt-6">
        <PlanEditor
          plans={plans}
          selectedId={selectedPlanId}
          onSelect={setSelectedPlanId}
          onChange={updatePlan}
        />
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
