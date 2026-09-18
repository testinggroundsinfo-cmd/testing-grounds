export function ProjectCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-800">
      <div className="aspect-video animate-pulse bg-ink-700" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-full animate-pulse rounded bg-white/10" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

export function ProjectCarouselSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <section className="space-y-4" aria-label="Loading projects" aria-busy="true">
      <div className="space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-accent/20" />
        <div className="h-7 w-52 animate-pulse rounded bg-white/10" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className="w-[78%] shrink-0 sm:w-[45%] lg:w-[31%] xl:w-[23%]">
            <ProjectCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProjectCatalogSkeleton() {
  return (
    <div className="space-y-10">
      <ProjectCarouselSkeleton />
      <ProjectCarouselSkeleton />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => <ProjectCardSkeleton key={index} />)}
      </div>
    </div>
  );
}
