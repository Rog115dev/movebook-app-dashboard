'use client';

import { useEffect, useRef, useState } from 'react';
import { ColorPreview } from '@/components/ColorPreview';
import { Field } from '@/components/Field';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import { COLOR_KEY_LABELS, DEFAULT_COLORS } from '@/lib/colorDefaults';
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

function isDefault(key: keyof ColorSettings, value: string) {
  return value.trim() === DEFAULT_COLORS[key].trim();
}

export default function ColorsPage() {
  const [colors, setColors] = useState<ColorSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeKeys, setActiveKeys] = useState<(keyof ColorSettings)[]>([]);
  const rowRefs = useRef<Partial<Record<keyof ColorSettings, HTMLDivElement | null>>>(
    {}
  );

  async function load() {
    const s = await fetchSettings();
    setColors(s.colors);
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  function focusKeys(keys: (keyof ColorSettings)[]) {
    setActiveKeys(keys);
    const first = keys[0];
    if (!first) return;
    const el = rowRefs.current[first];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function resetKey(key: keyof ColorSettings) {
    if (!colors) return;
    setColors({ ...colors, [key]: DEFAULT_COLORS[key] });
    setActiveKeys([key]);
    setMessage(`Reset “${COLOR_KEY_LABELS[key]}” to default.`);
  }

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
      <h1 className="text-2xl font-semibold">Colors</h1>
      <p className="mt-2 text-zinc-400">
        Update brand palette used across the mobile app. Use{' '}
        <span className="text-[#FF7800]">Default</span> next to a color to
        restore only that token — no full page reload. Click the preview to jump
        to related settings.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div className="mb-4 flex flex-wrap gap-3">
            {(['orange', 'bg', 'bgElevated', 'goldSoft'] as const).map(
              (key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => focusKeys([key])}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition ${
                    activeKeys.includes(key)
                      ? 'border-[#FF7800] bg-[#FF7800]/10'
                      : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <span
                    className="h-8 w-8 rounded-md border border-zinc-700"
                    style={{ background: colors[key] }}
                  />
                  <span className="text-sm text-zinc-300">{key}</span>
                </button>
              )
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {KEYS.map((key) => {
              const hexValue = toColorInputValue(colors[key]);
              const active = activeKeys.includes(key);
              const atDefault = isDefault(key, colors[key]);
              return (
                <div
                  key={key}
                  ref={(el) => {
                    rowRefs.current[key] = el;
                  }}
                  id={`color-${key}`}
                  className={`rounded-xl border p-3 transition ${
                    active
                      ? 'border-[#FF7800] bg-[#FF7800]/10 shadow-[0_0_0_1px_rgba(255,120,0,0.35)]'
                      : 'border-zinc-800 bg-zinc-900/30'
                  }`}
                  onClick={() => setActiveKeys([key])}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-zinc-300">
                      {COLOR_KEY_LABELS[key]}
                      <span className="ml-1.5 font-normal text-zinc-600">
                        ({key})
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetKey(key);
                      }}
                      disabled={atDefault}
                      title={
                        atDefault
                          ? 'Already at default'
                          : `Restore default: ${DEFAULT_COLORS[key]}`
                      }
                      className="rounded-md border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 transition hover:border-[#FF7800] hover:text-[#FF7800] disabled:cursor-default disabled:opacity-40"
                    >
                      Default
                    </button>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Field
                        label="Value"
                        value={colors[key]}
                        onChange={(v) => {
                          setColors({ ...colors, [key]: v });
                          setActiveKeys([key]);
                        }}
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
                        onChange={(e) => {
                          setColors({
                            ...colors,
                            [key]: e.target.value.toUpperCase(),
                          });
                          setActiveKeys([key]);
                        }}
                        className="mb-1 h-10 w-12 cursor-pointer rounded border border-zinc-700 bg-transparent"
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <SaveBar
            saving={saving}
            message={message}
            onSave={onSave}
            onReset={() => {
              load();
              setMessage('Reloaded saved colors from server.');
            }}
          />
        </div>

        <ColorPreview
          colors={colors}
          activeKeys={activeKeys}
          onSelectKeys={focusKeys}
        />
      </div>
    </div>
  );
}
