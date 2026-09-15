"use client";

import Link from "next/link";
import { Loader2, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

type SearchProject = {
  id: string;
  title: string;
  cover_image_url: string | null;
  category: "gaming" | "software";
};

const supabase = createClient();

export function GlobalProjectSearch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      const [titleSearch, tagSearch, platformSearch] = await Promise.all([
        supabase
          .from("projects")
          .select("id, title, cover_image_url, category")
          .ilike("title", `%${trimmedQuery}%`)
          .eq("is_published", true)
          .limit(8),
        supabase
          .from("projects")
          .select("id, title, cover_image_url, category")
          .contains("tags", [trimmedQuery.toLowerCase()])
          .eq("is_published", true)
          .limit(8),
        supabase
          .from("projects")
          .select("id, title, cover_image_url, category")
          .contains("platforms", [trimmedQuery.toLowerCase()])
          .eq("is_published", true)
          .limit(8),
      ]);

      if (cancelled) return;

      const firstError = titleSearch.error ?? tagSearch.error ?? platformSearch.error;
      if (firstError) {
        setResults([]);
        setError("Impossibile cercare i progetti. Riprova tra poco.");
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
      }
      setLoading(false);
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [query]);

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
          placeholder="Cerca progetti..."
          aria-label="Cerca progetti per titolo, tag o piattaforma"
          className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            aria-label="Cancella ricerca"
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
              Ricerca in corso...
            </div>
          ) : error ? (
            <p className="px-4 py-4 text-sm text-red-300">{error}</p>
          ) : results.length > 0 ? (
            <ul
              id="global-project-search-results"
              role="listbox"
              className="max-h-80 overflow-y-auto py-1"
            >
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
                        project.cover_image_url
                          ? { backgroundImage: `url(${project.cover_image_url})` }
                          : undefined
                      }
                      aria-hidden
                    >
                      {!project.cover_image_url ? (
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
          ) : (
            <p className="px-4 py-4 text-sm text-zinc-400">
              Nessun progetto trovato.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
