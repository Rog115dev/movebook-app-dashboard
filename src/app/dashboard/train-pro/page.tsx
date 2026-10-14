'use client';

import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import type { TrainProSettings } from '@/lib/types';

export default function TrainProPage() {
  const [trainPro, setTrainPro] = useState<TrainProSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const s = await fetchSettings();
    setTrainPro(s.trainPro);
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  async function onSave() {
    if (!trainPro) return;
    setSaving(true);
    setMessage('');
    try {
      await saveSettings({ trainPro });
      setMessage('TRAIN PRO saved.');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!trainPro) return <p className="text-zinc-400">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">TRAIN PRO</h1>
      <p className="mt-2 text-zinc-400">
        Headline, CTAs, stats, features, and FAQ on the home screen.
      </p>

      <div className="mt-6 grid gap-4">
        <Field
          label="Orange headline"
          value={trainPro.headlineOrange}
          onChange={(v) => setTrainPro({ ...trainPro, headlineOrange: v })}
        />
        <Field
          label="White headline"
          value={trainPro.headlineWhite}
          onChange={(v) => setTrainPro({ ...trainPro, headlineWhite: v })}
        />
        <Field
          label="Trial CTA"
          value={trainPro.trialCta}
          onChange={(v) => setTrainPro({ ...trainPro, trialCta: v })}
        />
        <Field
          label="Download CTA"
          value={trainPro.downloadCta}
          onChange={(v) => setTrainPro({ ...trainPro, downloadCta: v })}
        />
        <Field
          label="Banner image URL"
          value={trainPro.bannerImageUrl}
          onChange={(v) => setTrainPro({ ...trainPro, bannerImageUrl: v })}
        />
        <Field
          label="Guarantee best"
          value={trainPro.guaranteeBest}
          onChange={(v) => setTrainPro({ ...trainPro, guaranteeBest: v })}
        />
        <Field
          label="Guarantee line"
          value={trainPro.guaranteeLine}
          onChange={(v) => setTrainPro({ ...trainPro, guaranteeLine: v })}
        />
        <Field
          label="Secure text"
          value={trainPro.secureText}
          onChange={(v) => setTrainPro({ ...trainPro, secureText: v })}
        />
      </div>

      <h2 className="mt-10 text-xl font-semibold">Stats</h2>
      <div className="mt-4 space-y-3">
        {trainPro.stats.map((stat, idx) => (
          <div
            key={idx}
            className="grid gap-3 rounded-xl border border-zinc-800 p-3 sm:grid-cols-3"
          >
            <Field
              label="Value"
              value={stat.value}
              onChange={(v) => {
                const stats = [...trainPro.stats];
                stats[idx] = { ...stat, value: v };
                setTrainPro({ ...trainPro, stats });
              }}
            />
            <Field
              label="Label"
              value={stat.label}
              onChange={(v) => {
                const stats = [...trainPro.stats];
                stats[idx] = { ...stat, label: v };
                setTrainPro({ ...trainPro, stats });
              }}
            />
            <Field
              label="Icon"
              value={stat.icon}
              onChange={(v) => {
                const stats = [...trainPro.stats];
                stats[idx] = { ...stat, icon: v };
                setTrainPro({ ...trainPro, stats });
              }}
            />
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold">Features</h2>
      <div className="mt-4 space-y-3">
        {trainPro.features.map((f, idx) => (
          <div
            key={idx}
            className="grid gap-3 rounded-xl border border-zinc-800 p-3"
          >
            <Field
              label="Title"
              value={f.title}
              onChange={(v) => {
                const features = [...trainPro.features];
                features[idx] = { ...f, title: v };
                setTrainPro({ ...trainPro, features });
              }}
            />
            <Field
              label="Description"
              value={f.description}
              onChange={(v) => {
                const features = [...trainPro.features];
                features[idx] = { ...f, description: v };
                setTrainPro({ ...trainPro, features });
              }}
            />
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold">FAQ</h2>
      <div className="mt-4 space-y-3">
        {trainPro.faqs.map((item, idx) => (
          <div
            key={idx}
            className="grid gap-3 rounded-xl border border-zinc-800 p-3"
          >
            <Field
              label="Question"
              value={item.q}
              onChange={(v) => {
                const faqs = [...trainPro.faqs];
                faqs[idx] = { ...item, q: v };
                setTrainPro({ ...trainPro, faqs });
              }}
            />
            <Field
              label="Answer"
              value={item.a}
              multiline
              onChange={(v) => {
                const faqs = [...trainPro.faqs];
                faqs[idx] = { ...item, a: v };
                setTrainPro({ ...trainPro, faqs });
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
