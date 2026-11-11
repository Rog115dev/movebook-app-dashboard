import Link from 'next/link';
import { MARKETING_SECTION_LABELS, MARKETING_SECTION_KEYS } from '@/lib/marketing';

export default function MarketingOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Manage marketing</h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Upload and target marketing images and videos for Avatars, Reels, and
          Checks. Each asset can be linked to user types, countries, languages,
          and sports.
        </p>
      </div>

      <Link
        href="/dashboard/marketing/avatars"
        className="inline-flex items-center rounded-xl bg-[#FF7800] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
      >
        Manage marketing
      </Link>

      <div className="grid gap-4 sm:grid-cols-3">
        {MARKETING_SECTION_KEYS.map((key) => (
          <Link
            key={key}
            href={`/dashboard/marketing/${key}`}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-[#FF7800]"
          >
            <h2 className="text-lg font-semibold text-white">
              {MARKETING_SECTION_LABELS[key]}
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Images & videos with audience targeting
            </p>
            <span className="mt-4 inline-block text-xs font-semibold text-[#FF7800]">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
