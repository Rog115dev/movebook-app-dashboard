import { SectionTabs } from '@/components/SectionTabs';

const TABS = [
  { href: '/dashboard/marketing', label: 'Overview' },
  { href: '/dashboard/marketing/avatars', label: 'Avatars' },
  { href: '/dashboard/marketing/reels', label: 'Reels' },
  { href: '/dashboard/marketing/checks', label: 'Checks' },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl">
      <SectionTabs
        title="Marketing"
        description="Manage marketing media for Avatars, Reels, and Checks."
        tabs={TABS}
      />
      {children}
    </div>
  );
}
