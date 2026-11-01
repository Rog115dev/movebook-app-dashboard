import type { PlanFeature, PlanSettings, UnlockAudience } from './types';
import { UNLOCK_AUDIENCE_OPTIONS } from './types';

/** The 4 version tiers shown as plan cards. */
export const PLAN_VERSIONS = [
  { key: 'free', label: 'Free', title: 'Version Free' },
  { key: 'basic', label: 'Base', title: 'Version Base' },
  { key: 'premium', label: 'Premium', title: 'Version Premium' },
  { key: 'pro', label: 'Professional', title: 'Version Professional' },
] as const;

export type PlanVersionKey = (typeof PLAN_VERSIONS)[number]['key'];

export const PLAN_USER_TYPES: {
  id: UnlockAudience;
  label: string;
}[] = [
  { id: 'athlete', label: 'Athlete' },
  { id: 'coaches', label: 'Coach' },
  { id: 'teams', label: 'Team' },
  { id: 'clubs', label: 'Club' },
  { id: 'groups', label: 'Group' },
];

export function planMatrixId(
  version: PlanVersionKey,
  audience: UnlockAudience
): string {
  return `${version}-${audience}`;
}

export function parsePlanMatrixId(id: string): {
  version: PlanVersionKey | null;
  audience: UnlockAudience | null;
} {
  const raw = String(id || '');
  for (const version of PLAN_VERSIONS) {
    for (const audience of UNLOCK_AUDIENCE_OPTIONS) {
      if (raw === planMatrixId(version.key, audience) || raw === version.key) {
        return {
          version: version.key,
          audience: raw === version.key ? null : audience,
        };
      }
    }
  }
  const m = raw.match(/^(free|basic|premium|pro)-(\w+)$/);
  if (m) {
    const version = m[1] as PlanVersionKey;
    const audience = m[2] as UnlockAudience;
    if ((UNLOCK_AUDIENCE_OPTIONS as readonly string[]).includes(audience)) {
      return { version, audience };
    }
  }
  if ((['free', 'basic', 'premium', 'pro'] as string[]).includes(raw)) {
    return { version: raw as PlanVersionKey, audience: null };
  }
  return { version: null, audience: null };
}

function cloneFeatures(features: PlanFeature[] | undefined): PlanFeature[] {
  return (features || []).map((f) => ({ ...f }));
}

const TEMPLATE_FEATURES: Record<PlanVersionKey, PlanFeature[]> = {
  free: [
    { text: 'Develop aerobic workout plan', included: true },
    { text: 'Develop weight training plan', included: true },
    { text: 'Develop circuit training plan', included: true },
    { text: 'Develop weekly weight training plan', included: true },
    { text: 'Download user-shared workout plans', included: true },
    { text: 'Store workouts in the Annual Work Plan', included: true },
    { text: 'Store completed work', included: true },
  ],
  basic: [
    { text: 'All the features of the version free +', included: true },
    { text: '500+ exercises with videos', included: true },
    { text: 'Version for male and female', included: true },
    { text: 'View targeted muscle areas', included: true },
    { text: 'Completed workouts compared with planned', included: true },
    { text: 'Access to library of workouts', included: true },
    { text: 'Create your own preparatory cycles', included: true },
  ],
  premium: [
    { text: 'All the features of the version Base +', included: true },
    { text: 'Statistics on workouts planned', included: true },
    { text: 'Statistics on workouts completed', included: true },
    { text: 'Full editor new exercises', included: true },
    { text: 'Training assistant', included: true },
    { text: 'Analyze your diet', included: true },
    { text: 'Create meal plans', included: true },
    { text: 'Body analysis', included: true },
  ],
  pro: [
    { text: 'All the features of the version Premium +', included: true },
    { text: 'Gps workout map tracking', included: true },
    { text: 'Heart rate tracking', included: true },
    { text: 'Advanced statistical analysis', included: true },
    { text: 'Actions tracking', included: true },
    { text: 'Intelligent assistant', included: true },
    { text: 'Self-learning', included: true },
    {
      text: 'AI training plan development',
      included: true,
      highlight: true,
    },
  ],
};

