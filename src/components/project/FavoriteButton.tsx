"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { createClient } from "@/lib/supabaseClient";

export function FavoriteButton({
  projectId,
  ownerId,
  compact = false,
}: {
  projectId: string;
  ownerId?: string;
  compact?: boolean;
}) {
  const { t } = useLocale();
  const [userId, setUserId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function loadFavorite() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      setUserId(user?.id ?? null);
      if (!user || user.id === ownerId) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("project_favorites")
        .select("project_id")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (active) {
        setIsFavorite(Boolean(data));
        setLoading(false);
      }
    }

    void loadFavorite();
    return () => {
      active = false;
    };
  }, [ownerId, projectId]);

  async function toggleFavorite() {
    if (!userId) {
      window.location.assign("/login");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const nextValue = !isFavorite;
    const { error } = nextValue
      ? await supabase.from("project_favorites").insert({ project_id: projectId, user_id: userId })
      : await supabase.from("project_favorites").delete().eq("project_id", projectId).eq("user_id", userId);
    if (error) {
      console.error("Unable to update favorite:", error);
      window.alert(t("favorites.updateError"));
    } else {
      setIsFavorite(nextValue);
    }
    setSaving(false);
  }

  if (userId === ownerId) return null;

  const label = isFavorite ? t("favorites.remove") : t("favorites.add");
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggleFavorite();
      }}
      disabled={loading || saving}
      aria-label={label}
      aria-pressed={isFavorite}
      title={label}
      className={`inline-flex items-center justify-center rounded-lg border transition disabled:cursor-wait disabled:opacity-50 ${
        compact ? "h-9 w-9" : "gap-2 px-3 py-2 text-sm"
      } ${
        isFavorite
          ? "border-red-400/40 bg-red-500/10 text-red-300"
          : "border-white/15 bg-ink-900/80 text-zinc-300 hover:border-red-400/40 hover:text-red-300"
      }`}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
      {!compact ? label : null}
    </button>
  );
}
