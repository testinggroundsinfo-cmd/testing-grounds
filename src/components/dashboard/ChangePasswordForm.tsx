"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function ChangePasswordForm() {
  const { t } = useLocale();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (newPassword.length < 8) {
      setError(t("account.passwordMinLength"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("account.passwordMismatch"));
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error(t("account.mustLoginPassword"));

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      setMessage(t("account.passwordUpdated"));
      setNewPassword("");
      setConfirmPassword("");
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? t("account.unableToUpdatePasswordWithMessage", { message: updateError.message })
          : t("account.unableToUpdatePassword"),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-white/10 bg-ink-800 p-6 shadow-panel sm:p-8"
    >
      <div>
        <h2 className="text-lg font-semibold">{t("account.changePasswordTitle")}</h2>
        <p className="mt-1 text-sm text-zinc-400">{t("account.changePasswordSubtitle")}</p>
      </div>
      <label className="block text-sm">
        {t("account.newPassword")}
        <input
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          minLength={8}
          required
          className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        {t("account.confirmPassword")}
        <input
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          minLength={8}
          required
          className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50"
      >
        {saving ? t("account.updatingPassword") : t("account.updatePassword")}
      </button>
      {message ? <p className="text-sm text-accent">{message}</p> : null}
      {error ? (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      ) : null}
    </form>
  );
}
