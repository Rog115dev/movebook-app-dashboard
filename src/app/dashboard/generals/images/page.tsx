'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ImageSectionPreview } from '@/components/ImageSectionPreview';
import { MultiCheckDropdown } from '@/components/MultiCheckDropdown';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import {
  migrateImageSections,
  removeImageFromSection,
  sectionKind,
} from '@/lib/imageSections';
import { LOCALES, LOCALE_LABELS } from '@/lib/i18n';
import { looksLikeVideoUrl } from '@/lib/mediaUrl';
import { PLAN_USER_TYPES } from '@/lib/planMatrix';
import type {
  ImageSectionConfig,
  ImageSectionKey,
  RotateDelaySec,
  SportCatalogItem,
  UnlockAudience,
} from '@/lib/types';
import { ROTATE_DELAYS, UNLOCK_AUDIENCE_OPTIONS } from '@/lib/types';

const audienceOptions = PLAN_USER_TYPES.map((t) => ({
  value: t.id,
  label: t.label,
}));

const languageOptions = LOCALES.map((code) => ({
  value: code,
  label: LOCALE_LABELS[code],
}));

export default function ImagesPage() {
  const [sections, setSections] = useState<ImageSectionConfig[]>([]);
  const [sports, setSports] = useState<SportCatalogItem[]>([]);
  const [previewKey, setPreviewKey] = useState<ImageSectionKey>('hero');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<{
    sectionKey: ImageSectionConfig['key'];
    itemId: string;
  } | null>(null);
  const uploadLock = useRef(false);

  const sportOptions = useMemo(
    () => sports.map((sp) => ({ value: sp.id, label: sp.name })),
    [sports]
  );

  async function load() {
    const s = await fetchSettings();
    const next =
      s.imageSections?.length > 0
        ? s.imageSections
        : migrateImageSections(s);
    const imagesOnly = next.filter((sec) => sectionKind(sec.key) === 'image');
    setSections(imagesOnly);
    setSports(Array.isArray(s.sports) ? s.sports.map((sp) => ({ ...sp })) : []);
    setPreviewKey(imagesOnly[0]?.key || 'paywall');
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

  function setItemSports(
    sectionKey: ImageSectionConfig['key'],
    itemId: string,
    nextSports: string[]
  ) {
    updateSection(sectionKey, (section) => ({
      ...section,
      items: section.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              sports: Array.from(new Set(nextSports.filter(Boolean))),
            }
          : item
      ),
    }));
  }

  function setItemAudiences(
    sectionKey: ImageSectionConfig['key'],
    itemId: string,
    nextAudiences: string[]
  ) {
    updateSection(sectionKey, (section) => ({
      ...section,
      items: section.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              audiences: nextAudiences.filter((v): v is UnlockAudience =>
                (UNLOCK_AUDIENCE_OPTIONS as readonly string[]).includes(v)
              ),
            }
          : item
      ),
    }));
  }

  function setItemLanguages(
    sectionKey: ImageSectionConfig['key'],
    itemId: string,
    nextLanguages: string[]
  ) {
    updateSection(sectionKey, (section) => ({
      ...section,
      items: section.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              languages: Array.from(
                new Set(nextLanguages.map((l) => l.trim().toLowerCase()).filter(Boolean))
              ),
            }
          : item
      ),
    }));
  }

  function requestRemoveItem(
    sectionKey: ImageSectionConfig['key'],
    itemId: string
  ) {
    setPendingRemove({ sectionKey, itemId });
  }

  function confirmRemoveItem() {
    if (!pendingRemove) return;
    const { sectionKey, itemId } = pendingRemove;
    setPendingRemove(null);
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
      const uploaded =
        data.settings?.imageSections?.length > 0
          ? data.settings.imageSections
          : migrateImageSections(data.settings || {});
      setSections(
        uploaded.filter(
          (sec: ImageSectionConfig) => sectionKind(sec.key) === 'image'
        )
      );
      setMessage(
        mode === 'add'
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
        for (const item of section.items) {
          if (!(item.languages || []).length) {
            throw new Error(
              `${section.label}: each image needs at least 1 language`
            );
          }
          if (!(item.sports || []).length) {
            throw new Error(
              `${section.label}: each image needs at least 1 sport (so swim ≠ football)`
            );
          }
          if (!(item.audiences || []).length) {
            throw new Error(
              `${section.label}: each image needs at least 1 type of visitor`
            );
          }
        }
      }
      const current = await fetchSettings();
      const existing =
        current.imageSections?.length > 0
          ? current.imageSections
          : migrateImageSections(current);
      // Preserve hero videos managed on the Videos page.
      const merged = existing.map((sec) => {
        if (sectionKind(sec.key) === 'video') return sec;
        return sections.find((s) => s.key === sec.key) || sec;
      });
      for (const sec of sections) {
        if (!merged.some((s) => s.key === sec.key)) merged.push(sec);
      }
      const final = await saveSettings({
        imageSections: merged,
        home: {
          ...current.home,
          heroImageUrl: looksLikeVideoUrl(current.home.heroImageUrl)
            ? ''
            : current.home.heroImageUrl,
        },
      });
      const next =
        final.imageSections?.length > 0
          ? final.imageSections
          : migrateImageSections(final);
      setSections(next.filter((sec) => sectionKind(sec.key) === 'image'));
      setMessage('Image settings saved.');
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
      <h1 className="text-2xl font-semibold">Images</h1>
      <p className="mt-2 text-zinc-400">
        Paywall and TRAIN PRO image pools. Each image must target{' '}
        <span className="text-[#FF7800]">language(s)</span>,{' '}
        <span className="text-[#FF7800]">sport(s)</span>, and{' '}
        <span className="text-[#FF7800]">type of visitor</span> — mobile shows
        it only when the visitor matches. Hero clips are under{' '}
        <span className="text-[#FF7800]">Generals → Videos</span>.
      </p>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-4 lg:grid-cols-3">
          {sections.map((section) => {
            const kind = sectionKind(section.key);
            const isVideo = kind === 'video';
            const multi = !isVideo && section.selectedIds.length >= 2;
            const canAdd = true;
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
                        ? `${section.selectedIds.length} in cycle · ${section.items.length} video${section.items.length === 1 ? '' : 's'}`
                        : 'No videos yet'
                      : `${section.items.length} image${section.items.length === 1 ? '' : 's'}${
                          multi
                            ? ` · random ${section.rotateDelaySec}s`
                            : ' · fixed'
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
                          {!isVideo ? (
                            <div
                              className="relative z-10 space-y-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MultiCheckDropdown
                                label="Language"
                                options={languageOptions}
                                values={item.languages || []}
                                onChange={(next) =>
                                  setItemLanguages(section.key, item.id, next)
                                }
                                emptyLabel="None selected"
                                hint="Required — show only for visitors who chose one of these languages"
                              />
                              <MultiCheckDropdown
                                label="Type of sport"
                                options={sportOptions}
                                values={item.sports || []}
                                onChange={(next) =>
                                  setItemSports(section.key, item.id, next)
                                }
                                emptyLabel="None selected"
                                hint={
                                  sportOptions.length
                                    ? 'Required — swim visitors must not see football images'
                                    : 'Add sports under Feature → Testimonials first'
                                }
                              />
                              <MultiCheckDropdown
                                label="Type of visitor"
                                options={audienceOptions}
                                values={item.audiences || []}
                                onChange={(next) =>
                                  setItemAudiences(section.key, item.id, next)
                                }
                                emptyLabel="None selected"
                                hint="Required — Athlete, Coach, Teams, Clubs, Groups"
                              />
                            </div>
                          ) : null}
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
                                requestRemoveItem(section.key, item.id);
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
                        ? 'MP4 / WebM / MOV · no limit'
                        : 'No limit — add for each sport / user targeting'}
                    </span>
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

      <ConfirmDialog
        open={Boolean(pendingRemove)}
        title="Remove image"
        message="Remove this image? It will stay gone after you Save."
        confirmLabel="Remove"
        onConfirm={confirmRemoveItem}
        onCancel={() => setPendingRemove(null)}
      />
    </div>
  );
}
