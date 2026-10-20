'use client';

import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import type { WhyChooseReason } from '@/lib/types';

export default function WhyChooseMePage() {
  const [title, setTitle] = useState('Why Choose Me');
  const [reasons, setReasons] = useState<WhyChooseReason[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const s = await fetchSettings();
    setTitle(s.whyChooseMe.title);
    setReasons(s.whyChooseMe.reasons.map((r) => ({ ...r })));
    setLoaded(true);
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  async function onSave() {
    setSaving(true);
    setMessage('');
    try {
      await saveSettings({
        whyChooseMe: { title, reasons },
        i18n: {
          en: {
            'why.title': title,
            'why.resultsTitle': reasons[0]?.title || '',
            'why.resultsBody': reasons[0]?.body || '',
            'why.qualityTitle': reasons[1]?.title || '',
            'why.qualityBody': reasons[1]?.body || '',
            'why.collabTitle': reasons[2]?.title || '',
            'why.collabBody': reasons[2]?.body || '',
          },
        },
      });
      setMessage('Why choose me saved (English translations updated).');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return <p className="text-zinc-400">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Why choose me</h1>
      <p className="mt-2 text-zinc-400">
        Home section cards (Results-Driven, Quality Assured, Collaborative).
      </p>

      <div className="mt-6">
        <Field label="Section title" value={title} onChange={setTitle} />
      </div>
      <div className="mt-4 space-y-4">
        {reasons.map((reason, idx) => (
          <div
            key={reason.key}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <Field
              label="Title"
              value={reason.title}
              onChange={(v) => {
                const next = [...reasons];
                next[idx] = { ...reason, title: v };
                setReasons(next);
              }}
            />
            <div className="mt-3">
              <Field
                label="Body"
                value={reason.body}
                multiline
                onChange={(v) => {
                  const next = [...reasons];
                  next[idx] = { ...reason, body: v };
                  setReasons(next);
                }}
              />
            </div>
            <div className="mt-3">
              <Field
                label="Icon name"
                value={reason.icon}
                onChange={(v) => {
                  const next = [...reasons];
                  next[idx] = { ...reason, icon: v };
                  setReasons(next);
                }}
              />
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
