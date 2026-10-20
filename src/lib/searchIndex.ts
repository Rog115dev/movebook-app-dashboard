import { ENGLISH_STRINGS, I18N_GROUPS } from './i18n';

export type SearchHit = {
  id: string;
  title: string;
  desc: string;
  href: string;
  category: string;
  keywords: string[];
};

const SECTION_HITS: SearchHit[] = [
  {
    id: 'menu-home',
    title: 'Home',
    desc: 'Why choose me, Statistics, Characteristics, FAQ',
    href: '/dashboard/home',
    category: 'Menu',
    keywords: ['home', 'menu'],
  },
  {
    id: 'menu-feature',
    title: 'Feature',
    desc: 'Qualities, Details features, Testimonials, Version details',
    href: '/dashboard/feature',
    category: 'Menu',
    keywords: ['feature', 'menu'],
  },
  {
    id: 'menu-features-titles',
    title: 'Features titles',
    desc: 'Customized plans, 24/7 AI trainer, Progress tracking chips',
    href: '/dashboard/features-titles',
    category: 'Menu',
    keywords: [
      'features titles',
      'customized plans',
      'ai trainer',
      'unlimited workouts',
      'chips',
    ],
  },
  {
    id: 'menu-generals',
    title: 'Generals',
    desc: 'Overview, Colors, Languages, Paywall, and more',
    href: '/dashboard/generals',
    category: 'Menu',
    keywords: ['generals', 'others', 'menu'],
  },
  {
    id: 'why-choose-me',
    title: 'Why choose me',
    desc: 'Results-Driven, Quality Assured, Collaborative cards',
    href: '/dashboard/home/why-choose-me',
    category: 'Home',
    keywords: ['why', 'why choose me', 'results', 'quality', 'collaborative'],
  },
  {
    id: 'statistics',
    title: 'Statistics',
    desc: 'Workouts, calories, hours, satisfaction metrics',
    href: '/dashboard/home/statistics',
    category: 'Home',
    keywords: [
      'statistics',
      'stats',
      'workouts',
      'calories',
      'hours',
      'satisfaction',
    ],
  },
  {
    id: 'characteristics',
    title: 'Characteristics',
    desc: 'Personalized Plans, Track Progress, Coach Function, Nutrition',
    href: '/dashboard/home/characteristics',
    category: 'Home',
    keywords: [
      'characteristics',
      'personalized plans',
      'track progress',
      'coach function',
      'nutrition guidance',
    ],
  },
  {
    id: 'faq',
    title: 'FAQ',
    desc: 'Add/edit FAQ questions and answers',
    href: '/dashboard/home/faq',
    category: 'Home',
    keywords: ['faq', 'question', 'answer', 'help'],
  },
  {
    id: 'qualities',
    title: 'Qualities',
    desc: 'We built it just for you — Strong, Focused, Personalized',
    href: '/dashboard/feature/qualities',
    category: 'Feature',
    keywords: [
      'qualities',
      'built for you',
      'strong',
      'focused',
      'personalized',
      'results-driven',
      'trait',
    ],
  },
  {
    id: 'details-features',
    title: 'Details features',
    desc: 'Unlock everything you need — titles, descriptions, badges',
    href: '/dashboard/feature/details-features',
    category: 'Feature',
    keywords: [
      'unlock',
      'details features',
      'features',
      'badge',
      'hot',
      'vip',
      'coach mode',
      'nutrition',
      'ai workout',
      'exercise videos',
      'progress tracking',
    ],
  },
  {
    id: 'testimonials',
    title: 'Testimonials',
    desc: 'Create/edit reviews, photos, presentation carousel',
    href: '/dashboard/feature/testimonials',
    category: 'Feature',
    keywords: [
      'testimonial',
      'review',
      'love',
      'users love us',
      'carousel',
      'presentation',
      'mike',
      'shaun',
    ],
  },
  {
    id: 'version-details',
    title: 'Version details',
    desc: 'Free / Basic / Premium / Pro plan cards',
    href: '/dashboard/feature/version-details',
    category: 'Feature',
    keywords: [
      'version',
      'plan',
      'subscription',
      'price',
      'currency',
      'eur',
      'usd',
      'premium',
      'pro',
      'free',
      'basic',
    ],
  },
  {
    id: 'features-titles',
    title: 'Features titles',
    desc: 'Customized plans, 24/7 AI trainer, Progress tracking chips',
    href: '/dashboard/features-titles',
    category: 'Features titles',
    keywords: [
      'features titles',
      'customized plans',
      'ai trainer',
      'unlimited workouts',
      'chips',
    ],
  },
  {
    id: 'overview',
    title: 'Overview',
    desc: 'Dashboard status and config version',
    href: '/dashboard/generals/overview',
    category: 'Generals',
    keywords: ['overview', 'dashboard', 'status', 'version'],
  },
  {
    id: 'colors',
    title: 'Colors',
    desc: 'Brand orange, backgrounds, borders, accents',
    href: '/dashboard/generals/colors',
    category: 'Generals',
    keywords: [
      'color',
      'palette',
      'orange',
      'blue',
      'bg',
      'theme',
      'brand',
      'accent',
    ],
  },
  {
    id: 'home-content',
    title: 'Home content',
    desc: 'Brand title, hero video, CTAs',
    href: '/dashboard/generals/home-content',
    category: 'Generals',
    keywords: [
      'home content',
      'hero',
      'video',
      'mp4',
      'upload video',
      'cta',
      'signup',
      'login',
      'confidence',
      'brand',
      'fitai',
    ],
  },
  {
    id: 'languages',
    title: 'Languages',
    desc: 'Translate strings for 12 locales + Apply Translation',
    href: '/dashboard/generals/languages',
    category: 'Generals',
    keywords: [
      'language',
      'i18n',
      'translate',
      'translation',
      'locale',
      'italiano',
      'français',
      'apply translation',
    ],
  },
  {
    id: 'discount',
    title: 'Discount',
    desc: 'Promo CODE, discount %, expiration for Claim discount',
    href: '/dashboard/generals/discount',
    category: 'Generals',
    keywords: [
      'discount',
      'promo',
      'code',
      'coupon',
      'percent',
      'expiration',
      'claim discount',
      'offer',
    ],
  },
  {
    id: 'paywall',
    title: 'Paywall',
    desc: 'Offer tiers, discounts, trial copy, athletes image',
    href: '/dashboard/generals/paywall',
    category: 'Generals',
    keywords: ['paywall', 'trial', 'discount', 'tier', 'offer', 'billing'],
  },
  {
    id: 'train-pro',
    title: 'TRAIN PRO',
    desc: 'Headline, CTAs, guarantee',
    href: '/dashboard/generals/train-pro',
    category: 'Generals',
    keywords: ['train', 'train pro', 'guarantee', 'headline'],
  },
  {
    id: 'images',
    title: 'Images & video',
    desc: 'Hero / paywall / TRAIN PRO image pools and rotation',
    href: '/dashboard/generals/images',
    category: 'Generals',
    keywords: [
      'image',
      'photo',
      'upload',
      'banner',
      'hero',
      'rotate',
      'gallery',
      'add images',
    ],
  },
];

