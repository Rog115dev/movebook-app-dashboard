import type { LocaleCode, StringMap } from './i18n';
import { ENGLISH_STRINGS } from './i18n';

type TranslatorAvailability =
  | 'available'
  | 'downloadable'
  | 'downloading'
  | 'unavailable';

type BrowserTranslator = {
  translate: (text: string) => Promise<string>;
};

type TranslatorCtor = {
  availability: (opts: {
    sourceLanguage: string;
    targetLanguage: string;
  }) => Promise<TranslatorAvailability>;
  create: (opts: {
    sourceLanguage: string;
    targetLanguage: string;
    monitor?: (m: {
      addEventListener: (
        type: 'downloadprogress',
        cb: (e: { loaded: number }) => void
      ) => void;
    }) => void;
  }) => Promise<BrowserTranslator>;
};

declare global {
  interface Window {
    Translator?: TranslatorCtor;
  }
}

/** Map CMS locale codes to BCP-47 tags used by Chrome Translator. */
export const TRANSLATOR_LANG: Record<LocaleCode, string> = {
  en: 'en',
  fr: 'fr',
  de: 'de',
  it: 'it',
  es: 'es',
  hi: 'hi',
  pt: 'pt',
  ru: 'ru',
  zh: 'zh',
  ar: 'ar',
  ja: 'ja',
  id: 'id',
};

export function browserTranslatorSupported() {
  return typeof window !== 'undefined' && 'Translator' in window;
}

async function getTranslator(
  targetLanguage: string,
  onProgress?: (pct: number) => void
): Promise<BrowserTranslator> {
  const Translator = window.Translator;
  if (!Translator) {
    throw new Error(
      'Browser Translator API is not available. Use Chrome 138+ desktop.'
    );
  }

  const options = { sourceLanguage: 'en', targetLanguage };
  const availability = await Translator.availability(options);
  if (availability === 'unavailable') {
    throw new Error(
      `Browser cannot translate to "${targetLanguage}". Try another language or Chrome flags.`
    );
  }

  return Translator.create({
    ...options,
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        onProgress?.(Math.round((e.loaded || 0) * 100));
      });
    },
  });
}

/**
 * Translate English CMS strings into a target locale using Chrome's
 * on-device Translator API (no external AI API key).
 */
export async function translateStringsWithBrowser(
  targetLocale: LocaleCode,
  englishSource: StringMap,
  options?: {
    onlyEmpty?: boolean;
    current?: StringMap;
    keys?: string[];
    onProgress?: (message: string) => void;
  }
): Promise<{ next: StringMap; filled: number }> {
  if (targetLocale === 'en') {
    return { next: { ...englishSource }, filled: 0 };
  }

  const targetLanguage = TRANSLATOR_LANG[targetLocale];
  options?.onProgress?.(`Preparing translator (en → ${targetLanguage})…`);
  const translator = await getTranslator(targetLanguage, (pct) => {
    options?.onProgress?.(`Downloading language pack… ${pct}%`);
  });

  const keys =
    options?.keys?.length
      ? options.keys
      : Array.from(
          new Set([
            ...Object.keys(ENGLISH_STRINGS),
            ...Object.keys(englishSource),
          ])
        );

  const next: StringMap = { ...(options?.current || {}) };
  let filled = 0;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const source = (englishSource[key] || ENGLISH_STRINGS[key] || '').trim();
    if (!source) continue;
    if (options?.onlyEmpty && next[key]?.trim()) continue;

    options?.onProgress?.(
      `Translating ${i + 1}/${keys.length}: ${key}`
    );
    try {
      const translated = (await translator.translate(source)).trim();
      if (translated && translated !== next[key]) {
        next[key] = translated;
        filled += 1;
      }
    } catch {
      // Skip individual failures; continue remaining keys
    }
  }

  return { next, filled };
}
