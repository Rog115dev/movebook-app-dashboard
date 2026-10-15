'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Field } from '@/components/Field';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import {
  browserTranslatorSupported,
  translateStringsWithBrowser,
} from '@/lib/browserTranslate';
import {
  ENGLISH_STRINGS,
  I18N_GROUPS,
  LOCALES,
  LOCALE_LABELS,
  localeProgress,
  type LocaleCode,
  type StringMap,
} from '@/lib/i18n';
import { applyLocaleSeed, hasLocaleSeed } from '@/lib/localeSeeds';
import type { MobileAppSettings } from '@/lib/types';

export default function LanguagesPage() {
  return (
    <Suspense fallback={<p className="text-zinc-400">Loading languages…</p>}>
      <LanguagesPageInner />
    </Suspense>
  );
}

function LanguagesPageInner() {
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState<MobileAppSettings | null>(null);
  const [locale, setLocale] = useState<LocaleCode>('fr');
  const [draft, setDraft] = useState<StringMap>({});
  const [groupId, setGroupId] = useState(I18N_GROUPS[0].id);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');
  const [hasBrowserTranslator, setHasBrowserTranslator] = useState(false);

  async function load() {
    const s = await fetchSettings();
    setSettings(s);
    setDraft({ ...(s.i18n?.[locale] || {}) });
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
    setHasBrowserTranslator(browserTranslatorSupported());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const group = searchParams.get('group');
    const highlight = searchParams.get('highlight');
    if (group && I18N_GROUPS.some((g) => g.id === group)) {
      setGroupId(group);
    }
    if (highlight) {
      setHighlightKey(highlight);
      // Scroll after paint
      requestAnimationFrame(() => {
        document
          .getElementById(`lang-key-${highlight}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!settings) return;
    setDraft({ ...(settings.i18n?.[locale] || {}) });
  }, [locale, settings]);

  const group = I18N_GROUPS.find((g) => g.id === groupId) ?? I18N_GROUPS[0];
  const groupKeys = useMemo(() => {
    if (groupId !== 'faq' || !settings) return group.keys;
    const fromSettings = Object.keys(settings.i18n?.en || {}).filter(
      (k) => k === 'train.faqTitle' || /^train\.faq\d+[QA]$/.test(k)
    );
    return Array.from(new Set([...group.keys, ...fromSettings])).sort((a, b) => {
      if (a === 'train.faqTitle') return -1;
      if (b === 'train.faqTitle') return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    });
  }, [group.keys, groupId, settings]);

  const progress = useMemo(
    () => localeProgress(settings?.i18n, locale),
    [settings, locale]
  );

  const englishSource = useMemo<StringMap>(() => {
    return { ...ENGLISH_STRINGS, ...(settings?.i18n?.en || {}) };
  }, [settings]);

  function setKey(key: string, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function copyFromEnglish() {
    const next = { ...draft };
    for (const key of Object.keys(englishSource)) {
      if (!next[key]?.trim()) next[key] = englishSource[key];
    }
    setDraft(next);
    setMessage('Empty fields filled from English (not saved yet).');
  }

  async function applyTranslation(onlyEmpty: boolean) {
    if (locale === 'en') {
      setMessage('English is the source language — pick another locale.');
      return;
    }

    setApplying(true);
    setMessage('');
    try {
      if (browserTranslatorSupported()) {
        const { next, filled } = await translateStringsWithBrowser(
          locale,
          englishSource,
          {
            onlyEmpty,
            current: draft,
            onProgress: setMessage,
          }
        );
        setDraft(next);
        setMessage(
          filled
            ? `Browser translated ${filled} ${LOCALE_LABELS[locale]} string(s) from current English (not saved yet).`
            : onlyEmpty
              ? 'All fields already filled — nothing to apply.'
              : 'Translations already match.'
        );
        return;
      }

      // Fallback: built-in mobile locale seeds (static, not live EN)
      if (!hasLocaleSeed(locale)) {
        throw new Error(
          'Browser Translator API unavailable. Use Chrome 138+ desktop, or add a seed file.'
        );
      }
      const { next, filled } = applyLocaleSeed(locale, draft, { onlyEmpty });
      setDraft(next);
      setMessage(
        filled
          ? `Applied ${filled} seeded string(s) (browser translator unavailable). Not saved yet.`
          : 'Nothing to apply from seeds.'
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Apply translation failed.');
    } finally {
      setApplying(false);
    }
  }

  async function applyTranslationAllLocales() {
    if (!settings) return;
    setApplying(true);
    setMessage('');
    try {
      const nextI18n = { ...(settings.i18n || {}) };
      let filled = 0;
      const targets = LOCALES.filter((code) => code !== 'en');

      if (browserTranslatorSupported()) {
        for (let i = 0; i < targets.length; i++) {
          const code = targets[i];
          setMessage(
            `Browser translating ${LOCALE_LABELS[code]} (${i + 1}/${targets.length})…`
          );
          const result = await translateStringsWithBrowser(
            code,
            englishSource,
            {
              onlyEmpty: false,
              current: nextI18n[code] || {},
              onProgress: setMessage,
            }
          );
          nextI18n[code] = result.next;
          filled += result.filled;
        }
      } else {
        for (const code of targets) {
          if (!hasLocaleSeed(code)) continue;
          const result = applyLocaleSeed(code, nextI18n[code] || {}, {
            onlyEmpty: false,
          });
          nextI18n[code] = result.next;
          filled += result.filled;
        }
      }

      const saved = await saveSettings({ i18n: nextI18n });
      setSettings(saved);
      setDraft({ ...(saved.i18n?.[locale] || {}) });
      setMessage(
        filled
          ? `Translated all languages (${filled} fields) from current English and saved.`
          : 'All languages already up to date.'
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Apply translation failed.');
    } finally {
      setApplying(false);
    }
  }

  async function onSave() {
    if (!settings) return;
    setSaving(true);
    setMessage('');
    try {
      const saved = await saveSettings({
        i18n: {
          ...settings.i18n,
          [locale]: draft,
        },
      });
      setSettings(saved);
      setMessage(`${LOCALE_LABELS[locale]} translations saved.`);
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return <p className="text-zinc-400">Loading languages…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-semibold">Languages</h1>
      <p className="mt-2 text-zinc-400">
        Edit English first and save, then use{' '}
        <span className="text-white">Apply Translation</span> to translate the
        current English CMS text via the{' '}
        <span className="text-white">browser Translator API</span> (Chrome 138+).
        {hasBrowserTranslator
          ? ' Browser translator detected.'
          : ' Browser translator not detected — seeds fallback will be used.'}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {LOCALES.map((code) => {
          const p = localeProgress(settings.i18n, code);
          const active = code === locale;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                active
                  ? 'border-[#FF7800] bg-[#FF7800] text-black'
                  : 'border-zinc-700 text-zinc-300 hover:border-[#FF7800]'
              }`}
            >
              <div className="font-medium">{LOCALE_LABELS[code]}</div>
              <div
                className={`text-xs ${active ? 'text-black/70' : 'text-zinc-500'}`}
              >
                {p.filled}/{p.total}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="text-sm text-zinc-400">
          Editing <span className="text-white">{LOCALE_LABELS[locale]}</span> —{' '}
          {progress.filled}/{progress.total} filled
        </p>
        <button
          type="button"
          onClick={() => applyTranslation(false)}
          disabled={locale === 'en' || applying}
          className="rounded-lg bg-[#FF7800] px-3 py-1.5 text-sm font-semibold text-black disabled:opacity-40"
        >
          {applying ? 'Translating…' : 'Apply Translation'}
        </button>
        <button
          type="button"
          onClick={() => applyTranslation(true)}
          disabled={locale === 'en' || applying}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 disabled:opacity-40"
        >
          Fill empty only
        </button>
        <button
          type="button"
          onClick={copyFromEnglish}
          disabled={locale === 'en' || applying}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 disabled:opacity-40"
        >
          Copy empty from English
        </button>
        <button
          type="button"
          onClick={applyTranslationAllLocales}
          disabled={applying}
          className="rounded-lg border border-[#FF7800]/60 px-3 py-1.5 text-sm text-[#FF7800] disabled:opacity-40"
        >
          {applying ? 'Applying…' : 'Apply Translation to all languages'}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {I18N_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGroupId(g.id)}
            className={`rounded-full px-3 py-1 text-sm ${
              groupId === g.id
                ? 'bg-zinc-100 text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-5">
        {groupKeys.map((key) => {
          const enRef = englishSource[key] || '';
          const highlighted = highlightKey === key;
          return (
            <div
              id={`lang-key-${key}`}
              key={key}
              className={`rounded-xl border p-4 ${
                highlighted
                  ? 'border-[#FF7800] bg-[#FF7800]/10'
                  : 'border-zinc-800 bg-zinc-900/40'
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <code className="text-xs text-[#FF7800]">{key}</code>
                {locale !== 'en' ? (
                  <span className="text-xs text-zinc-500">
                    EN reference below
                  </span>
                ) : null}
              </div>
              {locale !== 'en' ? (
                <p className="mb-3 whitespace-pre-wrap rounded-lg bg-zinc-950 px-3 py-2 text-sm text-zinc-400">
                  {enRef}
                </p>
              ) : null}
              <Field
                label={locale === 'en' ? 'English text' : 'Translation'}
                value={draft[key] || ''}
                onChange={(v) => setKey(key, v)}
                multiline={
                  (draft[key] || enRef || '').length > 60 ||
                  (enRef || '').includes('\n')
                }
              />
            </div>
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
