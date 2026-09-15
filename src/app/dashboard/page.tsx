"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

type ProfileForm = {
  display_name: string;
  bio: string;
  avatar_url: string;
  github_url: string;
  twitter_url: string;
  website_url: string;
};

const emptyProfile: ProfileForm = {
  display_name: "",
  bio: "",
  avatar_url: "",
  github_url: "",
  twitter_url: "",
  website_url: "",
};

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error("Devi accedere per modificare il profilo.");

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select(
            "display_name, bio, avatar_url, github_url, twitter_url, website_url",
          )
          .eq("id", user.id)
          .maybeSingle();
        if (profileError) throw profileError;
        if (active && data) {
          setProfile({
            display_name: data.display_name ?? "",
            bio: data.bio ?? "",
            avatar_url: data.avatar_url ?? "",
            github_url: data.github_url ?? "",
            twitter_url: data.twitter_url ?? "",
            website_url: data.website_url ?? "",
          });
        }
      } catch (loadError) {
        if (active) {
          setError(
            errorMessage(loadError, "Impossibile caricare il profilo."),
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadProfile();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error("Devi accedere per salvare il profilo.");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          display_name: profile.display_name.trim(),
          bio: profile.bio.trim() || null,
          avatar_url: profile.avatar_url.trim() || null,
          github_url: profile.github_url.trim() || null,
          twitter_url: profile.twitter_url.trim() || null,
          website_url: profile.website_url.trim() || null,
        })
        .eq("id", user.id);
      if (updateError) throw updateError;
      setMessage("Profilo aggiornato correttamente.");
    } catch (saveError) {
      setError(errorMessage(saveError, "Impossibile salvare il profilo."));
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: keyof ProfileForm, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent">
          Area personale
        </p>
        <h1 className="text-3xl font-semibold">Dashboard sviluppatore</h1>
        <p className="text-sm text-zinc-400">
          Gestisci il profilo e pubblica giochi, software e mod per la community.
        </p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-ink-800 p-6 shadow-panel sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Il mio profilo</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Queste informazioni saranno visibili nella pagina pubblica del profilo.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 rounded-lg bg-white/10" />
            <div className="h-24 rounded-lg bg-white/10" />
            <div className="h-10 rounded-lg bg-white/10" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm">
              Nome visualizzato
              <input
                value={profile.display_name}
                onChange={(event) => updateField("display_name", event.target.value)}
                required
                maxLength={80}
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Bio
              <textarea
                value={profile.bio}
                onChange={(event) => updateField("bio", event.target.value)}
                rows={4}
                maxLength={500}
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              URL avatar
              <input
                type="url"
                value={profile.avatar_url}
                onChange={(event) => updateField("avatar_url", event.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["github_url", "GitHub URL"],
                  ["twitter_url", "Twitter / X URL"],
                  ["website_url", "Sito web"],
                ] as const
              ).map(([field, label]) => (
                <label key={field} className="block text-sm">
                  {label}
                  <input
                    type="url"
                    value={profile[field]}
                    onChange={(event) => updateField(field, event.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
                  />
                </label>
              ))}
            </div>
            <button
              disabled={saving}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50"
            >
              {saving ? "Salvataggio..." : "Salva profilo"}
            </button>
            {message ? <p className="text-sm text-accent">{message}</p> : null}
            {error ? (
              <p role="alert" className="text-sm text-red-300">
                {error}
              </p>
            ) : null}
          </form>
        )}
      </section>

      <Link
        href="/dashboard/projects/new"
        className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950"
      >
        Pubblica una scheda
      </Link>
    </div>
  );
}
