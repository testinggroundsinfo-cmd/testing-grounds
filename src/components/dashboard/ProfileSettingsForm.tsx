"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

type ProfileForm = {
  full_name: string;
  bio: string;
  avatar_url: string;
  github_url: string;
  twitter_url: string;
  website_url: string;
};

const emptyProfile: ProfileForm = {
  full_name: "", bio: "", avatar_url: "", github_url: "", twitter_url: "", website_url: "",
};

export default function ProfileSettingsForm() {
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error("Devi accedere per modificare il profilo.");
        const { data, error: profileError } = await supabase.from("profiles").select("full_name, bio, avatar_url, github_url, twitter_url, website_url").eq("id", user.id).maybeSingle();
        if (profileError) throw profileError;
        const metadata = user.user_metadata ?? {};
        const metadataName = (typeof metadata.full_name === "string" && metadata.full_name) || (typeof metadata.display_name === "string" && metadata.display_name) || "";
        setProfile({
          full_name: data?.full_name || metadataName,
          bio: data?.bio ?? "", avatar_url: data?.avatar_url ?? "",
          github_url: data?.github_url ?? "", twitter_url: data?.twitter_url ?? "", website_url: data?.website_url ?? "",
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Impossibile caricare il profilo.");
      } finally {
        setLoading(false);
      }
    }
    void loadProfile();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage(""); setError("");
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error("Devi accedere per salvare il profilo.");
      const metadata = user.user_metadata ?? {};
      const metadataName = (typeof metadata.full_name === "string" && metadata.full_name) || (typeof metadata.display_name === "string" && metadata.display_name) || "";
      const { error: saveError } = await supabase.from("profiles").upsert({
        id: user.id, full_name: profile.full_name.trim() || metadataName || "Tester",
        bio: profile.bio.trim() || null, avatar_url: profile.avatar_url.trim() || null,
        github_url: profile.github_url.trim() || null, twitter_url: profile.twitter_url.trim() || null,
        website_url: profile.website_url.trim() || null,
      }, { onConflict: "id" });
      if (saveError) throw saveError;
      setMessage("Profilo aggiornato correttamente.");
    } catch (saveError) {
      setError(saveError instanceof Error ? `Impossibile salvare il profilo: ${saveError.message}` : "Impossibile salvare il profilo.");
    } finally { setSaving(false); }
  }

  function updateField(field: keyof ProfileForm, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-10 rounded-lg bg-white/10" /><div className="h-24 rounded-lg bg-white/10" /><div className="h-10 rounded-lg bg-white/10" /></div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-ink-800 p-6 shadow-panel sm:p-8">
      {(["full_name", "bio", "avatar_url", "github_url", "twitter_url", "website_url"] as const).map((field) => (
        <label key={field} className="block text-sm">{field === "full_name" ? "Nome completo" : field === "bio" ? "Bio" : field.replace("_url", "").toUpperCase() + " URL"}
          {field === "bio" ? <textarea value={profile[field]} onChange={(event) => updateField(field, event.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /> : <input type={field === "full_name" ? "text" : "url"} value={profile[field]} onChange={(event) => updateField(field, event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />}
        </label>
      ))}
      <button disabled={saving} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50">{saving ? "Salvataggio..." : "Salva profilo"}</button>
      {message ? <p className="text-sm text-accent">{message}</p> : null}
      {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
    </form>
  );
}
