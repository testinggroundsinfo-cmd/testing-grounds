import { AdSlot } from "@/components/ads/AdSlot";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdSlot placement="footer" />
        <p className="text-center text-xs leading-relaxed text-zinc-500">
          Testing-Grounds è gratuita. I banner sostengono i creatori del sito
          per garantire l&apos;hosting, il mantenimento e il continuo sviluppo
          della piattaforma.
        </p>
      </div>
    </footer>
  );
}
