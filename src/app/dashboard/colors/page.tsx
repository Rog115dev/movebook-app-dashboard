'use client';

import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import type { ColorSettings } from '@/lib/types';

const KEYS: (keyof ColorSettings)[] = [
  'orange',
  'orangeHot',
  'gold',
  'goldSoft',
  'bg',
  'bgElevated',
  'bgCard',
  'white',
  'whiteMuted',
  'whiteDim',
  'red',
  'border',
  'borderSoft',
  'borderOrange',
  'black',
];

export default function ColorsPage() {
  const [colors, setColors] = useState<ColorSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const s = await fetchSettings();
    setColors(s.colors);
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  async function onSave() {
    if (!colors) return;
    setSaving(true);
    setMessage('');
    try {
      await saveSettings({ colors });
      setMessage('Colors saved.');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!colors) {
    return <p className="text-zinc-400">Loading colors…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">Colors</h1>
      <p className="mt-2 text-zinc-400">
        Update brand palette used across the mobile app.
      </p>

      <div className="mt-6 mb-4 flex flex-wrap gap-3">
        {(['orange', 'bg', 'bgElevated', 'goldSoft'] as const).map((key) => (
          <div
            key={key}
            className="flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2"
          >
            <span
              className="h-8 w-8 rounded-md border border-zinc-700"
              style={{ background: colors[key] }}
            />
            <span className="text-sm text-zinc-300">{key}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {KEYS.map((key) => (
          <div key={key} className="flex items-end gap-2">
            <div className="flex-1">
              <Field
                label={key}
                value={colors[key]}
                onChange={(v) => setColors({ ...colors, [key]: v })}
              />
            </div>
            <input
              type="color"
              value={
                colors[key].startsWith('#') && colors[key].length === 7
                  ? colors[key]
                  : '#FF7800'
              }
              onChange={(e) =>
                setColors({ ...colors, [key]: e.target.value.toUpperCase() })
              }
              className="mb-1 h-10 w-12 cursor-pointer rounded border border-zinc-700 bg-transparent"
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
