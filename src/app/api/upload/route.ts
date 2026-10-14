import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getSession } from '@/lib/auth';
import {
  addImageToSection,
  MAX_IMAGES_PER_SECTION,
  replaceImageInSection,
  syncLegacyImages,
  syncPrimaryUrls,
} from '@/lib/imageSections';
import { patchSettings, readSettings } from '@/lib/settings';
import type { ImageSectionKey } from '@/lib/types';
import { IMAGE_SECTION_KEYS } from '@/lib/types';

export async function POST(req: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file');
  const sectionKey = String(form.get('sectionKey') || '') as ImageSectionKey;
  const itemId = String(form.get('itemId') || '');
  const mode = String(form.get('mode') || (itemId ? 'replace' : 'add'));

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  if (!(IMAGE_SECTION_KEYS as readonly string[]).includes(sectionKey)) {
    return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
  }

  const current = await readSettings();
  const sections = current.imageSections.map((s) => ({ ...s, items: [...s.items] }));
  const index = sections.findIndex((s) => s.key === sectionKey);
  if (index < 0) {
    return NextResponse.json({ error: 'Section not found' }, { status: 404 });
  }

  if (mode === 'add' && sections[index].items.length >= MAX_IMAGES_PER_SECTION) {
    return NextResponse.json(
      { error: `Maximum ${MAX_IMAGES_PER_SECTION} images per section` },
      { status: 400 }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || '.jpg';
  const safeKey = `${sectionKey}${itemId ? `-${itemId}` : '-new'}`.replace(
    /[^a-zA-Z0-9_-]/g,
    '-'
  );
  const filename = `${safeKey}-${Date.now()}${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), bytes);
  const url = `/uploads/${filename}`;

  if (mode === 'replace' && itemId) {
    sections[index] = replaceImageInSection(sections[index], itemId, url);
  } else {
    sections[index] = addImageToSection(sections[index], url);
  }

  const primary = syncPrimaryUrls(sections);
  const saved = await patchSettings({
    imageSections: sections,
    images: syncLegacyImages(sections),
    home: { ...current.home, heroImageUrl: primary.heroImageUrl },
    paywall: { ...current.paywall, athletesImageUrl: primary.athletesImageUrl },
    trainPro: { ...current.trainPro, bannerImageUrl: primary.bannerImageUrl },
  });

  return NextResponse.json({ url, settings: saved });
}
