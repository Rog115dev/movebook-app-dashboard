'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

export type MultiCheckOption = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  options: MultiCheckOption[];
  values: string[];
  onChange: (values: string[]) => void;
  /** Shown when values is empty (means “all”). */
  emptyLabel?: string;
  hint?: string;
};

export function MultiCheckDropdown({
  label,
  options,
  values,
  onChange,
  emptyLabel = 'All',
  hint,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const selected = useMemo(() => new Set(values), [values]);

  const summary = useMemo(() => {
    if (values.length === 0) return emptyLabel;
    const names = values.map(
      (v) => options.find((o) => o.value === v)?.label || v
    );
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
  }, [values, options, emptyLabel]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [options, query]);

  function toggle(value: string) {
    if (selected.has(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  }

  const modal =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 sm:items-center"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-zinc-800 px-4 py-3">
                <div>
                  <h3
                    id={titleId}
                    className="text-base font-semibold text-white"
                  >
                    {label}
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {values.length === 0
                      ? `${emptyLabel} (no filter)`
                      : `${values.length} selected`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-zinc-700 px-2 py-1 text-sm text-zinc-300 hover:border-zinc-500"
                >
                  ✕
                </button>
              </div>

              <div className="border-b border-zinc-800 p-3">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  autoFocus
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-[#FF7800] focus:ring-2"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300 hover:border-[#FF7800]"
                    onClick={() => onChange([])}
                  >
                    Clear (= {emptyLabel})
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300 hover:border-[#FF7800]"
                    onClick={() => onChange(options.map((o) => o.value))}
                  >
                    Select all
                  </button>
                </div>
              </div>

              <ul className="min-h-0 flex-1 overflow-auto p-2">
                {filtered.length === 0 ? (
                  <li className="px-3 py-6 text-center text-sm text-zinc-500">
                    No matches
                  </li>
                ) : (
                  filtered.map((opt) => {
                    const checked = selected.has(opt.value);
                    return (
                      <li key={opt.value}>
                        <label
                          className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                            checked
                              ? 'bg-[#FF7800]/15 text-white'
                              : 'text-zinc-200 hover:bg-zinc-900'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(opt.value)}
                            className="h-4 w-4 accent-[#FF7800]"
                          />
                          <span className="truncate">{opt.label}</span>
                        </label>
                      </li>
                    );
                  })
                )}
              </ul>

              <div className="border-t border-zinc-800 p-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full rounded-xl bg-[#FF7800] px-4 py-2.5 text-sm font-semibold text-black"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="block space-y-1.5">
      <span className="text-sm font-medium text-zinc-200">{label}</span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-left text-sm text-white outline-none ring-[#FF7800] hover:border-[#FF7800]/60 focus:ring-2"
      >
        <span className="truncate text-zinc-200">{summary}</span>
        <span className="ml-2 shrink-0 text-xs text-[#FF7800]">Choose</span>
      </button>
      {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
      {modal}
    </div>
  );
}
