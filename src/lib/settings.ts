import { promises as fs } from 'fs';
import path from 'path';
import { createDefaultSettings } from './defaults';
import { LOCALES, mergeI18n, resolveStrings, type LocaleCode } from './i18n';
import {
  migrateImageSections,
  syncLegacyImages,
  syncPrimaryUrls,
} from './imageSections';
import type { MobileAppSettings, RotateDelaySec } from './types';
import { ROTATE_DELAYS } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_PATH = path.join(DATA_DIR, 'mobile-settings.json');

function normalize(settings: MobileAppSettings): MobileAppSettings {
  const defaults = createDefaultSettings();
  const imageSections = migrateImageSections(settings);
  const primary = syncPrimaryUrls(imageSections);
  return {
    ...defaults,
    ...settings,
    defaultLocale: settings.defaultLocale || 'en',
    locales: settings.locales?.length ? settings.locales : [...LOCALES],
    i18n: mergeI18n(settings.i18n),
    colors: { ...defaults.colors, ...(settings.colors || {}) },
    home: {
      ...defaults.home,
      ...(settings.home || {}),
      heroImageUrl: primary.heroImageUrl || defaults.home.heroImageUrl,
    },
    whyChooseMe: {
      ...defaults.whyChooseMe,
      ...(settings.whyChooseMe || {}),
      reasons: settings.whyChooseMe?.reasons?.length
        ? settings.whyChooseMe.reasons
        : defaults.whyChooseMe.reasons,
    },
    plans: settings.plans?.length ? settings.plans : defaults.plans,
    paywall: {
      ...defaults.paywall,
      ...(settings.paywall || {}),
      features: settings.paywall?.features?.length
        ? settings.paywall.features
        : defaults.paywall.features,
      tiers: settings.paywall?.tiers?.length
        ? settings.paywall.tiers
        : defaults.paywall.tiers,
      athletesImageUrl:
        primary.athletesImageUrl || defaults.paywall.athletesImageUrl,
    },
    trainPro: {
      ...defaults.trainPro,
      ...(settings.trainPro || {}),
      stats: settings.trainPro?.stats?.length
        ? settings.trainPro.stats
        : defaults.trainPro.stats,
      features: settings.trainPro?.features?.length
        ? settings.trainPro.features
        : defaults.trainPro.features,
      faqTitle:
        settings.trainPro?.faqTitle?.trim() || defaults.trainPro.faqTitle,
      faqs: Array.isArray(settings.trainPro?.faqs)
        ? settings.trainPro.faqs
        : defaults.trainPro.faqs,
      bannerImageUrl:
        primary.bannerImageUrl || defaults.trainPro.bannerImageUrl,
    },
    featuresPage: {
      ...defaults.featuresPage,
      ...(settings.featuresPage || {}),
      unlockTitle:
        settings.featuresPage?.unlockTitle?.trim() ||
        defaults.featuresPage.unlockTitle,
      unlockSub:
        settings.featuresPage?.unlockSub?.trim() ||
        defaults.featuresPage.unlockSub,
      items: Array.isArray(settings.featuresPage?.items)
        ? settings.featuresPage.items
        : defaults.featuresPage.items,
    },
    testimonials: {
      ...defaults.testimonials,
      ...(settings.testimonials || {}),
      subtitle:
        settings.testimonials?.subtitle?.trim() ||
        defaults.testimonials.subtitle,
      carouselDelaySec: (
        ROTATE_DELAYS as readonly number[]
      ).includes(settings.testimonials?.carouselDelaySec as number)
        ? (settings.testimonials!.carouselDelaySec as RotateDelaySec)
        : defaults.testimonials.carouselDelaySec,
      items: Array.isArray(settings.testimonials?.items)
        ? settings.testimonials.items.map((item, i) => ({
            id: item.id || `testimonial-${i + 1}`,
            code: item.code || '',
            pictureUrl: item.pictureUrl || '',
            borderColor: item.borderColor || defaults.colors.orange,
            title: item.title || '',
            description: item.description || '',
            showInPresentation: Boolean(item.showInPresentation),
            showInMenu: Boolean(item.showInMenu),
          }))
        : defaults.testimonials.items,
    },
    imageSections,
    images: syncLegacyImages(imageSections),
  };
}

export async function readSettings(): Promise<MobileAppSettings> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(SETTINGS_PATH, 'utf8');
    const parsed = JSON.parse(raw) as MobileAppSettings;
    const normalized = normalize(parsed);
    // Persist migration if i18n was missing
    if (!parsed.i18n) {
      await fs.writeFile(
        SETTINGS_PATH,
        JSON.stringify(normalized, null, 2),
        'utf8'
      );
    }
    return normalized;
  } catch {
    const defaults = createDefaultSettings();
    await fs.writeFile(SETTINGS_PATH, JSON.stringify(defaults, null, 2), 'utf8');
    return defaults;
  }
}

