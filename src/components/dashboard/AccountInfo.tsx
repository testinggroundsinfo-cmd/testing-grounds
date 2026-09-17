"use client";

import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function AccountInfo() {
  const { t } = useLocale();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (mounted) {
        setEmail(data.user?.email ?? null);
        setLoading(false);
      }
    }
    void loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-800 p-6 shadow-panel sm:p-8">
      <Mail className="h-5 w-5 shrink-0 text-accent" aria-hidden />
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-zinc-500">{t("account.loggedInAs")}</p>
        {loading ? (
          <div className="mt-1 h-5 w-40 animate-pulse rounded bg-white/10" />
        ) : (
          <p className="mt-1 truncate font-medium text-white">{email ?? "—"}</p>
        )}
      </div>
    </div>
  );
}
