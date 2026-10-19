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
    id: 'colors',
    title: 'Colors',
    desc: 'Brand orange, backgrounds, borders, accents',
    href: '/dashboard/colors',
    category: 'Section',
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
    id: 'home',
    title: 'Home content',
    desc: 'Brand title, hero, CTAs, Why Choose Me (English source)',
    href: '/dashboard/home',
    category: 'Section',
    keywords: [
      'home',
      'hero',
      'video',
      'mp4',
      'upload video',
      'cta',
      'signup',
      'login',
      'confidence',
      'why choose me',
      'brand',
      'fitai',
    ],
  },
  {
    id: 'faq',
    title: 'FAQ',
    desc: 'Add/edit FAQ questions and answers',
    href: '/dashboard/faq',
    category: 'Section',
    keywords: ['faq', 'question', 'answer', 'help'],
  },
  {
    id: 'features',
    title: 'Unlock features',
    desc: 'Unlock everything you need — titles, descriptions, badges',
    href: '/dashboard/features',
    category: 'Section',
    keywords: [
      'unlock',
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
    href: '/dashboard/testimonials',
    category: 'Section',
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
    id: 'languages',
    title: 'Languages',
    desc: 'Translate strings for 12 locales + Apply Translation',
    href: '/dashboard/languages',
    category: 'Section',
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
    id: 'plans',
    title: 'Plans',
    desc: 'Free / Basic / Premium / Pro plan cards',
    href: '/dashboard/plans',
    category: 'Section',
    keywords: [
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
    id: 'paywall',
    title: 'Paywall',
    desc: 'Offer tiers, discounts, trial copy, athletes image',
    href: '/dashboard/paywall',
    category: 'Section',
    keywords: ['paywall', 'trial', 'discount', 'tier', 'offer', 'billing'],
  },
  {
    id: 'train-pro',
    title: 'TRAIN PRO',
    desc: 'Headline, stats, features, guarantee',
    href: '/dashboard/train-pro',
    category: 'Section',
    keywords: ['train', 'train pro', 'stats', 'features', 'guarantee'],
  },
  {
    id: 'images',
    title: 'Images',
    desc: 'Hero / paywall / TRAIN PRO image pools and rotation',
    href: '/dashboard/images',
    category: 'Section',
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
  {
    id: 'overview',
    title: 'Overview',
    desc: 'Dashboard home and config status',
    href: '/dashboard',
    category: 'Section',
    keywords: ['overview', 'dashboard', 'home', 'status', 'version'],
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
  href: '/dashboard/colors',
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
  if (key.startsWith('home.') || key.startsWith('why.')) {
    return { href: '/dashboard/home', category: 'Home field' };
  }
  if (key.startsWith('train.faq') || key === 'train.faqTitle') {
    return { href: '/dashboard/faq', category: 'FAQ field' };
  }
  if (
    key === 'features.unlockTitle' ||
    key === 'features.unlockSub' ||
    /^features\.unlock\d+(Title|Desc|Badge)$/.test(key)
  ) {
    return { href: '/dashboard/features', category: 'Unlock features field' };
  }
  if (key === 'features.loveSub' || key.startsWith('testimonials.')) {
    return {
      href: '/dashboard/testimonials',
      category: 'Testimonials field',
    };
  }
  if (key.startsWith('train.')) {
    return { href: '/dashboard/train-pro', category: 'TRAIN PRO field' };
  }
  if (key.startsWith('paywall.')) {
    return { href: '/dashboard/paywall', category: 'Paywall field' };
  }
  const group = groupForKey(key);
  return {
    href: `/dashboard/languages?group=${encodeURIComponent(group)}&highlight=${encodeURIComponent(key)}`,
    category: 'Language key',
  };
}

const FIELD_HITS: SearchHit[] = Object.entries(ENGLISH_STRINGS).map(
  ([key, value]) => {
    const page = pageForI18nKey(key);
    const langHref = `/dashboard/languages?group=${encodeURIComponent(
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

/** Extra aliases people type when hunting for editors */
const ALIAS_HITS: SearchHit[] = [
  {
    id: 'alias-why',
    title: 'Why Choose Me',
    desc: 'Edit on Home content (English) or Languages → Why Choose Me',
    href: '/dashboard/home',
    category: 'Alias',
    keywords: ['why', 'why choose me', 'results', 'quality', 'collaborative'],
  },
  {
    id: 'alias-hero-image',
    title: 'Home hero image',
    desc: 'Upload / rotate images for the home hero',
    href: '/dashboard/images',
    category: 'Alias',
    keywords: ['hero image', 'break limits', 'banner', 'photo'],
  },
  {
    id: 'alias-apply-translation',
    title: 'Apply Translation',
    desc: 'Fill translations from browser translator / seeds',
    href: '/dashboard/languages',
    category: 'Alias',
    keywords: ['apply translation', 'translate', 'auto translate', 'browser'],
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
  if (!q) return SECTION_HITS;

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
    // Prefer sections slightly when scores tie
    if (hit.category === 'Section') score += 2;
    return { hit, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.hit.title.localeCompare(b.hit.title));

  return scored.slice(0, limit).map((row) => row.hit);
}
