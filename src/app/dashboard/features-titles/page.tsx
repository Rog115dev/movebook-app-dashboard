'use client';

import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import type { PaywallFeature, PaywallSettings } from '@/lib/types';

export default function FeaturesTitlesPage() {
  const [paywall, setPaywall] = useState<PaywallSettings | null>(null);
  const [features, setFeatures] = useState<PaywallFeature[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const s = await fetchSettings();
    setPaywall(s.paywall);
    setFeatures(s.paywall.features.map((f) => ({ ...f })));
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  async function onSave() {
    if (!paywall) return;
    setSaving(true);
    setMessage('');
    try {
      const next = { ...paywall, features };
      const en: Record<string, string> = {};
      features.forEach((f, i) => {
        en[`paywall.feature${i + 1}`] = f.label;
      });
      await saveSettings({ paywall: next, i18n: { en } });
      setPaywall(next);
      setMessage('Features titles saved.');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!paywall) return <p className="text-zinc-400">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">Features titles</h1>
      <p className="mt-2 text-zinc-400">
        Paywall / offer chips (Customized plans, 24/7 AI trainer, Progress
        tracking, Unlimited workouts).
      </p>

      <div className="mt-6 space-y-3">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-2"
          >
            <Field
              label="Label"
              value={f.label}
              onChange={(v) => {
                const next = [...features];
                next[idx] = { ...f, label: v };
                setFeatures(next);
              }}
            />
            <Field
              label="Icon"
              value={f.icon}
              onChange={(v) => {
                const next = [...features];
                next[idx] = { ...f, icon: v };
                setFeatures(next);
              }}
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
