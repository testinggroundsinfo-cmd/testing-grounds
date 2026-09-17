"use client";

import Link from "next/link";
import { ArrowRight, Download, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import type { PlatformKind } from "@/types/database";
import { AdBanner } from "@/components/ads/AdBanner";
import { useLocale } from "@/components/i18n/LocaleProvider";

export type SoftwareProject = {
  id: string;
  title?: string | null;
  short_description?: string | null;
  description?: string | null;
  platforms?: PlatformKind[] | null;
  tags?: string[] | null;
  cover_url?: string | null;
  created_at?: string | null;
  development_status?: string | null;
};

type Filter = "Tutti" | "Dev Tools" | "Utility" | "Open Source" | "Productivity" | "AI & Data";

const filters: Filter[] = ["Tutti", "Dev Tools", "Utility", "Open Source", "Productivity", "AI & Data"];

const filterKeys: Record<Filter, string> = {
  Tutti: "filter.all",
  "Dev Tools": "filter.devTools",
  Utility: "filter.utility",
  "Open Source": "filter.openSource",
  Productivity: "filter.productivity",
  "AI & Data": "filter.aiData",
};

const platformKeys: Record<PlatformKind, string> = {
  pc: "platform.pc", mobile: "platform.mobile", webgl: "platform.webgl", console: "platform.console",
  web_saas: "platform.webSaas", mobile_ios: "platform.mobileIos", mobile_android: "platform.mobileAndroid",
  desktop: "platform.desktop", browser_extension: "platform.browserExtension",
};

function getCategory(project: SoftwareProject): Exclude<Filter, "Tutti"> {
  const values = (project.tags ?? []).join(" ").toLowerCase();
  if (values.includes("open source") || values.includes("opensource")) return "Open Source";
  if (values.includes("ai") || values.includes("data")) return "AI & Data";
  if (values.includes("productivity")) return "Productivity";
  if (values.includes("dev") || values.includes("developer")) return "Dev Tools";
  return "Utility";
}

type SortOrder = "newest" | "oldest";

export function SoftwareHubClient({ projects }: { projects: SoftwareProject[] }) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("Tutti");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const visible = useMemo(() => projects.filter((project) => {
    const searchable = `${project.title ?? ""} ${project.description ?? ""} ${(project.tags ?? []).join(" ")} ${(project.platforms ?? [])
      .map((platform) => platform)
      .join(" ")}`.toLowerCase();
    const matchesQuery = !query.trim() || searchable.includes(query.trim().toLowerCase());
    return matchesQuery && (filter === "Tutti" || getCategory(project) === filter);
  }).sort((a, b) => {
    const dateA = a.created_at ?? "";
    const dateB = b.created_at ?? "";
    return sortOrder === "newest" ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
  }), [filter, projects, query, sortOrder]);

  function Card({ project, badge }: { project: SoftwareProject; badge: "Trending" | "Popolare" | "Novità" }) {
    return (
      <li>
        <Link href={`/projects/${project.id}`} className="group relative block h-full overflow-hidden rounded-2xl border border-white/10 bg-ink-800 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-panel">
          <span className="absolute left-3 top-3 z-10 rounded-full bg-ink-950/85 px-2.5 py-1 text-xs font-semibold text-accent backdrop-blur">
            {badge === "Trending" ? t("software.hub.badgeTrending") : badge === "Novità" ? t("software.hub.badgeNew") : t("software.hub.badgePopular")}
          </span>
          <div className="aspect-video bg-ink-700 bg-cover bg-center" style={project.cover_url ? { backgroundImage: `url(${project.cover_url})` } : undefined}>
            {!project.cover_url ? <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-zinc-500">Software</div> : null}
          </div>
          <div className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-xs uppercase tracking-widest text-zinc-500">{t(filterKeys[getCategory(project)])}</p><h3 className="mt-1 text-lg font-medium text-white group-hover:text-accent">{project.title || t("software.hub.untitled")}</h3></div>
              <ArrowRight className="h-5 w-5 shrink-0 text-zinc-500 group-hover:text-accent" />
            </div>
            <p className="line-clamp-2 text-sm text-zinc-400">{project.short_description || project.description || t("software.hub.noDescription")}</p>
            <div className="flex flex-wrap gap-1.5">
              {(project.platforms ?? []).map((platform) => <span key={platform} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-zinc-300">{platformKeys[platform] ? t(platformKeys[platform]) : platform}</span>)}
              {(project.tags ?? []).slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-accent-glow px-2.5 py-1 text-xs text-accent">#{tag}</span>)}
            </div>
            <div className="flex items-center gap-4 border-t border-white/10 pt-3 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1"><Download className="h-3.5 w-3.5" />{t("software.hub.community")}</span>
              <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-accent" />{t("software.hub.indie")}</span>
              <span>{project.development_status || t("software.hub.release")}</span>
            </div>
          </div>
        </Link>
      </li>
    );
  }

  const empty = (
    <p className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-400">
      {filter === "Tutti" ? t("software.hub.emptyAll") : t("software.hub.emptyFiltered")}
    </p>
  );
  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/15 via-ink-800 to-ink-900 p-6 shadow-panel sm:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">{t("software.hub.tag")}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{t("software.hub.title")}</h1>
        <p className="mt-3 max-w-2xl text-zinc-300">{t("software.hub.subtitle")}</p>
        <Link href="/dashboard/projects/new?type=software" className="mt-6 inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 hover:bg-accent-dim">{t("software.hub.publish")}</Link>
      </header>
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("software.hub.searchPlaceholder")} aria-label={t("software.hub.searchLabel")} className="w-full rounded-lg border border-white/10 bg-ink-900 py-2 pl-10 pr-3 text-sm outline-none focus:border-accent/50" /></div>
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            {t("gaming.hub.sortBy")}
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)} className="rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-accent/50">
              <option value="newest">{t("gaming.hub.sortNewest")}</option>
              <option value="oldest">{t("gaming.hub.sortOldest")}</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">{filters.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-xs ${filter === item ? "bg-accent text-ink-950" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`}>{t(filterKeys[item])}</button>)}</div>
      </section>
      <section className="space-y-4">
        <div><p className="text-xs uppercase tracking-widest text-accent">{t("software.hub.catalogTag")}</p><h2 className="mt-1 text-2xl font-semibold">{t("software.hub.catalogTitle")}</h2></div>
        {visible.length ? <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">{visible.map((project, index) => <Card key={project.id} project={project} badge={index < 3 ? "Trending" : index === 3 ? "Novità" : "Popolare"} />)}</ul> : empty}
      </section>
      <section className="space-y-4">
        <AdBanner format="horizontal" slotId="software-hub-mid" />
      </section>
    </div>
  );
}