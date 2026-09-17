"use client";

import Link from "next/link";
import { Loader2, Search, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useLocale } from "@/components/i18n/LocaleProvider";

type SearchProject = {
  id: string;
  title: string;
  cover_url: string | null;
  category: "gaming" | "software";
};

type SearchProfile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
};

export function GlobalProjectSearch() {
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProject[]>([]);
  const [profileResults, setProfileResults] = useState<SearchProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setResults([]);
      setProfileResults([]);
      setLoading(false);
      setError("");
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      const supabase = createClient();

      const [titleSearch, tagSearch, platformSearch, profileSearch] = await Promise.all([
        supabase
          .from("projects")
          .select("id, title, cover_url, category")
          .ilike("title", `%${trimmedQuery}%`)
          .eq("is_published", true)
          .limit(8),
        supabase
          .from("projects")
          .select("id, title, cover_url, category")
          .contains("tags", [trimmedQuery.toLowerCase()])
          .eq("is_published", true)
          .limit(8),
        supabase
          .from("projects")
          .select("id, title, cover_url, category")
          .contains("platforms", [trimmedQuery.toLowerCase()])
          .eq("is_published", true)
          .limit(8),
        supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .or(`username.ilike.%${trimmedQuery}%,full_name.ilike.%${trimmedQuery}%`)
          .limit(5),
      ]);

      if (cancelled) return;

      const firstError =
        titleSearch.error ?? tagSearch.error ?? platformSearch.error ?? profileSearch.error;
      if (firstError) {
        setResults([]);
        setProfileResults([]);
        setError(t("search.error"));
      } else {
        const merged = new Map<string, SearchProject>();
        for (const project of [
          ...(titleSearch.data ?? []),
          ...(tagSearch.data ?? []),
          ...(platformSearch.data ?? []),
        ]) {
          merged.set(project.id, project);
        }
        setResults(Array.from(merged.values()).slice(0, 8));
        setProfileResults((profileSearch.data ?? []) as SearchProfile[]);
      }
      setLoading(false);
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [query, t]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const showMenu = open && query.trim().length > 0;
  const hasResults = results.length > 0 || profileResults.length > 0;

  return (
    <div
      ref={containerRef}
      role="combobox"
      aria-controls="global-project-search-results"
      aria-expanded={showMenu}
      aria-haspopup="listbox"
      className="relative min-w-0 max-w-sm flex-1"
    >
      <div className="flex items-center rounded-lg border border-white/10 bg-ink-900/80 transition focus-within:border-accent/50">
        <Search className="ml-3 h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t("search.placeholder")}
          aria-label={t("search.ariaLabel")}
          className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            aria-label={t("search.clear")}
            className="mr-2 rounded p-0.5 text-zinc-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {showMenu ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-white/10 bg-ink-800 shadow-panel">
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-4 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("search.searching")}
            </div>
          ) : error ? (
            <p className="px-4 py-4 text-sm text-red-300">{error}</p>
          ) : hasResults ? (
            <div
              id="global-project-search-results"
              role="listbox"
              className="max-h-96 overflow-y-auto py-1"
            >
              {profileResults.length > 0 ? (
                <div>
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                    {t("search.creatorsHeading")}
                  </p>
                  <ul>
                    {profileResults.map((profile) => (
                      <li key={profile.id} role="option" aria-selected={false}>
                        <Link
                          href={`/profile/${profile.username}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-white/10"
                        >
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-ink-700 bg-cover bg-center text-zinc-500"
                            style={
                              profile.avatar_url
                                ? { backgroundImage: `url(${profile.avatar_url})` }
                                : undefined
                            }
                            aria-hidden
                          >
                            {!profile.avatar_url ? <UserRound className="h-4 w-4" /> : null}
                          </div>
                          <span className="min-w-0 truncate text-sm text-zinc-100">
                            {profile.full_name}
                            <span className="ml-1.5 text-xs text-zinc-500">@{profile.username}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {results.length > 0 ? (
                <div>
                  {profileResults.length > 0 ? (
                    <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                      {t("search.projectsHeading")}
                    </p>
                  ) : null}
                  <ul>
                    {results.map((project) => (
                      <li key={project.id} role="option" aria-selected={false}>
                        <Link
                          href={`/projects/${project.id}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-white/10"
                        >
                          <div
                            className="h-11 w-14 shrink-0 rounded-md border border-white/10 bg-ink-700 bg-cover bg-center"
                            style={
                              project.cover_url
                                ? { backgroundImage: `url(${project.cover_url})` }
                                : undefined
                            }
                            aria-hidden
                          >
                            {!project.cover_url ? (
                              <span className="flex h-full items-center justify-center text-[9px] uppercase text-zinc-500">
                                {project.category}
                              </span>
                            ) : null}
                          </div>
                          <span className="truncate text-sm text-zinc-100">
                            {project.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="px-4 py-4 text-sm text-zinc-400">
              {t("search.noResults")}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