const COLOR_FIELDS: SearchHit[] = [
  'orange',
  'orangeHot',
  'gold',
  'goldSoft',
  'bg',
  'bgElevated',
  'bgCard',
  'white',
  'whiteMuted',
  'whiteDim',
  'red',
  'border',
  'borderSoft',
  'borderOrange',
  'black',
].map((key) => ({
  id: `color-${key}`,
  title: key,
  desc: `Color token on Colors page`,
  href: '/dashboard/generals/colors',
  category: 'Color',
  keywords: [key, 'color', 'palette'],
}));

function groupForKey(key: string) {
  return (
    I18N_GROUPS.find((g) => g.keys.includes(key))?.id ||
    key.split('.')[0] ||
    'common'
  );
}

function pageForI18nKey(key: string): { href: string; category: string } {
  if (key.startsWith('why.')) {
    return {
      href: '/dashboard/home/why-choose-me',
      category: 'Why choose me field',
    };
  }
  if (key.startsWith('home.')) {
    return {
      href: '/dashboard/generals/home-content',
      category: 'Home field',
    };
  }
  if (key.startsWith('train.faq') || key === 'train.faqTitle') {
    return { href: '/dashboard/home/faq', category: 'FAQ field' };
  }
  if (/^train\.stat\d/.test(key)) {
    return { href: '/dashboard/home/statistics', category: 'Statistics field' };
  }
  if (/^train\.feat\d/.test(key)) {
    return {
      href: '/dashboard/home/characteristics',
      category: 'Characteristics field',
    };
  }
  if (key === 'features.builtFor' || key.startsWith('features.trait')) {
    return { href: '/dashboard/feature/qualities', category: 'Qualities field' };
  }
  if (
    key === 'features.unlockTitle' ||
    key === 'features.unlockSub' ||
    /^features\.unlock\d+(Title|Desc|Badge)$/.test(key)
  ) {
    return {
      href: '/dashboard/feature/details-features',
      category: 'Details features field',
    };
  }
  if (key === 'features.loveSub' || key.startsWith('testimonials.')) {
    return {
      href: '/dashboard/feature/testimonials',
      category: 'Testimonials field',
    };
  }
  if (key.startsWith('train.')) {
    return {
      href: '/dashboard/generals/train-pro',
      category: 'TRAIN PRO field',
    };
  }
  if (/^paywall\.feature\d/.test(key)) {
    return {
      href: '/dashboard/features-titles',
      category: 'Features titles field',
    };
  }
  if (key.startsWith('paywall.')) {
    return { href: '/dashboard/generals/paywall', category: 'Paywall field' };
  }
  if (key.startsWith('plans.')) {
    return {
      href: '/dashboard/feature/version-details',
      category: 'Version details field',
    };
  }
  const group = groupForKey(key);
  return {
    href: `/dashboard/generals/languages?group=${encodeURIComponent(group)}&highlight=${encodeURIComponent(key)}`,
    category: 'Language key',
  };
}

