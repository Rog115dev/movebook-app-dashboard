import Link from 'next/link';
import { readSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

const SECTIONS = [
  {
    href: '/dashboard/colors',
    title: 'Colors',
    desc: 'Brand orange, backgrounds, borders',
  },
  {
    href: '/dashboard/home',
    title: 'Home content',
    desc: 'Titles, CTAs, confidence text',
  },
  {
    href: '/dashboard/faq',
    title: 'FAQ',
    desc: 'Questions and answers on TRAIN PRO',
  },
  {
    href: '/dashboard/languages',
    title: 'Languages',
    desc: 'Manual translations for 12 locales',
  },
  {
    href: '/dashboard/plans',
    title: 'Plans',
    desc: 'Free / Basic / Premium / Pro cards',
  },
  {
    href: '/dashboard/paywall',
    title: 'Paywall',
    desc: 'Offer tiers, discounts, trial copy',
  },
  {
    href: '/dashboard/train-pro',
    title: 'TRAIN PRO',
    desc: 'Stats, features, FAQ',
  },
  {
    href: '/dashboard/images',
    title: 'Images',
    desc: 'Hero, paywall, TRAIN PRO banners',
  },
];

export default async function DashboardPage() {
  const settings = await readSettings();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-3xl font-semibold text-white">Overview</h1>
        <p className="mt-2 text-zinc-400">
          Control the FitAI Coach mobile app content from one place. Changes are
          served at{' '}
          <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-[#FF7800]">
            /api/mobile-config
          </code>
          .
        </p>
      </header>

      <section className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Config version
          </p>
          <p className="mt-1 text-2xl font-semibold text-white">
            v{settings.version}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Last updated
          </p>
          <p className="mt-1 text-sm text-zinc-200">
            {new Date(settings.updatedAt).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Accent color
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className="h-6 w-6 rounded-full border border-zinc-700"
              style={{ background: settings.colors.orange }}
            />
            <span className="text-sm">{settings.colors.orange}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-[#FF7800]"
          >
            <h2 className="text-lg font-medium text-white">{item.title}</h2>
            <p className="mt-2 text-sm text-zinc-400">{item.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
