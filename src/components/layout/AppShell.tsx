import { AdSlot } from "@/components/ads/AdSlot";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_336px]">
      <div>{children}</div>
      <div className="order-last flex justify-center lg:order-none lg:block">
        <div className="lg:sticky lg:top-24">
          <AdSlot placement="sidebar" />
        </div>
      </div>
    </div>
  );
}
