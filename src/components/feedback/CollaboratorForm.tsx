"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { requireBrowserUser } from "@/lib/auth/ensure-profile";
import { createClient } from "@/lib/supabaseClient";
import { FormAlert } from "@/components/ui/FormAlert";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function CollaboratorForm({ projectId }: { projectId: string }) {
  const { t } = useLocale();
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
      setMessage(t("feedback.collab.emptyFieldsError"));
      setStatus("error");
      setSubmitting(false);
      return;
    }
    try {
      const supabase = createClient();
      const user = await requireBrowserUser(supabase);
      const cleanPayload = {
        project_id: projectId,
        user_id: user.id,
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
      setMessage(t("feedback.collab.success"));
      setStatus("success");
    } catch (error) {
      console.error("Submit Error:", error);
      setMessage(error instanceof Error ? error.message : t("feedback.collab.failure"));
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-ink-800 p-6">
      <h2 className="text-lg font-medium">{t("feedback.collab.title")}</h2>
      <p className="text-sm text-zinc-400">
        {t("feedback.collab.subtitle")}
      </p>
      <label className="block text-sm">
        {t("feedback.collab.role")}
        <select name="role" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2">
          <option value="game_design">{t("feedback.collab.roleGameDesign")}</option>
          <option value="qa_tester">{t("feedback.collab.roleQaTester")}</option>
          <option value="translations">{t("feedback.collab.roleTranslations")}</option>
          <option value="development">{t("feedback.collab.roleDevelopment")}</option>
          <option value="community">{t("feedback.collab.roleCommunity")}</option>
          <option value="art">{t("feedback.collab.roleArt")}</option>
          <option value="other">{t("feedback.collab.roleOther")}</option>
        </select>
      </label>
      <label className="block text-sm">
        {t("feedback.collab.message")}
        <textarea name="message" value={applicationMessage} onChange={(event) => setApplicationMessage(event.target.value)} maxLength={2000} rows={5} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
      </label>
      <label className="block text-sm">
        {t("feedback.collab.portfolio")}
        <input name="portfolio_url" value={portfolioUrl} onChange={(event) => setPortfolioUrl(event.target.value)} type="url" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
      </label>
      <button disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitting ? t("feedback.collab.sending") : t("feedback.collab.submit")}
      </button>
      {message ? <FormAlert variant={status ?? "success"} message={message} /> : null}
    </form>
  );
}