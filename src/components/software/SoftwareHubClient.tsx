"use client";

import Link from "next/link";
import { ArrowRight, Download, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import type { PlatformKind } from "@/types/database";
import { AdBanner } from "@/components/ads/AdBanner";

export type SoftwareProject = {
  id: string;
  title?: string | null;
  short_pitch?: string | null;
  platforms?: PlatformKind[] | null;
  tags?: string[] | null;
  cover_image_url?: string | null;
  report_count?: number | null;
  created_at?: string | null;
  development_status?: string | null;
};

type Filter = "Tutti" | "Dev Tools" | "Utility" | "Open Source" | "Productivity" | "AI & Data";

const filters: Filter[] = ["Tutti", "Dev Tools", "Utility", "Open Source", "Productivity", "AI & Data"];

const platformLabels: Record<PlatformKind, string> = {
  pc: "PC", mobile: "Mobile", webgl: "WebGL", console: "Console",
  web_saas: "Web / SaaS", mobile_ios: "iOS", mobile_android: "Android",
  desktop: "Desktop", browser_extension: "Browser extension",
};

function getCategory(project: SoftwareProject): Exclude<Filter, "Tutti"> {
  const values = (project.tags ?? []).join(" ").toLowerCase();
  if (values.includes("open source") || values.includes("opensource")) return "Open Source";
  if (values.includes("ai") || values.includes("data")) return "AI & Data";
  if (values.includes("productivity")) return "Productivity";
  if (values.includes("dev") || values.includes("developer")) return "Dev Tools";
  return "Utility";
}

export function SoftwareHubClient({ projects }: { projects: SoftwareProject[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("Tutti");
  const visible = useMemo(() => projects.filter((project) => {
    const matchesQuery = !query.trim() ||
      `${project.title ?? ""} ${project.short_pitch ?? ""} ${(project.tags ?? []).join(" ")}`
        .toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (filter === "Tutti" || getCategory(project) === filter);
  }), [filter, projects, query]);
  const popular = [...visible].sort((a, b) => (b.report_count ?? 0) - (a.report_count ?? 0)).slice(0, 6);
  const recent = [...visible].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")).slice(0, 6);

  function Card({ project, badge }: { project: SoftwareProject; badge: "Trending" | "Popolare" | "Novità" }) {
    const interactions = project.report_count ?? 0;
    return (
      <li>
        <Link href={`/projects/${project.id}`} className="group relative block h-full overflow-hidden rounded-2xl border border-white/10 bg-ink-800 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-panel">
          <span className="absolute left-3 top-3 z-10 rounded-full bg-ink-950/85 px-2.5 py-1 text-xs font-semibold text-accent backdrop-blur">
            {badge === "Trending" ? "🔥 Trending" : badge === "Novità" ? "🆕 Novità" : "★ Popolare"}
          </span>
          <div className="aspect-video bg-ink-700 bg-cover bg-center" style={project.cover_image_url ? { backgroundImage: `url(${project.cover_image_url})` } : undefined}>
            {!project.cover_image_url ? <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-zinc-500">Software</div> : null}
          </div>
          <div className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-xs uppercase tracking-widest text-zinc-500">{getCategory(project)}</p><h3 className="mt-1 text-lg font-medium text-white group-hover:text-accent">{project.title || "Software senza titolo"}</h3></div>
              <ArrowRight className="h-5 w-5 shrink-0 text-zinc-500 group-hover:text-accent" />
            </div>
            <p className="line-clamp-2 text-sm text-zinc-400">{project.short_pitch || "Nessuna descrizione disponibile."}</p>
            <div className="flex flex-wrap gap-1.5">
              {(project.platforms ?? []).map((platform) => <span key={platform} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-zinc-300">{platformLabels[platform] ?? platform}</span>)}
              {(project.tags ?? []).slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-accent-glow px-2.5 py-1 text-xs text-accent">#{tag}</span>)}
            </div>
            <div className="flex items-center gap-4 border-t border-white/10 pt-3 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1"><Download className="h-3.5 w-3.5" />{interactions} download</span>
              <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-accent" />{Math.min(5, 3 + interactions / 10).toFixed(1)}</span>
              <span>{project.development_status || "Release"}</span>
            </div>
          </div>
        </Link>
      </li>
    );
  }

  const empty = <p className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-400">Nessun software corrisponde ai filtri selezionati.</p>;
  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/15 via-ink-800 to-ink-900 p-6 shadow-panel sm:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Creator hub</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Strumenti migliori, idee più veloci.</h1>
        <p className="mt-3 max-w-2xl text-zinc-300">Scopri utility, dev tools e software creati da sviluppatori indipendenti.</p>
        <Link href="/dashboard/projects/new?type=software" className="mt-6 inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 hover:bg-accent-dim">Pubblica il tuo Software</Link>
      </header>
      <section className="space-y-4">
        <div className="relative max-w-md"><Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca software..." aria-label="Cerca software" className="w-full rounded-lg border border-white/10 bg-ink-900 py-2 pl-10 pr-3 text-sm outline-none focus:border-accent/50" /></div>
        <div className="flex flex-wrap gap-2">{filters.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-xs ${filter === item ? "bg-accent text-ink-950" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`}>{item}</button>)}</div>
      </section>
      <section className="space-y-4">
        <div><p className="text-xs uppercase tracking-widest text-accent">🔥 Software Più Popolari</p><h2 className="mt-1 text-2xl font-semibold">In evidenza</h2></div>
        {popular.length ? <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">{popular.map((project, index) => <Card key={project.id} project={project} badge={index < 3 ? "Trending" : "Popolare"} />)}</ul> : empty}
      </section>
      <section className="space-y-4">
        <AdBanner format="horizontal" slotId="software-hub-mid" />
        <div><p className="text-xs uppercase tracking-widest text-accent">🆕 Nuove Uscite / Più Recenti</p><h2 className="mt-1 text-2xl font-semibold">Appena pubblicati</h2></div>
        {recent.length ? <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">{recent.map((project) => <Card key={project.id} project={project} badge="Novità" />)}</ul> : empty}
      </section>
    </div>
  );
}
