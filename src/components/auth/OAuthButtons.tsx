"use client";

import { useState } from "react";
import { Github } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { useLocale } from "@/components/i18n/LocaleProvider";

type Provider = "google" | "github";

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

const providerIcons: Record<Provider, () => React.JSX.Element> = {
  google: GoogleIcon,
  github: () => <Github className="h-4 w-4" />,
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
      <div className="grid grid-cols-2 gap-3">
        {(["google", "github"] as Provider[]).map((provider) => {
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
