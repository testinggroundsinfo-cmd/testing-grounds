"use client";

import { UserPlus, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function FollowButton({
  profileId,
  initialFollowerCount,
}: {
  profileId: string;
  initialFollowerCount: number;
}) {
  const { t } = useLocale();
  const [userId, setUserId] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    void supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      const currentUserId = data.user?.id ?? null;
      setUserId(currentUserId);
      if (currentUserId && currentUserId !== profileId) {
        const { data: existing } = await supabase
          .from("follows")
          .select("follower_id")
          .eq("follower_id", currentUserId)
          .eq("following_id", profileId)
          .maybeSingle();
        if (mounted) setFollowing(Boolean(existing));
      }
      if (mounted) setReady(true);
    });

    return () => {
      mounted = false;
    };
  }, [profileId]);

  async function toggle() {
    if (!userId) {
      setError(t("follow.loginRequired"));
      return;
    }
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      if (following) {
        const { error: deleteError } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", userId)
          .eq("following_id", profileId);
        if (deleteError) throw deleteError;
        setFollowing(false);
        setFollowerCount((current) => Math.max(0, current - 1));
      } else {
        const { error: insertError } = await supabase
          .from("follows")
          .insert({ follower_id: userId, following_id: profileId });
        if (insertError) throw insertError;
        setFollowing(true);
        setFollowerCount((current) => current + 1);
      }
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : t("follow.error"));
    } finally {
      setBusy(false);
    }
  }

  if (userId && userId === profileId) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-sm text-zinc-300">
        {t("follow.followersCount", { count: followerCount })}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={busy || !ready}
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
          following
            ? "border-accent/40 bg-accent/10 text-accent"
            : "border-white/15 text-zinc-300 hover:border-accent/40 hover:text-accent"
        }`}
      >
        {following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
        {following ? t("follow.following") : t("follow.follow")}
        <span className="text-xs text-zinc-500">({followerCount})</span>
      </button>
      {error ? <p role="alert" className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
