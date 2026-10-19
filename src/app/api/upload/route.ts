import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getSession } from '@/lib/auth';
import {
  addImageToSection,
  MAX_HERO_VIDEOS,
  MAX_IMAGES_PER_SECTION,
  primaryVideoUrlFromSection,
  replaceImageInSection,
  sectionKind,
  syncLegacyImages,
  syncPrimaryUrls,
} from '@/lib/imageSections';
import { looksLikeVideoUrl } from '@/lib/mediaUrl';
import { patchSettings, readSettings } from '@/lib/settings';
import type { ImageSectionKey } from '@/lib/types';
import { IMAGE_SECTION_KEYS } from '@/lib/types';

function extensionForFile(file: File): string {
  const fromName = path.extname(file.name || '').toLowerCase();
  if (fromName && fromName.length <= 8) return fromName;
  const type = (file.type || '').toLowerCase();
  if (type === 'video/mp4' || type === 'video/mpeg') return '.mp4';
  if (type === 'video/webm') return '.webm';
  if (type === 'video/quicktime') return '.mov';
  if (type === 'image/png') return '.png';
  if (type === 'image/webp') return '.webp';
  if (type === 'image/gif') return '.gif';
  if (type.startsWith('image/')) return '.jpg';
  if (type.startsWith('video/')) return '.mp4';
  return '.bin';
}

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

  const kind = sectionKind(sectionKey);
  const isVideoFile =
    file.type.startsWith('video/') ||
    /\.(mp4|webm|mov)$/i.test(file.name || '');
  const isImageFile =
    file.type.startsWith('image/') ||
    /\.(png|jpe?g|webp|gif)$/i.test(file.name || '');

  if (kind === 'video' && !isVideoFile) {
    return NextResponse.json(
      { error: 'Home hero accepts video files only (MP4 / WebM / MOV).' },
      { status: 400 }
    );
  }
  if (kind === 'image' && !isImageFile) {
    return NextResponse.json(
      { error: 'This section accepts image files only.' },
      { status: 400 }
    );
  }

  const current = await readSettings();
  const sections = current.imageSections.map((s) => ({
    ...s,
    items: [...s.items],
  }));
  const index = sections.findIndex((s) => s.key === sectionKey);
  if (index < 0) {
    return NextResponse.json({ error: 'Section not found' }, { status: 404 });
  }

  const maxItems =
    kind === 'video' ? MAX_HERO_VIDEOS : MAX_IMAGES_PER_SECTION;
  if (
    mode === 'add' &&
    sections[index].items.length >= maxItems
  ) {
    return NextResponse.json(
      {
        error: `Maximum ${maxItems} ${kind === 'video' ? 'videos' : 'images'} per section`,
      },
      { status: 400 }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = extensionForFile(file);
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
    // Hero videos append (deduped); images append as before.
    sections[index] = addImageToSection(sections[index], url);
  }

  const primary = syncPrimaryUrls(sections);
  const heroVideoUrl =
    primaryVideoUrlFromSection(sections.find((s) => s.key === 'hero')) ||
    current.home.heroVideoUrl ||
    '';

  const saved = await patchSettings({
    imageSections: sections,
    images: syncLegacyImages(sections),
    home: {
      ...current.home,
      heroImageUrl: primary.heroImageUrl,
      heroVideoUrl: looksLikeVideoUrl(heroVideoUrl) ? heroVideoUrl : '',
      heroVideoChosen: Boolean(looksLikeVideoUrl(heroVideoUrl)),
    },
    paywall: { ...current.paywall, athletesImageUrl: primary.athletesImageUrl },
    trainPro: { ...current.trainPro, bannerImageUrl: primary.bannerImageUrl },
  });

  return NextResponse.json({ url, settings: saved });
}