export async function writeSettings(
  next: MobileAppSettings
): Promise<MobileAppSettings> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const payload = normalize({
    ...next,
    version: (next.version ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  });
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

export async function patchSettings(
  partial: Partial<MobileAppSettings>
): Promise<MobileAppSettings> {
  const current = await readSettings();
  let i18n = current.i18n;
  if (partial.i18n) {
    const merged = { ...current.i18n };
    for (const locale of LOCALES) {
      if (partial.i18n[locale]) {
        merged[locale] = {
          ...(current.i18n[locale] || {}),
          ...partial.i18n[locale],
        };
      }
    }
    i18n = mergeI18n(merged);
  }

  return writeSettings({
    ...current,
    ...partial,
    i18n,
    version: current.version,
  });
}

/** Build API payload for a locale: merged strings + localized content overlays. */
export function buildLocalizedConfig(
  settings: MobileAppSettings,
  lang: string
) {
  const strings = resolveStrings(settings.i18n, lang);
  const locale = (LOCALES as readonly string[]).includes(lang)
    ? (lang as LocaleCode)
    : settings.defaultLocale || 'en';

  const s = (key: string, fallback: string) =>
    strings[key]?.trim() ? strings[key] : fallback;

  return {
    ...settings,
    locale,
    dir: locale === 'ar' ? 'rtl' : 'ltr',
    strings,
    home: {
      ...settings.home,
      brandPrefix: s('home.brandPrefix', settings.home.brandPrefix),
      brandAccent: s('home.brandAccent', settings.home.brandAccent),
      brandSuffix: s('home.brandSuffix', settings.home.brandSuffix),
      subtitle: s('home.subtitle', settings.home.subtitle),
      heroHeadline: s('home.heroHeadline', settings.home.heroHeadline),
      heroCaption: s('home.heroCaption', settings.home.heroCaption),
      featuresCta: s('home.featuresCta', settings.home.featuresCta),
      signupCta: s('home.signupCta', settings.home.signupCta),
      loginPrompt: s('home.loginPrompt', settings.home.loginPrompt),
      loginLink: s('home.loginLink', settings.home.loginLink),
      confidenceText: s('home.confidenceText', settings.home.confidenceText),
    },
    whyChooseMe: {
      title: s('why.title', settings.whyChooseMe.title),
      reasons: settings.whyChooseMe.reasons.map((r, idx) => {
        const keys = [
          ['why.resultsTitle', 'why.resultsBody'],
          ['why.qualityTitle', 'why.qualityBody'],
          ['why.collabTitle', 'why.collabBody'],
        ][idx];
        if (!keys) return r;
        return {
          ...r,
          title: s(keys[0], r.title),
          body: s(keys[1], r.body),
        };
      }),
    },
    paywall: {
      ...settings.paywall,
      brandSub: s('paywall.brandSub', settings.paywall.brandSub),
      claimDiscountLabel: s(
        'paywall.claimDiscount',
        settings.paywall.claimDiscountLabel
      ),
      startTrialLabel: s(
        'paywall.startTrial',
        settings.paywall.startTrialLabel
      ),
      trustLine1: s('paywall.trust1', settings.paywall.trustLine1),
      trustLine2: s('paywall.trust2', settings.paywall.trustLine2),
      features: settings.paywall.features.map((f, i) => ({
        ...f,
        label: s(`paywall.feature${i + 1}`, f.label),
      })),
      tiers: settings.paywall.tiers.map((t) => ({
        ...t,
        label:
          t.id === '1m'
            ? s('paywall.tier1m', t.label)
            : t.id === '3m'
              ? s('paywall.tier3m', t.label)
              : t.id === '12m'
                ? s('paywall.tier12m', t.label)
                : t.label,
      })),
    },
    trainPro: {
      ...settings.trainPro,
      headlineOrange: s('train.headlineOrange', settings.trainPro.headlineOrange),
      headlineWhite: s('train.headlineWhite', settings.trainPro.headlineWhite),
      trialCta: s('train.trialCta', settings.trainPro.trialCta),
      downloadCta: s('train.downloadCta', settings.trainPro.downloadCta),
      guaranteeBest: s('train.guaranteeBest', settings.trainPro.guaranteeBest),
      guaranteeLine: s('train.guaranteeLine', settings.trainPro.guaranteeLine),
      secureText: s('train.secureText', settings.trainPro.secureText),
      stats: settings.trainPro.stats.map((st, i) => ({
        ...st,
        value: s(`train.stat${i + 1}Value`, st.value),
        label: s(`train.stat${i + 1}Label`, st.label),
      })),
      features: settings.trainPro.features.map((f, i) => ({
        ...f,
        title: s(`train.feat${i + 1}Title`, f.title),
        description: s(`train.feat${i + 1}Desc`, f.description),
      })),
      faqTitle: s('train.faqTitle', settings.trainPro.faqTitle),
      faqs: settings.trainPro.faqs.map((f, i) => ({
        q: s(`train.faq${i + 1}Q`, f.q),
        a: s(`train.faq${i + 1}A`, f.a),
      })),
    },
    featuresPage: {
      ...settings.featuresPage,
      unlockTitle: s(
        'features.unlockTitle',
        settings.featuresPage.unlockTitle
      ),
      unlockSub: s('features.unlockSub', settings.featuresPage.unlockSub),
      items: settings.featuresPage.items.map((item, i) => ({
        ...item,
        title: s(`features.unlock${i + 1}Title`, item.title),
        description: s(`features.unlock${i + 1}Desc`, item.description),
        badge: s(`features.unlock${i + 1}Badge`, item.badge),
      })),
    },
    testimonials: {
      ...settings.testimonials,
      subtitle: s('features.loveSub', settings.testimonials.subtitle),
      items: settings.testimonials.items.map((item, i) => ({
        ...item,
        code: s(`testimonials.${i + 1}.code`, item.code),
        title: s(`testimonials.${i + 1}.title`, item.title),
        description: s(`testimonials.${i + 1}.description`, item.description),
      })),
    },
  };
}
