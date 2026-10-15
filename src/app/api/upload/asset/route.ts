import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getSession } from '@/lib/auth';

/** Standalone image upload (testimonials, etc.) — returns URL only. */
export async function POST(req: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file');
  const folder = String(form.get('folder') || 'assets').replace(
    /[^a-zA-Z0-9_-]/g,
    ''
  );

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || '.jpg';
  const filename = `${folder}-${Date.now()}${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), bytes);
  const url = `/uploads/${filename}`;

  return NextResponse.json({ url });
}
