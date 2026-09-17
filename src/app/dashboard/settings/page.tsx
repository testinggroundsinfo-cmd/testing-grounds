"use client";

import Link from "next/link";
import ProfileSettingsForm from "@/components/dashboard/ProfileSettingsForm";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function DashboardSettingsPage() {
  const { t } = useLocale();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/dashboard" className="inline-flex text-sm text-accent">{t("dashboard.backToProjectsPlain")}</Link>
      <header>
        <p className="text-xs uppercase tracking-widest text-accent">{t("dashboard.devDashboard")}</p>
        <h1 className="mt-2 text-3xl font-semibold">{t("dashboard.profileSettingsTitle")}</h1>
        <p className="mt-2 text-sm text-zinc-400">{t("dashboard.profileSettingsSubtitle")}</p>
      </header>
      <ProfileSettingsForm />
    </div>
  );
}