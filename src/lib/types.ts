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
  heroImageUrl: string;
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

export type PlanSettings = {
  id: string;
  name: string;
  price: string;
  subtitle: string;
  cta: string;
  badge?: string;
  badgeDenied?: boolean;
  features: PlanFeature[];
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
};

export type TrainProSettings = {
  headlineOrange: string;
  headlineWhite: string;
  trialCta: string;
  downloadCta: string;
  bannerImageUrl: string;
  stats: TrainStat[];
  features: TrainFeature[];
  faqs: FaqItem[];
  guaranteeBest: string;
  guaranteeLine: string;
  secureText: string;
};

export type ImageAsset = {
  id: string;
  key: string;
  label: string;
  url: string;
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
  paywall: PaywallSettings;
  trainPro: TrainProSettings;
  images: ImageAsset[];
};
