import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';
/** Allow long uploads for large MP4s */
export const maxDuration = 120;

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB

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

/** Standalone asset upload (hero video, testimonials, etc.) — returns URL only. */
export async function POST(req: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      {
        error:
          'Upload too large or invalid. Max size is 100MB — try a shorter MP4.',
      },
      { status: 413 }
    );
  }

  const file = form.get('file');
  const folder = String(form.get('folder') || 'assets').replace(
    /[^a-zA-Z0-9_-]/g,
    ''
  );

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: 'Empty file' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error: `File too large (${Math.round(file.size / 1024 / 1024)}MB). Max is 100MB.`,
      },
      { status: 413 }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = extensionForFile(file);
  const filename = `${folder || 'asset'}-${Date.now()}${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), bytes);
  const url = `/uploads/${filename}`;

  return NextResponse.json({
    url,
    size: file.size,
    contentType: file.type || null,
  });
}
