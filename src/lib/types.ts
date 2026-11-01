import type { I18nMap, LocaleCode } from './i18n';

export type ColorSettings = {
  bg: string;
  bgElevated: string;
  bgCard: string;
  white: string;
  whiteMuted: string;
  whiteDim: string;
  orange: string;
  orangeHot: string;
  gold: string;
  goldSoft: string;
  red: string;
  border: string;
  borderSoft: string;
  borderOrange: string;
  black: string;
};

export type HomeSettings = {
  brandPrefix: string;
  brandAccent: string;
  brandSuffix: string;
  subtitle: string;
  heroCaption: string;
  heroHeadline: string;
  featuresCta: string;
  signupCta: string;
  loginPrompt: string;
  loginLink: string;
  confidenceText: string;
  /** Poster / fallback still image */
  heroImageUrl: string;
  /**
   * Active hero video (uploaded path or external URL).
   * When set, mobile shows this clip only (image is fallback if cleared).
   */
  heroVideoUrl: string;
  /**
   * True when admin explicitly uploaded / pasted / picked a video.
   * Legacy default sample URLs without this flag are ignored.
   */
  heroVideoChosen?: boolean;
  /** Sample / library videos admin can pick from */
  heroVideoSamples: { id: string; label: string; url: string }[];
};

export type WhyChooseReason = {
  key: string;
  title: string;
  body: string;
  icon: string;
};

export type PlanFeature = {
  text: string;
  included: boolean;
  highlight?: boolean;
};

export type CurrencyOption = {
  /** ISO-like code, e.g. EUR */
  code: string;
  /** Display symbol, e.g. € */
  symbol: string;
  /** Human label, e.g. Euro */
  label: string;
};

export const UNLOCK_AUDIENCE_OPTIONS = [
  'athlete',
  'coaches',
  'teams',
  'clubs',
  'groups',
] as const;

export type UnlockAudience = (typeof UNLOCK_AUDIENCE_OPTIONS)[number];

export type PlanSettings = {
  id: string;
  name: string;
  /**
   * Legacy / display price string (kept in sync from amount + currency).
   * Mobile may convert via FX from amount + currencyCode.
   */
  price: string;
  /** Numeric amount in USD (admin always enters USD). */
  amount: number;
  /** Currency of `amount` — always USD for CMS entry. */
  currencyCode: string;
  subtitle: string;
  cta: string;
  badge?: string;
  badgeDenied?: boolean;
  features: PlanFeature[];
  /**
   * Which user types see this version card.
   * Matrix plans use a single audience (Athlete / Coach / Team / Club / Group).
   * Empty = all (legacy).
   */
  audiences?: UnlockAudience[];
};

/** App pricing config — CMS amounts are USD; mobile converts for display. */
export type PricingSettings = {
  baseCurrency: 'USD';
  /** Kept for mobile symbol lookup; not edited in CMS. */
  currencies: CurrencyOption[];
};

export type PaywallTier = {
  id: string;
  label: string;
  price: string;
  original: string;
  discount: string;
  popular: boolean;
};

export type PaywallFeature = {
  icon: string;
  label: string;
  /** When true, kept in CMS but hidden on mobile. */
  disabled?: boolean;
};

export type PaywallSettings = {
  brandName: string;
  brandSub: string;
  claimDiscountLabel: string;
  startTrialLabel: string;
  trustLine1: string;
  trustLine2: string;
  athletesImageUrl: string;
  features: PaywallFeature[];
  tiers: PaywallTier[];
};

/** Promo code claimed from the paywall “Claim discount” button. */
export type DiscountSettings = {
  /** Case-insensitive code users must enter */
  code: string;
  /** Percent off list price (0–100) */
  percent: number;
  /** Last valid day (YYYY-MM-DD), inclusive */
  expiresOn: string;
};

export type TrainStat = {
  icon: string;
  value: string;
  label: string;
};

export type TrainFeature = {
  icon: string;
  title: string;
  description: string;
};

