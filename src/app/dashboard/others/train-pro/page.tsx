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
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">TRAIN PRO</h1>
      <p className="mt-2 text-zinc-400">
        Headline, CTAs, and guarantee copy. Edit Statistics, Characteristics,
        and FAQ under the <span className="text-[#FF7800]">Home</span> menu
        tabs.
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

      <SaveBar
        saving={saving}
        message={message}
        onSave={onSave}
        onReset={() => load()}
      />
    </div>
  );
}
