"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { intlTags } from "@/i18n/config";

export type ProjectApplicationRow = {
  id: string;
  project_id: string | null;
  user_id: string | null;
  role: string | null;
  message: string | null;
  portfolio_url: string | null;
  status: string | null;
  created_at: string | null;
};

const statusStyles: Record<string, string> = {
  pending: "bg-white/10 text-zinc-300",
  accepted: "bg-emerald-500/15 text-emerald-300",
  rejected: "bg-red-500/15 text-red-300",
};

export function ApplicationsPanel({
  applications,
}: {
  applications: ProjectApplicationRow[];
}) {
  const { t, locale } = useLocale();
  const statusLabels: Record<string, string> = {
    pending: t("applicationStatus.pending"),
    accepted: t("applicationStatus.accepted"),
    rejected: t("applicationStatus.rejected"),
  };
  const [rows, setRows] = useState(applications);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function updateStatus(id: string, status: "accepted" | "rejected") {
    setPendingId(id);
    setError("");
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("project_applications")
        .update({ status })
        .eq("id", id);
      if (updateError) throw updateError;
      setRows((current) => current.map((row) => (row.id === id ? { ...row, status } : row)));
    } catch (updateError) {
      console.error("Errore aggiornamento candidatura:", updateError);
      setError(
        updateError instanceof Error
          ? updateError.message
          : t("dashboard.unableToUpdateApplication"),
      );
    } finally {
      setPendingId(null);
    }
  }

  if (!rows.length) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-400">
        {t("dashboard.noApplications")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
      <ul className="space-y-3">
        {rows.map((application) => {
          const status = application.status ?? "pending";
          return (
            <li
              key={application.id}
              className="rounded-xl border border-white/10 bg-ink-800 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">
                    {application.role || t("dashboard.roleUnspecified")}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {application.created_at
                      ? new Date(application.created_at).toLocaleString(intlTags[locale])
                      : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status] ?? statusStyles.pending}`}
                >
                  {statusLabels[status] ?? statusLabels.pending}
                </span>
              </div>
              {application.message ? (
                <p className="mt-2 text-sm text-zinc-300">{application.message}</p>
              ) : null}
              {application.portfolio_url ? (
                <a
                  href={application.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-accent underline"
                >
                  {t("dashboard.portfolioLink")}
                </a>
              ) : null}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={pendingId === application.id || status === "accepted"}
                  onClick={() => void updateStatus(application.id, "accepted")}
                  className="rounded-md border border-emerald-400/30 px-3 py-1.5 text-xs text-emerald-300 disabled:opacity-40"
                >
                  {t("dashboard.accept")}
                </button>
                <button
                  type="button"
                  disabled={pendingId === application.id || status === "rejected"}
                  onClick={() => void updateStatus(application.id, "rejected")}
                  className="rounded-md border border-red-400/30 px-3 py-1.5 text-xs text-red-300 disabled:opacity-40"
                >
                  {t("dashboard.reject")}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}