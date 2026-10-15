'use client';

import { useEffect, useMemo, useState } from 'react';
import { Field } from '@/components/Field';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import type {
  RotateDelaySec,
  TestimonialItem,
  TestimonialsSettings,
} from '@/lib/types';
import { ROTATE_DELAYS } from '@/lib/types';

type Mode = 'list' | 'create' | 'edit' | 'display';

const EMPTY_FORM: Omit<TestimonialItem, 'id'> = {
  code: '',
  pictureUrl: '',
  borderColor: '#FF7800',
  title: '',
  description: '',
  showInPresentation: true,
  showInMenu: false,
};

function testimonialsI18nKeys(data: TestimonialsSettings) {
  const en: Record<string, string> = {
    'features.loveSub': data.subtitle,
  };
  data.items.forEach((item, index) => {
    en[`testimonials.${index + 1}.code`] = item.code;
    en[`testimonials.${index + 1}.title`] = item.title;
    en[`testimonials.${index + 1}.description`] = item.description;
  });
  return en;
}

function initialsFromCode(code: string) {
  const parts = code.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

export default function TestimonialsPage() {
  const [data, setData] = useState<TestimonialsSettings | null>(null);
  const [mode, setMode] = useState<Mode>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const s = await fetchSettings();
    setData({
      subtitle: s.testimonials.subtitle,
      carouselDelaySec: s.testimonials.carouselDelaySec,
      items: s.testimonials.items.map((item) => ({ ...item })),
    });
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  const presentationCount = useMemo(
    () => data?.items.filter((i) => i.showInPresentation).length || 0,
    [data]
  );

  const carouselEnabled = presentationCount > 5;

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setMode('create');
    setMessage('');
  }

  function openEdit(item: TestimonialItem) {
    setEditingId(item.id);
    setForm({
      code: item.code,
      pictureUrl: item.pictureUrl,
      borderColor: item.borderColor,
      title: item.title,
      description: item.description,
      showInPresentation: item.showInPresentation,
      showInMenu: item.showInMenu,
    });
    setMode('edit');
    setMessage('');
  }

  function openDisplay(item: TestimonialItem) {
    setEditingId(item.id);
    setForm({
      code: item.code,
      pictureUrl: item.pictureUrl,
      borderColor: item.borderColor,
      title: item.title,
      description: item.description,
      showInPresentation: item.showInPresentation,
      showInMenu: item.showInMenu,
    });
    setMode('display');
    setMessage('');
  }

  function backToList() {
    setMode('list');
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  }

  async function uploadPicture(file: File) {
    setUploading(true);
    setMessage('');
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', 'testimonial');
      const res = await fetch('/api/upload/asset', {
        method: 'POST',
        body,
      });
      if (!res.ok) throw new Error('Upload failed');
      const json = (await res.json()) as { url: string };
      setForm((prev) => ({ ...prev, pictureUrl: json.url }));
      setMessage('Picture uploaded.');
    } catch {
      setMessage('Picture upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function persist(next: TestimonialsSettings, okMessage: string) {
    setSaving(true);
    setMessage('');
    try {
      await saveSettings({
        testimonials: next,
        i18n: { en: testimonialsI18nKeys(next) },
      });
      setData(next);
      setMessage(okMessage);
      return true;
    } catch {
      setMessage('Save failed.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveForm() {
    if (!data) return;
    const cleaned: TestimonialItem = {
      id: editingId || `testimonial-${Date.now()}`,
      code: form.code.trim(),
      pictureUrl: form.pictureUrl.trim(),
      borderColor: form.borderColor.trim() || '#FF7800',
      title: form.title.trim(),
      description: form.description.trim(),
      showInPresentation: form.showInPresentation,
      showInMenu: form.showInMenu,
    };
    if (!cleaned.code && !cleaned.title) {
      setMessage('Code or Title is required.');
      return;
    }

    const items =
      mode === 'edit' && editingId
        ? data.items.map((item) => (item.id === editingId ? cleaned : item))
        : [...data.items, cleaned];

    const next = { ...data, items };
    const ok = await persist(
      next,
      mode === 'edit' ? 'Testimonial updated.' : 'Testimonial created.'
    );
    if (ok) backToList();
  }

  async function removeItem(id: string) {
    if (!data) return;
    if (!window.confirm('Remove this testimonial?')) return;
    const next = {
      ...data,
      items: data.items.filter((item) => item.id !== id),
    };
    await persist(next, 'Testimonial removed.');
    if (editingId === id) backToList();
  }

  async function saveSettingsOnly() {
    if (!data) return;
    await persist(data, 'Testimonials settings saved.');
  }

  if (!data) return <p className="text-zinc-400">Loading…</p>;

  const readOnly = mode === 'display';

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Testimonials</h1>
          <p className="mt-2 text-zinc-400">
            Create and manage reviews shown on the Features presentation.
            Subtitle is translated under{' '}
            <span className="text-[#FF7800]">Languages → Testimonials</span>.
          </p>
        </div>
        {mode === 'list' ? (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-[#FF7800] px-4 py-2 text-sm font-semibold text-black"
          >
            + Add new
          </button>
        ) : (
          <button
            type="button"
            onClick={backToList}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
          >
            Back to list
          </button>
        )}
      </div>

      {mode === 'list' ? (
        <>
          <div className="mt-6 space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <Field
              label="Section subtitle"
              value={data.subtitle}
              onChange={(subtitle) => setData({ ...data, subtitle })}
              hint="Translated automatically via Languages → Apply Translation"
            />

            <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
              <p className="text-sm font-medium text-zinc-200">
                Presentation carousel
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {presentationCount} marked “Show in the presentation”. Carousel
                activates when more than 5 are checked.
              </p>
              <label className="mt-3 block space-y-1.5">
                <span className="text-sm font-medium text-zinc-200">
                  Rotate every (seconds)
                </span>
                <select
                  value={data.carouselDelaySec}
                  disabled={!carouselEnabled}
                  onChange={(e) =>
                    setData({
                      ...data,
                      carouselDelaySec: Number(e.target.value) as RotateDelaySec,
                    })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-[#FF7800] focus:ring-2 disabled:opacity-40"
                >
                  {ROTATE_DELAYS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}s
                    </option>
                  ))}
                </select>
              </label>
              {!carouselEnabled ? (
                <p className="mt-2 text-xs text-[#FF7800]">
                  Select more than 5 “Show in the presentation” to enable
                  carousel timing.
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {data.items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-700 p-6 text-center text-sm text-zinc-500">
                No testimonials yet. Click + Add new to create one.
              </p>
            ) : (
              data.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-zinc-800 text-xs font-bold text-zinc-200"
                    style={{ borderColor: item.borderColor || '#FF7800' }}
                  >
                    {item.pictureUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.pictureUrl}
                        alt={item.code}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initialsFromCode(item.code)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">
                      {item.code || 'Untitled'}
                    </p>
                    <p className="truncate text-sm text-zinc-400">
                      {item.title || 'No title'}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {item.showInPresentation ? 'Presentation' : 'Hidden'}
                      {' · '}
                      {item.showInMenu ? 'Menu' : 'No menu'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openDisplay(item)}
                      className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200"
                    >
                      Display
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-lg border border-red-900/60 px-3 py-1.5 text-xs text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <SaveBar
            saving={saving}
            message={message}
            onSave={saveSettingsOnly}
            onReset={() => {
              load().catch(() => setMessage('Failed to load settings'));
            }}
          />
        </>
      ) : (
        <div className="mt-6 space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="text-lg font-medium text-white">
            {mode === 'create'
              ? 'Add testimonial'
              : mode === 'edit'
                ? 'Edit testimonial'
                : 'Display testimonial'}
          </h2>

          <Field
            label="Code (name)"
            value={form.code}
            onChange={(code) => setForm({ ...form, code })}
            disabled={readOnly}
            hint={readOnly ? undefined : 'Name shown next to the picture'}
          />
          {readOnly ? (
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-zinc-200">Picture</span>
              <div
                className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 bg-zinc-800"
                style={{ borderColor: form.borderColor }}
              >
                {form.pictureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.pictureUrl}
                    alt={form.code}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-zinc-300">
                    {initialsFromCode(form.code)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-sm font-medium text-zinc-200">Picture</span>
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 bg-zinc-800"
                  style={{ borderColor: form.borderColor }}
                >
                  {form.pictureUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.pictureUrl}
                      alt={form.code}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-zinc-400">
                      {initialsFromCode(form.code)}
                    </span>
                  )}
                </div>
                <label className="cursor-pointer rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-[#FF7800]">
                  {uploading ? 'Uploading…' : 'Upload photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadPicture(file);
                      e.target.value = '';
                    }}
                  />
                </label>
                {form.pictureUrl ? (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, pictureUrl: '' })}
                    className="text-xs text-zinc-500 hover:text-red-300"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>
          )}

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-zinc-200">
              Color (picture border)
            </span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.borderColor || '#FF7800'}
                disabled={readOnly}
                onChange={(e) =>
                  setForm({ ...form, borderColor: e.target.value })
                }
                className="h-10 w-14 cursor-pointer rounded border border-zinc-700 bg-zinc-900 disabled:opacity-50"
              />
              <input
                type="text"
                value={form.borderColor}
                disabled={readOnly}
                onChange={(e) =>
                  setForm({ ...form, borderColor: e.target.value })
                }
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-[#FF7800] focus:ring-2 disabled:opacity-50"
              />
            </div>
          </label>

          <Field
            label="Title"
            value={form.title}
            onChange={(title) => setForm({ ...form, title })}
            disabled={readOnly}
          />
          <Field
            label="Description"
            value={form.description}
            onChange={(description) => setForm({ ...form, description })}
            multiline
            disabled={readOnly}
          />

          <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
            <label className="flex items-start gap-3 text-sm text-zinc-200">
              <input
                type="checkbox"
                checked={form.showInPresentation}
                disabled={readOnly}
                onChange={(e) =>
                  setForm({
                    ...form,
                    showInPresentation: e.target.checked,
                  })
                }
                className="mt-0.5 h-4 w-4 accent-[#FF7800]"
              />
              <span>
                Show in the presentation
                <span className="mt-0.5 block text-xs text-zinc-500">
                  Features screen reviews. If more than 5 are checked, carousel
                  uses the delay set on the list page.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-zinc-200">
              <input
                type="checkbox"
                checked={form.showInMenu}
                disabled={readOnly}
                onChange={(e) =>
                  setForm({ ...form, showInMenu: e.target.checked })
                }
                className="mt-0.5 h-4 w-4 accent-[#FF7800]"
              />
              <span>
                Show in the menu Testimonials
                <span className="mt-0.5 block text-xs text-zinc-500">
                  Reserved for a future Testimonials menu.
                </span>
              </span>
            </label>
          </div>

          {!readOnly ? (
            <SaveBar
              saving={saving}
              message={message}
              onSave={saveForm}
              onReset={backToList}
            />
          ) : (
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => editingId && openEdit(
                  data.items.find((i) => i.id === editingId)!
                )}
                className="rounded-lg bg-[#FF7800] px-4 py-2 text-sm font-semibold text-black"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={backToList}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
