import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getSession } from '@/lib/auth';
import { patchSettings, readSettings } from '@/lib/settings';

export async function POST(req: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file');
  const key = String(form.get('key') || 'asset');
  const label = String(form.get('label') || key);

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || '.jpg';
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '-');
  const filename = `${safeKey}-${Date.now()}${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), bytes);

  const url = `/uploads/${filename}`;
  const current = await readSettings();
  const images = [...current.images];
  const idx = images.findIndex((i) => i.key === key);
  if (idx >= 0) {
    images[idx] = { ...images[idx], url, label: label || images[idx].label };
  } else {
    images.push({ id: safeKey, key, label, url });
  }

  const nextHome = { ...current.home };
  const nextPaywall = { ...current.paywall };
  const nextTrain = { ...current.trainPro };

  if (key === 'heroBreakLimits') nextHome.heroImageUrl = url;
  if (key === 'paywallAthletes') nextPaywall.athletesImageUrl = url;
  if (key === 'trainPro') nextTrain.bannerImageUrl = url;

  const saved = await patchSettings({
    images,
    home: nextHome,
    paywall: nextPaywall,
    trainPro: nextTrain,
  });

  return NextResponse.json({ url, settings: saved });
}
