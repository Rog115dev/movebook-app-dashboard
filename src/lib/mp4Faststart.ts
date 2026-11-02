/**
 * Move MP4/MOV `moov` before `mdat` (faststart) so browsers and mobile
 * can preview/play without downloading the whole file first.
 * Pure Node — no ffmpeg required. Copy-remux only (no re-encode).
 */

type Box = { type: string; start: number; size: number; headerSize: number };

function readU32(buf: Buffer, offset: number): number {
  return buf.readUInt32BE(offset);
}

function readU64(buf: Buffer, offset: number): number {
  // File sizes we accept are <= 100MB; safe in JS number range.
  const hi = buf.readUInt32BE(offset);
  const lo = buf.readUInt32BE(offset + 4);
  return hi * 0x100000000 + lo;
}

function parseTopLevelBoxes(buf: Buffer): Box[] | null {
  const boxes: Box[] = [];
  let offset = 0;
  while (offset + 8 <= buf.length) {
    let size = readU32(buf, offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    let headerSize = 8;

    if (size === 1) {
      if (offset + 16 > buf.length) return null;
      size = readU64(buf, offset + 8);
      headerSize = 16;
    } else if (size === 0) {
      size = buf.length - offset;
    }

    if (size < headerSize || offset + size > buf.length) return null;

    boxes.push({ type, start: offset, size, headerSize });
    offset += size;
  }
  return offset === buf.length ? boxes : null;
}

/** Walk moov and bump every stco/co64 absolute chunk offset by `delta`. */
function patchChunkOffsets(moov: Buffer, delta: number): boolean {
  let offset = 8; // skip moov header (always 8 for standard moov)
  // moov may use extended size — rare; parseTopLevel already validated size.
  if (moov.length >= 16 && readU32(moov, 0) === 1) offset = 16;

  const stack: { end: number; pos: number }[] = [
    { end: moov.length, pos: offset },
  ];

  while (stack.length) {
    const frame = stack[stack.length - 1];
    if (frame.pos + 8 > frame.end) {
      stack.pop();
      continue;
    }

    let size = readU32(moov, frame.pos);
    const type = moov.toString('ascii', frame.pos + 4, frame.pos + 8);
    let headerSize = 8;
    if (size === 1) {
      if (frame.pos + 16 > frame.end) return false;
      size = readU64(moov, frame.pos + 8);
      headerSize = 16;
    } else if (size === 0) {
      size = frame.end - frame.pos;
    }
    if (size < headerSize || frame.pos + size > frame.end) return false;

    const boxStart = frame.pos;
    const boxEnd = boxStart + size;
    frame.pos = boxEnd;

    if (type === 'stco') {
      // version/flags (4) + entry_count (4) + entries u32[]
      const data = boxStart + headerSize;
      if (data + 8 > boxEnd) return false;
      const version = moov[data];
      if (version !== 0) return false;
      const count = readU32(moov, data + 4);
      const entriesAt = data + 8;
      if (entriesAt + count * 4 > boxEnd) return false;
      for (let i = 0; i < count; i++) {
        const at = entriesAt + i * 4;
        const next = readU32(moov, at) + delta;
        if (next < 0 || next > 0xffffffff) return false;
        moov.writeUInt32BE(next >>> 0, at);
      }
    } else if (type === 'co64') {
      const data = boxStart + headerSize;
      if (data + 8 > boxEnd) return false;
      const version = moov[data];
      if (version !== 0) return false;
      const count = readU32(moov, data + 4);
      const entriesAt = data + 8;
      if (entriesAt + count * 8 > boxEnd) return false;
      for (let i = 0; i < count; i++) {
        const at = entriesAt + i * 8;
        const next = readU64(moov, at) + delta;
        const hi = Math.floor(next / 0x100000000);
        const lo = next >>> 0;
        moov.writeUInt32BE(hi, at);
        moov.writeUInt32BE(lo, at + 4);
      }
    } else if (
      type === 'trak' ||
      type === 'mdia' ||
      type === 'minf' ||
      type === 'stbl' ||
      type === 'edts' ||
      type === 'moov'
    ) {
      stack.push({ end: boxEnd, pos: boxStart + headerSize });
    } else if (type === 'cmov') {
      // Compressed moov — cannot patch without inflate.
      return false;
    }
  }

  return true;
}

/**
 * Returns a buffer safe for progressive playback, or the original if
 * already faststarted / not an ISO BMFF / cannot remux.
 */
export function ensureMp4FastStart(input: Buffer): Buffer {
  if (input.length < 16) return input;

  const brand = input.toString('ascii', 4, 8);
  if (brand !== 'ftyp') return input;

  const boxes = parseTopLevelBoxes(input);
  if (!boxes || !boxes.length) return input;

  const moovIndex = boxes.findIndex((b) => b.type === 'moov');
  const mdatIndex = boxes.findIndex((b) => b.type === 'mdat');
  if (moovIndex < 0 || mdatIndex < 0) return input;

  // Already progressive (moov before mdat).
  if (moovIndex < mdatIndex) return input;

  const moovBox = boxes[moovIndex];
  const moov = Buffer.from(
    input.subarray(moovBox.start, moovBox.start + moovBox.size)
  );

  if (!patchChunkOffsets(moov, moovBox.size)) {
    return input;
  }

  // Rebuild: everything before first mdat (except trailing moov/free after mdat),
  // then patched moov, then all mdat (and any non-moov boxes that were after moov skip).
  // Classic layout: [ftyp][free?][mdat...][moov] → [ftyp][free?][moov][mdat...]
  const before: Buffer[] = [];
  const afterMdat: Buffer[] = [];
  let seenMdat = false;

  for (const box of boxes) {
    if (box.type === 'moov') continue;
    const slice = input.subarray(box.start, box.start + box.size);
    if (box.type === 'mdat') {
      seenMdat = true;
      afterMdat.push(slice);
      continue;
    }
    // Drop trailing `free` that sat after mdat (often leftover); keep leading free.
    if (seenMdat && box.type === 'free') continue;
    if (!seenMdat) before.push(slice);
    else afterMdat.push(slice);
  }

  return Buffer.concat([...before, moov, ...afterMdat]);
}

export function shouldFastStartVideo(filenameOrExt: string): boolean {
  return /\.(mp4|m4v|mov)$/i.test(filenameOrExt);
}
