import { DashboardSearch } from '@/components/DashboardSearch';
import { readSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function GeneralsOverviewPage() {
  const settings = await readSettings();

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold text-white">Overview</h2>
        <p className="mt-2 text-zinc-400">
          Config status and quick search. Use the sidebar menus and tabs to edit
          each section.
        </p>
      </header>

      <section className="rounded-2xl border border-[#FF7800]/40 bg-zinc-900/60 p-5">
        <h3 className="text-sm font-medium uppercase tracking-wide text-[#FF7800]">
          Find what to edit
        </h3>
        <p className="mt-1 text-sm text-zinc-400">
          Try “FAQ”, “orange”, “hero”, “why.resultsBody”, “paywall”, “images”…
        </p>
        <div className="mt-4">
          <DashboardSearch variant="hero" />
        </div>
      </section>

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
    </div>
  );
}
