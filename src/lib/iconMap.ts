/**
 * Curated Ionicons used by the mobile app (Train Pro stats / features).
 * Values must match Ionicons glyph names.
 */
export type AppIconOption = {
  id: string;
  label: string;
  /** Short hint for admins */
  hint: string;
};

export const APP_ICON_OPTIONS: AppIconOption[] = [
  { id: 'barbell-outline', label: 'Barbell', hint: 'Workouts / strength' },
  { id: 'flame-outline', label: 'Flame', hint: 'Calories / energy' },
  { id: 'hourglass-outline', label: 'Hourglass', hint: 'Time / hours' },
  { id: 'happy-outline', label: 'Happy', hint: 'Satisfaction' },
  { id: 'clipboard-outline', label: 'Clipboard', hint: 'Plans' },
  { id: 'stats-chart-outline', label: 'Chart', hint: 'Progress / stats' },
  { id: 'person-outline', label: 'Person', hint: 'Coach / profile' },
  { id: 'headset-outline', label: 'Headset', hint: 'AI trainer / support' },
  { id: 'nutrition-outline', label: 'Nutrition', hint: 'Food / diet' },
  { id: 'fitness-outline', label: 'Fitness', hint: 'Training' },
  { id: 'heart-outline', label: 'Heart', hint: 'Health / HR' },
  { id: 'trophy-outline', label: 'Trophy', hint: 'Goals / wins' },
  { id: 'ribbon-outline', label: 'Ribbon', hint: 'Achievement' },
  { id: 'pulse-outline', label: 'Pulse', hint: 'Activity' },
  { id: 'walk-outline', label: 'Walk', hint: 'Steps / cardio' },
  { id: 'bicycle-outline', label: 'Bicycle', hint: 'Cycling' },
  { id: 'water-outline', label: 'Water', hint: 'Hydration' },
  { id: 'timer-outline', label: 'Timer', hint: 'Duration' },
  { id: 'calendar-outline', label: 'Calendar', hint: 'Schedule' },
  { id: 'star-outline', label: 'Star', hint: 'Favorites' },
  { id: 'flash-outline', label: 'Flash', hint: 'Power / speed' },
  { id: 'shield-checkmark-outline', label: 'Shield', hint: 'Quality / secure' },
  { id: 'people-outline', label: 'People', hint: 'Team / community' },
  { id: 'body-outline', label: 'Body', hint: 'Anatomy' },
  { id: 'scale-outline', label: 'Scale', hint: 'Weight' },
];

export function iconSvgUrl(iconId: string) {
  const safe = encodeURIComponent(iconId.replace(/[^a-z0-9-]/gi, ''));
  return `https://cdn.jsdelivr.net/npm/ionicons@7.4.0/dist/svg/${safe}.svg`;
}

export function iconLabel(iconId: string) {
  return APP_ICON_OPTIONS.find((o) => o.id === iconId)?.label || iconId;
}
