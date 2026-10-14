'use client';

import { useEffect, useState } from 'react';
import { ColorPreview } from '@/components/ColorPreview';
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

function toColorInputValue(value: string): string | null {
  const hex = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex.toUpperCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(hex)) {
    const r = hex.charAt(1);
    const g = hex.charAt(2);
    const b = hex.charAt(3);
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return null;
}

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
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-semibold">Colors</h1>
      <p className="mt-2 text-zinc-400">
        Update brand palette used across the mobile app. Preview updates live.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div className="mb-4 flex flex-wrap gap-3">
            {(['orange', 'bg', 'bgElevated', 'goldSoft'] as const).map(
              (key) => (
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
              )
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {KEYS.map((key) => {
              const hexValue = toColorInputValue(colors[key]);
              return (
                <div key={key} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field
                      label={key}
                      value={colors[key]}
                      onChange={(v) => setColors({ ...colors, [key]: v })}
                    />
                  </div>
                  <span
                    className="mb-1 h-10 w-10 shrink-0 rounded border border-zinc-700"
                    style={{ background: colors[key] }}
                    title={colors[key]}
                  />
                  {hexValue ? (
                    <input
                      type="color"
                      value={hexValue}
                      onChange={(e) =>
                        setColors({
                          ...colors,
                          [key]: e.target.value.toUpperCase(),
                        })
                      }
                      className="mb-1 h-10 w-12 cursor-pointer rounded border border-zinc-700 bg-transparent"
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          <SaveBar
            saving={saving}
            message={message}
            onSave={onSave}
            onReset={() => load()}
          />
        </div>

        <ColorPreview colors={colors} />
      </div>
    </div>
  );
}
