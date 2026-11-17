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

/** Avatar gender targeting. */
export const MARKETING_GENDERS = ['male', 'female', 'both'] as const;
export type MarketingGender = (typeof MARKETING_GENDERS)[number];

export const MARKETING_GENDER_LABELS: Record<MarketingGender, string> = {
  male: 'Male',
  female: 'Female',
  both: 'Both',
};

export type MarketingMediaKind = 'image' | 'video';

export type MarketingMediaItem = {
  id: string;
  kind: MarketingMediaKind;
  url: string;
  audiences: UnlockAudience[];
  countries: string[];
  /** Images: 1+. Videos / Reels: exactly 1. */
  languages: string[];
  sports: string[];
  /** Avatars only — Male / Female / Both. */
  gender?: MarketingGender;
  /** Reels image cards — optional external URL when media is an image. */
  linkUrl?: string;
  /** Reels label — title in the selected language. */
  title?: string;
  /** Reels label — body text in the selected language. */
  text?: string;
  /** Reels label — free-form note (any language). */
  note?: string;
  /** Reels label — last publish date (YYYY-MM-DD). */
  lastPublishDate?: string;
  /** Reels label / copy payload — DMXs data (free text). */
  dmxs?: string;
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

function normalizeGender(raw: unknown): MarketingGender | undefined {
  const v = String(raw || '')
    .trim()
    .toLowerCase();
  return (MARKETING_GENDERS as readonly string[]).includes(v)
    ? (v as MarketingGender)
    : undefined;
}

function normalizePublishDate(raw: unknown): string | undefined {
  const v = String(raw || '').trim();
  if (!v) return undefined;
  // Accept YYYY-MM-DD from <input type="date">
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

export function normalizeMarketingMediaItem(
  item: Partial<MarketingMediaItem> | undefined,
  index: number,
  section: MarketingSectionKey
): MarketingMediaItem | null {
  const url = String(item?.url || '').trim();
  const title = String(item?.title || '').trim();
  const text = String(item?.text || '').trim();
  const note = String(item?.note || '').trim();
  const dmxs = String(item?.dmxs || '').trim();
  // Reels may be created as label-only drafts before media is uploaded.
  if (!url && section !== 'reels') return null;
  if (
    !url &&
    section === 'reels' &&
    !title &&
    !text &&
    !note &&
    !dmxs &&
    !item?.id
  ) {
    return null;
  }

  const kindFromField =
    item?.kind === 'video' || item?.kind === 'image' ? item.kind : null;
  const kind: MarketingMediaKind =
    kindFromField || (looksLikeVideoUrl(url) ? 'video' : 'image');

  let languages = normalizeLanguages(item?.languages);
  let audiences = normalizeAudiences(item?.audiences);
  // Reels: exactly 1 user type + 1 language.
  if (section === 'reels' || kind === 'video') {
    languages = languages.slice(0, 1);
  }
  if (section === 'reels') {
    audiences = audiences.slice(0, 1);
  }

  const gender =
    section === 'avatars'
      ? normalizeGender(item?.gender) || 'both'
      : undefined;

  const linkUrl =
    section === 'reels' && kind === 'image'
      ? String(item?.linkUrl || '').trim() || undefined
      : undefined;

  const lastPublishDate =
    section === 'reels' ? normalizePublishDate(item?.lastPublishDate) : undefined;

  return {
    id: String(item?.id || '').trim() || newId(`${section}-${kind}-${index + 1}`),
    kind,
    url,
    audiences,
    countries: normalizeCountries(item?.countries),
    languages,
    sports: normalizeSports(item?.sports),
    ...(gender ? { gender } : {}),
    ...(linkUrl ? { linkUrl } : {}),
    ...(section === 'reels'
      ? {
          ...(title ? { title } : {}),
          ...(text ? { text } : {}),
          ...(note ? { note } : {}),
          ...(dmxs ? { dmxs } : {}),
          ...(lastPublishDate ? { lastPublishDate } : {}),
        }
      : {}),
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
  url: string,
  opts?: {
    audience?: UnlockAudience;
    language?: string;
    countries?: string[];
    linkUrl?: string;
    title?: string;
    text?: string;
    note?: string;
    lastPublishDate?: string;
  }
): MarketingMediaItem {
  const audience = opts?.audience;
  const language = opts?.language?.trim().toLowerCase();
  const title = String(opts?.title || '').trim();
  const text = String(opts?.text || '').trim();
  const note = String(opts?.note || '').trim();
  const lastPublishDate = normalizePublishDate(opts?.lastPublishDate);
  return {
    id: newId(`${section}-${kind}`),
    kind,
    url: url.trim(),
    audiences: audience ? [audience] : [],
    countries: normalizeCountries(opts?.countries || []),
    languages: language
      ? [language]
      : kind === 'video' || section === 'reels'
        ? ['en']
        : [],
    sports: [],
    ...(section === 'avatars' ? { gender: 'both' as const } : {}),
    ...(section === 'reels' && kind === 'image' && opts?.linkUrl?.trim()
      ? { linkUrl: opts.linkUrl.trim() }
      : {}),
    ...(section === 'reels'
      ? {
          ...(title ? { title } : {}),
          ...(text ? { text } : {}),
          ...(note ? { note } : {}),
          ...(lastPublishDate ? { lastPublishDate } : {}),
        }
      : {}),
  };
}