const TEMPLATE_META: Record<
  PlanVersionKey,
  Omit<PlanSettings, 'id' | 'audiences' | 'features'>
> = {
  free: {
    name: 'Version Free',
    price: '$ 0',
    amount: 0,
    currencyCode: 'USD',
    subtitle: 'Use version free for 1 month',
    cta: 'Choose Free',
  },
  basic: {
    name: 'Version Base',
    price: '$ 36',
    amount: 36,
    currencyCode: 'USD',
    subtitle: 'Annual subscription',
    cta: 'Choose Base',
  },
  premium: {
    name: 'Version Premium',
    price: '$ 73',
    amount: 73,
    currencyCode: 'USD',
    subtitle: 'Annual subscription',
    cta: 'Choose Premium',
  },
  pro: {
    name: 'Version Professional',
    price: '$ 109',
    amount: 109,
    currencyCode: 'USD',
    subtitle: 'Annual subscription',
    cta: 'Choose Professional',
    badge: 'Personal avatar',
    badgeDenied: true,
  },
};

export function createDefaultPlanMatrix(): PlanSettings[] {
  const out: PlanSettings[] = [];
  for (const audience of UNLOCK_AUDIENCE_OPTIONS) {
    for (const version of PLAN_VERSIONS) {
      const meta = TEMPLATE_META[version.key];
      out.push({
        ...meta,
        id: planMatrixId(version.key, audience),
        audiences: [audience],
        features: cloneFeatures(TEMPLATE_FEATURES[version.key]),
      });
    }
  }
  return out;
}

function normalizeAudiences(raw: unknown): UnlockAudience[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((a) => String(a).trim().toLowerCase())
    .filter((a): a is UnlockAudience =>
      (UNLOCK_AUDIENCE_OPTIONS as readonly string[]).includes(a)
    );
}

/**
 * Ensure Free/Base/Premium/Professional × Athlete/Coach/Team/Club/Group exist.
 * Legacy 4 plans (free/basic/premium/pro) are cloned for every user type.
 */
export function ensurePlanMatrix(plans: PlanSettings[]): PlanSettings[] {
  const byId = new Map(plans.map((p) => [p.id, p]));

  // Legacy templates without audience suffix
  const legacyByVersion = new Map<PlanVersionKey, PlanSettings>();
  for (const version of PLAN_VERSIONS) {
    const legacy = byId.get(version.key);
    if (legacy) legacyByVersion.set(version.key, legacy);
  }

  const out: PlanSettings[] = [];
  for (const audience of UNLOCK_AUDIENCE_OPTIONS) {
    for (const version of PLAN_VERSIONS) {
      const id = planMatrixId(version.key, audience);
      const existing = byId.get(id);
      const legacy = legacyByVersion.get(version.key);
      const template = TEMPLATE_META[version.key];
      const source = existing || legacy;

      if (source) {
        out.push({
          ...template,
          ...source,
          id,
          currencyCode: 'USD',
          amount: Number.isFinite(source.amount)
            ? source.amount
            : template.amount,
          audiences: [audience],
          features: cloneFeatures(
            source.features?.length
              ? source.features
              : TEMPLATE_FEATURES[version.key]
          ),
        });
      } else {
        out.push({
          ...template,
          id,
          audiences: [audience],
          features: cloneFeatures(TEMPLATE_FEATURES[version.key]),
        });
      }
    }
  }

  // Keep any custom plans that are not part of the matrix (rare)
  for (const plan of plans) {
    if (out.some((p) => p.id === plan.id)) continue;
    const parsed = parsePlanMatrixId(plan.id);
    if (parsed.version && !parsed.audience) continue; // legacy bare ids already expanded
    out.push({
      ...plan,
      audiences: normalizeAudiences(plan.audiences).length
        ? normalizeAudiences(plan.audiences)
        : plan.audiences,
      currencyCode: 'USD',
    });
  }

  return out;
}

export function audienceLabel(id: UnlockAudience): string {
  return PLAN_USER_TYPES.find((t) => t.id === id)?.label || id;
}
