"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import type { ProjectCategory } from "@/types/database";

export function BugForm({
  category,
  projectId,
}: {
  category: ProjectCategory;
  projectId: string;
}) {
  const isGame = category === "gaming";
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bugTitle, setBugTitle] = useState("");
  const [reproductionSteps, setReproductionSteps] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const cleanBugTitle = bugTitle.trim();
    const cleanReproductionSteps = reproductionSteps.trim();
    if (!cleanBugTitle && !cleanReproductionSteps) {
      setMessage("Compila almeno un campo prima di inviare.");
      setSubmitting(false);
      return;
    }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const cleanPayload = {
        project_id: projectId,
        title: cleanBugTitle || null,
        bug_type: String(form.get("kind") || "").trim() || null,
        fps: form.get("avg_fps") ? Number(form.get("avg_fps")) : null,
        os: String(form.get("os_name") ?? "").trim() || null,
        gpu: String(form.get("gpu_name") ?? "").trim() || null,
        ram: form.get("ram_gb") ? Number(form.get("ram_gb")) : null,
        steps: cleanReproductionSteps || null,
        user_id: user?.id || null,
      };
      const { error } = await supabase.from("project_bugs").insert(cleanPayload);
      if (error) {
        console.error("Errore Invio Bug:", error);
        setMessage(error.message || JSON.stringify(error));
        return;
      }
      setBugTitle("");
      setReproductionSteps("");
      setMessage("Report inviato.");
    } catch (error) {
      console.error("Submit Error:", error);
      setMessage(error instanceof Error ? error.message : "Invio non riuscito.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-ink-800 p-6">
      <h2 className="text-lg font-medium">Segnala un bug</h2>
      <label className="block text-sm">
        Titolo
        <input name="title" value={bugTitle} onChange={(event) => setBugTitle(event.target.value)} maxLength={120} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
      </label>
      <label className="block text-sm">
        Tipo
        <select name="kind" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2">
          {isGame ? (
            <>
              <option value="crash">Crash</option>
              <option value="gameplay">Gameplay</option>
              <option value="graphics">Grafica</option>
              <option value="audio">Audio</option>
              <option value="performance">Performance</option>
            </>
          ) : (
            <>
              <option value="ui_ux">UI/UX</option>
              <option value="performance">Performance</option>
              <option value="crash">Crash</option>
              <option value="other">Altro</option>
            </>
          )}
        </select>
      </label>
      {isGame ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            FPS medi
            <input name="avg_fps" type="number" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
          </label>
          <label className="text-sm">
            OS
            <input name="os_name" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
          </label>
          <label className="text-sm">
            GPU
            <input name="gpu_name" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
          </label>
          <label className="text-sm">
            RAM (GB)
            <input name="ram_gb" type="number" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
          </label>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Dispositivo
            <input name="device_name" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
          </label>
          <label className="text-sm">
            Browser
            <input name="browser_name" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
          </label>
        </div>
      )}
      <label className="block text-sm">
        Passaggi per riprodurlo
        <textarea name="steps" value={reproductionSteps} onChange={(event) => setReproductionSteps(event.target.value)} rows={5} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
      </label>
      <button disabled={submitting} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50">
        {submitting ? "Invio..." : "Invia report"}
      </button>
      {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
    </form>
  );
}
