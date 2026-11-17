'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MultiCheckDropdown } from '@/components/MultiCheckDropdown';
import { SaveBar } from '@/components/SaveBar';
import { useConfirm } from '@/hooks/useConfirm';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import {
  browserTranslatorSupported,
  translateTextWithBrowser,
} from '@/lib/browserTranslate';
import { COUNTRY_OPTIONS } from '@/lib/countries';
import {
  isLocaleCode,
  LOCALES,
  LOCALE_LABELS,
  type LocaleCode,
} from '@/lib/i18n';
import {
  createMarketingMediaItem,
  MARKETING_USER_TYPES,
  type MarketingMediaItem,
  type MarketingMediaKind,
  type MarketingSettings,
} from '@/lib/marketing';
import { looksLikeVideoUrl } from '@/lib/mediaUrl';
import type { UnlockAudience } from '@/lib/types';

const countryOptions = COUNTRY_OPTIONS.map((c) => ({
  value: c.code,
  label: c.name,
}));

const languageOptions = LOCALES.map((code) => ({
  value: code,
  label: LOCALE_LABELS[code],
}));

const TOTAL_SLOTS = MARKETING_USER_TYPES.length * LOCALES.length;

function audienceLabel(id: UnlockAudience) {
  return MARKETING_USER_TYPES.find((t) => t.id === id)?.label || id;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

type CreateDraft = {
  audience: UnlockAudience;
  language: string;
  kind: MarketingMediaKind;
  mediaUrl: string;
  linkUrl: string;
  countries: string[];
  title: string;
  text: string;
  note: string;
  lastPublishDate: string;
};

type CopyParts = {
  country: boolean;
  video: boolean;
  titleText: boolean;
  dmxs: boolean;
};

type CopyFlow = {
  mode: 'copy' | 'translate';
  step: 'parts' | 'recipients';
  sourceId: string;
  parts: CopyParts;
  audience: UnlockAudience;
  languages: string[];
};

/**
 * Reels CMS:
 * - Context: 1 type of user + 1 language
 * - Media: video, or image with optional link
 * - Label section: Country, Title, Text, Note, Last publish date
 * - Add new creates a reel in the current context
 */
export function MarketingReelsManager() {
  const { confirm, confirmDialog } = useConfirm();
  const [marketing, setMarketing] = useState<MarketingSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const uploadLock = useRef(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState<CreateDraft | null>(null);
  const [copyFlow, setCopyFlow] = useState<CopyFlow | null>(null);
  const [copyBusy, setCopyBusy] = useState(false);

  const [contextAudience, setContextAudience] =
    useState<UnlockAudience>('athlete');
  const [filterLanguage, setFilterLanguage] = useState<string>(
    LOCALES[0] || 'en'
  );
  const [filterCountry, setFilterCountry] = useState('');

  const items = marketing?.reels || [];

  const filledSlots = useMemo(() => {
    const keys = new Set<string>();
    for (const item of items) {
      const a = item.audiences?.[0];
      const l = item.languages?.[0];
      if (a && l) keys.add(`${a}|${l}`);
    }
    return keys.size;
  }, [items]);

  const visible = useMemo(() => {
    return items.filter((item) => {
      if (!(item.audiences || []).includes(contextAudience)) return false;
      if (
        filterLanguage &&
        !(item.languages || []).includes(filterLanguage.toLowerCase())
      ) {
        return false;
      }
      if (filterCountry) {
        const tagged = item.countries || [];
        if (
          tagged.length > 0 &&
          !tagged.includes(filterCountry.toUpperCase())
        ) {
          return false;
        }
      }
      return true;
    });
  }, [items, contextAudience, filterLanguage, filterCountry]);

  async function load() {
    const s = await fetchSettings();
    setMarketing(
      s.marketing || {
        avatars: [],
        reels: [],
        checks: [],
      }
    );
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load marketing settings'));
  }, []);

  function patchItem(itemId: string, patch: Partial<MarketingMediaItem>) {
    setMarketing((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        reels: prev.reels.map((item) =>
          item.id === itemId ? { ...item, ...patch } : item
        ),
      };
    });
  }

  async function removeItem(itemId: string) {
    const ok = await confirm({
      title: 'Remove reel',
      message: 'Remove this reel? It will stay gone after you Save.',
    });
    if (!ok) return;
    setMarketing((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        reels: prev.reels.filter((item) => item.id !== itemId),
      };
    });
  }

  function openAddNew() {
    setDraft({
      audience: contextAudience,
      language: filterLanguage || LOCALES[0] || 'en',
      kind: 'video',
      mediaUrl: '',
      linkUrl: '',
      countries: filterCountry ? [filterCountry] : [],
      title: '',
      text: '',
      note: '',
      lastPublishDate: todayIso(),
    });
    setCreateOpen(true);
    setMessage('');
  }

  function closeAddNew() {
    setCreateOpen(false);
    setDraft(null);
  }

  async function uploadMediaFile(file: File): Promise<{
    url: string;
    kind: MarketingMediaKind;
  }> {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', 'marketing-reels');
    const res = await fetch('/api/upload/asset', {
      method: 'POST',
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    const url = String(data.url || '').trim();
    if (!url) throw new Error('Upload returned no URL');
    const kind: MarketingMediaKind =
      looksLikeVideoUrl(url) || file.type.startsWith('video/')
        ? 'video'
        : 'image';
    return { url, kind };
  }

  async function uploadCreateMedia(file: File) {
    if (!draft || uploadLock.current) return;
    uploadLock.current = true;
    setBusy(true);
    setMessage('');
    try {
      const { url, kind } = await uploadMediaFile(file);
      setDraft({
        ...draft,
        mediaUrl: url,
        kind,
        linkUrl: kind === 'image' ? draft.linkUrl : '',
      });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
      uploadLock.current = false;
    }
  }

  async function replaceItemMedia(itemId: string, file: File) {
    if (uploadLock.current) return;
    uploadLock.current = true;
    setBusy(true);
    setMessage('');
    try {
      const { url, kind } = await uploadMediaFile(file);
      patchItem(itemId, {
        url,
        kind,
        ...(kind === 'video' ? { linkUrl: undefined } : {}),
      });
      setMessage('Reel media replaced — Save when ready.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
      uploadLock.current = false;
    }
  }

  function submitAddNew() {
    if (!marketing || !draft) return;
    if (!draft.audience || !draft.language) {
      setMessage('Type of user and language are required.');
      return;
    }
    if (!(draft.countries || []).length) {
      setMessage('Select at least 1 country.');
      return;
    }
    if (!draft.title.trim()) {
      setMessage('Title is required.');
      return;
    }

    const mediaUrl = draft.mediaUrl.trim();
    const kind: MarketingMediaKind =
      draft.kind === 'image' || draft.kind === 'video'
        ? draft.kind
        : looksLikeVideoUrl(mediaUrl)
          ? 'video'
          : 'image';

    const link = draft.linkUrl.trim();
    if (
      kind === 'image' &&
      link &&
      !/^https?:\/\//i.test(link) &&
      !link.startsWith('/')
    ) {
      setMessage('Link URL must be http(s) or a site path.');
      return;
    }

    const created = createMarketingMediaItem('reels', kind, mediaUrl, {
      audience: draft.audience,
      language: draft.language,
      countries: draft.countries,
      linkUrl: kind === 'image' ? link || undefined : undefined,
      title: draft.title,
      text: draft.text,
      note: draft.note,
      lastPublishDate: draft.lastPublishDate || todayIso(),
    });

    setMarketing({
      ...marketing,
      reels: [...marketing.reels, created],
    });
    setContextAudience(draft.audience);
    setFilterLanguage(draft.language);
    closeAddNew();
    setMessage(
      `Reel added for ${audienceLabel(draft.audience)} / ${
        LOCALE_LABELS[draft.language as keyof typeof LOCALE_LABELS] ||
        draft.language
      }. Save when ready.`
    );
  }

  function openCopyFlow(sourceId: string, mode: 'copy' | 'translate') {
    const source = items.find((i) => i.id === sourceId);
    if (!source) return;
    setCopyFlow({
      mode,
      step: 'parts',
      sourceId,
      parts: {
        country: false,
        video: true,
        titleText: false,
        dmxs: false,
      },
      audience: source.audiences[0] || contextAudience,
      languages: [],
    });
    setMessage('');
  }

  function closeCopyFlow() {
    if (copyBusy) return;
    setCopyFlow(null);
  }

  async function executeCopyFlow() {
    if (!marketing || !copyFlow) return;
    const source = marketing.reels.find((i) => i.id === copyFlow.sourceId);
    if (!source) {
      setMessage('Source reel not found.');
      setCopyFlow(null);
      return;
    }

    const { parts, mode, audience, languages } = copyFlow;
    if (!parts.video && !parts.titleText) {
      setMessage('Select at least Video or Title & text.');
      return;
    }
    if (!audience) {
      setMessage('Select a type of user.');
      return;
    }
    const targets = languages
      .map((l) => l.toLowerCase())
      .filter((l) => l && l !== (source.languages[0] || '').toLowerCase());
    if (!targets.length) {
      setMessage('Select at least 1 recipient language (not the current one).');
      return;
    }

    setCopyBusy(true);
    setMessage(
      mode === 'translate'
        ? 'Copying with translation…'
        : 'Copying reel…'
    );

    try {
      const sourceLang = (source.languages[0] || 'en').toLowerCase();
      const created: MarketingMediaItem[] = [];

      for (const lang of targets) {
        let title = parts.titleText ? String(source.title || '') : '';
        let text = parts.titleText ? String(source.text || '') : '';
        const note = parts.titleText ? String(source.note || '') : '';

        if (mode === 'translate' && parts.titleText) {
          if (!browserTranslatorSupported()) {
            throw new Error(
              'Browser Translator API unavailable. Use Chrome 138+ for “Copy with translation”, or use “Copy on…”.'
            );
          }
          if (!isLocaleCode(sourceLang) || !isLocaleCode(lang)) {
            throw new Error('Unsupported language for translation.');
          }
          if (title.trim()) {
            title = await translateTextWithBrowser(
              sourceLang as LocaleCode,
              lang as LocaleCode,
              title,
              (m) => setMessage(m)
            );
          }
          if (text.trim()) {
            text = await translateTextWithBrowser(
              sourceLang as LocaleCode,
              lang as LocaleCode,
              text,
              (m) => setMessage(m)
            );
          }
          // NOTE is never translated.
        }

        const item = createMarketingMediaItem(
          'reels',
          parts.video ? source.kind : 'video',
          parts.video ? source.url : '',
          {
            audience,
            language: lang,
            countries: parts.country ? [...(source.countries || [])] : [],
            linkUrl:
              parts.video && source.kind === 'image'
                ? source.linkUrl
                : undefined,
            title: parts.titleText ? title : undefined,
            text: parts.titleText ? text : undefined,
            note: parts.titleText ? note : undefined,
            lastPublishDate: todayIso(),
          }
        );
        if (parts.dmxs && source.dmxs) {
          item.dmxs = source.dmxs;
        }
        created.push(item);
      }

      setMarketing({
        ...marketing,
        reels: [...marketing.reels, ...created],
      });
      setContextAudience(audience);
      if (targets[0]) setFilterLanguage(targets[0]);
      setCopyFlow(null);
      setMessage(
        mode === 'translate'
          ? `Copied with translation to ${created.length} language(s). Save when ready.`
          : `Copied to ${created.length} language(s). Save when ready.`
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Copy failed.');
    } finally {
      setCopyBusy(false);
    }
  }

  async function onSave() {
    if (!marketing) return;
    setSaving(true);
    setMessage('');
    try {
      for (const item of marketing.reels) {
        if ((item.audiences || []).length !== 1) {
          throw new Error('Each reel needs exactly 1 type of user');
        }
        if ((item.languages || []).length !== 1) {
          throw new Error('Each reel needs exactly 1 language');
        }
        // Empty countries = all countries. Title required unless this is a media-only draft.
        if (!String(item.title || '').trim() && !String(item.url || '').trim()) {
          throw new Error('Each reel needs a title or media');
        }
        if (item.kind === 'image') {
          const link = String(item.linkUrl || '').trim();
          if (link && !/^https?:\/\//i.test(link) && !link.startsWith('/')) {
            throw new Error(
              'Image reel link must be an http(s) URL or site path'
            );
          }
        }
      }

      const current = await fetchSettings();
      const nextMarketing: MarketingSettings = {
        ...(current.marketing || {
          avatars: [],
          reels: [],
          checks: [],
        }),
        reels: marketing.reels,
      };
      const saved = await saveSettings({ marketing: nextMarketing });
      setMarketing(saved.marketing);
      setMessage('Reels saved.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!marketing) {
    return <p className="text-zinc-400">Loading marketing…</p>;
  }

  const langLabel =
    LOCALE_LABELS[filterLanguage as keyof typeof LOCALE_LABELS] ||
    filterLanguage;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Reels</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Each reel is tied to{' '}
            <span className="text-[#FF7800]">1 type of user</span> and{' '}
            <span className="text-[#FF7800]">1 language</span>. Fill the Label
            section (country, title, text, note, publish date). Usually a video;
            rarely an image with an optional link. Matrix:{' '}
            <span className="text-zinc-200">
              {filledSlots} / {TOTAL_SLOTS}
            </span>{' '}
            slots used.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddNew}
          className="rounded-xl bg-[#FF7800] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
        >
          Add new
        </button>
      </div>

      <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
          Type of user
        </p>
        <div className="flex flex-wrap gap-2">
          {MARKETING_USER_TYPES.map((type) => {
            const active = contextAudience === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setContextAudience(type.id)}
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

        <div className="grid gap-3 sm:grid-cols-2">
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
              {languageOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="text-xs text-zinc-500">
          Showing {visible.length} reel{visible.length === 1 ? '' : 's'} for{' '}
          <span className="text-zinc-300">{audienceLabel(contextAudience)}</span>
          {' · '}
          <span className="text-zinc-300">{langLabel}</span>
          {filterCountry ? ` · ${filterCountry}` : ''}.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visible.map((item) => {
          const userType = item.audiences[0] || contextAudience;
          const lang = item.languages[0] || filterLanguage;
          const itemLangLabel =
            LOCALE_LABELS[lang as keyof typeof LOCALE_LABELS] || lang;
          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70"
            >
              <div className="relative aspect-video bg-black">
                {item.url ? (
                  item.kind === 'video' ? (
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
                  )
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                    No media yet — upload or paste a URL
                  </div>
                )}
                <span className="absolute left-2 top-2 rounded bg-black/75 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#FF7800]">
                  {item.kind}
                </span>
              </div>

              <div className="space-y-4 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-zinc-200">
                      Type of user
                    </span>
                    <select
                      value={userType}
                      onChange={(e) =>
                        patchItem(item.id, {
                          audiences: [e.target.value as UnlockAudience],
                        })
                      }
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white"
                    >
                      {MARKETING_USER_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-zinc-200">
                      Language
                    </span>
                    <select
                      value={lang}
                      onChange={(e) =>
                        patchItem(item.id, {
                          languages: e.target.value ? [e.target.value] : [],
                        })
                      }
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white"
                    >
                      {languageOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {(['video', 'image'] as const).map((kind) => {
                      const active = item.kind === kind;
                      return (
                        <button
                          key={kind}
                          type="button"
                          onClick={() =>
                            patchItem(item.id, {
                              kind,
                              ...(kind === 'video'
                                ? { linkUrl: undefined }
                                : {}),
                            })
                          }
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                            active
                              ? 'border-[#FF7800] bg-[#FF7800] text-black'
                              : 'border-zinc-700 text-zinc-300'
                          }`}
                        >
                          {kind === 'video' ? 'Video' : 'Image'}
                        </button>
                      );
                    })}
                    <label className="inline-flex cursor-pointer rounded-lg bg-[#FF7800] px-2.5 py-1 text-[11px] font-semibold text-black">
                      {busy ? '…' : 'Replace media'}
                      <input
                        type="file"
                        accept={
                          item.kind === 'video'
                            ? 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov'
                            : 'image/*'
                        }
                        className="hidden"
                        disabled={busy}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file) replaceItemMedia(item.id, file);
                        }}
                      />
                    </label>
                  </div>
                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-zinc-200">
                      Media URL
                    </span>
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => {
                        const nextUrl = e.target.value;
                        patchItem(item.id, {
                          url: nextUrl,
                          kind: looksLikeVideoUrl(nextUrl)
                            ? 'video'
                            : item.kind,
                        });
                      }}
                      placeholder="/uploads/… or https://…"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white"
                    />
                  </label>
                  {item.kind === 'image' ? (
                    <label className="block space-y-1">
                      <span className="text-sm font-medium text-zinc-200">
                        Link URL{' '}
                        <span className="text-zinc-500">(optional)</span>
                      </span>
                      <input
                        type="url"
                        value={item.linkUrl || ''}
                        onChange={(e) =>
                          patchItem(item.id, {
                            linkUrl: e.target.value.trim() || undefined,
                          })
                        }
                        placeholder="https://…"
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm text-white"
                      />
                    </label>
                  ) : null}
                </div>

                {/* Label section */}
                <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FF7800]">
                    Label
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Title and text should be in {itemLangLabel}. Note can be in
                    any language.
                  </p>

                  <MultiCheckDropdown
                    label="Country"
                    options={countryOptions}
                    values={item.countries}
                    onChange={(vals) =>
                      patchItem(item.id, { countries: vals })
                    }
                    emptyLabel="Select one or more countries"
                    hint="1 or more"
                  />

                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-zinc-200">
                      Title
                    </span>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) =>
                        patchItem(item.id, { title: e.target.value })
                      }
                      placeholder={`Title in ${itemLangLabel}`}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm text-white"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-zinc-200">
                      Text
                    </span>
                    <textarea
                      value={item.text || ''}
                      onChange={(e) =>
                        patchItem(item.id, { text: e.target.value })
                      }
                      rows={4}
                      placeholder={`Text in ${itemLangLabel}`}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm text-white"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-zinc-200">
                      Note
                    </span>
                    <textarea
                      value={item.note || ''}
                      onChange={(e) =>
                        patchItem(item.id, { note: e.target.value })
                      }
                      rows={2}
                      placeholder="Internal note (any language)"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm text-white"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-zinc-200">
                      Last publish date
                    </span>
                    <input
                      type="date"
                      value={item.lastPublishDate || ''}
                      onChange={(e) =>
                        patchItem(item.id, {
                          lastPublishDate: e.target.value || undefined,
                        })
                      }
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm text-white"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-sm font-medium text-zinc-200">
                      DMXs
                    </span>
                    <textarea
                      value={item.dmxs || ''}
                      onChange={(e) =>
                        patchItem(item.id, { dmxs: e.target.value })
                      }
                      rows={2}
                      placeholder="DMXs payload / notes"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm text-white"
                    />
                  </label>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => openCopyFlow(item.id, 'copy')}
                    className="rounded-lg border border-zinc-600 px-3 py-2.5 text-sm font-semibold text-zinc-100 hover:border-[#FF7800]"
                  >
                    Copy on…
                  </button>
                  <button
                    type="button"
                    onClick={() => openCopyFlow(item.id, 'translate')}
                    className="rounded-lg border border-[#FF7800]/50 bg-[#FF7800]/10 px-3 py-2.5 text-sm font-semibold text-[#FF7800] hover:bg-[#FF7800]/20"
                  >
                    Copy with translation on…
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="w-full rounded-lg border border-red-900/50 px-3 py-2 text-sm text-red-300 hover:border-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={openAddNew}
          className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#FF7800]/40 px-3 py-6 text-center text-[#FF7800] transition hover:bg-[#FF7800]/10"
        >
          <span className="text-sm font-semibold">Add new</span>
          <span className="mt-1 text-[11px] text-zinc-500">
            {audienceLabel(contextAudience)} · {langLabel}
          </span>
        </button>
      </div>

      <SaveBar
        saving={saving}
        message={message}
        onSave={onSave}
        onReset={() => load()}
      />
      {confirmDialog}

      {createOpen && draft ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-reel-title"
          onClick={closeAddNew}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-950 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="add-reel-title"
              className="text-lg font-semibold text-white"
            >
              Add new reel
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Assigned to the selected type of user and language. Fill the Label
              section below.
            </p>

            <div className="mt-4 space-y-3">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-zinc-200">
                  Type of user
                </span>
                <select
                  value={draft.audience}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      audience: e.target.value as UnlockAudience,
                    })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                >
                  {MARKETING_USER_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-zinc-200">
                  Language
                </span>
                <select
                  value={draft.language}
                  onChange={(e) =>
                    setDraft({ ...draft, language: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                >
                  {languageOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap gap-2">
                {(['video', 'image'] as const).map((kind) => {
                  const active = draft.kind === kind;
                  return (
                    <button
                      key={kind}
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          kind,
                          linkUrl: kind === 'image' ? draft.linkUrl : '',
                        })
                      }
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        active
                          ? 'border-[#FF7800] bg-[#FF7800] text-black'
                          : 'border-zinc-700 text-zinc-300'
                      }`}
                    >
                      {kind === 'video' ? 'Video' : 'Image + link'}
                    </button>
                  );
                })}
              </div>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-zinc-200">
                  Media URL <span className="text-zinc-500">(optional now)</span>
                </span>
                <input
                  type="text"
                  value={draft.mediaUrl}
                  onChange={(e) =>
                    setDraft({ ...draft, mediaUrl: e.target.value })
                  }
                  placeholder="/uploads/… or https://…"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                />
              </label>

              <label className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-[#FF7800]">
                {busy ? 'Uploading…' : 'Upload file'}
                <input
                  type="file"
                  accept={
                    draft.kind === 'video'
                      ? 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov'
                      : 'image/*'
                  }
                  className="hidden"
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) uploadCreateMedia(file);
                  }}
                />
              </label>

              {draft.kind === 'image' ? (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-zinc-200">
                    Link URL <span className="text-zinc-500">(optional)</span>
                  </span>
                  <input
                    type="url"
                    value={draft.linkUrl}
                    onChange={(e) =>
                      setDraft({ ...draft, linkUrl: e.target.value })
                    }
                    placeholder="https://…"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                  />
                </label>
              ) : null}

              <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FF7800]">
                  Label
                </p>

                <MultiCheckDropdown
                  label="Country"
                  options={countryOptions}
                  values={draft.countries}
                  onChange={(vals) => setDraft({ ...draft, countries: vals })}
                  emptyLabel="Select one or more countries"
                  hint="1 or more"
                />

                <label className="block space-y-1">
                  <span className="text-sm font-medium text-zinc-200">
                    Title
                  </span>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) =>
                      setDraft({ ...draft, title: e.target.value })
                    }
                    placeholder={`Title in ${
                      LOCALE_LABELS[
                        draft.language as keyof typeof LOCALE_LABELS
                      ] || draft.language
                    }`}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm text-white"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-medium text-zinc-200">
                    Text
                  </span>
                  <textarea
                    value={draft.text}
                    onChange={(e) =>
                      setDraft({ ...draft, text: e.target.value })
                    }
                    rows={4}
                    placeholder="Paste or type text in the selected language"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm text-white"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-medium text-zinc-200">
                    Note
                  </span>
                  <textarea
                    value={draft.note}
                    onChange={(e) =>
                      setDraft({ ...draft, note: e.target.value })
                    }
                    rows={2}
                    placeholder="Any language"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm text-white"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-medium text-zinc-200">
                    Last publish date
                  </span>
                  <input
                    type="date"
                    value={draft.lastPublishDate}
                    onChange={(e) =>
                      setDraft({ ...draft, lastPublishDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm text-white"
                  />
                </label>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeAddNew}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={submitAddNew}
                className="rounded-lg bg-[#FF7800] px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
              >
                Add new
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {copyFlow ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeCopyFlow}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-950 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const source = items.find((i) => i.id === copyFlow.sourceId);
              const sourceLang = source?.languages[0] || '';
              const partsOk =
                copyFlow.parts.video || copyFlow.parts.titleText;
              return (
                <>
                  <h2 className="text-lg font-semibold text-white">
                    {copyFlow.mode === 'translate'
                      ? 'Copy with translation on…'
                      : 'Copy on…'}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {copyFlow.step === 'parts'
                      ? 'Select what to copy. You must include Video and/or Title & text.'
                      : 'Select the recipient type of user and one or more languages.'}
                    {copyFlow.mode === 'translate' ? (
                      <>
                        {' '}
                        Title & text will be translated into each recipient
                        language (Note is never translated).
                      </>
                    ) : null}
                  </p>

                  {copyFlow.step === 'parts' ? (
                    <div className="mt-4 space-y-2">
                      {(
                        [
                          ['country', 'Country'],
                          ['video', 'Video'],
                          ['titleText', 'Title & text'],
                          ['dmxs', 'DMXs'],
                        ] as const
                      ).map(([key, label]) => (
                        <label
                          key={key}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 px-3 py-2.5 text-sm text-zinc-200 hover:border-zinc-600"
                        >
                          <input
                            type="checkbox"
                            checked={copyFlow.parts[key]}
                            onChange={(e) =>
                              setCopyFlow({
                                ...copyFlow,
                                parts: {
                                  ...copyFlow.parts,
                                  [key]: e.target.checked,
                                },
                              })
                            }
                            className="h-4 w-4 accent-[#FF7800]"
                          />
                          {label}
                          {key === 'video' ? (
                            <span className="text-[11px] text-zinc-500">
                              (default on)
                            </span>
                          ) : null}
                        </label>
                      ))}
                      {!partsOk ? (
                        <p className="text-xs text-red-300">
                          Select at least Video or Title & text.
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="mb-2 text-sm font-medium text-zinc-200">
                          Type of user (1 only)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {MARKETING_USER_TYPES.map((type) => {
                            const active = copyFlow.audience === type.id;
                            return (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() =>
                                  setCopyFlow({
                                    ...copyFlow,
                                    audience: type.id,
                                  })
                                }
                                className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                                  active
                                    ? 'border-[#FF7800] bg-[#FF7800] text-black'
                                    : 'border-zinc-700 text-zinc-300'
                                }`}
                              >
                                {type.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-sm font-medium text-zinc-200">
                          Languages (1 or more)
                        </p>
                        <div className="max-h-56 space-y-1 overflow-auto rounded-xl border border-zinc-800 p-2">
                          {languageOptions.map((o) => {
                            const isSource =
                              o.value.toLowerCase() ===
                              sourceLang.toLowerCase();
                            const checked = copyFlow.languages.includes(
                              o.value
                            );
                            return (
                              <label
                                key={o.value}
                                className={`flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm ${
                                  isSource
                                    ? 'cursor-not-allowed text-zinc-600'
                                    : 'cursor-pointer text-zinc-200 hover:bg-zinc-900'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  disabled={isSource}
                                  checked={checked}
                                  onChange={(e) => {
                                    const next = e.target.checked
                                      ? [...copyFlow.languages, o.value]
                                      : copyFlow.languages.filter(
                                          (l) => l !== o.value
                                        );
                                    setCopyFlow({
                                      ...copyFlow,
                                      languages: next,
                                    });
                                  }}
                                  className="h-4 w-4 accent-[#FF7800] disabled:opacity-40"
                                />
                                {o.label}
                                {isSource ? (
                                  <span className="text-[11px] text-zinc-600">
                                    (current — disabled)
                                  </span>
                                ) : null}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={copyBusy}
                      onClick={closeCopyFlow}
                      className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 disabled:opacity-40"
                    >
                      Cancel
                    </button>
                    {copyFlow.step === 'parts' ? (
                      <button
                        type="button"
                        disabled={!partsOk}
                        onClick={() =>
                          setCopyFlow({ ...copyFlow, step: 'recipients' })
                        }
                        className="rounded-lg bg-[#FF7800] px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
                      >
                        Continue
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={copyBusy}
                          onClick={() =>
                            setCopyFlow({ ...copyFlow, step: 'parts' })
                          }
                          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 disabled:opacity-40"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          disabled={
                            copyBusy ||
                            !copyFlow.audience ||
                            copyFlow.languages.length === 0
                          }
                          onClick={() => executeCopyFlow()}
                          className="rounded-lg bg-[#FF7800] px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
                        >
                          {copyBusy
                            ? 'Working…'
                            : copyFlow.mode === 'translate'
                              ? 'Copy with translation'
                              : 'Copy'}
                        </button>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      ) : null}
    </div>
  );
}
