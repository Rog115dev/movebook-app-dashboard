'use client';

import { useEffect, useState } from 'react';
import { fetchSettings } from '@/lib/api-client';
import type { ImageAsset } from '@/lib/types';

export default function ImagesPage() {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [message, setMessage] = useState('');
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  async function load() {
    const s = await fetchSettings();
    setImages(s.images);
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load settings'));
  }, []);

  async function onUpload(key: string, label: string, file: File) {
    setUploadingKey(key);
    setMessage('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('key', key);
      form.append('label', label);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setImages(data.settings.images);
      setMessage(`Uploaded ${label}`);
    } catch {
      setMessage('Upload failed.');
    } finally {
      setUploadingKey(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-semibold">Images</h1>
      <p className="mt-2 text-zinc-400">
        Replace hero, paywall, and TRAIN PRO images used by the mobile app.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => (
          <div
            key={img.id}
            className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40"
          >
            <div className="relative aspect-square bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.label}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0.25';
                }}
              />
            </div>
            <div className="space-y-3 p-4">
              <div>
                <p className="font-medium text-white">{img.label}</p>
                <p className="truncate text-xs text-zinc-500">{img.url}</p>
              </div>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#FF7800] px-3 py-2 text-sm font-semibold text-black">
                {uploadingKey === img.key ? 'Uploading…' : 'Replace image'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingKey === img.key}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload(img.key, img.label, file);
                  }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {message ? <p className="mt-4 text-sm text-zinc-400">{message}</p> : null}
    </div>
  );
}
