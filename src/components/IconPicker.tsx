'use client';

import { useMemo, useState } from 'react';
import {
  APP_ICON_OPTIONS,
  iconLabel,
  iconSvgUrl,
} from '@/lib/iconMap';

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
};

export function IconPicker({ label = 'Icon', value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return APP_ICON_OPTIONS;
    return APP_ICON_OPTIONS.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.label.toLowerCase().includes(q) ||
        o.hint.toLowerCase().includes(q)
    );
  }, [query]);

  const selected = APP_ICON_OPTIONS.find((o) => o.id === value);

  return (
    <div className="relative">
      <p className="mb-1.5 text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950/60 px-3 py-2.5 text-left transition hover:border-[#FF7800]"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF7800]/15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={iconSvgUrl(value || 'barbell-outline')}
            alt=""
            className="h-6 w-6"
            style={{ filter: 'invert(48%) sepia(98%) saturate(1800%) hue-rotate(360deg) brightness(102%)' }}
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-white">
            {selected?.label || iconLabel(value) || 'Choose icon'}
          </span>
          <span className="block truncate text-xs text-zinc-500">
            {selected?.hint || value || 'Pick from the icon map'}
          </span>
        </span>
        <span className="text-xs text-zinc-500">{open ? '▲' : '▼'}</span>
      </button>

      {open ? (
        <div className="absolute z-30 mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 shadow-2xl shadow-black/50">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search icons…"
            className="mb-3 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-[#FF7800] placeholder:text-zinc-500 focus:ring-2"
          />
          <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {filtered.map((opt) => {
              const active = opt.id === value;
              return (
                <button
                  key={opt.id}
                  type="button"
                  title={`${opt.label} — ${opt.hint}`}
                  onClick={() => {
                    onChange(opt.id);
                    setOpen(false);
                    setQuery('');
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-center transition ${
                    active
                      ? 'border-[#FF7800] bg-[#FF7800]/15'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-500'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={iconSvgUrl(opt.id)}
                    alt=""
                    className="h-7 w-7"
                    style={{
                      filter: active
                        ? 'invert(48%) sepia(98%) saturate(1800%) hue-rotate(360deg) brightness(102%)'
                        : 'invert(80%)',
                    }}
                  />
                  <span
                    className={`text-[10px] leading-tight ${
                      active ? 'text-[#FF7800]' : 'text-zinc-400'
                    }`}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-500">
              No icons match “{query}”.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
