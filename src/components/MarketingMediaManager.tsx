'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MultiCheckDropdown } from '@/components/MultiCheckDropdown';
import { SaveBar } from '@/components/SaveBar';
import { useConfirm } from '@/hooks/useConfirm';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import { COUNTRY_OPTIONS } from '@/lib/countries';
import { LOCALES, LOCALE_LABELS } from '@/lib/i18n';
import {
  createMarketingMediaItem,
  MARKETING_GENDER_LABELS,
  MARKETING_GENDERS,
  MARKETING_SECTION_LABELS,
  MARKETING_USER_TYPES,
  type MarketingGender,
  type MarketingMediaItem,
  type MarketingMediaKind,
  type MarketingSectionKey,
  type MarketingSettings,
} from '@/lib/marketing';
import type { SportCatalogItem, UnlockAudience } from '@/lib/types';
import { UNLOCK_AUDIENCE_OPTIONS } from '@/lib/types';

type Props = {
  sectionKey: MarketingSectionKey;
};

const countryOptions = COUNTRY_OPTIONS.map((c) => ({
  value: c.code,
  label: c.name,
}));

const languageOptions = LOCALES.map((code) => ({
  value: code,
  label: LOCALE_LABELS[code],
}));

export function MarketingMediaManager({ sectionKey }: Props) {
  const isAvatars = sectionKey === 'avatars';
  const { confirm, confirmDialog } = useConfirm();
  const [marketing, setMarketing] = useState<MarketingSettings | null>(null);
  const [sports, setSports] = useState<SportCatalogItem[]>([]);
  const [mediaKind, setMediaKind] = useState<MarketingMediaKind>('image');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const uploadLock = useRef(false);

  // Filters
  const [filterAudience, setFilterAudience] = useState<UnlockAudience | ''>('');
  const [filterGender, setFilterGender] = useState<MarketingGender | ''>('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterSports, setFilterSports] = useState<string[]>([]);

  const sportOptions = useMemo(
    () => sports.map((sp) => ({ value: sp.id, label: sp.name })),
    [sports]
  );

  const items = marketing?.[sectionKey] || [];

  const visible = useMemo(() => {
    return items.filter((item) => {
      if (item.kind !== mediaKind) return false;
      if (filterAudience && !(item.audiences || []).includes(filterAudience)) {
        return false;
      }
      if (isAvatars && filterGender && (item.gender || 'both') !== filterGender) {
        return false;
      }
      if (
        filterCountry &&
        !(item.countries || []).includes(filterCountry.toUpperCase())
      ) {
        return false;
      }
      if (
        filterLanguage &&
        !(item.languages || []).includes(filterLanguage.toLowerCase())
      ) {
        return false;
      }
      if (filterSports.length) {
        const tagged = item.sports || [];
        if (!filterSports.some((s) => tagged.includes(s))) return false;
      }
      return true;
    });
  }, [
    items,
    mediaKind,
    isAvatars,
    filterAudience,
    filterGender,
    filterCountry,
    filterLanguage,
    filterSports,
  ]);

  async function load() {
    const s = await fetchSettings();
    setMarketing(
      s.marketing || {
        avatars: [],
        reels: [],
        checks: [],
      }
    );
    setSports(Array.isArray(s.sports) ? s.sports.map((sp) => ({ ...sp })) : []);
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load marketing settings'));
  }, [sectionKey]);

  function patchItem(itemId: string, patch: Partial<MarketingMediaItem>) {
    setMarketing((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [sectionKey]: prev[sectionKey].map((item) =>
          item.id === itemId ? { ...item, ...patch } : item
        ),
      };
    });
  }

  async function removeItem(itemId: string) {
    const ok = await confirm({
      title: 'Remove item',
      message: 'Remove this item? It will stay gone after you Save.',
    });
    if (!ok) return;
    setMarketing((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [sectionKey]: prev[sectionKey].filter((item) => item.id !== itemId),
      };
    });
  }

  async function addNew(file: File) {
    if (uploadLock.current || !marketing) return;
    uploadLock.current = true;
    setBusy(true);
    setMessage('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', `marketing-${sectionKey}`);
      const res = await fetch('/api/upload/asset', {
        method: 'POST',
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      const url = String(data.url || '').trim();
      if (!url) throw new Error('Upload returned no URL');

      const created = createMarketingMediaItem(sectionKey, mediaKind, url);
      // If user selected video radio but uploaded image (or vice versa), trust radio.
      created.kind = mediaKind;
      setMarketing({
        ...marketing,
        [sectionKey]: [...marketing[sectionKey], created],
      });
      setMessage(
        `${mediaKind === 'video' ? 'Video' : 'Image'} added — set targeting, then Save.`
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
      uploadLock.current = false;
    }
  }

  async function onSave() {
    if (!marketing) return;
    setSaving(true);
    setMessage('');
    try {
      for (const item of marketing[sectionKey]) {
        if (!(item.audiences || []).length) {
          throw new Error('Each item needs at least 1 type of user');
        }
        if (!(item.countries || []).length) {
          throw new Error('Each item needs at least 1 country');
        }
        if (!(item.languages || []).length) {
          throw new Error(
            item.kind === 'video'
              ? 'Each video needs exactly 1 language'
              : 'Each image needs at least 1 language'
          );
        }
        if (item.kind === 'video' && item.languages.length !== 1) {
          throw new Error('Each video can be linked to only 1 language');
        }
        if (!(item.sports || []).length) {
          throw new Error('Each item needs at least 1 sport');
        }
        if (
          isAvatars &&
          !(MARKETING_GENDERS as readonly string[]).includes(
            String(item.gender || '')
          )
        ) {
          throw new Error('Each avatar needs a gender (Male, Female, or Both)');
        }
      }

      const current = await fetchSettings();
      const nextMarketing: MarketingSettings = {
        ...(current.marketing || {
          avatars: [],
          reels: [],
          checks: [],
        }),
        ...marketing,
      };
      const saved = await saveSettings({ marketing: nextMarketing });
      setMarketing(saved.marketing);
      setMessage(`${MARKETING_SECTION_LABELS[sectionKey]} saved.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!marketing) {
    return <p className="text-zinc-400">Loading marketing…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {MARKETING_SECTION_LABELS[sectionKey]}
        </h1>
        <p className="mt-2 text-zinc-400">
          Manage marketing{' '}
          <span className="text-[#FF7800]">images</span> or{' '}
          <span className="text-[#FF7800]">videos</span>. Each asset is linked
          to user types, countries, languages, and sports.
        </p>
      </div>

      {/* Images / Videos radio */}
      <div className="flex flex-wrap gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        {(['image', 'video'] as const).map((kind) => {
          const active = mediaKind === kind;
          return (
            <label
              key={kind}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? 'border-[#FF7800] bg-[#FF7800]/15 text-white'
                  : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              <input
                type="radio"
                name={`${sectionKey}-media-kind`}
                checked={active}
                onChange={() => setMediaKind(kind)}
                className="accent-[#FF7800]"
              />
              {kind === 'image' ? 'IMAGES' : 'VIDEOS'}
            </label>
          );
        })}
      </div>

      {/* Filters */}
      <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
          Filter list
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterAudience('')}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              filterAudience === ''
                ? 'border-[#FF7800] bg-[#FF7800] text-black'
                : 'border-zinc-700 text-zinc-300 hover:border-[#FF7800]/60'
            }`}
          >
            All types of users
          </button>
          {MARKETING_USER_TYPES.map((type) => {
            const active = filterAudience === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setFilterAudience(type.id)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  active
                    ? 'border-[#FF7800] bg-[#FF7800] text-black'
                    : 'border-zinc-700 text-zinc-300 hover:border-[#FF7800]/60'
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {isAvatars ? (
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-zinc-200">Gender</span>
              <select
                value={filterGender}
                onChange={(e) =>
                  setFilterGender((e.target.value || '') as MarketingGender | '')
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              >
                <option value="">All genders</option>
                {MARKETING_GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {MARKETING_GENDER_LABELS[g]}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-zinc-200">Country</span>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            >
              <option value="">All countries</option>
              {countryOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-zinc-200">Language</span>
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
            >
              <option value="">All languages</option>
              {languageOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <MultiCheckDropdown
            label="Sport"
            options={sportOptions}
            values={filterSports}
            onChange={setFilterSports}
            emptyLabel="All sports"
            hint="Multi-check filter"
          />
        </div>

        <p className="text-xs text-zinc-500">
          Showing {visible.length} {mediaKind}
          {visible.length === 1 ? '' : 's'}
          {filterAudience ||
          filterGender ||
          filterCountry ||
          filterLanguage ||
          filterSports.length
            ? ' (filtered)'
            : ''}
          .
        </p>
      </div>

      {/* List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70"
          >
            <div className="relative aspect-video bg-black">
              {item.kind === 'video' ? (
                <video
                  src={item.url}
                  className="h-full w-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
              <span className="absolute left-2 top-2 rounded bg-black/75 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#FF7800]">
                {item.kind}
              </span>
            </div>

            <div className="space-y-3 p-3">
              <p className="truncate text-xs text-zinc-500">{item.url}</p>

              <MultiCheckDropdown
                label="Type of user"
                options={MARKETING_USER_TYPES.map((t) => ({
                  value: t.id,
                  label: t.label,
                }))}
                values={item.audiences}
                onChange={(vals) =>
                  patchItem(item.id, {
                    audiences: vals.filter((v): v is UnlockAudience =>
                      (UNLOCK_AUDIENCE_OPTIONS as readonly string[]).includes(v)
                    ),
                  })
                }
                emptyLabel="None selected"
                hint="1 or more"
              />

              {isAvatars ? (
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-zinc-200">
                    Gender
                  </span>
                  <select
                    value={item.gender || 'both'}
                    onChange={(e) =>
                      patchItem(item.id, {
                        gender: e.target.value as MarketingGender,
                      })
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white"
                  >
                    {MARKETING_GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {MARKETING_GENDER_LABELS[g]}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <MultiCheckDropdown
                label="Country"
                options={countryOptions}
                values={item.countries}
                onChange={(vals) => patchItem(item.id, { countries: vals })}
                emptyLabel="None selected"
                hint="1 or more"
              />

              {item.kind === 'video' ? (
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-zinc-200">
                    Language <span className="text-[#FF7800]">(1 only)</span>
                  </span>
                  <select
                    value={item.languages[0] || ''}
                    onChange={(e) =>
                      patchItem(item.id, {
                        languages: e.target.value ? [e.target.value] : [],
                      })
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
              ) : (
                <MultiCheckDropdown
                  label="Language"
                  options={languageOptions}
                  values={item.languages}
                  onChange={(vals) => patchItem(item.id, { languages: vals })}
                  emptyLabel="None selected"
                  hint="1 or more"
                />
              )}

              <MultiCheckDropdown
                label="Sport"
                options={sportOptions}
                values={item.sports}
                onChange={(vals) => patchItem(item.id, { sports: vals })}
                emptyLabel="None selected"
                hint={
                  sportOptions.length
                    ? '1 or more'
                    : 'Add sports under Feature → Testimonials first'
                }
              />

              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="w-full rounded-lg border border-red-900/50 px-3 py-2 text-sm text-red-300 hover:border-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <label className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#FF7800]/40 px-3 py-6 text-center text-[#FF7800] transition hover:bg-[#FF7800]/10">
          <span className="text-sm font-semibold">
            {busy ? 'Uploading…' : 'Add new'}
          </span>
          <span className="mt-1 text-[11px] text-zinc-500">
            {mediaKind === 'video'
              ? 'MP4 / WebM / MOV'
              : 'PNG / JPG / WebP / GIF'}
          </span>
          <input
            type="file"
            accept={
              mediaKind === 'video'
                ? 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov'
                : 'image/*'
            }
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) addNew(file);
            }}
          />
        </label>
      </div>

      <SaveBar
        saving={saving}
        message={message}
        onSave={onSave}
        onReset={() => load()}
      />
      {confirmDialog}
    </div>
  );
}
