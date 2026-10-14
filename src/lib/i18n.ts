export const LOCALES = [
  'en',
  'fr',
  'de',
  'it',
  'es',
  'hi',
  'pt',
  'ru',
  'zh',
  'ar',
  'ja',
  'id',
] as const;

export type LocaleCode = (typeof LOCALES)[number];

export type StringMap = Record<string, string>;
export type I18nMap = Partial<Record<LocaleCode, StringMap>>;

export const LOCALE_LABELS: Record<LocaleCode, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  es: 'Español',
  hi: 'हिन्दी',
  pt: 'Português',
  ru: 'Русский',
  zh: '中文',
  ar: 'العربية',
  ja: '日本語',
  id: 'Bahasa Indonesia',
};

/** Canonical English keys (manual translations edit these). */
export const ENGLISH_STRINGS: StringMap = {
  'common.back': 'Back',
  'common.ok': 'OK',
  'common.menu': 'Menu',
  'common.language': 'Language',
  'common.chooseLanguage': 'Choose language',
  'home.brandPrefix': 'Movesbook ',
  'home.brandAccent': 'FitAI',
  'home.brandSuffix': ' Coach',
  'home.subtitle':
    'Comprehensive solutions for modern sport & fitness digital challenges',
  'home.heroHeadline': 'BREAK ALL LIMITS',
  'home.heroCaption': 'Push Beyond Yesterday...',
  'home.featuresCta': 'Feature of the version',
  'home.signupCta': 'Sign up',
  'home.loginPrompt': 'Already have an account?',
  'home.loginLink': 'Log in',
  'home.confidenceText':
    "We're confident that our premium experience will exceed your expectations, providing you with unique value and satisfaction.\n\nEnjoy the freedom to explore everything we offer, because your satisfaction is, and always will be, our top priority.",
  'home.menuSoon': 'Navigation drawer coming soon.',
  'home.videoSoon': 'Promo player will stream here.',
  'why.title': 'Why Choose Me',
  'why.resultsTitle': 'Results-Driven',
  'why.resultsBody':
    'Focused on achieving measurable sport technology results through optimal solutions',
  'why.qualityTitle': 'Quality Assured',
  'why.qualityBody':
    'Committed to excellence with rigorous testings, code reviews, and adherence to best sport industry practices',
  'why.collabTitle': 'Collaborative',
  'why.collabBody':
    'Ability to listen to user needs and a collaborative approach to ensure project success and users satisfaction',
  'train.headlineOrange': 'TRAIN PRO: ',
  'train.headlineWhite': 'Unleash Your Potential.',
  'train.trialCta': 'START FREE TRIAL',
  'train.downloadCta': 'DOWNLOAD APP',
  'train.downloadSoon': 'App store link soon.',
  'train.faqTitle': 'FAQ',
  'train.guaranteeBest': 'Best',
  'train.guaranteeLine': 'SATISFACTION GUARANTEE',
  'train.secureText': 'Pay Safe & Secure',
  'train.stat1Value': '100,000+',
  'train.stat1Label': 'TOTAL WORKOUTS COMPLETED',
  'train.stat2Value': '2,000,000+',
  'train.stat2Label': 'CALORIES BURNED',
  'train.stat3Value': '10,000+',
  'train.stat3Label': 'HOURS TRAINED',
  'train.stat4Value': '98%',
  'train.stat4Label': 'USER SATISFACTION',
  'train.feat1Title': 'PERSONALIZED PLANS',
  'train.feat1Desc': 'Customer personalized plans',
  'train.feat2Title': 'TRACK PROGRESS',
  'train.feat2Desc': 'Analyze and track progress to gain insights',
  'train.feat3Title': 'COACH FUNCTION',
  'train.feat3Desc': 'Get the most out of your coaching',
  'train.feat4Title': 'NUTRITION GUIDANCE',
  'train.feat4Desc': 'Let your nutrition guide help you',
  'train.faq1Q': 'How does personalized training work?',
  'train.faq1A':
    'FitAI builds plans from your goals, level, and available equipment, then adapts as you complete sessions.',
  'train.faq2Q': 'Can I customize my program?',
  'train.faq2A':
    'Yes. Swap exercises, adjust volume, and save your own cycles while keeping coach-ready structure.',
  'train.faq3Q': 'Can I track nutrition?',
  'train.faq3A':
    'Premium and Pro unlock meal plans, diet analysis, and body metrics alongside workout tracking.',
  'train.faq4Q': "What's included in the trial?",
  'train.faq4A':
    'Start with the Free month: aerobic, weights, circuit planning, shared downloads, and annual plan storage.',
  'features.topTitle': 'Feature of the version',
  'features.heroTitle': 'Your FitAI Coach is ready for you',
  'features.heroSub': 'Personalized training, brought to life.',
  'features.builtFor': 'We built it just for you',
  'features.unlockTitle': 'Unlock everything you need',
  'features.unlockSub': 'Everything you want. All in one place.',
  'features.mostPopular': 'MOST POPULAR',
  'features.planSuffix': 'plan',
  'paywall.brandSub': 'Personalized AI Workout Plans',
  'paywall.claimDiscount': 'Claim discount',
  'paywall.startTrial': 'Start Free Trial',
  'paywall.mostPopular': 'MOST POPULAR',
  'paywall.trust1': 'No commitment. Cancel anytime!',
  'paywall.trust2': 'Top quality workouts',
  'paywall.discountApplied': 'Claim discount applied to your offer.',
  'paywall.feature1': 'Customized plans',
  'paywall.feature2': '24/7 AI trainer',
  'paywall.feature3': 'Progress tracking',
  'paywall.feature4': 'Unlimited workouts',
  'paywall.tier1m': '1 month',
  'paywall.tier3m': '3 months',
  'paywall.tier12m': '12 months',
  'auth.back': 'Back',
  'auth.loginTitle': 'Log in',
  'auth.signupTitle': 'Sign up',
  'auth.emailOrUsername': 'Email or username',
  'auth.password': 'Password',
  'auth.login': 'Log in',
  'auth.signup': 'Create account',
  'auth.noAccount': "Don't have an account?",
  'auth.hasAccount': 'Already have an account?',
  'auth.identifierRequired': 'Email or username is required',
  'auth.passwordRequired': 'Password is required',
  'auth.welcomeBack': 'Welcome back',
  'auth.loginFailed': 'Login failed',
  'auth.checkCredentials': 'Please check your credentials.',
};