export type FaqItem = {
  q: string;
  a: string;
  /** Which user types see this FAQ. Empty = all. */
  audiences?: UnlockAudience[];
};

export type TrainProSettings = {
  headlineOrange: string;
  headlineWhite: string;
  trialCta: string;
  downloadCta: string;
  bannerImageUrl: string;
  stats: TrainStat[];
  features: TrainFeature[];
  faqTitle: string;
  faqs: FaqItem[];
  guaranteeBest: string;
  guaranteeLine: string;
  secureText: string;
};

export type UnlockFeatureItem = {
  id: string;
  title: string;
  description: string;
  badge: string;
  /** Which user types see this feature. Empty = all. */
  audiences?: UnlockAudience[];
  /** When true, kept in CMS but hidden on mobile. */
  disabled?: boolean;
};

/** Features screen — “Unlock everything you need” list */
export type FeaturesPageSettings = {
  unlockTitle: string;
  unlockSub: string;
  /** Feature card background (hex) */
  backgroundColor: string;
  /** Feature section / card title text (hex) */
  textColor: string;
  items: UnlockFeatureItem[];
};

export type TestimonialItem = {
  id: string;
  /** Display name / code of the person */
  code: string;
  /** Person photo (avatar) */
  pictureUrl: string;
  /** Separate brand / logo image shown on the card */
  logoUrl: string;
  /** Border color around the picture */
  borderColor: string;
  title: string;
  description: string;
  showInPresentation: boolean;
  /** Reserved for a future Testimonials menu */
  showInMenu: boolean;
  /**
   * Targeting — empty array = visible to all for that dimension.
   */
  countries: string[];
  languages: string[];
  audiences: UnlockAudience[];
  /** Sport ids from the CMS sports catalog */
  sports: string[];
};

export type ImageAsset = {
  id: string;
  key: string;
  label: string;
  url: string;
};

export const IMAGE_SECTION_KEYS = ['hero', 'paywall', 'trainPro'] as const;
export type ImageSectionKey = (typeof IMAGE_SECTION_KEYS)[number];

export const ROTATE_DELAYS = [3, 5, 7, 10, 15] as const;
export type RotateDelaySec = (typeof ROTATE_DELAYS)[number];

export type TestimonialsSettings = {
  /** “Join FitAI Coach users who cannot get enough.” */
  subtitle: string;
  /** Used when more than 5 presentation testimonials are enabled */
  carouselDelaySec: RotateDelaySec;
  items: TestimonialItem[];
};

export type ImagePoolItem = {
  id: string;
  url: string;
  /** Sport catalog ids. Empty = all sports. Used for image pools (not hero video). */
  sports?: string[];
};

/** Per-screen image pool: 1–9 images, select 1 (fixed) or 2+ (random rotate). */
export type ImageSectionConfig = {
  key: ImageSectionKey;
  label: string;
  items: ImagePoolItem[];
  selectedIds: string[];
  rotateDelaySec: RotateDelaySec;
};

export type SportCatalogItem = {
  id: string;
  name: string;
};

export type MobileAppSettings = {
  version: number;
  updatedAt: string;
  defaultLocale: LocaleCode;
  locales: LocaleCode[];
  /** Manual translations keyed by locale then string key */
  i18n: I18nMap;
  colors: ColorSettings;
  home: HomeSettings;
  whyChooseMe: {
    title: string;
    reasons: WhyChooseReason[];
  };
  plans: PlanSettings[];
  pricing: PricingSettings;
  paywall: PaywallSettings;
  discount: DiscountSettings;
  trainPro: TrainProSettings;
  featuresPage: FeaturesPageSettings;
  /** Admin-managed sport list (names from Movesbook; custom add/delete). */
  sports: SportCatalogItem[];
  testimonials: TestimonialsSettings;
  /** @deprecated Prefer imageSections; kept for legacy clients */
  images: ImageAsset[];
  imageSections: ImageSectionConfig[];
};
