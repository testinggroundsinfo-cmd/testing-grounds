"use client";

import { FormEvent, useState } from "react";
import { ensureProfile, requireBrowserUser } from "@/lib/auth/ensure-profile";
import { createClient } from "@/lib/supabaseClient";

export function CollaboratorForm({ projectId }: { projectId: string }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const applicationMessage = String(form.get("message") ?? "").trim();
    const portfolioUrl = String(form.get("portfolio_url") ?? "").trim();
    if (!applicationMessage && !portfolioUrl) {
      setMessage("Compila almeno un campo prima di inviare.");
      setSubmitting(false);
      return;
    }
    try {
      const supabase = createClient();
      const user = await requireBrowserUser(supabase);
      await ensureProfile(supabase, user);
      const { error } = await supabase.from("collaborator_applications").insert({
        project_id: projectId,
        applicant_id: user.id,
        role: String(form.get("role") || "other") as never,
        message: applicationMessage,
        portfolio_url: portfolioUrl || null,
      });
      if (error) throw error;
      event.currentTarget.reset();
      setMessage("Candidatura inviata.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Invio non riuscito.");
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
        <textarea name="message" maxLength={2000} rows={5} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
      </label>
      <label className="block text-sm">
        Portfolio / link
        <input name="portfolio_url" type="url" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
      </label>
      <button disabled={submitting} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50">
        {submitting ? "Invio..." : "Invia candidatura"}
      </button>
      {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
    </form>
  );
}
