"use client";

import { Download, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";

export function DownloadButton({
  projectId,
  href,
  isDownload,
  children,
}: {
  projectId: string;
  href: string;
  isDownload: boolean;
  children: React.ReactNode;
}) {
  function trackClick() {
    const supabase = createClient();
    // Fire-and-forget: never block or fail the actual download/navigation.
    void supabase.from("project_events").insert({ project_id: projectId, event_type: "download_click" });
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      download={isDownload ? true : undefined}
      onClick={trackClick}
      className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-accent-dim"
    >
      {isDownload ? <Download className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
      {children}
    </a>
  );
}
