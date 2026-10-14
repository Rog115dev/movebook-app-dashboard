'use client';

import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import type { PlanSettings } from '@/lib/types';

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanSettings[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const s = await fetchSettings();
    setPlans(s.plans);
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  async function onSave() {
    setSaving(true);
    setMessage('');
    try {
      await saveSettings({ plans });
      setMessage('Plans saved.');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!plans.length) return <p className="text-zinc-400">Loading plans…</p>;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-semibold">Subscription plans</h1>
      <p className="mt-2 text-zinc-400">
        Edit Free / Basic / Premium / Pro cards shown in Feature of the version.
      </p>

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
                onChange={(v) => {
                  const next = [...plans];
                  next[idx] = { ...plan, name: v };
                  setPlans(next);
                }}
              />
              <Field
                label="Price"
                value={plan.price}
                onChange={(v) => {
                  const next = [...plans];
                  next[idx] = { ...plan, price: v };
                  setPlans(next);
                }}
              />
              <Field
                label="Subtitle"
                value={plan.subtitle}
                onChange={(v) => {
                  const next = [...plans];
                  next[idx] = { ...plan, subtitle: v };
                  setPlans(next);
                }}
              />
              <Field
                label="CTA"
                value={plan.cta}
                onChange={(v) => {
                  const next = [...plans];
                  next[idx] = { ...plan, cta: v };
                  setPlans(next);
                }}
              />
              <Field
                label="Badge"
                value={plan.badge || ''}
                onChange={(v) => {
                  const next = [...plans];
                  next[idx] = { ...plan, badge: v || undefined };
                  setPlans(next);
                }}
              />
            </div>

            <h3 className="mb-2 mt-5 text-sm font-medium text-zinc-300">
              Features (one per line)
            </h3>
            <textarea
              value={plan.features.map((f) => f.text).join('\n')}
              onChange={(e) => {
                const lines = e.target.value.split('\n');
                const next = [...plans];
                next[idx] = {
                  ...plan,
                  features: lines.map((text, i) => ({
                    text,
                    included: true,
                    highlight: plan.features[i]?.highlight,
                  })),
                };
                setPlans(next);
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
