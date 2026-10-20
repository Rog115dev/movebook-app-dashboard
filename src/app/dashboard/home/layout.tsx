import { SectionTabs } from '@/components/SectionTabs';

const TABS = [
  { href: '/dashboard/home/why-choose-me', label: 'Why choose me' },
  { href: '/dashboard/home/statistics', label: 'Statistics' },
  { href: '/dashboard/home/characteristics', label: 'Characteristics' },
  { href: '/dashboard/home/faq', label: 'FAQ' },
];

export default function HomeSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <SectionTabs
        title="Home"
        description="Home screen content blocks shown on the mobile app."
        tabs={TABS}
      />
      {children}
    </div>
  );
}
