import { SectionTabs } from '@/components/SectionTabs';

const TABS = [
  { href: '/dashboard/others/overview', label: 'Overview' },
  { href: '/dashboard/others/colors', label: 'Colors' },
  { href: '/dashboard/others/home-content', label: 'Home content' },
  { href: '/dashboard/others/languages', label: 'Languages' },
  { href: '/dashboard/others/paywall', label: 'Paywall' },
  { href: '/dashboard/others/discount', label: 'Discount' },
  { href: '/dashboard/others/train-pro', label: 'TRAIN PRO' },
  { href: '/dashboard/others/images', label: 'Images & video' },
];

export default function OthersSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl">
      <SectionTabs
        title="Others"
        description="Remaining settings not grouped under Home or Feature."
        tabs={TABS}
      />
      {children}
    </div>
  );
}
