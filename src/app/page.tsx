"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function HomePage() {
  const { t } = useLocale();
  return (
    <AppShell>
      <section className="max-w-3xl space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-accent">MVP</p>
        <h1 className="text-4xl font-semibold tracking-tight">
          {t("home.title")}
        </h1>
        <p className="text-zinc-400">
          {t("home.description")}
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            href="/gaming"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950"
          >
            {t("home.gaming")}
          </Link>
          <Link
            href="/software"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white"
          >
            {t("home.software")}
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