export const I18N_GROUPS: { id: string; label: string; keys: string[] }[] = [
  {
    id: 'common',
    label: 'Common',
    keys: Object.keys(ENGLISH_STRINGS).filter((k) => k.startsWith('common.')),
  },
  {
    id: 'home',
    label: 'Home',
    keys: Object.keys(ENGLISH_STRINGS).filter((k) => k.startsWith('home.')),
  },
  {
    id: 'why',
    label: 'Why Choose Me',
    keys: Object.keys(ENGLISH_STRINGS).filter((k) => k.startsWith('why.')),
  },
  {
    id: 'train',
    label: 'TRAIN PRO',
    keys: Object.keys(ENGLISH_STRINGS).filter(
      (k) =>
        k.startsWith('train.') &&
        k !== 'train.faqTitle' &&
        !/^train\.faq\d+[QA]$/.test(k)
    ),
  },
  {
    id: 'faq',
    label: 'FAQ',
    keys: Object.keys(ENGLISH_STRINGS).filter(
      (k) => k === 'train.faqTitle' || /^train\.faq\d+[QA]$/.test(k)
    ),
  },
  {
    id: 'features',
    label: 'Features',
    keys: Object.keys(ENGLISH_STRINGS).filter((k) =>
      k.startsWith('features.')
    ),
  },
  {
    id: 'paywall',
    label: 'Paywall',
    keys: Object.keys(ENGLISH_STRINGS).filter((k) => k.startsWith('paywall.')),
  },
  {
    id: 'auth',
    label: 'Auth',
    keys: Object.keys(ENGLISH_STRINGS).filter((k) => k.startsWith('auth.')),
  },
];

export function createDefaultI18n(): I18nMap {
  const empty = Object.fromEntries(
    LOCALES.filter((l) => l !== 'en').map((l) => [l, {}])
  ) as I18nMap;
  return { en: { ...ENGLISH_STRINGS }, ...empty };
}

export function isLocaleCode(value: string | null | undefined): value is LocaleCode {
  return Boolean(value && (LOCALES as readonly string[]).includes(value));
}

export function mergeI18n(existing?: I18nMap | null): I18nMap {
  const base = createDefaultI18n();
  if (!existing) return base;
  const next: I18nMap = { ...base };
  for (const locale of LOCALES) {
    next[locale] = {
      ...(locale === 'en' ? ENGLISH_STRINGS : {}),
      ...(existing[locale] || {}),
    };
  }
  // Keep English keys complete
  next.en = { ...ENGLISH_STRINGS, ...(existing.en || {}) };
  return next;
}

export function resolveStrings(
  i18n: I18nMap | undefined,
  lang: string
): StringMap {
  const map = mergeI18n(i18n);
  const locale = isLocaleCode(lang) ? lang : 'en';
  return {
    ...ENGLISH_STRINGS,
    ...(map.en || {}),
    ...(map[locale] || {}),
  };
}

export function localeProgress(i18n: I18nMap | undefined, locale: LocaleCode) {
  const keys = Object.keys(ENGLISH_STRINGS);
  const map = i18n?.[locale] || {};
  const filled = keys.filter((k) => Boolean(map[k]?.trim())).length;
  return { filled, total: keys.length };
}
