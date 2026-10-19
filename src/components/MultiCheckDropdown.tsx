'use client';

import { useEffect, useId, useRef, useState } from 'react';

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
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const selected = new Set(values);
  const summary =
    values.length === 0
      ? emptyLabel
      : values.length <= 2
        ? values
            .map((v) => options.find((o) => o.value === v)?.label || v)
            .join(', ')
        : `${values.length} selected`;

  function toggle(value: string) {
    if (selected.has(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  }

  return (
    <div ref={rootRef} className="relative block space-y-1.5">
      <span className="text-sm font-medium text-zinc-200">{label}</span>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-left text-sm text-white outline-none ring-[#FF7800] focus:ring-2"
      >
        <span className="truncate text-zinc-200">{summary}</span>
        <span className="ml-2 shrink-0 text-zinc-500">{open ? '▴' : '▾'}</span>
      </button>
      {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
      {open ? (
        <div
          id={listId}
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-zinc-700 bg-zinc-950 shadow-xl"
        >
          <div className="sticky top-0 flex gap-2 border-b border-zinc-800 bg-zinc-950 p-2">
            <button
              type="button"
              className="rounded border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:border-[#FF7800]"
              onClick={() => onChange([])}
            >
              Clear (= all)
            </button>
            <button
              type="button"
              className="rounded border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:border-[#FF7800]"
              onClick={() => onChange(options.map((o) => o.value))}
            >
              Select all
            </button>
          </div>
          <ul className="p-1">
            {options.map((opt) => {
              const checked = selected.has(opt.value);
              return (
                <li key={opt.value}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-200 hover:bg-zinc-900">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(opt.value)}
                      className="accent-[#FF7800]"
                    />
                    <span className="truncate">{opt.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
