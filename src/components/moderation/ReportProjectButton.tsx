"use client";

import { Flag } from "lucide-react";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useLocale } from "@/components/i18n/LocaleProvider";

type Props = {
  projectId: string;
  projectTitle: string;
};

export function ReportProjectButton({ projectId, projectTitle }: Props) {
  const { t } = useLocale();
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
      setMessage(t("moderation.report.detailsRequired"));
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
      setMessage(t("moderation.report.success"));
      window.setTimeout(() => setOpen(false), 700);
    } catch (error) {
      console.error("Submit Error:", error);
      setMessage(error instanceof Error ? error.message : t("moderation.report.failure"));
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
        {t("moderation.report.button")}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-3 rounded-2xl border border-white/10 bg-ink-800 p-6"
          >
            <h3 className="text-lg font-medium">
              {t("moderation.report.title", { title: projectTitle || t("moderation.report.projectFallback") })}
            </h3>
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
            >
              <option value="malware">{t("moderation.report.reasonMalware")}</option>
              <option value="phishing">{t("moderation.report.reasonPhishing")}</option>
              <option value="copyright">{t("moderation.report.reasonCopyright")}</option>
              <option value="inappropriate">{t("moderation.report.reasonInappropriate")}</option>
              <option value="spam">{t("moderation.report.reasonSpam")}</option>
            </select>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={4}
              placeholder={t("moderation.report.detailsPlaceholder")}
              className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
            />
            <div className="flex items-center justify-between gap-2">
              {message ? <p className="text-sm text-zinc-300">{message}</p> : <span />}
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-zinc-400">
                  {t("moderation.report.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? t("moderation.report.sending") : t("moderation.report.submit")}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}