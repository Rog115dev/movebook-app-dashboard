'use client';

import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import { ENGLISH_STRINGS } from '@/lib/i18n';

const TRAIT_KEYS = [
  'features.traitStrong',
  'features.traitFocused',
  'features.traitPersonalized',
  'features.traitResults',
] as const;

type QualitiesForm = {
  builtFor: string;
  traits: string[];
};

export default function QualitiesPage() {
  const [form, setForm] = useState<QualitiesForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const s = await fetchSettings();
    const en = { ...ENGLISH_STRINGS, ...(s.i18n?.en || {}) };
    setForm({
      builtFor: en['features.builtFor'] || 'We built it just for you',
      traits: TRAIT_KEYS.map(
        (key, i) =>
          en[key] ||
          ['Strong', 'Focused', 'Personalized', 'Results-driven'][i] ||
          ''
      ),
    });
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  async function onSave() {
    if (!form) return;
    setSaving(true);
    setMessage('');
    try {
      const en: Record<string, string> = {
        'features.builtFor': form.builtFor,
      };
      TRAIT_KEYS.forEach((key, i) => {
        en[key] = form.traits[i] || '';
      });
      await saveSettings({ i18n: { en } });
      setMessage('Qualities saved (English translations updated).');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <p className="text-zinc-400">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Qualities</h1>
      <p className="mt-2 text-zinc-400">
        Features screen heading and trait pills (Strong, Focused, Personalized,
        Results-driven).
      </p>

      <div className="mt-6 grid gap-4">
        <Field
          label="Section heading"
          value={form.builtFor}
          onChange={(v) => setForm({ ...form, builtFor: v })}
        />
      </div>

      <h2 className="mt-10 text-xl font-semibold">Trait pills</h2>
      <div className="mt-4 space-y-3">
        {form.traits.map((trait, idx) => (
          <Field
            key={TRAIT_KEYS[idx]}
            label={`Trait ${idx + 1}`}
            value={trait}
            onChange={(v) => {
              const traits = [...form.traits];
              traits[idx] = v;
              setForm({ ...form, traits });
            }}
          />
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
