import { DashboardSearch } from '@/components/DashboardSearch';
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 px-6 py-3 backdrop-blur md:px-10">
          <DashboardSearch variant="bar" />
        </header>
        <main className="flex-1 overflow-auto px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
