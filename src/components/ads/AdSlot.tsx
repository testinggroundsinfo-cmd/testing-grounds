type AdSlotProps = {
  placement: "sidebar" | "footer";
  className?: string;
};

export function AdSlot({ placement, className = "" }: AdSlotProps) {
  const isSidebar = placement === "sidebar";

  return (
    <aside
      className={`relative ad-slot advertisement adsbygoogle flex items-center justify-center border border-dashed border-white/10 bg-ink-800/60 text-xs uppercase tracking-widest text-zinc-500 ${
        isSidebar ? "min-h-[280px] rounded-xl p-4" : "min-h-[90px] w-full rounded-lg p-3"
      } ${className} ${isSidebar ? "mb-12" : "mb-10"}`}
      aria-label="Spazio pubblicitario"
    >
      <span>Pubblicità · {isSidebar ? "160×600" : "728×90"}</span>
      <p className="absolute left-3 right-3 top-full mt-2 text-center text-[10px] normal-case leading-relaxed tracking-normal text-zinc-500">
        Testing-Grounds è gratuita. I banner sostengono i creatori del sito
        per garantire l&apos;hosting, il mantenimento e il continuo sviluppo
        della piattaforma.
      </p>
    </aside>
  );
}
