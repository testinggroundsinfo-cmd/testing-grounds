"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    const email = String(new FormData(event.currentTarget).get("email") || "").trim();
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error: resetError } = await createClient().auth.resetPasswordForEmail(email, { redirectTo });
    if (resetError) setError(resetError.message);
    else setMessage(t("auth.forgot.sent"));
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-ink-800 p-8 shadow-panel">
      <h1 className="text-2xl font-semibold">{t("auth.forgot.title")}</h1>
      <p className="mt-2 text-sm text-zinc-400">{t("auth.forgot.description")}</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input name="email" type="email" required placeholder={t("auth.login.email")} className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
        <button disabled={loading} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50">
          {loading ? t("auth.forgot.sending") : t("auth.forgot.submit")}
        </button>
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
        {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
      </form>
      <Link href="/login" className="mt-5 inline-block text-sm text-zinc-400 hover:text-white">{t("auth.forgot.back")}</Link>
    </div>
  );
}
