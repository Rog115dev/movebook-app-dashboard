import type {
  ImageAsset,
  ImagePoolItem,
  ImageSectionConfig,
  ImageSectionKey,
  MobileAppSettings,
  RotateDelaySec,
} from './types';
import { ROTATE_DELAYS } from './types';
import { looksLikeVideoUrl } from './mediaUrl';

export const MAX_IMAGES_PER_SECTION = 9;
/** Home hero video playlist (circular playback on mobile). */
export const MAX_HERO_VIDEOS = 9;

const SECTION_META: Record<
  ImageSectionKey,
  { label: string; legacyKey: string; kind: 'image' | 'video' }
> = {
  hero: {
    label: 'Home hero video',
    legacyKey: 'heroBreakLimits',
    kind: 'video',
  },
  paywall: {
    label: 'Paywall athletes image',
    legacyKey: 'paywallAthletes',
    kind: 'image',
  },
  trainPro: {
    label: 'TRAIN PRO banner',
    legacyKey: 'trainPro',
    kind: 'image',
  },
};

export function sectionKind(key: ImageSectionKey): 'image' | 'video' {
  return SECTION_META[key]?.kind || 'image';
}

export function isRotateDelay(value: unknown): value is RotateDelaySec {
  return (
    typeof value === 'number' &&
    (ROTATE_DELAYS as readonly number[]).includes(value)
  );
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function dedupeByUrl(items: ImagePoolItem[]): ImagePoolItem[] {
  const seen = new Set<string>();
  const out: ImagePoolItem[] = [];
  for (const item of items) {
    const url = (item.url || '').trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push({ ...item, url });
  }
  return out;
}

export function createDefaultImageSections(urls?: {
  hero?: string;
  paywall?: string;
  trainPro?: string;
}): ImageSectionConfig[] {
  const mk = (key: ImageSectionKey, url: string): ImageSectionConfig => {
    const id = `${key}-1`;
    return {
      key,
      label: SECTION_META[key].label,
      items: [{ id, url }],
      selectedIds: [id],
      rotateDelaySec: 5,
    };
  };

  return [
    mk('hero', urls?.hero || ''),
    mk('paywall', urls?.paywall || '/uploads/paywall-athletes.jpg'),
    mk('trainPro', urls?.trainPro || '/uploads/train-pro.jpg'),
  ];
}

/**
 * Hero section: video playlist (deduped URLs, up to MAX_HERO_VIDEOS).
 * Image sections: 1–9 images.
 */
export function normalizeImageSection(
  section: Partial<ImageSectionConfig> | undefined,
  fallback: ImageSectionConfig
): ImageSectionConfig {
  const key = (section?.key || fallback.key) as ImageSectionKey;
  const meta = SECTION_META[key] || SECTION_META[fallback.key];
  let items = Array.isArray(section?.items)
    ? section!.items.filter((i): i is ImagePoolItem => Boolean(i?.id && i?.url))
    : [];

  items = dedupeByUrl(items);

  if (meta.kind === 'video') {
    items = items
      .filter((i) => looksLikeVideoUrl(i.url))
      .slice(0, MAX_HERO_VIDEOS);
  } else {
    items = items
      .filter((i) => !looksLikeVideoUrl(i.url))
      .slice(0, MAX_IMAGES_PER_SECTION);
  }

  if (!items.length && meta.kind !== 'video') {
    items = fallback.items.map((i) => ({ ...i }));
  }

  const itemIds = new Set(items.map((i) => i.id));
  let selectedIds = Array.isArray(section?.selectedIds)
    ? section!.selectedIds.filter((id) => itemIds.has(id))
    : [];

  // Preserve selection order for circular playback; default = all videos.
  if (!selectedIds.length && items.length) {
    selectedIds = items.map((i) => i.id);
  }

  return {
    key,
    label: meta.label,
    items,
    selectedIds,
    rotateDelaySec: isRotateDelay(section?.rotateDelaySec)
      ? section!.rotateDelaySec
      : fallback.rotateDelaySec,
  };
}

/** Migrate legacy flat `images` + URL fields into imageSections. */
export function migrateImageSections(
  settings: Partial<MobileAppSettings>
): ImageSectionConfig[] {
  const heroSeed =
    (typeof settings.home?.heroVideoUrl === 'string' &&
    looksLikeVideoUrl(settings.home.heroVideoUrl)
      ? settings.home.heroVideoUrl
      : '') ||
    (typeof settings.home?.heroImageUrl === 'string' &&
    looksLikeVideoUrl(settings.home.heroImageUrl)
      ? settings.home.heroImageUrl
      : '') ||
    '';

  const defaults = createDefaultImageSections({
    hero: heroSeed,
    paywall: settings.paywall?.athletesImageUrl,
    trainPro: settings.trainPro?.bannerImageUrl,
  });

  if (Array.isArray(settings.imageSections) && settings.imageSections.length) {
    return defaults.map((fallback) => {
      const found = settings.imageSections!.find((s) => s.key === fallback.key);
      return normalizeImageSection(found, fallback);
    });
  }

  const byKey = new Map(
    (settings.images || []).map((img) => [img.key, img] as const)
  );

  return defaults.map((fallback) => {
    const legacy = byKey.get(SECTION_META[fallback.key].legacyKey);
    const url =
      legacy?.url ||
      (fallback.key === 'hero'
        ? heroSeed
        : fallback.key === 'paywall'
          ? settings.paywall?.athletesImageUrl
          : settings.trainPro?.bannerImageUrl) ||
      fallback.items[0]?.url ||
      '';
    const id = fallback.items[0]?.id || `${fallback.key}-1`;
    return normalizeImageSection(
      {
        ...fallback,
        items: url ? [{ id, url }] : [],
        selectedIds: url ? [id] : [],
      },
      fallback
    );
  });
}

export function primaryUrlFromSection(section: ImageSectionConfig): string {
  const selected = section.items.filter((i) =>
    section.selectedIds.includes(i.id)
  );
  const pool = selected.length ? selected : section.items;
  if (sectionKind(section.key) === 'video') {
    const video = pool.find((i) => looksLikeVideoUrl(i.url));
    return video?.url || pool[0]?.url || '';
  }
  const imageItem = pool.find((i) => !looksLikeVideoUrl(i.url));
  if (imageItem) return imageItem.url || '';
  return pool[0]?.url || '';
}

/** First selected video in a section. */
export function primaryVideoUrlFromSection(
  section: ImageSectionConfig | undefined
): string {
  if (!section) return '';
  const selected = section.items.filter((i) =>
    section.selectedIds.includes(i.id)
  );
  const pool = selected.length ? selected : section.items;
  const video = pool.find((i) => looksLikeVideoUrl(i.url));
  return video?.url?.trim() || '';
}

export function syncLegacyImages(
  sections: ImageSectionConfig[]
): ImageAsset[] {
  return sections.map((section) => ({
    id: section.key,
    key: SECTION_META[section.key].legacyKey,
    label: section.label,
    url: primaryUrlFromSection(section),
  }));
}

export function syncPrimaryUrls(sections: ImageSectionConfig[]) {
  const map = Object.fromEntries(
    sections.map((s) => [s.key, primaryUrlFromSection(s)])
  ) as Record<ImageSectionKey, string>;
  return {
    // Hero image fallback stays empty when hero slot is video-only.
    heroImageUrl: looksLikeVideoUrl(map.hero) ? '' : map.hero || '',
    athletesImageUrl: map.paywall || '',
    bannerImageUrl: map.trainPro || '',
  };
}

/** Append a hero video (dedupe by URL). Used for circular playlist. */
export function addHeroVideo(
  section: ImageSectionConfig,
  url: string
): ImageSectionConfig {
  const trimmed = url.trim();
  if (!trimmed) return section;
  if (section.items.some((i) => i.url === trimmed)) {
    // Already present — ensure it's selected for the cycle.
    const existing = section.items.find((i) => i.url === trimmed)!;
    const selected = new Set(section.selectedIds);
    selected.add(existing.id);
    return { ...section, selectedIds: Array.from(selected) };
  }
  if (section.items.length >= MAX_HERO_VIDEOS) return section;
  const id = newId('hero');
  return {
    ...section,
    label: SECTION_META.hero.label,
    items: [...section.items, { id, url: trimmed }],
    selectedIds: [...section.selectedIds, id],
  };
}

export function addImageToSection(
  section: ImageSectionConfig,
  url: string
): ImageSectionConfig {
  if (sectionKind(section.key) === 'video') {
    return addHeroVideo(section, url);
  }
  if (section.items.some((i) => i.url === url)) return section;
  if (section.items.length >= MAX_IMAGES_PER_SECTION) return section;
  const id = newId(section.key);
  const items = [...section.items, { id, url }];
  return {
    ...section,
    items,
    selectedIds: section.selectedIds.length
      ? [...section.selectedIds, id]
      : [id],
  };
}

export function replaceImageInSection(
  section: ImageSectionConfig,
  itemId: string,
  url: string
): ImageSectionConfig {
  return {
    ...section,
    items: section.items.map((item) =>
      item.id === itemId ? { ...item, url: url.trim() } : item
    ),
  };
}

export function removeImageFromSection(
  section: ImageSectionConfig,
  itemId: string
): ImageSectionConfig {
  const isVideo = sectionKind(section.key) === 'video';
  if (!isVideo && section.items.length <= 1) return section;
  const items = section.items.filter((i) => i.id !== itemId);
  let selectedIds = section.selectedIds.filter((id) => id !== itemId);
  if (!selectedIds.length && items.length) {
    selectedIds = isVideo ? items.map((i) => i.id) : [items[0].id];
  }
  return { ...section, items, selectedIds };
}
