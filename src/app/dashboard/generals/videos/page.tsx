'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ImageSectionPreview } from '@/components/ImageSectionPreview';
import { MultiCheckDropdown } from '@/components/MultiCheckDropdown';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import { COUNTRY_OPTIONS } from '@/lib/countries';
import { LOCALES, LOCALE_LABELS, type LocaleCode } from '@/lib/i18n';
import {
  migrateImageSections,
  primaryVideoUrlFromSection,
  removeImageFromSection,
} from '@/lib/imageSections';
import { looksLikeVideoUrl } from '@/lib/mediaUrl';
import { audienceLabel, PLAN_USER_TYPES } from '@/lib/planMatrix';
import type {
  ImagePoolItem,
  ImageSectionConfig,
  SportCatalogItem,
  UnlockAudience,
} from '@/lib/types';
import { UNLOCK_AUDIENCE_OPTIONS } from '@/lib/types';

const audienceOptions = PLAN_USER_TYPES.map((t) => ({
  value: t.id,
  label: t.label,
}));

const countryOptions = COUNTRY_OPTIONS.map((c) => ({
  value: c.code,
  label: c.name,
}));

const languageOptions = LOCALES.map((code) => ({
  value: code,
  label: LOCALE_LABELS[code],
}));

function patchItem(
  section: ImageSectionConfig,
  itemId: string,
  patch: Partial<ImagePoolItem>
): ImageSectionConfig {
  return {
    ...section,
    items: section.items.map((item) =>
      item.id === itemId ? { ...item, ...patch } : item
    ),
  };
}

