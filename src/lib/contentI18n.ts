import type { PlanSettings } from './types';
import type { StringMap } from './i18n';

/** Sync plan English copy into i18n.en keys for Languages / Apply Translation. */
export function plansI18nKeys(plans: PlanSettings[]): StringMap {
  const en: StringMap = {};
  for (const plan of plans) {
    const id = plan.id || 'plan';
    en[`plans.${id}.name`] = plan.name || '';
    en[`plans.${id}.subtitle`] = plan.subtitle || '';
    en[`plans.${id}.cta`] = plan.cta || '';
    if (plan.badge?.trim()) {
      en[`plans.${id}.badge`] = plan.badge;
    }
    (plan.features || []).forEach((f, i) => {
      en[`plans.${id}.feature${i + 1}`] = f.text || '';
    });
  }
  return en;
}

export function unlockFeaturesI18nKeys(
  unlockTitle: string,
  unlockSub: string,
  items: { title: string; description: string; badge: string }[]
): StringMap {
  const en: StringMap = {
    'features.unlockTitle': unlockTitle,
    'features.unlockSub': unlockSub,
  };
  items.forEach((item, index) => {
    en[`features.unlock${index + 1}Title`] = item.title;
    en[`features.unlock${index + 1}Desc`] = item.description;
    en[`features.unlock${index + 1}Badge`] = item.badge;
  });
  return en;
}
