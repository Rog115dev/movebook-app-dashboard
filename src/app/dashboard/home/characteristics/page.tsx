'use client';

import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { IconPicker } from '@/components/IconPicker';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import type { TrainFeature, TrainProSettings } from '@/lib/types';

export default function CharacteristicsPage() {
  const [trainPro, setTrainPro] = useState<TrainProSettings | null>(null);
  const [features, setFeatures] = useState<TrainFeature[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const s = await fetchSettings();
    setTrainPro(s.trainPro);
    setFeatures(s.trainPro.features.map((item) => ({ ...item })));
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  async function onSave() {
    if (!trainPro) return;
    setSaving(true);
    setMessage('');
    try {
      const next = { ...trainPro, features };
      await saveSettings({
        trainPro: next,
        i18n: {
          en: Object.fromEntries(
            features.flatMap((f, i) => [
              [`train.feat${i + 1}Title`, f.title],
              [`train.feat${i + 1}Desc`, f.description],
            ])
          ),
        },
      });
      setTrainPro(next);
      setMessage('Characteristics saved.');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!trainPro) return <p className="text-zinc-400">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Characteristics</h1>
      <p className="mt-2 text-zinc-400">
        Home attribute cards (Personalized Plans, Track Progress, Coach
        Function, Nutrition Guidance).
      </p>

      <div className="mt-6 space-y-4">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <p className="mb-3 text-sm font-medium text-zinc-300">
              Card {idx + 1}
            </p>
            <div className="grid gap-3">
              <Field
                label="Title"
                value={f.title}
                onChange={(v) => {
                  const next = [...features];
                  next[idx] = { ...f, title: v };
                  setFeatures(next);
                }}
              />
              <Field
                label="Description"
                value={f.description}
                onChange={(v) => {
                  const next = [...features];
                  next[idx] = { ...f, description: v };
                  setFeatures(next);
                }}
              />
              <IconPicker
                label="Icon"
                value={f.icon || 'clipboard-outline'}
                onChange={(icon) => {
                  const next = [...features];
                  next[idx] = { ...f, icon };
                  setFeatures(next);
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
