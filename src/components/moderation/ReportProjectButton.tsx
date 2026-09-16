"use client";

import { Flag } from "lucide-react";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

type Props = {
  projectId: string;
  projectTitle: string;
};

export function ReportProjectButton({ projectId, projectTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("malware");
  const [details, setDetails] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const cleanReason = reason.trim();
    const cleanDetails = details.trim();

    if (!cleanDetails) {
      setMessage("Inserisci i dettagli della segnalazione.");
      setSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("project_reports").insert({
        project_id: projectId,
        user_id: user?.id || null,
        reason: cleanReason,
        details: cleanDetails,
      });
      if (error) throw error;
      setReason("malware");
      setDetails("");
      setMessage("Segnalazione inviata con successo!");
      window.setTimeout(() => setOpen(false), 700);
    } catch (error) {
      console.error("Submit Error:", error);
      setMessage(error instanceof Error ? error.message : "Invio segnalazione non riuscito.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMessage("");
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-full border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
      >
        <Flag className="h-3.5 w-3.5" />
        Segnala contenuto / sospetto malware
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-3 rounded-2xl border border-white/10 bg-ink-800 p-6"
          >
            <h3 className="text-lg font-medium">
              Segnala {projectTitle || "il progetto"}
            </h3>
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
            >
              <option value="malware">Sospetto malware</option>
              <option value="phishing">Phishing</option>
              <option value="copyright">Copyright</option>
              <option value="inappropriate">Contenuto inappropriato</option>
              <option value="spam">Spam</option>
            </select>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={4}
              placeholder="Dettagli"
              className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
            />
            <div className="flex items-center justify-between gap-2">
              {message ? <p className="text-sm text-zinc-300">{message}</p> : <span />}
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-zinc-400">
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? "Invio..." : "Invia segnalazione"}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
