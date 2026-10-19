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
  'features.unlock1Title': 'AI Workout Plans',
  'features.unlock1Desc': 'Built around your goals and level.',
  'features.unlock1Badge': 'HOT',
  'features.unlock2Title': 'Exercise Videos',
  'features.unlock2Desc': '500+ demos with form cues.',
  'features.unlock2Badge': 'HIGH QUALITY',
  'features.unlock3Title': 'Coach Mode',
  'features.unlock3Desc': 'Guidance that adapts as you train.',
  'features.unlock3Badge': 'NEW',
  'features.unlock4Title': 'Progress Tracking',
  'features.unlock4Desc': 'Compare planned vs completed work.',
  'features.unlock4Badge': 'EXCLUSIVE',
  'features.unlock5Title': 'Nutrition Guidance',
  'features.unlock5Desc': 'Meal plans and body analysis.',
  'features.unlock5Badge': 'VIP',
  'features.mostPopular': 'MOST POPULAR',
  'features.planSuffix': 'plan',
  'features.loveSub': 'Join FitAI Coach users who cannot get enough.',
  'testimonials.1.code': 'Mike Myers',
  'testimonials.1.title': 'Great training flow',
  'testimonials.1.description':
    'Plans feel personalized and the video library is excellent. Progress tracking keeps me consistent week after week.',
  'testimonials.2.code': 'Shaun',
  'testimonials.2.title': 'Actually feels smart',
  'testimonials.2.description':
    'Not robotic at all. I ended up using FitAI Coach way more than I expected — coaching tips are clear and useful.',
  'testimonials.3.code': 'Carlos Pearson',
  'testimonials.3.title': 'Production-level experience',
  'testimonials.3.description':
    'Workout videos and structure feel polished. Closest thing to having a real coach in my pocket.',
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
  'auth.signupHeadline': 'Create your',
  'auth.signupFreeAccent': 'free',
  'auth.signupHeadlineEnd': 'account',
  'auth.signupSub':
    'Choose your country for local pricing, and your role for relevant features.',
  'auth.fullName': 'Full name',
  'auth.username': 'Username',
  'auth.email': 'Email',
  'auth.placeholderName': 'Alex Runner',
  'auth.placeholderUsername': 'alexrunner',
  'auth.placeholderEmail': 'you@email.com',
  'auth.placeholderPassword': 'At least 6 characters',
  'auth.nameRequired': 'Full name is required',
  'auth.usernameRequired': 'Username is required',
  'auth.emailRequired': 'Valid email is required',
  'auth.passwordMin': 'Password must be at least 6 characters',
  'auth.countryRequired': 'Please select your country',
  'auth.userTypeRequired': 'Please select your user type',
  'auth.audienceLabel': 'I am / We are',
  'auth.signupFreeCta': 'Sign up free',
  'auth.signupSuccessTitle': 'Account created',
  'auth.signupSuccessBody': 'Welcome to FitAI Coach.',
  'auth.signupFailed': 'Sign up failed',
  'auth.tryAgain': 'Please try again.',
  'auth.signedInAs': 'Signed in as {name}.',
  'auth.country': 'Country',
  'auth.countryPlaceholder': 'Select your country',
  'auth.countryModalTitle': 'Select country',
  'auth.countrySearch': 'Search country',
  'audience.athlete': 'Athlete',
  'audience.coaches': 'Coaches',
  'audience.teams': 'Teams',
  'audience.clubs': 'Clubs',
  'audience.groups': 'Groups',
  'features.traitStrong': 'Strong',
  'features.traitFocused': 'Focused',
  'features.traitPersonalized': 'Personalized',
  'features.traitResults': 'Results-driven',
  'features.audienceHint': 'Showing features for {role}',
  'features.loveTitleBefore': 'Users',
  'features.loveAccent': 'LOVE',
  'features.loveTitleAfter': 'us',
  'features.realReview': 'Real review',
  'features.choosePlanTitle': 'Choose the perfect plan for you',
  'features.stickyCta': 'Get FitAI Coach',
  'features.continueTitle': 'Continue',
  'features.continueBody': 'Choose a plan below to continue.',
  'features.a11yHideDesc': 'Hide description',
  'features.a11yShowDesc': 'Show description',
  'features.a11yGoBack': 'Go back',
  'home.a11yPlayVideo': 'Play Break All Limits video',
  'home.a11yToggleVideo': 'Toggle hero video',
  'paywall.brandName': 'FitAI Coach',
  'countries.US': 'United States',
  'countries.GB': 'United Kingdom',
  'countries.IT': 'Italy',
  'countries.FR': 'France',
  'countries.DE': 'Germany',
  'countries.ES': 'Spain',
  'countries.PT': 'Portugal',
  'countries.NL': 'Netherlands',
  'countries.BE': 'Belgium',
  'countries.CH': 'Switzerland',
  'countries.AT': 'Austria',
  'countries.IE': 'Ireland',
  'countries.CA': 'Canada',
  'countries.AU': 'Australia',
  'countries.BR': 'Brazil',
  'countries.IN': 'India',
  'countries.JP': 'Japan',
  'countries.CN': 'China',
  'countries.MX': 'Mexico',
  'countries.AR': 'Argentina',
  'countries.PL': 'Poland',
  'countries.SE': 'Sweden',
  'countries.NO': 'Norway',
  'countries.DK': 'Denmark',
  'countries.FI': 'Finland',
  'countries.RO': 'Romania',
  'countries.GR': 'Greece',
  'countries.CZ': 'Czechia',
  'countries.HU': 'Hungary',
  'countries.ZA': 'South Africa',
  'plans.free.name': 'Free',
  'plans.free.subtitle': 'Use version free for 1 month',
  'plans.free.cta': 'Choose Free',
  'plans.free.feature1': 'Develop aerobic workout plan',
  'plans.free.feature2': 'Develop weight training plan',
  'plans.free.feature3': 'Develop circuit training plan',
  'plans.free.feature4': 'Develop weekly weight training plan',
  'plans.free.feature5': 'Download user-shared workout plans',
  'plans.free.feature6': 'Store workouts in the Annual Work Plan',
  'plans.free.feature7': 'Store completed work',
  'plans.basic.name': 'Basic',
  'plans.basic.subtitle': 'Annual subscription',
  'plans.basic.cta': 'Choose Basic',
  'plans.basic.feature1': 'All the features of the version free +',
  'plans.basic.feature2': '500+ exercises with videos',
  'plans.basic.feature3': 'Version for male and female',
  'plans.basic.feature4': 'View targeted muscle areas',
  'plans.basic.feature5': 'Completed workouts compared with planned',
  'plans.basic.feature6': 'Access to library of workouts',
  'plans.basic.feature7': 'Create your own preparatory cycles',
  'plans.premium.name': 'Premium',
  'plans.premium.subtitle': 'Annual subscription',
  'plans.premium.cta': 'Choose Premium',
  'plans.premium.feature1': 'All the features of the version Basic +',
  'plans.premium.feature2': 'Statistics on workouts planned',
  'plans.premium.feature3': 'Statistics on workouts completed',
  'plans.premium.feature4': 'Full editor new exercises',
  'plans.premium.feature5': 'Training assistant',
  'plans.premium.feature6': 'Analyze your diet',
  'plans.premium.feature7': 'Create meal plans',
  'plans.premium.feature8': 'Body analysis',
  'plans.pro.name': 'Pro',
  'plans.pro.subtitle': 'Annual subscription',
  'plans.pro.cta': 'Choose Pro',
  'plans.pro.badge': 'Personal avatar',
  'plans.pro.feature1': 'All the features of the version Premium +',
  'plans.pro.feature2': 'Gps workout map tracking',
  'plans.pro.feature3': 'Heart rate tracking',
  'plans.pro.feature4': 'Advanced statistical analysis',
  'plans.pro.feature5': 'Actions tracking',
  'plans.pro.feature6': 'Intelligent assistant',
  'plans.pro.feature7': 'Self-learning',
  'plans.pro.feature8': 'AI training plan development',
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
    keys: Object.keys(ENGLISH_STRINGS).filter(
      (k) => k.startsWith('features.') && k !== 'features.loveSub'
    ),
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    keys: Object.keys(ENGLISH_STRINGS).filter(
      (k) => k === 'features.loveSub' || k.startsWith('testimonials.')
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
  {
    id: 'audience',
    label: 'Audience & countries',
    keys: Object.keys(ENGLISH_STRINGS).filter(
      (k) => k.startsWith('audience.') || k.startsWith('countries.')
    ),
  },
  {
    id: 'plans',
    label: 'Plans',
    keys: Object.keys(ENGLISH_STRINGS).filter((k) => k.startsWith('plans.')),
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

export function englishKeySet(i18n?: I18nMap | null): string[] {
  return Object.keys({ ...ENGLISH_STRINGS, ...(i18n?.en || {}) });
}

export function localeProgress(i18n: I18nMap | undefined, locale: LocaleCode) {
  const keys = englishKeySet(i18n);
  const map = i18n?.[locale] || {};
  const filled = keys.filter((k) => Boolean(map[k]?.trim())).length;
  return { filled, total: keys.length };
}
