'use client';

import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import type { FeaturesPageSettings, UnlockFeatureItem } from '@/lib/types';

function unlockI18nKeys(page: FeaturesPageSettings) {
  const en: Record<string, string> = {
    'features.unlockTitle': page.unlockTitle,
    'features.unlockSub': page.unlockSub,
  };
  page.items.forEach((item, index) => {
    en[`features.unlock${index + 1}Title`] = item.title;
    en[`features.unlock${index + 1}Desc`] = item.description;
    en[`features.unlock${index + 1}Badge`] = item.badge;
  });
  return en;
}

export default function FeaturesPage() {
  const [page, setPage] = useState<FeaturesPageSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const s = await fetchSettings();
    setPage({
      unlockTitle: s.featuresPage.unlockTitle,
      unlockSub: s.featuresPage.unlockSub,
      items: s.featuresPage.items.map((item) => ({ ...item })),
    });
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  function updateItem(index: number, patch: Partial<UnlockFeatureItem>) {
    setPage((prev) => {
      if (!prev) return prev;
      const items = [...prev.items];
      items[index] = { ...items[index], ...patch };
      return { ...prev, items };
    });
  }

  function addItem() {
    setPage((prev) => {
      if (!prev) return prev;
      const nextIndex = prev.items.length + 1;
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            id: `unlock-${Date.now()}`,
            title: `Feature ${nextIndex}`,
            description: '',
            badge: 'NEW',
          },
        ],
      };
    });
  }

  function removeItem(index: number) {
    setPage((prev) => {
      if (!prev) return prev;
      return { ...prev, items: prev.items.filter((_, i) => i !== index) };
    });
  }

  function moveItem(index: number, direction: -1 | 1) {
    setPage((prev) => {
      if (!prev) return prev;
      const target = index + direction;
      if (target < 0 || target >= prev.items.length) return prev;
      const items = [...prev.items];
      const [item] = items.splice(index, 1);
      items.splice(target, 0, item);
      return { ...prev, items };
    });
  }

  async function onSave() {
    if (!page) return;
    const cleaned: FeaturesPageSettings = {
      unlockTitle: page.unlockTitle.trim() || 'Unlock everything you need',
      unlockSub: page.unlockSub.trim() || 'Everything you want. All in one place.',
      items: page.items
        .map((item, i) => ({
          id: item.id?.trim() || `unlock-${i + 1}`,
          title: item.title.trim(),
          description: item.description.trim(),
          badge: item.badge.trim().toUpperCase() || 'NEW',
        }))
        .filter((item) => item.title || item.description),
    };

    setSaving(true);
    setMessage('');
    try {
      await saveSettings({
        featuresPage: cleaned,
        i18n: {
          en: unlockI18nKeys(cleaned),
        },
      });
      setPage(cleaned);
      setMessage('Unlock features saved (English translations updated).');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!page) return <p className="text-zinc-400">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">Unlock features</h1>
      <p className="mt-2 text-zinc-400">
        Edit the “Unlock everything you need” list on the Features screen.
        Translate other languages under{' '}
        <span className="text-[#FF7800]">Languages → Features</span>.
      </p>

      <div className="mt-6 space-y-4">
        <Field
          label="Section title"
          value={page.unlockTitle}
          onChange={(unlockTitle) => setPage({ ...page, unlockTitle })}
        />
        <Field
          label="Subtitle"
          value={page.unlockSub}
          onChange={(unlockSub) => setPage({ ...page, unlockSub })}
        />
      </div>

      <div className="mt-8 space-y-4">
        {page.items.map((item, index) => (
          <div
            key={item.id || `unlock-${index}`}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-zinc-200">
                Feature {index + 1}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300 disabled:opacity-40"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  disabled={index === page.items.length - 1}
                  className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300 disabled:opacity-40"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded-lg border border-red-900/60 px-2 py-1 text-xs text-red-300"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <Field
                label="Title"
                value={item.title}
                onChange={(title) => updateItem(index, { title })}
              />
              <Field
                label="Description"
                value={item.description}
                onChange={(description) => updateItem(index, { description })}
                multiline
              />
              <Field
                label="Badge"
                value={item.badge}
                onChange={(badge) => updateItem(index, { badge })}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-4 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-[#FF7800]"
      >
        Add feature
      </button>

      <SaveBar
        saving={saving}
        message={message}
        onSave={onSave}
        onReset={() => {
          load().catch(() => setMessage('Failed to load settings'));
        }}
      />
    </div>
  );
}
