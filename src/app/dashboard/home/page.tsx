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
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [previewError, setPreviewError] = useState(false);

  async function load() {
    const s = await fetchSettings();
    setHome({
      ...s.home,
      heroVideoSamples: s.home.heroVideoSamples?.length
        ? s.home.heroVideoSamples.map((v) => ({ ...v }))
        : [],
    });
    setTitle(s.whyChooseMe.title);
    setReasons(s.whyChooseMe.reasons);
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  async function uploadVideo(file: File) {
    if (!home) return;
    if (!file.type.startsWith('video/') && !/\.(mp4|webm|mov)$/i.test(file.name)) {
      setMessage('Please choose an MP4, WebM, or MOV video file.');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setMessage('Video is too large (max 100MB). Compress or shorten the clip.');
      return;
    }
    setUploading(true);
    setMessage('');
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', 'hero-video');
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
      const id = `upload-${Date.now()}`;
      const nextHome = {
        ...home,
        heroVideoUrl: json.url,
        heroVideoSamples: [
          ...home.heroVideoSamples.filter((s) => s.url !== json.url),
          { id, label: file.name || 'Uploaded video', url: json.url },
        ],
      };
      setPreviewError(false);
      setHome(nextHome);
      // Persist immediately so mobile can load the new URL
      await saveSettings({
        home: {
          ...nextHome,
          heroVideoUrl: nextHome.heroVideoUrl.trim(),
        },
      });
      setMessage(
        `Video uploaded and saved (${Math.round(file.size / 1024)} KB). Preview below — reload the mobile app to see it.`
      );
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : 'Video upload failed.'
      );
    } finally {
      setUploading(false);
    }
  }

  async function onSave() {
    if (!home) return;
    setSaving(true);
    setMessage('');
    try {
      await saveSettings({
        home: {
          ...home,
          heroVideoUrl: home.heroVideoUrl.trim(),
        },
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

  const videoUrl = home.heroVideoUrl?.trim() || '';
  const canPreviewVideo =
    Boolean(videoUrl) &&
    (/^https?:\/\//i.test(videoUrl) ||
      videoUrl.startsWith('/uploads/') ||
      /\.(mp4|webm|mov|m3u8)(\?|$)/i.test(videoUrl));

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
          label="Hero poster image URL"
          value={home.heroImageUrl}
          onChange={(v) => setHome({ ...home, heroImageUrl: v })}
          hint="Shown as poster / fallback when no video is set. Manage pool under Images."
        />
      </div>

      <section className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="text-xl font-semibold text-white">Hero video</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Paste a direct video URL (.mp4 / .webm / .m3u8) or upload a file. Pick
          a sample below. On mobile, an active video URL overrides the hero
          image from Images — use “Clear video” to show the image only.
        </p>
        {videoUrl ? (
          <p className="mt-2 rounded-lg border border-[#FF7800]/40 bg-[#FF7800]/10 px-3 py-2 text-xs text-[#FF7800]">
            Video is active. The mobile hero will play this clip instead of the
            Images → Home hero image until you clear it.
          </p>
        ) : null}

        <div className="mt-4">
          <Field
            label="Active video URL"
            value={home.heroVideoUrl}
            onChange={(v) => {
              setPreviewError(false);
              setHome({ ...home, heroVideoUrl: v });
            }}
            hint="Example: https://…/clip.mp4 or /uploads/sample-hero-1.mp4"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-[#FF7800]">
            {uploading ? 'Uploading…' : 'Upload video'}
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadVideo(file);
                e.target.value = '';
              }}
            />
          </label>
          {home.heroVideoUrl ? (
            <button
              type="button"
              onClick={() => setHome({ ...home, heroVideoUrl: '' })}
              className="text-xs text-zinc-500 hover:text-red-300"
            >
              Clear video (use image)
            </button>
          ) : null}
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-zinc-200">Sample videos</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {home.heroVideoSamples.map((sample) => {
              const selected = home.heroVideoUrl === sample.url;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    setPreviewError(false);
                    setHome({ ...home, heroVideoUrl: sample.url });
                  }}
                  className={`rounded-xl border p-3 text-left transition ${
                    selected
                      ? 'border-[#FF7800] bg-[#FF7800]/10'
                      : 'border-zinc-700 bg-zinc-950/50 hover:border-zinc-500'
                  }`}
                >
                  <p className="text-sm font-medium text-white">
                    {sample.label}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-zinc-500">
                    {sample.url}
                  </p>
                  {selected ? (
                    <p className="mt-2 text-[11px] font-medium text-[#FF7800]">
                      Selected
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {videoUrl ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-zinc-800 bg-black">
            {canPreviewVideo && !previewError ? (
              <video
                key={videoUrl}
                src={videoUrl}
                controls
                muted
                playsInline
                preload="metadata"
                className="max-h-56 w-full object-contain bg-black"
                onLoadedData={() => setPreviewError(false)}
                onError={() => setPreviewError(true)}
              />
            ) : (
              <p className="p-4 text-sm text-red-300">
                Preview failed to load{' '}
                <code className="text-zinc-400">{videoUrl}</code>. Re-upload the
                MP4 (max 100MB) or confirm the file exists under{' '}
                <code className="text-zinc-400">public/uploads</code>.
              </p>
            )}
            <p className="border-t border-zinc-800 px-3 py-2 text-[11px] text-zinc-500">
              Active: {videoUrl}
            </p>
          </div>
        ) : null}
      </section>

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
