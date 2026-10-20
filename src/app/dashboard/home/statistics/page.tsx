'use client';

import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import type { TrainProSettings, TrainStat } from '@/lib/types';

export default function StatisticsPage() {
  const [trainPro, setTrainPro] = useState<TrainProSettings | null>(null);
  const [stats, setStats] = useState<TrainStat[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const s = await fetchSettings();
    setTrainPro(s.trainPro);
    setStats(s.trainPro.stats.map((item) => ({ ...item })));
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  async function onSave() {
    if (!trainPro) return;
    setSaving(true);
    setMessage('');
    try {
      const next = { ...trainPro, stats };
      await saveSettings({
        trainPro: next,
        i18n: {
          en: Object.fromEntries(
            stats.flatMap((stat, i) => [
              [`train.stat${i + 1}Value`, stat.value],
              [`train.stat${i + 1}Label`, stat.label],
            ])
          ),
        },
      });
      setTrainPro(next);
      setMessage('Statistics saved.');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!trainPro) return <p className="text-zinc-400">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Statistics</h1>
      <p className="mt-2 text-zinc-400">
        Home metric tiles (workouts, calories, hours, satisfaction).
      </p>

      <div className="mt-6 space-y-3">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-3"
          >
            <Field
              label="Value"
              value={stat.value}
              onChange={(v) => {
                const next = [...stats];
                next[idx] = { ...stat, value: v };
                setStats(next);
              }}
            />
            <Field
              label="Label"
              value={stat.label}
              onChange={(v) => {
                const next = [...stats];
                next[idx] = { ...stat, label: v };
                setStats(next);
              }}
            />
            <Field
              label="Icon"
              value={stat.icon}
              onChange={(v) => {
                const next = [...stats];
                next[idx] = { ...stat, icon: v };
                setStats(next);
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
