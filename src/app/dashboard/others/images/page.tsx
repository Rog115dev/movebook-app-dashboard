'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageSectionPreview } from '@/components/ImageSectionPreview';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import {
  MAX_HERO_VIDEOS,
  MAX_IMAGES_PER_SECTION,
  migrateImageSections,
  primaryVideoUrlFromSection,
  removeImageFromSection,
  sectionKind,
} from '@/lib/imageSections';
import { looksLikeVideoUrl } from '@/lib/mediaUrl';
import type {
  ImageSectionConfig,
  ImageSectionKey,
  RotateDelaySec,
} from '@/lib/types';
import { ROTATE_DELAYS } from '@/lib/types';

export default function ImagesPage() {
  const [sections, setSections] = useState<ImageSectionConfig[]>([]);
  const [previewKey, setPreviewKey] = useState<ImageSectionKey>('hero');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const uploadLock = useRef(false);

  async function load() {
    const s = await fetchSettings();
    const next =
      s.imageSections?.length > 0
        ? s.imageSections
        : migrateImageSections(s);
    setSections(next);
    setPreviewKey(next[0]?.key || 'hero');
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  function updateSection(
    key: ImageSectionConfig['key'],
    updater: (section: ImageSectionConfig) => ImageSectionConfig
  ) {
    setSections((prev) =>
      prev.map((section) => (section.key === key ? updater(section) : section))
    );
  }

  function toggleSelected(
    sectionKey: ImageSectionConfig['key'],
    itemId: string
  ) {
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

  function selectOnly(
    sectionKey: ImageSectionConfig['key'],
    itemId: string
  ) {
    updateSection(sectionKey, (section) => ({
      ...section,
      selectedIds: [itemId],
    }));
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
    if (uploadLock.current) return;
    uploadLock.current = true;
    const busy = `${section.key}:${mode}:${itemId || 'new'}`;
    setBusyKey(busy);
    setMessage('');
    setPreviewKey(section.key);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('sectionKey', section.key);
      form.append('mode', mode);
      if (itemId) form.append('itemId', itemId);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      const next =
        data.settings?.imageSections?.length > 0
          ? data.settings.imageSections
          : migrateImageSections(data.settings || {});
      setSections(next);
      const kind = sectionKind(section.key);
      setMessage(
        kind === 'video'
          ? 'Hero video saved (single clip).'
          : mode === 'add'
            ? `Added image to ${section.label}`
            : `Replaced image in ${section.label}`
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusyKey(null);
      uploadLock.current = false;
    }
  }

  async function onSave() {
    setSaving(true);
    setMessage('');
    try {
      for (const section of sections) {
        const kind = sectionKind(section.key);
        if (kind === 'image' && !section.items.length) {
          throw new Error(`${section.label}: keep at least 1 image`);
        }
        if (kind === 'image' && !section.selectedIds.length) {
          throw new Error(
            `${section.label}: select at least 1 image to display`
          );
        }
      }
      const current = await fetchSettings();
      const hero = sections.find((s) => s.key === 'hero');
      const heroVideoUrl = primaryVideoUrlFromSection(hero);
      const final = await saveSettings({
        imageSections: sections,
        home: {
          ...current.home,
          heroVideoUrl: heroVideoUrl || '',
          heroVideoChosen: Boolean(heroVideoUrl),
          heroImageUrl: looksLikeVideoUrl(current.home.heroImageUrl)
            ? ''
            : current.home.heroImageUrl,
        },
      });
      const next =
        final.imageSections?.length > 0
          ? final.imageSections
          : migrateImageSections(final);
      setSections(next);
      setMessage('Media settings saved.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  const previewSection =
    sections.find((s) => s.key === previewKey) || sections[0] || null;

  if (!sections.length) {
    return <p className="text-zinc-400">Loading media…</p>;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-semibold">Images & video</h1>
      <p className="mt-2 text-zinc-400">
        Home hero is a{' '}
        <span className="text-[#FF7800]">video playlist</span> (up to{' '}
        {MAX_HERO_VIDEOS}). Selected clips play in a circular cycle — each
        plays for its full length. Paywall and TRAIN PRO stay image pools.
      </p>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-4 lg:grid-cols-3">
          {sections.map((section) => {
            const kind = sectionKind(section.key);
            const isVideo = kind === 'video';
            const multi = !isVideo && section.selectedIds.length >= 2;
            const maxItems = isVideo ? MAX_HERO_VIDEOS : MAX_IMAGES_PER_SECTION;
            const canAdd = section.items.length < maxItems;
            return (
              <section
                key={section.key}
                onClick={() => setPreviewKey(section.key)}
                className={`flex flex-col rounded-2xl border p-4 ${
                  previewKey === section.key
                    ? 'border-[#FF7800] bg-zinc-900/50'
                    : 'border-zinc-800 bg-zinc-900/30'
                }`}
              >
                <div className="mb-3">
                  <h2 className="text-lg font-medium text-white">
                    {section.label}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    {isVideo
                      ? section.items.length
                        ? `${section.selectedIds.length} in cycle Â· ${section.items.length}/${MAX_HERO_VIDEOS}`
                        : 'No videos yet'
                      : `${section.items.length}/${MAX_IMAGES_PER_SECTION}${
                          multi
                            ? ` Â· random ${section.rotateDelaySec}s`
                            : ' Â· fixed'
                        }`}
                  </p>
                </div>

                {!isVideo ? (
                  <label className="mb-3 block text-xs text-zinc-400">
                    Rotate delay
                    <select
                      value={section.rotateDelaySec}
                      disabled={!multi}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        setDelay(
                          section.key,
                          Number(e.target.value) as RotateDelaySec
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm text-white disabled:opacity-40"
                    >
                      {ROTATE_DELAYS.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}&quot;
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                <div className="flex flex-1 flex-col gap-3">
                  {section.items.map((item, index) => {
                    const selected = section.selectedIds.includes(item.id);
                    const canRemove = section.items.length > 0;
                    const itemIsVideo = looksLikeVideoUrl(item.url);
                    return (
                      <div
                        key={item.id}
                        className={`overflow-hidden rounded-xl border ${
                          selected ? 'border-[#FF7800]' : 'border-zinc-800'
                        } bg-zinc-950/70`}
                      >
                        <div className="relative aspect-square bg-zinc-950">
                          {itemIsVideo ? (
                            <video
                              src={item.url}
                              className="h-full w-full object-cover"
                              muted
                              playsInline
                              preload="metadata"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.url}
                              alt={`${section.label} ${index + 1}`}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.opacity =
                                  '0.25';
                              }}
                            />
                          )}
                          <span className="absolute left-2 top-2 rounded bg-black/75 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#FF7800]">
                            {isVideo
                              ? `Clip #${index + 1}`
                              : index === 0
                                ? 'Default'
                                : `#${index + 1}`}
                          </span>
                        </div>
                        <div className="space-y-2 p-3">
                          <p className="truncate text-xs text-zinc-500">
                            {item.url}
                          </p>
                          <label
                            className="flex cursor-pointer items-center gap-2 text-xs text-zinc-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                toggleSelected(section.key, item.id)
                              }
                              className="h-3.5 w-3.5 accent-[#FF7800]"
                            />
                            {isVideo
                              ? 'Include in cycle'
                              : 'Use in presentation'}
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectOnly(section.key, item.id);
                              }}
                              className="rounded-lg border border-zinc-700 px-2 py-1 text-[11px] text-zinc-200 hover:border-[#FF7800]"
                            >
                              {isVideo ? 'Play only this' : 'Show only this'}
                            </button>
                            <label
                              className="inline-flex cursor-pointer rounded-lg bg-[#FF7800] px-2 py-1 text-[11px] font-semibold text-black"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {busyKey ===
                              `${section.key}:replace:${item.id}`
                                ? '…'
                                : 'Replace'}
                              <input
                                type="file"
                                accept={
                                  isVideo
                                    ? 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov'
                                    : 'image/*'
                                }
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
                              onClick={(e) => {
                                e.stopPropagation();
                                removeItem(section.key, item.id);
                              }}
                              className="rounded-lg border border-red-900/50 px-2 py-1 text-[11px] text-red-300 disabled:opacity-35"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <label
                    onClick={(e) => e.stopPropagation()}
                    className={`mt-1 flex min-h-[88px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-3 py-4 text-center transition ${
                      canAdd
                        ? 'border-[#FF7800]/40 text-[#FF7800] hover:bg-[#FF7800]/10'
                        : 'cursor-not-allowed border-zinc-800 text-zinc-600'
                    }`}
                  >
                    <span className="text-sm font-semibold">
                      {busyKey === `${section.key}:add:new`
                        ? 'Uploading…'
                        : isVideo
                          ? 'Add video to cycle'
                          : 'Add images'}
                    </span>
                    <span className="mt-1 text-[11px] text-zinc-500">
                      {isVideo
                        ? canAdd
                          ? `MP4 / WebM / MOV Â· ${MAX_HERO_VIDEOS - section.items.length} slots left`
                          : 'Maximum 9 videos'
                        : canAdd
                          ? `Up to ${MAX_IMAGES_PER_SECTION - section.items.length} more`
                          : 'Maximum 9 reached'}
                    </span>
                    <input
                      type="file"
                      accept={
                        isVideo
                          ? 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov'
                          : 'image/*'
                      }
                      className="hidden"
                      disabled={!canAdd || busyKey !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (file) upload(section, file, 'add');
                      }}
                    />
                  </label>
                </div>
              </section>
            );
          })}
        </div>

        <ImageSectionPreview section={previewSection} />
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
