"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { ensureProfile } from "@/lib/auth/ensure-profile";
import { createClient } from "@/lib/supabaseClient";
import { FormAlert } from "@/components/ui/FormAlert";

export function CollaboratorForm({ projectId }: { projectId: string }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setStatus(null);
    const form = new FormData(event.currentTarget);
    const cleanApplicationMessage = applicationMessage.trim();
    const cleanPortfolioUrl = portfolioUrl.trim();
    if (!cleanApplicationMessage && !cleanPortfolioUrl) {
      setMessage("Compila almeno un campo prima di inviare.");
      setStatus("error");
      setSubmitting(false);
      return;
    }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await ensureProfile(supabase, user);
      const cleanPayload = {
        project_id: projectId,
        user_id: user?.id ?? null,
        role: String(form.get("role") || "other").trim() || "other",
        message: cleanApplicationMessage || null,
        portfolio_url: cleanPortfolioUrl || null,
      };
      const { error } = await supabase.from("project_applications").insert(cleanPayload);
      if (error) {
        console.error("Errore Supabase:", error);
        throw error;
      }
      const notificationResponse = await fetch(
        `/api/projects/${projectId}/applications/notify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: projectId,
            role: cleanPayload.role,
            message: cleanPayload.message,
            portfolio_url: cleanPayload.portfolio_url,
            applicant_id: cleanPayload.user_id,
          }),
        },
      );
      if (!notificationResponse.ok) {
        console.warn("Candidatura salvata, ma la notifica non è stata consegnata.");
      }
      setApplicationMessage("");
      setPortfolioUrl("");
      setMessage("Candidatura inviata, lo sviluppatore la riceverà in dashboard.");
      setStatus("success");
    } catch (error) {
      console.error("Submit Error:", error);
      setMessage(error instanceof Error ? error.message : "Invio non riuscito.");
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-ink-800 p-6">
      <h2 className="text-lg font-medium">Candidati come collaboratore</h2>
      <p className="text-sm text-zinc-400">
        Il messaggio arriva allo sviluppatore nella dashboard riservata.
      </p>
      <label className="block text-sm">
        Ruolo
        <select name="role" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2">
          <option value="game_design">Game Design</option>
          <option value="qa_tester">QA Tester</option>
          <option value="translations">Traduzioni</option>
          <option value="development">Sviluppo</option>
          <option value="community">Community</option>
          <option value="art">Art</option>
          <option value="other">Altro</option>
        </select>
      </label>
      <label className="block text-sm">
        Messaggio
        <textarea name="message" value={applicationMessage} onChange={(event) => setApplicationMessage(event.target.value)} maxLength={2000} rows={5} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
      </label>
      <label className="block text-sm">
        Portfolio / link
        <input name="portfolio_url" value={portfolioUrl} onChange={(event) => setPortfolioUrl(event.target.value)} type="url" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
      </label>
      <button disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitting ? "Invio in corso..." : "Invia candidatura"}
      </button>
      {message ? <FormAlert variant={status ?? "success"} message={message} /> : null}
    </form>
  );
}
