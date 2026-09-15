export default function ProjectLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-8">
      <div className="h-5 w-36 rounded bg-white/10" />
      <div className="space-y-3">
        <div className="h-3 w-28 rounded bg-white/10" />
        <div className="h-10 w-2/3 rounded bg-white/10" />
        <div className="h-5 w-1/2 rounded bg-white/10" />
      </div>
      <div className="aspect-video rounded-2xl bg-white/10" />
      <div className="space-y-4 rounded-2xl border border-white/10 bg-ink-800 p-6">
        <div className="h-7 w-36 rounded bg-white/10" />
        <div className="h-4 w-full rounded bg-white/10" />
        <div className="h-4 w-5/6 rounded bg-white/10" />
        <div className="h-4 w-2/3 rounded bg-white/10" />
      </div>
    </div>
  );
}
