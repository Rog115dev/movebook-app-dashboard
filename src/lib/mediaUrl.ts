/** Detect video vs image asset paths (CMS + uploads). */

export function looksLikeVideoUrl(url: string | undefined | null): boolean {
  const u = (url || '').trim();
  if (!u) return false;
  return (
    /\.(mp4|webm|mov|m3u8)(\?|#|$)/i.test(u) ||
    /\/uploads\/[^/?#]+\.(mp4|webm|mov)(\?|#|$)/i.test(u)
  );
}
