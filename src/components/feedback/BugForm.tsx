"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { requireBrowserUser } from "@/lib/auth/ensure-profile";
import { FormAlert } from "@/components/ui/FormAlert";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { ProjectCategory } from "@/types/database";

export function BugForm({
  category,
  projectId,
}: {
  category: ProjectCategory;
  projectId: string;
}) {
  const { t } = useLocale();
  const isGame = category === "gaming";
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bugTitle, setBugTitle] = useState("");
  const [reproductionSteps, setReproductionSteps] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setStatus(null);
    const form = new FormData(event.currentTarget);
    const optionalText = (name: string) => String(form.get(name) ?? "").trim() || null;
    const optionalNumber = (name: string) => {
      const value = String(form.get(name) ?? "").trim();
      if (!value) return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };
    const cleanBugTitle = bugTitle.trim();
    const cleanReproductionSteps = reproductionSteps.trim();
    if (!cleanBugTitle && !cleanReproductionSteps) {
      setMessage(t("feedback.bug.emptyFieldsError"));
      setStatus("error");
      setSubmitting(false);
      return;
    }
    try {
      const supabase = createClient();
      const user = await requireBrowserUser(supabase);
      const cleanPayload = {
        project_id: projectId,
        title: cleanBugTitle || null,
        bug_type: optionalText("kind"),
        fps: isGame ? optionalNumber("avg_fps") : null,
        os: isGame ? optionalText("os_name") : null,
        gpu: isGame ? optionalText("gpu_name") : null,
        ram: isGame ? optionalNumber("ram_gb") : null,
        device: isGame
          ? null
          : [optionalText("device_name"), optionalText("browser_name")]
              .filter(Boolean)
              .join(" / ") || null,
        steps: cleanReproductionSteps || null,
        user_id: user.id,
      };
      const { error } = await supabase.from("project_bugs").insert(cleanPayload);
      if (error) {
        console.error("Errore Invio Bug:", error);
        setMessage(error.message || JSON.stringify(error));
        setStatus("error");
        return;
      }
      fetch(`/api/projects/${projectId}/bugs/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          title: cleanPayload.title,
          bug_type: cleanPayload.bug_type,
          steps: cleanPayload.steps,
          reporter_id: user.id,
        }),
      }).catch(() => {
        console.warn("Bug salvato, ma la notifica email non è stata consegnata.");
      });
      setBugTitle("");
      setReproductionSteps("");
      setMessage(t("feedback.bug.success"));
      setStatus("success");
    } catch (error) {
      console.error("Submit Error:", error);
      setMessage(error instanceof Error ? error.message : t("feedback.bug.failure"));
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-ink-800 p-6">
      <h2 className="text-lg font-medium">{t("feedback.bug.title")}</h2>
      <label className="block text-sm">
        {t("feedback.bug.titleField")}
        <input name="title" value={bugTitle} onChange={(event) => setBugTitle(event.target.value)} maxLength={120} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
      </label>
      <label className="block text-sm">
        {t("feedback.bug.type")}
        <select name="kind" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2">
          {isGame ? (
            <>
              <option value="crash">{t("feedback.bug.typeCrash")}</option>
              <option value="gameplay">{t("feedback.bug.typeGameplay")}</option>
              <option value="graphics">{t("feedback.bug.typeGraphics")}</option>
              <option value="audio">{t("feedback.bug.typeAudio")}</option>
              <option value="performance">{t("feedback.bug.typePerformance")}</option>
            </>
          ) : (
            <>
              <option value="ui_ux">{t("feedback.bug.typeUiUx")}</option>
              <option value="performance">{t("feedback.bug.typePerformance")}</option>
              <option value="crash">{t("feedback.bug.typeCrash")}</option>
              <option value="other">{t("feedback.bug.typeOther")}</option>
            </>
          )}
        </select>
      </label>
      {isGame ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            {t("feedback.bug.avgFps")}
            <input name="avg_fps" type="number" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
          </label>
          <label className="text-sm">
            {t("feedback.bug.os")}
            <input name="os_name" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
          </label>
          <label className="text-sm">
            {t("feedback.bug.gpu")}
            <input name="gpu_name" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
          </label>
          <label className="text-sm">
            {t("feedback.bug.ram")}
            <input name="ram_gb" type="number" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
          </label>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            {t("feedback.bug.device")}
            <input name="device_name" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
          </label>
          <label className="text-sm">
            {t("feedback.bug.browser")}
            <input name="browser_name" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
          </label>
        </div>
      )}
      <label className="block text-sm">
        {t("feedback.bug.steps")}
        <textarea name="steps" value={reproductionSteps} onChange={(event) => setReproductionSteps(event.target.value)} rows={5} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
      </label>
      <button disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitting ? t("feedback.bug.sending") : t("feedback.bug.submit")}
      </button>
      {message ? <FormAlert variant={status ?? "success"} message={message} /> : null}
    </form>
  );
}