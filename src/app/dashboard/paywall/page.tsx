'use client';

import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import type { PaywallSettings } from '@/lib/types';

export default function PaywallPage() {
  const [paywall, setPaywall] = useState<PaywallSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const s = await fetchSettings();
    setPaywall(s.paywall);
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  async function onSave() {
    if (!paywall) return;
    setSaving(true);
    setMessage('');
    try {
      const en: Record<string, string> = {
        'paywall.brandName': paywall.brandName,
        'paywall.brandSub': paywall.brandSub,
        'paywall.claimDiscount': paywall.claimDiscountLabel,
        'paywall.startTrial': paywall.startTrialLabel,
        'paywall.trust1': paywall.trustLine1,
        'paywall.trust2': paywall.trustLine2,
      };
      paywall.features.forEach((f, i) => {
        en[`paywall.feature${i + 1}`] = f.label;
      });
      paywall.tiers.forEach((tier) => {
        if (tier.id === '1m') en['paywall.tier1m'] = tier.label;
        if (tier.id === '3m') en['paywall.tier3m'] = tier.label;
        if (tier.id === '12m') en['paywall.tier12m'] = tier.label;
      });
      await saveSettings({ paywall, i18n: { en } });
      setMessage('Paywall saved (English translations updated).');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!paywall) return <p className="text-zinc-400">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">Paywall</h1>
      <p className="mt-2 text-zinc-400">
        Offer copy and duration tiers after choosing Free / Basic / Premium /
        Pro.
      </p>

      <div className="mt-6 grid gap-4">
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

      <h2 className="mt-10 text-xl font-semibold">Feature chips</h2>
      <div className="mt-4 space-y-3">
        {paywall.features.map((f, idx) => (
          <div key={idx} className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Label"
              value={f.label}
              onChange={(v) => {
                const features = [...paywall.features];
                features[idx] = { ...f, label: v };
                setPaywall({ ...paywall, features });
              }}
            />
            <Field
              label="Icon"
              value={f.icon}
              onChange={(v) => {
                const features = [...paywall.features];
                features[idx] = { ...f, icon: v };
                setPaywall({ ...paywall, features });
              }}
            />
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold">Duration tiers</h2>
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
                onChange={(v) => {
                  const tiers = [...paywall.tiers];
                  tiers[idx] = { ...tier, label: v };
                  setPaywall({ ...paywall, tiers });
                }}
              />
              <Field
                label="Price"
                value={tier.price}
                onChange={(v) => {
                  const tiers = [...paywall.tiers];
                  tiers[idx] = { ...tier, price: v };
                  setPaywall({ ...paywall, tiers });
                }}
              />
              <Field
                label="Original price"
                value={tier.original}
                onChange={(v) => {
                  const tiers = [...paywall.tiers];
                  tiers[idx] = { ...tier, original: v };
                  setPaywall({ ...paywall, tiers });
                }}
              />
              <Field
                label="Discount badge"
                value={tier.discount}
                onChange={(v) => {
                  const tiers = [...paywall.tiers];
                  tiers[idx] = { ...tier, discount: v };
                  setPaywall({ ...paywall, tiers });
                }}
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
