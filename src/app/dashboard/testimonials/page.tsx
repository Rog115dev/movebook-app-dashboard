'use client';

import { useEffect, useMemo, useState } from 'react';
import { Field } from '@/components/Field';
import { MultiCheckDropdown } from '@/components/MultiCheckDropdown';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import { COUNTRY_OPTIONS } from '@/lib/countries';
import { LOCALES, LOCALE_LABELS, type LocaleCode } from '@/lib/i18n';
import { slugifySportName } from '@/lib/sports';
import type {
  RotateDelaySec,
  SportCatalogItem,
  TestimonialItem,
  TestimonialsSettings,
  UnlockAudience,
} from '@/lib/types';
import { ROTATE_DELAYS, UNLOCK_AUDIENCE_OPTIONS } from '@/lib/types';

const AUDIENCE_OPTIONS = UNLOCK_AUDIENCE_OPTIONS.map((id) => ({
  value: id,
  label:
    id === 'athlete'
      ? 'Athlete'
      : id === 'coaches'
        ? 'Coaches'
        : id === 'teams'
          ? 'Teams'
          : id === 'clubs'
            ? 'Clubs'
            : 'Groups',
}));

const LANGUAGE_OPTIONS = LOCALES.map((code) => ({
  value: code,
  label: LOCALE_LABELS[code as LocaleCode] || code,
}));

const COUNTRY_DROPDOWN = COUNTRY_OPTIONS.map((c) => ({
  value: c.code,
  label: `${c.name} (${c.code})`,
}));

function emptyTargeting(): Pick<
  TestimonialItem,
  'countries' | 'languages' | 'audiences' | 'sports'
> {
  return {
    countries: [],
    languages: [],
    audiences: [],
    sports: [],
  };
}

function blankItem(): TestimonialItem {
  return {
    id: `testimonial-${Date.now()}`,
    code: 'New review',
    pictureUrl: '',
    logoUrl: '',
    borderColor: '#FF7800',
    title: 'Title',
    description: 'Write the review text users will read.',
    showInPresentation: true,
    showInMenu: true,
    ...emptyTargeting(),
  };
}

