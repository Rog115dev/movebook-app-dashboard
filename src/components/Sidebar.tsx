'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const MAIN_MENUS = [
  { href: '/dashboard/home', label: 'Home' },
  { href: '/dashboard/feature', label: 'Feature' },
  { href: '/dashboard/features-titles', label: 'Features titles' },
  { href: '/dashboard/others', label: 'Others' },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800 px-5 py-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[#FF7800]">
          FitAI Coach
        </p>
        <h1 className="mt-1 text-lg font-semibold">App Settings</h1>
        <p className="mt-1 text-xs text-zinc-400">Mobile CMS dashboard</p>
        <p className="mt-2 text-[11px] text-zinc-500">
          Use <span className="text-[#FF7800]">Search</span> at the top to find
          any option to edit
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {MAIN_MENUS.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? 'bg-[#FF7800] font-medium text-black'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-800 p-3">
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-[#FF7800] hover:text-white"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
