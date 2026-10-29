'use client';

import { useEffect, useState } from 'react';
import { ColorField } from '@/components/ColorField';
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

const DEFAULT_BG = '#161616';
const DEFAULT_TEXT = '#FFFFFF';

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
      backgroundColor: s.featuresPage.backgroundColor || DEFAULT_BG,
      textColor: s.featuresPage.textColor || DEFAULT_TEXT,
      items: s.featuresPage.items.map((item) => ({
        ...item,
        // Missing audiences (legacy) = visible to all. Explicit [] = hidden from all.
        audiences: Array.isArray(item.audiences)
          ? [...item.audiences]
          : [...UNLOCK_AUDIENCE_OPTIONS],
        disabled: Boolean(item.disabled),
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
            disabled: false,
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
      backgroundColor: page.backgroundColor.trim() || DEFAULT_BG,
      textColor: page.textColor.trim() || DEFAULT_TEXT,
      items: page.items
        .map((item, i) => ({
          id: item.id?.trim() || `unlock-${i + 1}`,
          title: item.title.trim(),
          description: item.description.trim(),
          badge: item.badge.trim().toUpperCase() || 'NEW',
          // Keep [] so the feature exists but is shown to no user type.
          audiences: Array.isArray(item.audiences) ? item.audiences : [],
          disabled: Boolean(item.disabled),
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
        <span className="text-[#FF7800]">Generals / Languages</span>.
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

      <h2 className="mt-8 text-lg font-medium text-zinc-200">Colors</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Text and background for the unlock-features section on mobile.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ColorField
          label="Text color"
          value={page.textColor}
          onChange={(textColor) => setPage({ ...page, textColor })}
        />
        <ColorField
          label="Background color"
          value={page.backgroundColor}
          onChange={(backgroundColor) => setPage({ ...page, backgroundColor })}
        />
      </div>
      <div
        className="mt-4 rounded-xl border border-zinc-700 p-4"
        style={{ backgroundColor: page.backgroundColor }}
      >
        <p className="text-sm font-semibold" style={{ color: page.textColor }}>
          {page.unlockTitle || 'Section title preview'}
        </p>
        <p
          className="mt-1 text-xs"
          style={{ color: page.textColor, opacity: 0.72 }}
        >
          {page.unlockSub || 'Subtitle preview'}
        </p>
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
            selected.length === UNLOCK_AUDIENCE_OPTIONS.length &&
            UNLOCK_AUDIENCE_OPTIONS.every((a) => selected.includes(a));
          const noneSelected = selected.length === 0;

          return (
            <div
              key={item.id || `unlock-${index}`}
              className={`rounded-xl border p-4 ${
                item.disabled
                  ? 'border-zinc-800 bg-zinc-950/40 opacity-70'
                  : 'border-zinc-800 bg-zinc-900/40'
              }`}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-zinc-200">
                  Feature {index + 1}
                  {item.disabled ? (
                    <span className="ml-2 text-xs font-normal text-zinc-500">
                      (disabled — hidden on app)
                    </span>
                  ) : noneSelected ? (
                    <span className="ml-2 text-xs font-normal text-zinc-500">
                      (hidden from all users)
                    </span>
                  ) : null}
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
                    onClick={() =>
                      updateItem(index, { disabled: !item.disabled })
                    }
                    className={`rounded-lg border px-2 py-1 text-xs ${
                      item.disabled
                        ? 'border-[#FF7800]/60 bg-[#FF7800]/10 text-[#FF7800]'
                        : 'border-zinc-700 text-zinc-300 hover:border-[#FF7800]'
                    }`}
                  >
                    {item.disabled ? 'Enable' : 'Disable'}
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
                      (untag All = keep feature, show to nobody)
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateItem(index, {
                          audiences: allSelected
                            ? []
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
                      const on = selected.includes(audience);
                      return (
                        <button
                          key={audience}
                          type="button"
                          onClick={() =>
                            updateItem(index, {
                              audiences: toggleAudience(selected, audience),
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
