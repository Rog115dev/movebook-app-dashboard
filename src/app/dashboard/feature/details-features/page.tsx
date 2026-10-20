'use client';

import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import { unlockFeaturesI18nKeys } from '@/lib/contentI18n';
import type {
  FeaturesPageSettings,
  UnlockAudience,
  UnlockFeatureItem,
} from '@/lib/types';
import { UNLOCK_AUDIENCE_OPTIONS } from '@/lib/types';

const AUDIENCE_LABELS: Record<UnlockAudience, string> = {
  athlete: 'Athlete',
  coaches: 'Coaches',
  teams: 'Teams',
  clubs: 'Clubs',
  groups: 'Groups',
};

function toggleAudience(
  current: UnlockAudience[] | undefined,
  value: UnlockAudience
): UnlockAudience[] {
  const list = current?.length ? [...current] : [];
  const idx = list.indexOf(value);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(value);
  return list;
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
      items: s.featuresPage.items.map((item) => ({
        ...item,
        audiences: Array.isArray(item.audiences)
          ? [...item.audiences]
          : undefined,
      })),
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
            title: `New feature ${nextIndex}`,
            description: 'Add a description users will see when they tap the card.',
            badge: 'NEW',
            audiences: [...UNLOCK_AUDIENCE_OPTIONS],
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
      unlockSub:
        page.unlockSub.trim() || 'Everything you want. All in one place.',
      items: page.items
        .map((item, i) => ({
          id: item.id?.trim() || `unlock-${i + 1}`,
          title: item.title.trim(),
          description: item.description.trim(),
          badge: item.badge.trim().toUpperCase() || 'NEW',
          audiences:
            Array.isArray(item.audiences) && item.audiences.length
              ? item.audiences
              : undefined,
        }))
        .filter((item) => item.title || item.description),
    };

    setSaving(true);
    setMessage('');
    try {
      await saveSettings({
        featuresPage: cleaned,
        i18n: {
          en: unlockFeaturesI18nKeys(
            cleaned.unlockTitle,
            cleaned.unlockSub,
            cleaned.items
          ),
        },
      });
      setPage(cleaned);
      setMessage('Details features saved (English translations updated).');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!page) return <p className="text-zinc-400">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Details features</h1>
      <p className="mt-2 text-zinc-400">
        “Unlock everything you need” cards on the Features screen. Description
        appears when the user taps a card. Translate other languages under{' '}
        <span className="text-[#FF7800]">Others / Languages</span>.
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

      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium text-zinc-200">Feature cards</h2>
        <button
          type="button"
          onClick={addItem}
          className="rounded-lg border border-[#FF7800]/60 bg-[#FF7800]/10 px-3 py-2 text-sm text-[#FF7800] hover:bg-[#FF7800]/20"
        >
          + Add feature
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {page.items.map((item, index) => {
          const selected = item.audiences || [];
          const allSelected =
            selected.length === 0 ||
            UNLOCK_AUDIENCE_OPTIONS.every((a) => selected.includes(a));

          return (
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
                  label="Description (shown when user taps the card)"
                  value={item.description}
                  onChange={(description) => updateItem(index, { description })}
                  multiline
                />
                <Field
                  label="Badge"
                  value={item.badge}
                  onChange={(badge) => updateItem(index, { badge })}
                />
                <div>
                  <p className="mb-2 text-sm text-zinc-400">
                    Visible to user types{' '}
                    <span className="text-zinc-500">
                      (none selected = all)
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateItem(index, {
                          audiences: allSelected
                            ? ['athlete']
                            : [...UNLOCK_AUDIENCE_OPTIONS],
                        })
                      }
                      className={`rounded-lg border px-2.5 py-1 text-xs ${
                        allSelected
                          ? 'border-[#FF7800] bg-[#FF7800]/15 text-[#FF7800]'
                          : 'border-zinc-700 text-zinc-300'
                      }`}
                    >
                      All
                    </button>
                    {UNLOCK_AUDIENCE_OPTIONS.map((audience) => {
                      const on =
                        selected.length === 0 || selected.includes(audience);
                      return (
                        <button
                          key={audience}
                          type="button"
                          onClick={() =>
                            updateItem(index, {
                              audiences: toggleAudience(
                                selected.length
                                  ? selected
                                  : [...UNLOCK_AUDIENCE_OPTIONS],
                                audience
                              ),
                            })
                          }
                          className={`rounded-lg border px-2.5 py-1 text-xs ${
                            on
                              ? 'border-[#FF7800] bg-[#FF7800]/15 text-[#FF7800]'
                              : 'border-zinc-700 text-zinc-400'
                          }`}
                        >
                          {AUDIENCE_LABELS[audience]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {page.items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          No features yet. Click “Add feature” to create one.
        </p>
      ) : null}

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
