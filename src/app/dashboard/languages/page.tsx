'use client';

import { useEffect, useMemo, useState } from 'react';
import { Field } from '@/components/Field';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import {
  ENGLISH_STRINGS,
  I18N_GROUPS,
  LOCALES,
  LOCALE_LABELS,
  localeProgress,
  type LocaleCode,
  type StringMap,
} from '@/lib/i18n';
import type { MobileAppSettings } from '@/lib/types';

export default function LanguagesPage() {
  const [settings, setSettings] = useState<MobileAppSettings | null>(null);
  const [locale, setLocale] = useState<LocaleCode>('fr');
  const [draft, setDraft] = useState<StringMap>({});
  const [groupId, setGroupId] = useState(I18N_GROUPS[0].id);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const s = await fetchSettings();
    setSettings(s);
    setDraft({ ...(s.i18n?.[locale] || {}) });
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function setKey(key: string, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function copyFromEnglish() {
    const next = { ...draft };
    for (const key of Object.keys(ENGLISH_STRINGS)) {
      if (!next[key]?.trim()) next[key] = ENGLISH_STRINGS[key];
    }
    setDraft(next);
    setMessage('Empty fields filled from English (not saved yet).');
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
        Manually translate each string for all 12 app languages. Mobile loads{' '}
        <code className="text-[#FF7800]">/api/mobile-config?lang=xx</code>.
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
              <div className={`text-xs ${active ? 'text-black/70' : 'text-zinc-500'}`}>
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
          onClick={copyFromEnglish}
          disabled={locale === 'en'}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 disabled:opacity-40"
        >
          Copy empty from English
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
          const enRef =
            settings.i18n?.en?.[key] || ENGLISH_STRINGS[key] || '';
          return (
          <div
            key={key}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <code className="text-xs text-[#FF7800]">{key}</code>
              {locale !== 'en' ? (
                <span className="text-xs text-zinc-500">EN reference below</span>
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
