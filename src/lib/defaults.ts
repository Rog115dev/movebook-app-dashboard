import type { MobileAppSettings } from './types';
import { DEFAULT_COLORS } from './colorDefaults';
import { createDefaultI18n, LOCALES } from './i18n';
import {
  createDefaultImageSections,
  syncLegacyImages,
} from './imageSections';
import { DEFAULT_CURRENCIES } from './currency';
import { createDefaultPlanMatrix } from './planMatrix';
import { createDefaultSports } from './sports';

export function createDefaultSettings(): MobileAppSettings {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    defaultLocale: 'en',
    locales: [...LOCALES],
    i18n: createDefaultI18n(),
    colors: { ...DEFAULT_COLORS },
    home: {
      brandPrefix: 'Movesbook ',
      brandAccent: 'FitAI',
      brandSuffix: ' Coach',
      subtitle:
        'Comprehensive solutions for modern sport & fitness digital challenges',
      heroCaption: 'Push Beyond Yesterday...',
      heroHeadline: 'BREAK ALL LIMITS',
      featuresCta: 'Feature of the version',
      signupCta: 'Sign up',
      loginPrompt: 'Already have an account?',
      loginLink: 'Log in',
      confidenceText:
        "We're confident that our premium experience will exceed your expectations, providing you with unique value and satisfaction.\n\nEnjoy the freedom to explore everything we offer, because your satisfaction is, and always will be, our top priority.",
      heroImageUrl: '/uploads/hero-break-limits.jpg',
      /** Empty by default — samples are optional picks, not auto-active. */
      heroVideoUrl: '',
      heroVideoChosen: false,
      heroVideoSamples: [
        {
          id: 'sample-1',
          label: 'Break All Limits — AI workout plans',
          url: '/uploads/sample-hero-1.mp4',
        },
        {
          id: 'sample-2',
          label: 'Train Smarter — Coach Mode',
          url: '/uploads/sample-hero-2.mp4',
        },
        {
          id: 'sample-3',
          label: 'Push Beyond — Progress tracking',
          url: '/uploads/sample-hero-3.mp4',
        },
      ],
    },
    whyChooseMe: {
      title: 'Why Choose Me',
      reasons: [
        {
          key: 'results',
          icon: 'trending-up',
          title: 'Results-Driven',
          body: 'Focused on achieving measurable sport technology results through optimal solutions',
        },
        {
          key: 'quality',
          icon: 'shield-checkmark-outline',
          title: 'Quality Assured',
          body: 'Committed to excellence with rigorous testings, code reviews, and adherence to best sport industry practices',
        },
        {
          key: 'collab',
          icon: 'people-outline',
          title: 'Collaborative',
          body: 'Ability to listen to user needs and a collaborative approach to ensure project success and users satisfaction',
        },
      ],
    },
    pricing: {
      baseCurrency: 'USD',
      currencies: [...DEFAULT_CURRENCIES],
    },
    plans: createDefaultPlanMatrix(),
    paywall: {
      brandName: 'FitAI Coach',
      brandSub: 'Personalized AI Workout Plans',
      claimDiscountLabel: 'Claim discount',
      startTrialLabel: 'Start Free Trial',
      trustLine1: 'No commitment. Cancel anytime!',
      trustLine2: 'Top quality workouts',
      athletesImageUrl: '/uploads/paywall-athletes.jpg',
      features: [
        { icon: 'clipboard-outline', label: 'Customized plans', disabled: false },
        { icon: 'headset-outline', label: '24/7 AI trainer', disabled: false },
        {
          icon: 'stats-chart-outline',
          label: 'Progress tracking',
          disabled: false,
        },
        {
          icon: 'barbell-outline',
          label: 'Unlimited workouts',
          disabled: false,
        },
      ],
      tiers: [
        {
          id: '1m',
          label: '1 month',
          price: '0.50 USD',
          original: '$28.00 USD',
          discount: '50% OFF',
          popular: false,
        },
        {
          id: '3m',
          label: '3 months',
          price: '0.35 USD',
          original: '$32.55 USD',
          discount: '65% OFF',
          popular: false,
        },
        {
          id: '12m',
          label: '12 months',
          price: '0.20 USD',
          original: '$73.00 USD',
          discount: '80% OFF',
          popular: true,
        },
      ],
    },
    discount: {
      code: 'FITAI50',
      percent: 50,
      expiresOn: '2027-12-31',
    },
    trainPro: {
      headlineOrange: 'TRAIN PRO: ',
      headlineWhite: 'Unleash Your Potential.',
      trialCta: 'START FREE TRIAL',
      downloadCta: 'DOWNLOAD APP',
      bannerImageUrl: '/uploads/train-pro.jpg',
      stats: [
        {
          icon: 'barbell-outline',
          value: '100,000+',
          label: 'TOTAL WORKOUTS COMPLETED',
        },
        {
          icon: 'flame-outline',
          value: '2,000,000+',
          label: 'CALORIES BURNED',
        },
        {
          icon: 'hourglass-outline',
          value: '10,000+',
          label: 'HOURS TRAINED',
        },
        {
          icon: 'happy-outline',
          value: '98%',
          label: 'USER SATISFACTION',
        },
      ],
      features: [
        {
          icon: 'clipboard-outline',
          title: 'PERSONALIZED PLANS',
          description: 'Customer personalized plans',
        },
        {
          icon: 'stats-chart-outline',
          title: 'TRACK PROGRESS',
          description: 'Analyze and track progress to gain insights',
        },
        {
          icon: 'person-outline',
          title: 'COACH FUNCTION',
          description: 'Get the most out of your coaching',
        },
        {
          icon: 'nutrition-outline',
          title: 'NUTRITION GUIDANCE',
          description: 'Let your nutrition guide help you',
        },
      ],
      faqTitle: 'FAQ',
      faqs: [
        {
          q: 'How does personalized training work?',
          a: 'FitAI builds plans from your goals, level, and available equipment, then adapts as you complete sessions.',
          audiences: [],
        },
        {
          q: 'Can I customize my program?',
          a: 'Yes. Swap exercises, adjust volume, and save your own cycles while keeping coach-ready structure.',
          audiences: [],
        },
        {
          q: 'Can I track nutrition?',
          a: 'Premium and Pro unlock meal plans, diet analysis, and body metrics alongside workout tracking.',
          audiences: [],
        },
        {
          q: "What's included in the trial?",
          a: 'Start with the Free month: aerobic, weights, circuit planning, shared downloads, and annual plan storage.',
          audiences: [],
        },
      ],
      guaranteeBest: 'Best',
      guaranteeLine: 'SATISFACTION GUARANTEE',
      secureText: 'Pay Safe & Secure',
    },
    featuresPage: {
      unlockTitle: 'Unlock everything you need',
      unlockSub: 'Everything you want. All in one place.',
      backgroundColor: '#161616',
      textColor: '#FFFFFF',
      items: [
        {
          id: 'ai-plans',
          title: 'AI Workout Plans',
          description: 'Built around your goals and level.',
          badge: 'HOT',
        },
        {
          id: 'videos',
          title: 'Exercise Videos',
          description: '500+ demos with form cues.',
          badge: 'HIGH QUALITY',
        },
        {
          id: 'coach',
          title: 'Coach Mode',
          description: 'Guidance that adapts as you train.',
          badge: 'NEW',
        },
        {
          id: 'progress',
          title: 'Progress Tracking',
          description: 'Compare planned vs completed work.',
          badge: 'EXCLUSIVE',
        },
        {
          id: 'nutrition',
          title: 'Nutrition Guidance',
          description: 'Meal plans and body analysis.',
          badge: 'VIP',
        },
      ],
    },
    sports: createDefaultSports(),
    testimonials: {
      subtitle: 'Join FitAI Coach users who cannot get enough.',
      carouselDelaySec: 5,
      items: [
        {
          id: 'mike-myers',
          code: 'Mike Myers',
          pictureUrl: '',
          logoUrl: '',
          borderColor: '#FF7800',
          title: 'Great training flow',
          description:
            'Plans feel personalized and the video library is excellent. Progress tracking keeps me consistent week after week.',
          showInPresentation: true,
          showInMenu: true,
          countries: [],
          languages: [],
          audiences: [],
          sports: [],
        },
        {
          id: 'shaun',
          code: 'Shaun',
          pictureUrl: '',
          logoUrl: '',
          borderColor: '#FF7800',
          title: 'Actually feels smart',
          description:
            'Not robotic at all. I ended up using FitAI Coach way more than I expected — coaching tips are clear and useful.',
          showInPresentation: true,
          showInMenu: true,
          countries: [],
          languages: [],
          audiences: [],
          sports: [],
        },
        {
          id: 'carlos-pearson',
          code: 'Carlos Pearson',
          pictureUrl: '',
          logoUrl: '',
          borderColor: '#FF7800',
          title: 'Production-level experience',
          description:
            'Workout videos and structure feel polished. Closest thing to having a real coach in my pocket.',
          showInPresentation: true,
          showInMenu: true,
          countries: [],
          languages: [],
          audiences: [],
          sports: [],
        },
      ],
    },
    imageSections: createDefaultImageSections({
      hero: '/uploads/hero-break-limits.jpg',
      paywall: '/uploads/paywall-athletes.jpg',
      trainPro: '/uploads/train-pro.jpg',
    }),
    images: syncLegacyImages(
      createDefaultImageSections({
        hero: '/uploads/hero-break-limits.jpg',
        paywall: '/uploads/paywall-athletes.jpg',
        trainPro: '/uploads/train-pro.jpg',
      })
    ),
  };
}
