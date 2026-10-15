'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { searchDashboard, type SearchHit } from '@/lib/searchIndex';

type Props = {
  /** Larger search block for Overview page */
  variant?: 'bar' | 'hero';
};

export function DashboardSearch({ variant = 'bar' }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchDashboard(query), [query]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  function onPick() {
    setOpen(false);
    setQuery('');
  }

  const showPanel = open && (query.trim().length > 0 || variant === 'hero');

  return (
    <div ref={rootRef} className={variant === 'hero' ? 'relative w-full' : 'relative w-full max-w-xl'}>
      <label className="sr-only" htmlFor="dashboard-search">
        Search options to edit
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            ⌕
          </span>
          <input
            ref={inputRef}
            id="dashboard-search"
            type="search"
            value={query}
            placeholder="Search options to edit… (colors, FAQ, why.resultsBody)"
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className={`w-full rounded-xl border border-zinc-700 bg-zinc-900 py-2.5 pl-9 pr-3 text-sm text-white outline-none ring-[#FF7800] placeholder:text-zinc-500 focus:ring-2 ${
              variant === 'hero' ? 'py-3 text-base' : ''
            }`}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            inputRef.current?.focus();
          }}
          className="shrink-0 rounded-xl bg-[#FF7800] px-4 py-2.5 text-sm font-semibold text-black"
        >
          Search
        </button>
      </div>
      <p className="mt-1.5 text-xs text-zinc-500">
        Tip: press <kbd className="rounded border border-zinc-700 px-1">Ctrl</kbd>+
        <kbd className="rounded border border-zinc-700 px-1">K</kbd>
      </p>

      {showPanel ? (
        <div className="absolute z-50 mt-2 max-h-[420px] w-full overflow-auto rounded-xl border border-zinc-700 bg-zinc-950 shadow-2xl shadow-black/50">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-sm text-zinc-500">
              No matches for “{query}”.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-800 py-1">
              {results.map((hit) => (
                <ResultRow key={hit.id} hit={hit} onPick={onPick} />
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ResultRow({ hit, onPick }: { hit: SearchHit; onPick: () => void }) {
  return (
    <li>
      <Link
        href={hit.href}
        onClick={onPick}
        className="block px-4 py-3 transition hover:bg-zinc-900"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium text-white">{hit.title}</p>
          <span className="shrink-0 rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
            {hit.category}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{hit.desc}</p>
      </Link>
    </li>
  );
}
