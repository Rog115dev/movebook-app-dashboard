import { SectionTabs } from '@/components/SectionTabs';

const TABS = [
  { href: '/dashboard/generals/overview', label: 'Overview' },
  { href: '/dashboard/generals/colors', label: 'Colors' },
  { href: '/dashboard/generals/home-content', label: 'Home content' },
  { href: '/dashboard/generals/languages', label: 'Languages' },
  { href: '/dashboard/generals/paywall', label: 'Paywall' },
  { href: '/dashboard/generals/discount', label: 'Discount' },
  { href: '/dashboard/generals/train-pro', label: 'TRAIN PRO' },
  { href: '/dashboard/generals/images', label: 'Images & video' },
];

export default function GeneralsSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl">
      <SectionTabs
        title="Generals"
        description="General settings not grouped under Home or Feature."
        tabs={TABS}
      />
      {children}
    </div>
  );
}
