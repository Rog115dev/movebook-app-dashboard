'use client';

import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import type { DiscountSettings } from '@/lib/types';

export default function DiscountPage() {
  const [discount, setDiscount] = useState<DiscountSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const s = await fetchSettings();
    setDiscount({ ...s.discount });
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  async function onSave() {
    if (!discount) return;
    const percent = Number(discount.percent);
    const cleaned: DiscountSettings = {
      code: discount.code.trim().toUpperCase(),
      percent:
        Number.isFinite(percent) && percent >= 0
          ? Math.min(100, Math.round(percent))
          : 0,
      expiresOn: discount.expiresOn.trim(),
    };
    if (!cleaned.code) {
      setMessage('Code is required.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cleaned.expiresOn)) {
      setMessage('Expiration date must be YYYY-MM-DD.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      await saveSettings({ discount: cleaned });
      setDiscount(cleaned);
      setMessage('Discount settings saved.');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!discount) return <p className="text-zinc-400">Loading…</p>;

  const expired =
    discount.expiresOn &&
    discount.expiresOn < new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-semibold">Discount</h1>
      <p className="mt-2 text-zinc-400">
        Promo code for the mobile paywall “Claim discount” button. Users enter
        this code to unlock the percent off. Valid through the expiration date
        (inclusive).
      </p>

      <div className="mt-6 space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <Field
          label="CODE"
          value={discount.code}
          onChange={(code) => setDiscount({ ...discount, code })}
          hint="Case-insensitive. Stored uppercase."
        />
        <Field
          label="Discount %"
          type="number"
          value={String(discount.percent)}
          onChange={(v) =>
            setDiscount({
              ...discount,
              percent: Number(v) || 0,
            })
          }
          hint="0–100. Applied to each tier’s list (original) price."
        />
        <Field
          label="Expiration date"
          type="date"
          value={discount.expiresOn}
          onChange={(expiresOn) => setDiscount({ ...discount, expiresOn })}
          hint="Last day the code is valid."
        />
        {expired ? (
          <p className="text-sm text-red-300">
            This code is past its expiration date — mobile will reject it until
            you update the date.
          </p>
        ) : (
          <p className="text-sm text-zinc-500">
            Preview: enter <span className="text-[#FF7800]">{discount.code || '…'}</span>{' '}
            → {discount.percent}% off until {discount.expiresOn || '—'}.
          </p>
        )}
      </div>

      <SaveBar
        saving={saving}
        message={message}
        onSave={onSave}
        onReset={() => {
          load().catch(() => setMessage('Failed to load settings'));
        }}
      />
    </div>
  );
}
