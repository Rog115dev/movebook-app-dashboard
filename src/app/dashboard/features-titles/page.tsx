'use client';

import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { IconPicker } from '@/components/IconPicker';
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
    setFeatures(
      s.paywall.features.map((f) => ({
        ...f,
        disabled: Boolean(f.disabled),
      }))
    );
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  function updateItem(index: number, patch: Partial<PaywallFeature>) {
    setFeatures((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function addItem() {
    setFeatures((prev) => [
      ...prev,
      {
        icon: 'star-outline',
        label: `Feature ${prev.length + 1}`,
        disabled: false,
      },
    ]);
  }

  function removeItem(index: number) {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  }

  function moveItem(index: number, direction: -1 | 1) {
    setFeatures((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  }

  async function onSave() {
    if (!paywall) return;
    setSaving(true);
    setMessage('');
    try {
      const cleaned = features
        .map((f) => ({
          icon: f.icon.trim() || 'star-outline',
          label: f.label.trim(),
          disabled: Boolean(f.disabled),
        }))
        .filter((f) => f.label);
      const next = { ...paywall, features: cleaned };
      const en: Record<string, string> = {};
      cleaned.forEach((f, i) => {
        en[`paywall.feature${i + 1}`] = f.label;
      });
      await saveSettings({ paywall: next, i18n: { en } });
      setPaywall(next);
      setFeatures(cleaned);
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
        Paywall / offer chips. Disable keeps the item in the list but hides it
        on mobile.
      </p>

      <div className="mt-6 flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium text-zinc-200">Titles</h2>
        <button
          type="button"
          onClick={addItem}
          className="rounded-lg border border-[#FF7800]/60 bg-[#FF7800]/10 px-3 py-2 text-sm text-[#FF7800] hover:bg-[#FF7800]/20"
        >
          + Add title
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {features.map((f, idx) => (
          <div
            key={idx}
            className={`rounded-xl border p-4 ${
              f.disabled
                ? 'border-zinc-800 bg-zinc-950/40 opacity-70'
                : 'border-zinc-800 bg-zinc-900/40'
            }`}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-zinc-200">
                Title {idx + 1}
                {f.disabled ? (
                  <span className="ml-2 text-xs font-normal text-zinc-500">
                    (disabled — hidden on app)
                  </span>
                ) : null}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => moveItem(idx, -1)}
                  disabled={idx === 0}
                  className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300 disabled:opacity-40"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(idx, 1)}
                  disabled={idx === features.length - 1}
                  className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300 disabled:opacity-40"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateItem(idx, { disabled: !f.disabled })
                  }
                  className={`rounded-lg border px-2 py-1 text-xs ${
                    f.disabled
                      ? 'border-[#FF7800]/60 bg-[#FF7800]/10 text-[#FF7800]'
                      : 'border-zinc-700 text-zinc-300 hover:border-[#FF7800]'
                  }`}
                >
                  {f.disabled ? 'Enable' : 'Disable'}
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="rounded-lg border border-red-900/60 px-2 py-1 text-xs text-red-300"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="grid gap-3">
              <Field
                label="Label"
                value={f.label}
                onChange={(label) => updateItem(idx, { label })}
              />
              <IconPicker
                label="Icon"
                value={f.icon || 'star-outline'}
                onChange={(icon) => updateItem(idx, { icon })}
              />
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={Boolean(f.disabled)}
                  onChange={(e) =>
                    updateItem(idx, { disabled: e.target.checked })
                  }
                />
                Disabled (keep in CMS, do not show on mobile)
              </label>
            </div>
          </div>
        ))}
      </div>

      {features.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          No titles yet. Click “Add title” to create one.
        </p>
      ) : null}

      <SaveBar
        saving={saving}
        message={message}
        onSave={onSave}
        onReset={() => load()}
      />
    </div>
  );
}
