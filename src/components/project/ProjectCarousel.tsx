"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useRef } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { FavoriteButton } from "@/components/project/FavoriteButton";
import { sortByNewest, sortByPopularity } from "@/lib/projectSort";

export type CarouselProject = {
  id: string;
  owner_id?: string | null;
  title?: string | null;
  short_description?: string | null;
  description?: string | null;
  cover_url?: string | null;
  created_at?: string | null;
  upvote_count?: number | null;
};

export type CarouselVariant = "popular" | "new";

const VARIANT_LIMIT: Record<CarouselVariant, number> = {
  popular: 10,
  new: 25,
};

const VARIANT_KEYS: Record<
  CarouselVariant,
  { tag: string; title: string; badge: string; empty: string }
> = {
  popular: {
    tag: "carousel.popularTag",
    title: "carousel.popularTitle",
    badge: "carousel.badgePopular",
    empty: "carousel.emptyPopular",
  },
  new: {
    tag: "carousel.newTag",
    title: "carousel.newTitle",
    badge: "carousel.badgeNew",
    empty: "carousel.emptyNew",
  },
};

/**
 * Reusable horizontal carousel for "most popular" (top 10 by upvotes) and
 * "new releases" (up to 25 by created_at desc) project sections. Accepts an
 * unsorted list and takes care of sorting/limiting, so callers can simply
 * pass whatever project set they already fetched.
 */
export function ProjectCarousel({
  variant,
  projects,
  limit,
}: {
  variant: CarouselVariant;
  projects: CarouselProject[];
  limit?: number;
}) {
  const { t } = useLocale();
  const carouselRef = useRef<HTMLUListElement>(null);
  const keys = VARIANT_KEYS[variant];
  const effectiveLimit = limit ?? VARIANT_LIMIT[variant];

  const items = useMemo(() => {
    const sorted = variant === "popular" ? sortByPopularity(projects) : sortByNewest(projects);
    return sorted.slice(0, effectiveLimit);
  }, [effectiveLimit, projects, variant]);

  function scroll(direction: 1 | -1) {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollBy({ left: direction * carousel.clientWidth, behavior: "smooth" });
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent">{t(keys.tag)}</p>
          <h2 className="mt-1 text-2xl font-semibold">{t(keys.title)}</h2>
        </div>
        {items.length > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={t("carousel.prev")}
              onClick={() => scroll(-1)}
              className="rounded-lg border border-white/10 p-2 text-zinc-300 transition hover:border-accent/50 hover:text-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={t("carousel.next")}
              onClick={() => scroll(1)}
              className="rounded-lg border border-white/10 p-2 text-zinc-300 transition hover:border-accent/50 hover:text-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
      {items.length ? (
        <ul
          ref={carouselRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]"
        >
          {items.map((project) => (
            <li
              key={project.id}
              className="w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-[31%] xl:w-[23%]"
            >
              <div className="relative h-full">
                <Link
                  href={`/projects/${project.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-800 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-panel"
                >
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-ink-950/85 px-2.5 py-1 text-xs font-semibold text-accent backdrop-blur">
                    {t(keys.badge)}
                  </span>
                  {project.cover_url ? (
                    <img
                      src={project.cover_url}
                      alt={project.title || t("carousel.untitled")}
                      className="aspect-video w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-ink-700 text-xs uppercase tracking-widest text-zinc-500">
                      {t("carousel.noCover")}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-1.5 p-4">
                    <h3 className="line-clamp-1 text-base font-medium text-white group-hover:text-accent">
                      {project.title || t("carousel.untitled")}
                    </h3>
                    <p className="line-clamp-2 text-sm text-zinc-400">
                      {project.short_description || project.description || t("carousel.noDescription")}
                    </p>
                  </div>
                </Link>
                <div className="absolute right-3 top-3 z-20">
                  <FavoriteButton projectId={project.id} ownerId={project.owner_id ?? undefined} compact />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-400">
          {t(keys.empty)}
        </p>
      )}
    </section>
  );
}