"use client";

import { Flag } from "lucide-react";
import { useState } from "react";

export function ReportProjectButton({ projectSlug }: { projectSlug: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
      >
        <Flag className="h-3.5 w-3.5" />
        Segnala contenuto / sospetto malware
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form className="w-full max-w-md space-y-3 rounded-2xl border border-white/10 bg-ink-800 p-6">
            <h3 className="text-lg font-medium">Segnala {projectSlug}</h3>
            <select className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm">
              <option>Sospetto malware</option>
              <option>Phishing</option>
              <option>Copyright</option>
              <option>Contenuto inappropriato</option>
              <option>Spam</option>
            </select>
            <textarea
              rows={4}
              placeholder="Dettagli"
              className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-zinc-400">
                Annulla
              </button>
              <button type="button" className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white">
                Invia segnalazione
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
