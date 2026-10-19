/** FitAI sport catalog — names from Movesbook DEFAULT_SPORTS (ids are local slugs, not Movesbook codes). */

export type SportItem = {
  id: string;
  name: string;
};

const MOVESBOOK_SPORT_NAMES = [
  'Swimming',
  'Running',
  'Cycling',
  'Weights',
  'Soccer',
  'Basketball',
  'Tennis',
  'Volleyball',
  'Boxing',
  'Martial Arts',
  'Rowing',
  'Yoga',
  'Gymnastics',
  'Skiing',
  'Surfing',
  'Golf',
  'Baseball',
  'Ice Hockey',
  'Rugby',
  'Mountain Climbing',
  'American Football',
  'Archery',
  'Artistic Gymnastics',
  'Athletics',
  'Badminton',
  'Billiards',
  'Boating',
  'Bowling',
  'Calisthenics',
  'Canoe',
  'Cycling Tourism',
  'Classic Dance',
  'Cricket',
  'Cross-Country Skiing',
  'CrossFit',
  'Cyclocross',
  'Dance',
  'Dips',
  'Diving',
  'Downhill Skiing',
  'Fencing',
  'Field Hockey',
  'Fishing',
  'Freestyle Wrestling',
  'Handball',
  'Hang Gliding',
  'Hiking',
  'Horse Racing',
  'Ice Skating',
  'Jumps',
  'Kayak',
  'Kickboxing',
  'Lifting',
  'Modern Dance',
  'Motoring',
  'Mountain Bike',
  'MTB',
  'Pilates',
  'Ping Pong',
  'Polo',
  'Powerlifting',
  'Racquetball',
  'Rhythmic Gymnastics',
  'Sailing',
  'Shot Put',
  'Skateboard',
  'Skating',
  'Ski Jump',
  'Ski Slalom',
  'Snorkeling',
  'Snowboard',
  'Spartan Race',
  'Spinning',
  'Stretching',
  'Tango',
  'Technical Training',
  'Throws',
  'Trekking',
  'Triathlon',
  'Walking',
  'Water Polo',
  'Water Ski',
  'Windsurf',
] as const;

export function slugifySportName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export function createDefaultSports(): SportItem[] {
  return MOVESBOOK_SPORT_NAMES.map((name) => ({
    id: slugifySportName(name),
    name,
  }));
}

export function normalizeSports(raw: unknown): SportItem[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return createDefaultSports();
  }
  const seen = new Set<string>();
  const out: SportItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const name = String((item as SportItem).name || '').trim();
    if (!name) continue;
    let id = String((item as SportItem).id || '').trim() || slugifySportName(name);
    id = slugifySportName(id) || slugifySportName(name);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, name });
  }
  return out.length ? out : createDefaultSports();
}
