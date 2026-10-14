'use client';

import { useEffect, useState } from 'react';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import {
  MAX_IMAGES_PER_SECTION,
  removeImageFromSection,
} from '@/lib/imageSections';
import type { ImageSectionConfig, RotateDelaySec } from '@/lib/types';
import { ROTATE_DELAYS } from '@/lib/types';

export default function ImagesPage() {
  const [sections, setSections] = useState<ImageSectionConfig[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [busyKey, setBusyKey] = useState<string | null>(null);

  async function load() {
    const s = await fetchSettings();
    setSections(s.imageSections);
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  function updateSection(
    key: ImageSectionConfig['key'],
    updater: (section: ImageSectionConfig) => ImageSectionConfig
  ) {
    setSections((prev) =>
      prev.map((section) =>
        section.key === key ? updater(section) : section
      )
    );
  }

  function toggleSelected(sectionKey: ImageSectionConfig['key'], itemId: string) {
    updateSection(sectionKey, (section) => {
      const selected = new Set(section.selectedIds);
      if (selected.has(itemId)) {
        if (selected.size <= 1) return section;
        selected.delete(itemId);
      } else {
        selected.add(itemId);
      }
      return { ...section, selectedIds: Array.from(selected) };
    });
  }

  function setDelay(
    sectionKey: ImageSectionConfig['key'],
    rotateDelaySec: RotateDelaySec
  ) {
    updateSection(sectionKey, (section) => ({ ...section, rotateDelaySec }));
  }

  function removeItem(sectionKey: ImageSectionConfig['key'], itemId: string) {
    updateSection(sectionKey, (section) =>
      removeImageFromSection(section, itemId)
    );
  }

  async function upload(
    section: ImageSectionConfig,
    file: File,
    mode: 'add' | 'replace',
    itemId?: string
  ) {
    const busy = `${section.key}:${mode}:${itemId || 'new'}`;
    setBusyKey(busy);
    setMessage('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('sectionKey', section.key);
      form.append('mode', mode);
      if (itemId) form.append('itemId', itemId);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setSections(data.settings.imageSections);
      setMessage(
        mode === 'add'
          ? `Added image to ${section.label}`
          : `Replaced image in ${section.label}`
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusyKey(null);
    }
  }

  async function onSave() {
    setSaving(true);
    setMessage('');
    try {
      for (const section of sections) {
        if (!section.items.length) {
          throw new Error(`${section.label}: keep at least 1 image`);
        }
        if (!section.selectedIds.length) {
          throw new Error(`${section.label}: select at least 1 image to display`);
        }
      }
      const saved = await saveSettings({ imageSections: sections });
      setSections(saved.imageSections);
      setMessage('Image settings saved.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!sections.length) {
    return <p className="text-zinc-400">Loading images…</p>;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-semibold">Images</h1>
      <p className="mt-2 text-zinc-400">
        Each section can hold 1–{MAX_IMAGES_PER_SECTION} images. Select one to
        show a fixed image, or select two or more for random rotation.
      </p>

      <div className="mt-8 space-y-8">
        {sections.map((section) => {
          const multi = section.selectedIds.length >= 2;
          return (
            <section
              key={section.key}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-medium text-white">
                    {section.label}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {section.items.length}/{MAX_IMAGES_PER_SECTION} images ·{' '}
                    {multi
                      ? `Random rotate every ${section.rotateDelaySec}s`
                      : 'Fixed display (1 selected)'}
                  </p>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <label className="block text-sm text-zinc-300">
                    Rotate delay
                    <select
                      value={section.rotateDelaySec}
                      disabled={!multi}
                      onChange={(e) =>
                        setDelay(
                          section.key,
                          Number(e.target.value) as RotateDelaySec
                        )
                      }
                      className="mt-1 block rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white disabled:opacity-40"
                    >
                      {ROTATE_DELAYS.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec} seconds
                        </option>
                      ))}
                    </select>
                  </label>

                  <label
                    className={`inline-flex cursor-pointer items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold ${
                      section.items.length >= MAX_IMAGES_PER_SECTION
                        ? 'cursor-not-allowed bg-zinc-800 text-zinc-500'
                        : 'bg-[#FF7800] text-black'
                    }`}
                  >
                    {busyKey === `${section.key}:add:new`
                      ? 'Uploading…'
                      : 'Add image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={
                        section.items.length >= MAX_IMAGES_PER_SECTION ||
                        busyKey !== null
                      }
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (file) upload(section, file, 'add');
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((item, index) => {
                  const selected = section.selectedIds.includes(item.id);
                  const canRemove = section.items.length > 1;
                  return (
                    <div
                      key={item.id}
                      className={`overflow-hidden rounded-xl border ${
                        selected
                          ? 'border-[#FF7800]'
                          : 'border-zinc-800'
                      } bg-zinc-950/60`}
                    >
                      <div className="relative aspect-[4/3] bg-zinc-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={`${section.label} ${index + 1}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.opacity =
                              '0.25';
                          }}
                        />
                        {index === 0 ? (
                          <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#FF7800]">
                            Default
                          </span>
                        ) : null}
                      </div>
                      <div className="space-y-3 p-3">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-200">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() =>
                              toggleSelected(section.key, item.id)
                            }
                            className="h-4 w-4 accent-[#FF7800]"
                          />
                          Use in presentation
                        </label>
                        <p className="truncate text-xs text-zinc-500">
                          {item.url}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <label className="inline-flex cursor-pointer rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-200 hover:border-[#FF7800]">
                            {busyKey ===
                            `${section.key}:replace:${item.id}`
                              ? 'Uploading…'
                              : 'Replace'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={busyKey !== null}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                e.target.value = '';
                                if (file)
                                  upload(section, file, 'replace', item.id);
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            disabled={!canRemove}
                            onClick={() => removeItem(section.key, item.id)}
                            className="rounded-lg border border-red-900/50 px-2.5 py-1.5 text-xs text-red-300 disabled:opacity-40"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
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
  );
}
