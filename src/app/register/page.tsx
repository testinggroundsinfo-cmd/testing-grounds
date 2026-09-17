"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [message, setMessage] = useState("");
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { data, error } = await createClient().auth.signUp({
      email: String(form.get("email")),
      password: String(form.get("password")),
      options: { data: { full_name: String(form.get("full_name")), username: String(form.get("username")) } },
    });
    if (error) return setMessage(error.message);
    if (data.session) router.push("/dashboard");
    else setMessage(t("auth.register.confirmEmail"));
  }
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-ink-800 p-8 shadow-panel">
      <h1 className="text-2xl font-semibold">{t("auth.register.title")}</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input name="full_name" required placeholder={t("auth.register.fullName")} className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
        <input name="username" required minLength={3} maxLength={24} pattern="[a-zA-Z0-9_]+" placeholder={t("auth.register.username")} className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
        <input name="email" type="email" required placeholder={t("auth.register.email")} className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
        <input name="password" type="password" required minLength={6} placeholder={t("auth.register.password")} className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950">{t("auth.register.submit")}</button>
        {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
      </form>
    </div>
  );
}