export default function VideosPage() {
  const [allSections, setAllSections] = useState<ImageSectionConfig[]>([]);
  const [sports, setSports] = useState<SportCatalogItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const uploadLock = useRef(false);

  // Admin browse filters — Language (1) + Type of Visitor (multi)
  const [filterLanguage, setFilterLanguage] = useState<LocaleCode | ''>('');
  const [filterAudiences, setFilterAudiences] = useState<UnlockAudience[]>([]);

  const sportOptions = useMemo(
    () => sports.map((sp) => ({ value: sp.id, label: sp.name })),
    [sports]
  );

  const hero = useMemo(
    () => allSections.find((s) => s.key === 'hero') || null,
    [allSections]
  );

  const visibleItems = useMemo(() => {
    if (!hero) return [];
    return hero.items.filter((item) => {
      if (!looksLikeVideoUrl(item.url)) return false;
      if (filterLanguage && item.language !== filterLanguage) return false;
      if (filterAudiences.length) {
        const audiences = item.audiences || [];
        if (!audiences.some((a) => filterAudiences.includes(a))) return false;
      }
      return true;
    });
  }, [hero, filterLanguage, filterAudiences]);

  async function load() {
    const s = await fetchSettings();
    const next =
      s.imageSections?.length > 0
        ? s.imageSections
        : migrateImageSections(s);
    setAllSections(next);
    setSports(Array.isArray(s.sports) ? s.sports.map((sp) => ({ ...sp })) : []);
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  function updateHero(
    updater: (section: ImageSectionConfig) => ImageSectionConfig
  ) {
    setAllSections((prev) =>
      prev.map((section) =>
        section.key === 'hero' ? updater(section) : section
      )
    );
  }

  function toggleSelected(itemId: string) {
    updateHero((section) => {
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

  function selectOnly(itemId: string) {
    updateHero((section) => ({ ...section, selectedIds: [itemId] }));
  }

  function requestRemoveItem(itemId: string) {
    setPendingRemoveId(itemId);
  }

  function confirmRemoveItem() {
    if (!pendingRemoveId) return;
    const itemId = pendingRemoveId;
    setPendingRemoveId(null);
    updateHero((section) => removeImageFromSection(section, itemId));
  }

  async function upload(file: File, mode: 'add' | 'replace', itemId?: string) {
    if (!hero || uploadLock.current) return;
    uploadLock.current = true;
    const busy = `hero:${mode}:${itemId || 'new'}`;
    setBusyKey(busy);
    setMessage('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('sectionKey', 'hero');
      form.append('mode', mode);
      if (itemId) form.append('itemId', itemId);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      const next =
        data.settings?.imageSections?.length > 0
          ? data.settings.imageSections
          : migrateImageSections(data.settings || {});
      setAllSections(next);
      setMessage(
        mode === 'add'
          ? 'Video added — set Language + Visitor type before save.'
          : 'Video replaced.'
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusyKey(null);
      uploadLock.current = false;
    }
  }

  async function onSave() {
    if (!hero) return;
    setSaving(true);
    setMessage('');
    try {
      for (const item of hero.items) {
        if (!looksLikeVideoUrl(item.url)) continue;
        if (!item.language) {
          throw new Error(
            `Each video needs exactly 1 language (missing on ${item.url})`
          );
        }
        if (!(item.audiences || []).length) {
          throw new Error(
            `Select at least 1 Type of Visitor for video (${item.language})`
          );
        }
        if (!(item.sports || []).length) {
          throw new Error(
            `Select at least 1 sport for video (${item.language})`
          );
        }
      }

      const current = await fetchSettings();
      // Keep image sections intact; only replace hero.
      const merged = (current.imageSections?.length
        ? current.imageSections
        : migrateImageSections(current)
      ).map((s) => (s.key === 'hero' ? hero : s));

      const heroVideoUrl = primaryVideoUrlFromSection(hero);
      const final = await saveSettings({
        imageSections: merged,
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
      setAllSections(next);
      setMessage('Videos saved.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!hero) {
    return <p className="text-zinc-400">Loading videos…</p>;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-semibold">Videos</h1>
      <p className="mt-2 text-zinc-400">
        Presentation / home hero clips are filtered on mobile by the visitor’s{' '}
        <span className="text-[#FF7800]">language</span> (exact match — never
        cross-language), optional{' '}
        <span className="text-[#FF7800]">country</span>,{' '}
        <span className="text-[#FF7800]">type of visitor</span>, and{' '}
        <span className="text-[#FF7800]">sport</span>. Empty country = language
        only.
      </p>

      {/* Browse filters */}
      <div className="mt-6 grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-200">
            Filter by language
          </span>
          <select
            value={filterLanguage}
            onChange={(e) =>
              setFilterLanguage((e.target.value || '') as LocaleCode | '')
            }
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none ring-[#FF7800] focus:ring-2"
          >
            <option value="">All languages</option>
            {languageOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-zinc-500">
            Find videos for one presentation language
          </span>
        </label>

        <MultiCheckDropdown
          label="Filter by type of visitor"
          options={audienceOptions}
          values={filterAudiences}
          onChange={(vals) =>
            setFilterAudiences(
              vals.filter((v): v is UnlockAudience =>
                (UNLOCK_AUDIENCE_OPTIONS as readonly string[]).includes(v)
              )
            )
          }
          emptyLabel="All visitor types"
          hint="Athlete, Coach, Teams, Clubs, Groups"
        />
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Showing {visibleItems.length} of {hero.items.length} video
        {hero.items.length === 1 ? '' : 's'}
        {filterLanguage || filterAudiences.length
          ? ' (filtered)'
          : ''}
        .
      </p>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item, index) => {
            const selected = hero.selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`overflow-hidden rounded-2xl border ${
                  selected ? 'border-[#FF7800]' : 'border-zinc-800'
                } bg-zinc-950/70`}
              >
                <div className="relative aspect-video bg-black">
                  <video
                    src={item.url}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                    controls
                  />
                  <span className="absolute left-2 top-2 rounded bg-black/75 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#FF7800]">
                    Clip #{index + 1}
                    {item.language
                      ? ` · ${LOCALE_LABELS[item.language as LocaleCode] || item.language}`
                      : ' · no language'}
                  </span>
                </div>

                <div className="space-y-3 p-3">
                  <p className="truncate text-xs text-zinc-500">{item.url}</p>

                  <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-200">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSelected(item.id)}
                      className="h-3.5 w-3.5 accent-[#FF7800]"
                    />
                    Include in playlist
                  </label>

                  {/* Language — exactly 1 */}
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-zinc-300">
                      Language <span className="text-[#FF7800]">(1 only)</span>
                    </span>
                    <select
                      value={item.language || ''}
                      onChange={(e) =>
                        updateHero((section) =>
                          patchItem(section, item.id, {
                            language: e.target.value || undefined,
                          })
                        )
                      }
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white"
                    >
                      <option value="">Select language…</option>
                      {languageOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Countries — 0+ ; empty = language only */}
                  <MultiCheckDropdown
                    label="Country"
                    options={countryOptions}
                    values={item.countries || []}
                    onChange={(next) =>
                      updateHero((section) =>
                        patchItem(section, item.id, { countries: next })
                      )
                    }
                    emptyLabel="Any (language only)"
                    hint="Leave empty to match by language only"
                  />

                  {/* Visitor types — 1+ */}
                  <MultiCheckDropdown
                    label="Type of visitor"
                    options={audienceOptions}
                    values={item.audiences || []}
                    onChange={(next) =>
                      updateHero((section) =>
                        patchItem(section, item.id, {
                          audiences: next.filter((v): v is UnlockAudience =>
                            (UNLOCK_AUDIENCE_OPTIONS as readonly string[]).includes(
                              v
                            )
                          ),
                        })
                      )
                    }
                    emptyLabel="None selected"
                    hint="Select one or more: Athlete, Coach, Teams, Clubs, Groups"
                  />

                  {/* Sports — 1+ */}
                  <MultiCheckDropdown
                    label="Sport"
                    options={sportOptions}
                    values={item.sports || []}
                    onChange={(next) =>
                      updateHero((section) =>
                        patchItem(section, item.id, { sports: next })
                      )
                    }
                    emptyLabel="None selected"
                    hint={
                      sportOptions.length
                        ? 'Select one or more sports'
                        : 'Add sports under Feature → Testimonials first'
                    }
                  />

                  {(item.audiences || []).length > 0 ? (
                    <p className="text-[10px] text-zinc-500">
                      Visitors:{' '}
                      {(item.audiences || [])
                        .map((a) => audienceLabel(a))
                        .join(', ')}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => selectOnly(item.id)}
                      className="rounded-lg border border-zinc-700 px-2 py-1 text-[11px] text-zinc-200 hover:border-[#FF7800]"
                    >
                      Play only this
                    </button>
                    <label className="inline-flex cursor-pointer rounded-lg bg-[#FF7800] px-2 py-1 text-[11px] font-semibold text-black">
                      {busyKey === `hero:replace:${item.id}` ? '…' : 'Replace'}
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                        className="hidden"
                        disabled={busyKey !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file) upload(file, 'replace', item.id);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => requestRemoveItem(item.id)}
                      className="rounded-lg border border-red-900/50 px-2 py-1 text-[11px] text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#FF7800]/40 px-3 py-6 text-center text-[#FF7800] transition hover:bg-[#FF7800]/10">
            <span className="text-sm font-semibold">
              {busyKey === 'hero:add:new' ? 'Uploading…' : 'Add video'}
            </span>
            <span className="mt-1 text-[11px] text-zinc-500">
              MP4 / WebM / MOV · then set language + visitor type
            </span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              className="hidden"
              disabled={busyKey !== null}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (file) upload(file, 'add');
              }}
            />
          </label>
        </div>

        <ImageSectionPreview
          section={{
            ...hero,
            items: visibleItems.length ? visibleItems : hero.items,
            selectedIds: hero.selectedIds.filter((id) =>
              (visibleItems.length ? visibleItems : hero.items).some(
                (i) => i.id === id
              )
            ),
          }}
        />
      </div>

      <SaveBar
        saving={saving}
        message={message}
        onSave={onSave}
        onReset={() => load()}
      />

      <ConfirmDialog
        open={Boolean(pendingRemoveId)}
        title="Remove video"
        message="Remove this video? It will stay gone after you Save."
        confirmLabel="Remove"
        onConfirm={confirmRemoveItem}
        onCancel={() => setPendingRemoveId(null)}
      />
    </div>
  );
}
