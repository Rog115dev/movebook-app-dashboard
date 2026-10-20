import { SectionTabs } from '@/components/SectionTabs';

const TABS = [
  { href: '/dashboard/feature/qualities', label: 'Qualities' },
  { href: '/dashboard/feature/details-features', label: 'Details features' },
  { href: '/dashboard/feature/testimonials', label: 'Testimonials' },
  { href: '/dashboard/feature/version-details', label: 'Version details' },
];

export default function FeatureSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <SectionTabs
        title="Feature"
        description="Features screen sections: qualities, unlock list, testimonials, and plans."
        tabs={TABS}
      />
      {children}
    </div>
  );
}
