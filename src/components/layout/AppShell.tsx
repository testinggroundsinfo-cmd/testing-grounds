import { AdSlot } from "@/components/ads/AdSlot";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_180px]">
      <div>{children}</div>
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <AdSlot placement="sidebar" />
        </div>
      </div>
    </div>
  );
}
