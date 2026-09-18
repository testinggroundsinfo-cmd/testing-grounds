"use client";

import { useState } from "react";
import { Github } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { useLocale } from "@/components/i18n/LocaleProvider";

type Provider = "google" | "github" | "discord";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.82-.07-1.42-.22-2.05H12v3.72h6.6c-.13 1.1-.85 2.75-2.45 3.86l-.02.15 3.56 2.76.25.02c2.26-2.09 3.58-5.17 3.58-8.46Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.79-2.93c-1.01.7-2.38 1.19-4.14 1.19-3.17 0-5.86-2.09-6.82-4.99l-.14.01-3.7 2.87-.05.14C3.25 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.18 14.37A7.35 7.35 0 0 1 4.77 12c0-.82.15-1.62.4-2.37l-.01-.16-3.75-2.9-.12.06A11.97 11.97 0 0 0 0 12c0 1.94.47 3.77 1.29 5.37l3.89-3Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c2.25 0 3.77.97 4.64 1.78l3.39-3.31C17.94 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.29 6.63l3.88 3.01C6.14 6.84 8.83 4.75 12 4.75Z"
      />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="#5865F2">
      <path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.45.87-.61 1.26a18.27 18.27 0 0 0-5.48 0 12.6 12.6 0 0 0-.62-1.26.08.08 0 0 0-.08-.04 19.74 19.74 0 0 0-4.89 1.52.07.07 0 0 0-.03.03C1.02 8.68.32 12.85.66 16.97a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .09-.03c.46-.63.87-1.3 1.22-2a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.89.08.08 0 0 1-.01-.13c.13-.09.25-.19.37-.28a.07.07 0 0 1 .08-.01c3.93 1.79 8.18 1.79 12.06 0a.07.07 0 0 1 .08.01c.12.1.24.19.37.28a.08.08 0 0 1-.01.13c-.6.35-1.22.65-1.87.89a.08.08 0 0 0-.04.11c.36.7.77 1.37 1.22 2a.08.08 0 0 0 .09.03 19.83 19.83 0 0 0 6-3.03.08.08 0 0 0 .03-.06c.4-4.76-.67-8.9-2.83-12.57a.06.06 0 0 0-.03-.03ZM8.68 14.6c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.17 1.1 2.15 2.42 0 1.34-.95 2.42-2.15 2.42Zm6.65 0c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.17 1.1 2.15 2.42 0 1.34-.94 2.42-2.15 2.42Z" />
    </svg>
  );
}

const providerIcons: Record<Provider, () => React.JSX.Element> = {
  google: GoogleIcon,
  github: () => <Github className="h-4 w-4" />,
  discord: DiscordIcon,
};

export function OAuthButtons({ onError }: { onError: (message: string) => void }) {
  const { t } = useLocale();
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  async function handleOAuth(provider: Provider) {
    if (loadingProvider) return;
    setLoadingProvider(provider);
    onError("");
    const { error } = await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      onError(error.message);
      setLoadingProvider(null);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-wide text-zinc-400">{t("auth.oauth.divider")}</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(["google", "github", "discord"] as Provider[]).map((provider) => {
          const Icon = providerIcons[provider];
          return (
            <button
              key={provider}
              type="button"
              disabled={loadingProvider !== null}
              onClick={() => handleOAuth(provider)}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-ink-900 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-ink-800 disabled:opacity-50"
            >
              <Icon />
              {t(`auth.oauth.${provider}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
