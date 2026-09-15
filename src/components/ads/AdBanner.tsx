import { AdSlot } from "@/components/ads/AdSlot";

export function AdBanner({
  format,
  slotId,
}: {
  format: "horizontal";
  slotId: string;
}) {
  return (
    <AdSlot
      placement="footer"
      className="mb-0 min-h-[100px]"
      aria-label={`Banner pubblicitario ${slotId}`}
    />
  );
}