export default function TestimonialsPage() {
  const [page, setPage] = useState<TestimonialsSettings | null>(null);
  const [sports, setSports] = useState<SportCatalogItem[]>([]);
  const [newSportName, setNewSportName] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function load() {
    const s = await fetchSettings();
    setPage({
      subtitle: s.testimonials.subtitle,
      carouselDelaySec: s.testimonials.carouselDelaySec,
      items: s.testimonials.items.map((item) => ({
        ...item,
        logoUrl: item.logoUrl || '',
        countries: [...(item.countries || [])],
        languages: [...(item.languages || [])],
        audiences: [...(item.audiences || [])] as UnlockAudience[],
        sports: [...(item.sports || [])],
      })),
    });
    setSports(s.sports.map((sp) => ({ ...sp })));
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  const sportOptions = useMemo(
    () => sports.map((sp) => ({ value: sp.id, label: sp.name })),
    [sports]
  );

  function updateItem(index: number, patch: Partial<TestimonialItem>) {
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
      return { ...prev, items: [...prev.items, blankItem()] };
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

  function addSport() {
    const name = newSportName.trim();
    if (!name) {
      setMessage('Enter a sport name to add.');
      return;
    }
    let id = slugifySportName(name);
    if (!id) {
      setMessage('Sport name is invalid.');
      return;
    }
    if (sports.some((s) => s.id === id || s.name.toLowerCase() === name.toLowerCase())) {
      setMessage('That sport already exists.');
      return;
    }
    setSports((prev) => [...prev, { id, name }]);
    setNewSportName('');
    setMessage(`Added sport “${name}”. Save to persist.`);
  }

  function removeSport(id: string) {
    setSports((prev) => prev.filter((s) => s.id !== id));
    setPage((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) => ({
          ...item,
          sports: (item.sports || []).filter((sid) => sid !== id),
        })),
      };
    });
  }

  async function uploadImage(
    index: number,
    field: 'pictureUrl' | 'logoUrl',
    file: File
  ) {
    if (!page) return;
    if (!file.type.startsWith('image/')) {
      setMessage('Please choose an image file.');
      return;
    }
    setUploadingKey(`${index}-${field}`);
    setMessage('');
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', field === 'logoUrl' ? 'testimonial-logo' : 'testimonial');
      const res = await fetch('/api/upload/asset', {
        method: 'POST',
        body,
      });
      const json = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !json.url) {
        throw new Error(json.error || `Upload failed (${res.status})`);
      }
      updateItem(index, { [field]: json.url });
      setMessage(`${field === 'logoUrl' ? 'Logo' : 'Photo'} uploaded.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploadingKey(null);
    }
  }

  async function onSave() {
    if (!page) return;
    setSaving(true);
    setMessage('');
    try {
      await saveSettings({
        sports,
        testimonials: {
          subtitle: page.subtitle.trim(),
          carouselDelaySec: page.carouselDelaySec,
          items: page.items.map((item) => ({
            ...item,
            code: item.code.trim(),
            pictureUrl: item.pictureUrl.trim(),
            logoUrl: item.logoUrl.trim(),
            borderColor: item.borderColor.trim() || '#FF7800',
            title: item.title.trim(),
            description: item.description.trim(),
            countries: [...item.countries],
            languages: [...item.languages],
            audiences: [...item.audiences],
            sports: [...item.sports],
          })),
        },
      });
      setMessage('Testimonials and sports saved.');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!page) return <p className="text-zinc-400">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">Testimonials</h1>
      <p className="mt-2 text-zinc-400">
        Mobile Presentation — each review can target logo, country, language,
        user type, and sport. Empty targeting = show to everyone for that
        field.
      </p>

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="text-lg font-medium text-zinc-200">Sports catalog</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Seeded from the Movesbook sport names. Add or delete sports used in
          targeting and mobile signup.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={newSportName}
            onChange={(e) => setNewSportName(e.target.value)}
            placeholder="New sport name"
            className="min-w-[180px] flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-[#FF7800] focus:ring-2"
          />
          <button
            type="button"
            onClick={addSport}
            className="rounded-lg border border-[#FF7800]/60 bg-[#FF7800]/10 px-3 py-2 text-sm text-[#FF7800]"
          >
            + Add sport
          </button>
        </div>
        <ul className="mt-4 max-h-48 space-y-1 overflow-auto">
          {sports.map((sp) => (
            <li
              key={sp.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800 px-3 py-1.5 text-sm text-zinc-200"
            >
              <span>{sp.name}</span>
              <button
                type="button"
                onClick={() => removeSport(sp.id)}
                className="text-xs text-red-300 hover:text-red-200"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid gap-4">
        <Field
          label="Section subtitle"
          value={page.subtitle}
          onChange={(subtitle) => setPage({ ...page, subtitle })}
          hint="Shown under “users love FitAI Coach” on mobile."
        />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-200">
            Carousel delay (when more than 5 presentation reviews)
          </span>
          <select
            value={page.carouselDelaySec}
            onChange={(e) =>
              setPage({
                ...page,
                carouselDelaySec: Number(e.target.value) as RotateDelaySec,
              })
            }
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-[#FF7800] focus:ring-2"
          >
            {ROTATE_DELAYS.map((sec) => (
              <option key={sec} value={sec}>
                {sec}s
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium text-zinc-200">
          Presentation reviews
        </h2>
        <button
          type="button"
          onClick={addItem}
          className="rounded-lg border border-[#FF7800]/60 bg-[#FF7800]/10 px-3 py-2 text-sm text-[#FF7800] hover:bg-[#FF7800]/20"
        >
          + Add review
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {page.items.map((item, index) => (
          <div
            key={item.id || `t-${index}`}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-zinc-200">
                Review {index + 1}
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
                label="Name / code"
                value={item.code}
                onChange={(code) => updateItem(index, { code })}
              />
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
                label="Photo URL (person)"
                value={item.pictureUrl}
                onChange={(pictureUrl) => updateItem(index, { pictureUrl })}
                hint="Avatar on the review card."
              />
              <label className="inline-flex cursor-pointer rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-[#FF7800]">
                {uploadingKey === `${index}-pictureUrl`
                  ? 'Uploading…'
                  : 'Upload photo'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={Boolean(uploadingKey)}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(index, 'pictureUrl', file);
                    e.target.value = '';
                  }}
                />
              </label>

              <Field
                label="Logo URL"
                value={item.logoUrl}
                onChange={(logoUrl) => updateItem(index, { logoUrl })}
                hint="Separate logo shown on the mobile card (not the person photo)."
              />
              <label className="inline-flex cursor-pointer rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-[#FF7800]">
                {uploadingKey === `${index}-logoUrl`
                  ? 'Uploading…'
                  : 'Upload logo'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={Boolean(uploadingKey)}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(index, 'logoUrl', file);
                    e.target.value = '';
                  }}
                />
              </label>

              <Field
                label="Border color"
                value={item.borderColor}
                onChange={(borderColor) => updateItem(index, { borderColor })}
              />

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={item.showInPresentation}
                    onChange={(e) =>
                      updateItem(index, {
                        showInPresentation: e.target.checked,
                      })
                    }
                    className="accent-[#FF7800]"
                  />
                  Show in presentation
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={item.showInMenu}
                    onChange={(e) =>
                      updateItem(index, { showInMenu: e.target.checked })
                    }
                    className="accent-[#FF7800]"
                  />
                  Show in menu
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <MultiCheckDropdown
                  label="Country"
                  options={COUNTRY_DROPDOWN}
                  values={item.countries}
                  onChange={(countries) => updateItem(index, { countries })}
                  hint="Empty = all countries"
                />
                <MultiCheckDropdown
                  label="Language"
                  options={LANGUAGE_OPTIONS}
                  values={item.languages}
                  onChange={(languages) => updateItem(index, { languages })}
                  hint="Empty = all languages"
                />
                <MultiCheckDropdown
                  label="Type of user"
                  options={AUDIENCE_OPTIONS}
                  values={item.audiences}
                  onChange={(audiences) =>
                    updateItem(index, {
                      audiences: audiences as UnlockAudience[],
                    })
                  }
                  hint="Empty = all user types"
                />
                <MultiCheckDropdown
                  label="Type of sport"
                  options={sportOptions}
                  values={item.sports}
                  onChange={(nextSports) =>
                    updateItem(index, { sports: nextSports })
                  }
                  hint="Empty = all sports"
                />
              </div>
            </div>
          </div>
        ))}
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
