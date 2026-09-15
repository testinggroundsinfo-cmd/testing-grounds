import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

export default function HomePage() {
  return (
    <AppShell>
      <section className="max-w-3xl space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-accent">MVP</p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Beta testing e playtest per giochi indie e software.
        </h1>
        <p className="text-zinc-400">
          Scopri build in Alpha, Closed Beta e Playtest. Lascia bug report
          strutturati, recensioni e candidati come collaboratore.
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            href="/gaming"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950"
          >
            Esplora Gaming
          </Link>
          <Link
            href="/software"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white"
          >
            Esplora App
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
