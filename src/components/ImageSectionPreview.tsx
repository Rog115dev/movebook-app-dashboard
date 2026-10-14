'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ImageSectionConfig } from '@/lib/types';

type Props = {
  section: ImageSectionConfig | null;
};

export function ImageSectionPreview({ section }: Props) {
  const urls = useMemo(() => {
    if (!section) return [];
    const selected = section.items.filter((i) =>
      section.selectedIds.includes(i.id)
    );
    return (selected.length ? selected : section.items.slice(0, 1)).map(
      (i) => i.url
    );
  }, [section]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [section?.key, urls.join('|')]);

  useEffect(() => {
    if (urls.length < 2 || !section) return;
    const timer = setInterval(() => {
      setIndex((prev) => {
        if (urls.length < 2) return 0;
        let next = Math.floor(Math.random() * urls.length);
        if (next === prev) next = (prev + 1) % urls.length;
        return next;
      });
    }, Math.max(3, section.rotateDelaySec) * 1000);
    return () => clearInterval(timer);
  }, [urls, section]);

  if (!section) {
    return (
      <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-500">
        Select a section to preview.
      </aside>
    );
  }

  const multi = urls.length >= 2;
  const active = urls[Math.min(index, urls.length - 1)];

  return (
    <aside className="lg:sticky lg:top-6">
      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
        Live preview · {section.label}
      </p>
      <div className="mx-auto w-[260px] rounded-[2rem] border border-zinc-700 bg-zinc-900 p-3 shadow-2xl shadow-black/40">
        <div className="mb-2 flex justify-center">
          <span className="h-1.5 w-14 rounded-full bg-zinc-700" />
        </div>
        <div className="overflow-hidden rounded-[1.35rem] border border-zinc-800 bg-black">
          <div className="relative aspect-[9/14] bg-zinc-950">
            {active ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active}
                alt="Preview"
                className="h-full w-full object-cover transition-opacity duration-500"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                No image
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <p className="text-xs font-semibold text-white">
                {multi
                  ? `Random · every ${section.rotateDelaySec}s`
                  : 'Fixed display'}
              </p>
              <p className="text-[10px] text-zinc-300">
                {urls.length} selected for presentation
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