const FIELD_HITS: SearchHit[] = Object.entries(ENGLISH_STRINGS).map(
  ([key, value]) => {
    const page = pageForI18nKey(key);
    const langHref = `/dashboard/generals/languages?group=${encodeURIComponent(
      groupForKey(key)
    )}&highlight=${encodeURIComponent(key)}`;
    return {
      id: `field-${key}`,
      title: key,
      desc: value.slice(0, 120),
      href: page.category === 'Language key' ? page.href : langHref,
      category: page.category,
      keywords: [
        key,
        value,
        key.replace(/\./g, ' '),
        groupForKey(key),
        'edit',
        'field',
        'string',
      ],
    };
  }
);

const ALIAS_HITS: SearchHit[] = [
  {
    id: 'alias-why',
    title: 'Why Choose Me',
    desc: 'Home → Why choose me tab',
    href: '/dashboard/home/why-choose-me',
    category: 'Alias',
    keywords: ['why', 'why choose me', 'results', 'quality', 'collaborative'],
  },
  {
    id: 'alias-hero-image',
    title: 'Home hero image',
    desc: 'Upload / rotate images for the home hero',
    href: '/dashboard/generals/images',
    category: 'Alias',
    keywords: ['hero image', 'break limits', 'banner', 'photo'],
  },
  {
    id: 'alias-apply-translation',
    title: 'Apply Translation',
    desc: 'Fill translations from browser translator / seeds',
    href: '/dashboard/generals/languages',
    category: 'Alias',
    keywords: ['apply translation', 'translate', 'auto translate', 'browser'],
  },
  {
    id: 'alias-plans',
    title: 'Plans',
    desc: 'Feature → Version details tab',
    href: '/dashboard/feature/version-details',
    category: 'Alias',
    keywords: ['plans', 'subscription plans'],
  },
  {
    id: 'alias-unlock',
    title: 'Unlock features',
    desc: 'Feature → Details features tab',
    href: '/dashboard/feature/details-features',
    category: 'Alias',
    keywords: ['unlock features', 'unlock'],
  },
];

export const SEARCH_INDEX: SearchHit[] = [
  ...SECTION_HITS,
  ...COLOR_FIELDS,
  ...FIELD_HITS,
  ...ALIAS_HITS,
];

function normalize(text: string) {
  return text.toLowerCase().normalize('NFKD').replace(/\s+/g, ' ').trim();
}

export function searchDashboard(query: string, limit = 40): SearchHit[] {
  const q = normalize(query);
  if (!q) return SECTION_HITS.filter((h) => h.category === 'Menu');

  const terms = q.split(' ').filter(Boolean);
  const scored = SEARCH_INDEX.map((hit) => {
    const hay = normalize(
      [hit.title, hit.desc, hit.category, ...hit.keywords].join(' ')
    );
    let score = 0;
    if (hay.includes(q)) score += 20;
    if (normalize(hit.title).startsWith(q)) score += 30;
    if (normalize(hit.title) === q) score += 50;
    for (const term of terms) {
      if (hay.includes(term)) score += 8;
      if (normalize(hit.title).includes(term)) score += 12;
    }
    if (
      hit.category === 'Menu' ||
      hit.category === 'Home' ||
      hit.category === 'Feature' ||
      hit.category === 'Features titles' ||
      hit.category === 'Generals'
    ) {
      score += 2;
    }
    return { hit, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.hit.title.localeCompare(b.hit.title));

  return scored.slice(0, limit).map((row) => row.hit);
}
