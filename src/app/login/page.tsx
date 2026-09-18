"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error") === "oauth") {
      setMessage(t("auth.oauth.error"));
    }
  }, [t]);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { error } = await createClient().auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) return setMessage(error.message);
    router.push("/dashboard");
    router.refresh();
  }
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-ink-800 p-8 shadow-panel">
      <h1 className="text-2xl font-semibold">{t("auth.login.title")}</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input name="email" type="email" required placeholder={t("auth.login.email")} className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
        <input name="password" type="password" required minLength={6} placeholder={t("auth.login.password")} className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-accent hover:text-accent-dim">
            {t("auth.login.forgotPassword")}
          </Link>
        </div>
        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950">{t("auth.login.submit")}</button>
        {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
      </form>
      <OAuthButtons onError={setMessage} />
    </div>
  );
}