"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function ResetPasswordPage() {
  const { t } = useLocale();
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setReady(Boolean(data.session));
        if (!data.session) setError(t("auth.reset.invalidToken"));
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
        setError("");
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [t]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const password = String(values.get("password") || "");
    const confirmation = String(values.get("confirmation") || "");
    setMessage("");
    setError("");
    if (password !== confirmation) {
      setError(t("auth.reset.mismatch"));
      return;
    }
    setLoading(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    if (updateError) setError(updateError.message);
    else setMessage(t("auth.reset.success"));
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-ink-800 p-8 shadow-panel">
      <h1 className="text-2xl font-semibold">{t("auth.reset.title")}</h1>
      <p className="mt-2 text-sm text-zinc-400">{t("auth.reset.description")}</p>
      {ready ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input name="password" type="password" required minLength={6} placeholder={t("auth.reset.newPassword")} className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
          <input name="confirmation" type="password" required minLength={6} placeholder={t("auth.reset.confirmPassword")} className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
          <button disabled={loading} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50">
            {loading ? t("auth.reset.saving") : t("auth.reset.submit")}
          </button>
          {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
          {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
        </form>
      ) : (
        <p role="alert" className="mt-6 text-sm text-red-300">{error || t("auth.reset.waiting")}</p>
      )}
      <Link href="/login" className="mt-5 inline-block text-sm text-zinc-400 hover:text-white">{t("auth.forgot.back")}</Link>
    </div>
  );
}
