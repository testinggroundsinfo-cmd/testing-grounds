import { Download, Eye } from "lucide-react";
import { T } from "@/components/i18n/T";

export function ProjectAnalytics({
  totalViews,
  totalDownloadClicks,
  views30d,
  downloadClicks30d,
}: {
  totalViews: number;
  totalDownloadClicks: number;
  views30d: number;
  downloadClicks30d: number;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-medium"><T k="analytics.title" /></h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-ink-800 p-4">
          <p className="inline-flex items-center gap-2 text-sm text-zinc-400">
            <Eye className="h-4 w-4" /> <T k="analytics.views" />
          </p>
          <p className="mt-2 text-2xl font-semibold">{totalViews}</p>
          <p className="mt-1 text-xs text-zinc-500"><T k="analytics.last30Days" params={{ count: views30d }} /></p>
        </div>
        <div className="rounded-xl border border-white/10 bg-ink-800 p-4">
          <p className="inline-flex items-center gap-2 text-sm text-zinc-400">
            <Download className="h-4 w-4" /> <T k="analytics.downloadClicks" />
          </p>
          <p className="mt-2 text-2xl font-semibold">{totalDownloadClicks}</p>
          <p className="mt-1 text-xs text-zinc-500"><T k="analytics.last30Days" params={{ count: downloadClicks30d }} /></p>
        </div>
      </div>
    </section>
  );
}
