'use client';

import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import type { HomeSettings, WhyChooseReason } from '@/lib/types';

export default function HomePageEditor() {
  const [home, setHome] = useState<HomeSettings | null>(null);
  const [title, setTitle] = useState('Why Choose Me');
  const [reasons, setReasons] = useState<WhyChooseReason[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const s = await fetchSettings();
    setHome(s.home);
    setTitle(s.whyChooseMe.title);
    setReasons(s.whyChooseMe.reasons);
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  async function onSave() {
    if (!home) return;
    setSaving(true);
    setMessage('');
    try {
      await saveSettings({
        home,
        whyChooseMe: { title, reasons },
        // Keep English i18n keys in sync with Home editor
        i18n: {
          en: {
            'home.brandPrefix': home.brandPrefix,
            'home.brandAccent': home.brandAccent,
            'home.brandSuffix': home.brandSuffix,
            'home.subtitle': home.subtitle,
            'home.heroHeadline': home.heroHeadline,
            'home.heroCaption': home.heroCaption,
            'home.featuresCta': home.featuresCta,
            'home.signupCta': home.signupCta,
            'home.loginPrompt': home.loginPrompt,
            'home.loginLink': home.loginLink,
            'home.confidenceText': home.confidenceText,
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
      setMessage('Home content saved (English translations updated).');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!home) return <p className="text-zinc-400">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">Home content</h1>
      <p className="mt-2 text-zinc-400">
        English source copy for home. Translate other languages under{' '}
        <span className="text-[#FF7800]">Languages</span>.
      </p>

      <div className="mt-6 grid gap-4">
        <Field
          label="Brand prefix"
          value={home.brandPrefix}
          onChange={(v) => setHome({ ...home, brandPrefix: v })}
        />
        <Field
          label="Brand accent"
          value={home.brandAccent}
          onChange={(v) => setHome({ ...home, brandAccent: v })}
        />
        <Field
          label="Brand suffix"
          value={home.brandSuffix}
          onChange={(v) => setHome({ ...home, brandSuffix: v })}
        />
        <Field
          label="Subtitle"
          value={home.subtitle}
          onChange={(v) => setHome({ ...home, subtitle: v })}
          multiline
        />
        <Field
          label="Hero headline"
          value={home.heroHeadline}
          onChange={(v) => setHome({ ...home, heroHeadline: v })}
        />
        <Field
          label="Hero caption"
          value={home.heroCaption}
          onChange={(v) => setHome({ ...home, heroCaption: v })}
        />
        <Field
          label="Features CTA"
          value={home.featuresCta}
          onChange={(v) => setHome({ ...home, featuresCta: v })}
        />
        <Field
          label="Sign up CTA"
          value={home.signupCta}
          onChange={(v) => setHome({ ...home, signupCta: v })}
        />
        <Field
          label="Login prompt"
          value={home.loginPrompt}
          onChange={(v) => setHome({ ...home, loginPrompt: v })}
        />
        <Field
          label="Login link"
          value={home.loginLink}
          onChange={(v) => setHome({ ...home, loginLink: v })}
        />
        <Field
          label="Confidence text"
          value={home.confidenceText}
          onChange={(v) => setHome({ ...home, confidenceText: v })}
          multiline
        />
        <Field
          label="Hero image URL"
          value={home.heroImageUrl}
          onChange={(v) => setHome({ ...home, heroImageUrl: v })}
          hint="Upload via Images page, or paste a URL"
        />
      </div>

      <h2 className="mt-10 text-xl font-semibold">Why Choose Me</h2>
      <div className="mt-4">
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
