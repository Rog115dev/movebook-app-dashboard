'use client';

import { useEffect, useState } from 'react';
import { Field } from '@/components/Field';
import { SaveBar } from '@/components/SaveBar';
import { fetchSettings, saveSettings } from '@/lib/api-client';
import type { FaqItem, TrainProSettings } from '@/lib/types';

function faqI18nKeys(faqTitle: string, faqs: FaqItem[]) {
  const en: Record<string, string> = {
    'train.faqTitle': faqTitle,
  };
  faqs.forEach((item, index) => {
    en[`train.faq${index + 1}Q`] = item.q;
    en[`train.faq${index + 1}A`] = item.a;
  });
  return en;
}

export default function FaqPage() {
  const [trainPro, setTrainPro] = useState<TrainProSettings | null>(null);
  const [faqTitle, setFaqTitle] = useState('FAQ');
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const s = await fetchSettings();
    setTrainPro(s.trainPro);
    setFaqTitle(s.trainPro.faqTitle || 'FAQ');
    setFaqs(s.trainPro.faqs?.length ? s.trainPro.faqs.map((f) => ({ ...f })) : []);
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  function updateFaq(index: number, patch: Partial<FaqItem>) {
    setFaqs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function addFaq() {
    setFaqs((prev) => [...prev, { q: '', a: '' }]);
  }

  function removeFaq(index: number) {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  }

  function moveFaq(index: number, direction: -1 | 1) {
    setFaqs((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  }

  async function onSave() {
    if (!trainPro) return;
    const cleaned = faqs
      .map((f) => ({ q: f.q.trim(), a: f.a.trim() }))
      .filter((f) => f.q || f.a);

    setSaving(true);
    setMessage('');
    try {
      const nextTrainPro: TrainProSettings = {
        ...trainPro,
        faqTitle: faqTitle.trim() || 'FAQ',
        faqs: cleaned,
      };
      await saveSettings({
        trainPro: nextTrainPro,
        i18n: {
          en: faqI18nKeys(nextTrainPro.faqTitle, cleaned),
        },
      });
      setTrainPro(nextTrainPro);
      setFaqs(cleaned);
      setMessage('FAQ saved (English translations updated).');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (!trainPro) return <p className="text-zinc-400">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">FAQ</h1>
      <p className="mt-2 text-zinc-400">
        Manage questions shown under TRAIN PRO. Translate other languages under{' '}
        <span className="text-[#FF7800]">Others / Languages</span>.
      </p>

      <div className="mt-6">
        <Field label="Section title" value={faqTitle} onChange={setFaqTitle} />
      </div>

      <div className="mt-6 space-y-4">
        {faqs.map((item, index) => (
          <div
            key={`faq-${index}`}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-zinc-200">
                Question {index + 1}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => moveFaq(index, -1)}
                  disabled={index === 0}
                  className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300 disabled:opacity-40"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveFaq(index, 1)}
                  disabled={index === faqs.length - 1}
                  className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300 disabled:opacity-40"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => removeFaq(index)}
                  className="rounded-lg border border-red-900/60 px-2 py-1 text-xs text-red-300"
                >
                  Remove
                </button>
              </div>
            </div>
            <Field
              label="Question"
              value={item.q}
              onChange={(v) => updateFaq(index, { q: v })}
            />
            <div className="mt-3">
              <Field
                label="Answer"
                value={item.a}
                multiline
                onChange={(v) => updateFaq(index, { a: v })}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addFaq}
        className="mt-4 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-[#FF7800]"
      >
        Add question
      </button>

      <SaveBar
        saving={saving}
        message={message}
        onSave={onSave}
        onReset={() => load()}
      />
    </div>
  );
}
