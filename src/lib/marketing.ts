import { isLocaleCode } from './i18n';
import { looksLikeVideoUrl } from './mediaUrl';
import type { UnlockAudience } from './types';
import { UNLOCK_AUDIENCE_OPTIONS } from './types';

export const MARKETING_SECTION_KEYS = ['avatars', 'reels', 'checks'] as const;
export type MarketingSectionKey = (typeof MARKETING_SECTION_KEYS)[number];

export const MARKETING_SECTION_LABELS: Record<MarketingSectionKey, string> = {
  avatars: 'Avatars',
  reels: 'Reels',
  checks: 'Checks',
};

/** Filter / targeting labels requested for marketing CMS. */
export const MARKETING_USER_TYPES: {
  id: UnlockAudience;
  label: string;
}[] = [
  { id: 'athlete', label: 'Athletes' },
  { id: 'coaches', label: 'Coaches' },
  { id: 'teams', label: 'Teams' },
  { id: 'clubs', label: 'FitPools Clubs' },
  { id: 'groups', label: 'Generic Groups' },
];

export type MarketingMediaKind = 'image' | 'video';

export type MarketingMediaItem = {
  id: string;
  kind: MarketingMediaKind;
  url: string;
  audiences: UnlockAudience[];
  countries: string[];
  /** Images: 1+. Videos: exactly 1. */
  languages: string[];
  sports: string[];
};

export type MarketingSettings = {
  avatars: MarketingMediaItem[];
  reels: MarketingMediaItem[];
  checks: MarketingMediaItem[];
};

export function createDefaultMarketing(): MarketingSettings {
  return {
    avatars: [],
    reels: [],
    checks: [],
  };
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function normalizeAudiences(raw: unknown): UnlockAudience[] {
  if (!Array.isArray(raw)) return [];
  return Array.from(
    new Set(
      raw
        .map((a) => String(a || '').trim())
        .filter((a): a is UnlockAudience =>
          (UNLOCK_AUDIENCE_OPTIONS as readonly string[]).includes(a)
        )
    )
  );
}

function normalizeCountries(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return Array.from(
    new Set(
      raw
        .map((c) => String(c || '').trim().toUpperCase())
        .filter((c) => c.length === 2)
    )
  );
}

function normalizeLanguages(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return Array.from(
    new Set(
      raw
        .map((l) => String(l || '').trim().toLowerCase())
        .filter((l) => isLocaleCode(l))
    )
  );
}

function normalizeSports(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return Array.from(
    new Set(raw.map((s) => String(s || '').trim()).filter(Boolean))
  );
}

export function normalizeMarketingMediaItem(
  item: Partial<MarketingMediaItem> | undefined,
  index: number,
  section: MarketingSectionKey
): MarketingMediaItem | null {
  const url = String(item?.url || '').trim();
  if (!url) return null;

  const kindFromField =
    item?.kind === 'video' || item?.kind === 'image' ? item.kind : null;
  const kind: MarketingMediaKind =
    kindFromField || (looksLikeVideoUrl(url) ? 'video' : 'image');

  let languages = normalizeLanguages(item?.languages);
  if (kind === 'video') {
    languages = languages.slice(0, 1);
  }

  return {
    id: String(item?.id || '').trim() || newId(`${section}-${kind}-${index + 1}`),
    kind,
    url,
    audiences: normalizeAudiences(item?.audiences),
    countries: normalizeCountries(item?.countries),
    languages,
    sports: normalizeSports(item?.sports),
  };
}

export function normalizeMarketingSettings(
  raw: Partial<MarketingSettings> | undefined
): MarketingSettings {
  const defaults = createDefaultMarketing();
  const out = { ...defaults };
  for (const key of MARKETING_SECTION_KEYS) {
    const list = Array.isArray(raw?.[key]) ? raw![key]! : [];
    out[key] = list
      .map((item, i) => normalizeMarketingMediaItem(item, i, key))
      .filter((item): item is MarketingMediaItem => Boolean(item));
  }
  return out;
}

export function createMarketingMediaItem(
  section: MarketingSectionKey,
  kind: MarketingMediaKind,
  url: string
): MarketingMediaItem {
  return {
    id: newId(`${section}-${kind}`),
    kind,
    url: url.trim(),
    audiences: [],
    countries: [],
    languages: kind === 'video' ? ['en'] : [],
    sports: [],
  };
}
