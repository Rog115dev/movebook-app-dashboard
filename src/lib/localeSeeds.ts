import type { LocaleCode, StringMap } from './i18n';
import { ENGLISH_STRINGS, LOCALES } from './i18n';
import seedsJson from './localeSeeds.json';

/** Built-in mobile app translations (no external/AI API). */
const SEEDS = seedsJson as Record<string, StringMap>;

export function getLocaleSeed(locale: LocaleCode): StringMap {
  if (locale === 'en') return { ...ENGLISH_STRINGS };
  return { ...(SEEDS[locale] || {}) };
}

export function hasLocaleSeed(locale: LocaleCode): boolean {
  return locale === 'en' || Boolean(SEEDS[locale] && Object.keys(SEEDS[locale]).length);
}

/**
 * Fill translation map from built-in seeds.
 * @param onlyEmpty when true, skip keys that already have text
 */
export function applyLocaleSeed(
  locale: LocaleCode,
  current: StringMap,
  options?: { onlyEmpty?: boolean; keys?: string[] }
): { next: StringMap; filled: number } {
  const seed = getLocaleSeed(locale);
  const onlyEmpty = options?.onlyEmpty ?? false;
  const keys = options?.keys?.length
    ? options.keys
    : Array.from(new Set([...Object.keys(ENGLISH_STRINGS), ...Object.keys(seed)]));

  const next = { ...current };
  let filled = 0;
  for (const key of keys) {
    const value = seed[key];
    if (!value?.trim()) continue;
    if (onlyEmpty && next[key]?.trim()) continue;
    if (next[key] === value) continue;
    next[key] = value;
    filled += 1;
  }
  return { next, filled };
}

/** Apply seeds for every non-English locale (used by “Apply all”). */
export function applyAllLocaleSeeds(
  i18n: Partial<Record<LocaleCode, StringMap>>,
  options?: { onlyEmpty?: boolean }
): { next: Partial<Record<LocaleCode, StringMap>>; filled: number } {
  const next = { ...i18n };
  let filled = 0;
  for (const locale of LOCALES) {
    if (locale === 'en') continue;
    const result = applyLocaleSeed(locale, next[locale] || {}, options);
    next[locale] = result.next;
    filled += result.filled;
  }
  return { next, filled };
}
