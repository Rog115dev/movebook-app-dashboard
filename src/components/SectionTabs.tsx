'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type SectionTab = {
  href: string;
  label: string;
};

type Props = {
  title: string;
  description?: string;
  tabs: SectionTab[];
};

export function SectionTabs({ title, description, tabs }: Props) {
  const pathname = usePathname();

  return (
    <div className="mb-8 border-b border-zinc-800 pb-4">
      <h1 className="text-3xl font-semibold text-white">{title}</h1>
      {description ? (
        <p className="mt-2 text-sm text-zinc-400">{description}</p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-lg px-3.5 py-2 text-sm transition ${
                active
                  ? 'bg-[#FF7800] font-medium text-black'
                  : 'border border-zinc-700 text-zinc-300 hover:border-[#FF7800] hover:text-white'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
