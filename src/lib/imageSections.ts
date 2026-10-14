import type {
  ImageAsset,
  ImagePoolItem,
  ImageSectionConfig,
  ImageSectionKey,
  MobileAppSettings,
  RotateDelaySec,
} from './types';
import { ROTATE_DELAYS } from './types';

export const MAX_IMAGES_PER_SECTION = 9;

const SECTION_META: Record<
  ImageSectionKey,
  { label: string; legacyKey: string }
> = {
  hero: { label: 'Home hero image', legacyKey: 'heroBreakLimits' },
  paywall: { label: 'Paywall athletes image', legacyKey: 'paywallAthletes' },
  trainPro: { label: 'TRAIN PRO banner', legacyKey: 'trainPro' },
};

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
    mk('hero', urls?.hero || '/uploads/hero-break-limits.jpg'),
    mk('paywall', urls?.paywall || '/uploads/paywall-athletes.jpg'),
    mk('trainPro', urls?.trainPro || '/uploads/train-pro.jpg'),
  ];
}

export function normalizeImageSection(
  section: Partial<ImageSectionConfig> | undefined,
  fallback: ImageSectionConfig
): ImageSectionConfig {
  const key = (section?.key || fallback.key) as ImageSectionKey;
  const meta = SECTION_META[key] || SECTION_META[fallback.key];
  let items = Array.isArray(section?.items)
    ? section!.items
        .filter((i): i is ImagePoolItem => Boolean(i?.id && i?.url))
        .slice(0, MAX_IMAGES_PER_SECTION)
    : [];

  if (!items.length) {
    items = fallback.items.map((i) => ({ ...i }));
  }

  const itemIds = new Set(items.map((i) => i.id));
  let selectedIds = Array.isArray(section?.selectedIds)
    ? section!.selectedIds.filter((id) => itemIds.has(id))
    : [];

  if (!selectedIds.length) {
    selectedIds = [items[0].id];
  }

  return {
    key,
    label: section?.label?.trim() || meta.label,
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
  const defaults = createDefaultImageSections({
    hero: settings.home?.heroImageUrl,
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
        ? settings.home?.heroImageUrl
        : fallback.key === 'paywall'
          ? settings.paywall?.athletesImageUrl
          : settings.trainPro?.bannerImageUrl) ||
      fallback.items[0].url;
    const id = fallback.items[0].id;
    return {
      ...fallback,
      items: [{ id, url }],
      selectedIds: [id],
    };
  });
}

export function primaryUrlFromSection(section: ImageSectionConfig): string {
  const selected = section.items.filter((i) =>
    section.selectedIds.includes(i.id)
  );
  return (selected[0] || section.items[0])?.url || '';
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
    heroImageUrl: map.hero || '',
    athletesImageUrl: map.paywall || '',
    bannerImageUrl: map.trainPro || '',
  };
}

export function addImageToSection(
  section: ImageSectionConfig,
  url: string
): ImageSectionConfig {
  if (section.items.length >= MAX_IMAGES_PER_SECTION) return section;
  const id = newId(section.key);
  const items = [...section.items, { id, url }];
  return { ...section, items };
}

export function replaceImageInSection(
  section: ImageSectionConfig,
  itemId: string,
  url: string
): ImageSectionConfig {
  return {
    ...section,
    items: section.items.map((item) =>
      item.id === itemId ? { ...item, url } : item
    ),
  };
}

export function removeImageFromSection(
  section: ImageSectionConfig,
  itemId: string
): ImageSectionConfig {
  if (section.items.length <= 1) return section;
  const items = section.items.filter((i) => i.id !== itemId);
  let selectedIds = section.selectedIds.filter((id) => id !== itemId);
  if (!selectedIds.length) selectedIds = [items[0].id];
  return { ...section, items, selectedIds };
}
