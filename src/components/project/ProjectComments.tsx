"use client";

import { MessageCircle, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { FormAlert } from "@/components/ui/FormAlert";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { intlTags } from "@/i18n/config";

type Comment = {
  id: string;
  user_id: string | null;
  body: string;
  created_at: string;
};

type Author = {
  username: string | null;
  full_name: string | null;
};

export function ProjectComments({
  projectId,
  projectOwnerId,
}: {
  projectId: string;
  projectOwnerId?: string;
}) {
  const { t, locale } = useLocale();
  const [comments, setComments] = useState<Comment[]>([]);
  const [authors, setAuthors] = useState<Record<string, Author>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const isOwner = Boolean(userId && projectOwnerId && userId === projectOwnerId);

  async function loadAuthors(userIds: string[], supabase: ReturnType<typeof createClient>) {
    const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
    if (!uniqueIds.length) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, username, full_name")
      .in("id", uniqueIds);
    if (!data) return;
    setAuthors((current) => {
      const next = { ...current };
      for (const row of data as { id: string; username: string | null; full_name: string | null }[]) {
        next[row.id] = { username: row.username, full_name: row.full_name };
      }
      return next;
    });
  }

  async function loadComments() {
    const supabase = createClient();
    const { data, error: listError } = await supabase
      .from("project_comments")
      .select("id, user_id, body, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (!listError) {
      const rows = (data ?? []) as Comment[];
      setComments(rows);
      await loadAuthors(rows.map((row) => row.user_id).filter((id): id is string => Boolean(id)), supabase);
    }
    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUserId(data.user?.id ?? null);
    });
    void loadComments();

    const channel = supabase
      .channel(`project-comments-${projectId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "project_comments", filter: `project_id=eq.${projectId}` },
        (payload) => {
          const row = payload.new as Comment;
          setComments((current) => (current.some((item) => item.id === row.id) ? current : [row, ...current]));
          if (row.user_id) void loadAuthors([row.user_id], supabase);
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    if (!userId) {
      setError(t("comments.loginRequired"));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const supabase = createClient();
      const { data, error: insertError } = await supabase
        .from("project_comments")
        .insert({ project_id: projectId, user_id: userId, body: trimmed })
        .select("id, user_id, body, created_at")
        .single();
      if (insertError) throw insertError;
      setComments((current) => [data as Comment, ...current]);
      setBody("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t("comments.error"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("comments.deleteConfirm"))) return;
    setBusyId(id);
    setError("");
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase.from("project_comments").delete().eq("id", id);
      if (deleteError) throw deleteError;
      setComments((current) => current.filter((item) => item.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t("comments.error"));
    } finally {
      setBusyId(null);
    }
  }

  function authorName(comment: Comment) {
    const author = comment.user_id ? authors[comment.user_id] : undefined;
    return author?.full_name || author?.username || t("comments.anonymous");
  }

  return (
    <div className="space-y-4">
      {error ? <FormAlert variant="error" message={error} /> : null}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={3}
          maxLength={2000}
          placeholder={t("comments.placeholder")}
          className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting || !body.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50"
        >
          <MessageCircle className="h-4 w-4" />
          {submitting ? t("comments.submitting") : t("comments.submit")}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-zinc-400">{t("common.loading")}</p>
      ) : comments.length ? (
        <ul className="space-y-3">
          {comments.map((comment) => {
            const canDelete = Boolean(userId && (comment.user_id === userId || isOwner));
            return (
              <li key={comment.id} className="rounded-lg border border-white/10 bg-ink-900 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{authorName(comment)}</p>
                    <time className="text-xs text-zinc-500">
                      {new Date(comment.created_at).toLocaleString(intlTags[locale])}
                    </time>
                  </div>
                  {canDelete ? (
                    <button
                      type="button"
                      disabled={busyId === comment.id}
                      onClick={() => void handleDelete(comment.id)}
                      aria-label={t("comments.delete")}
                      className="rounded-md p-1.5 text-zinc-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{comment.body}</p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-zinc-400">{t("comments.empty")}</p>
      )}
    </div>
  );
}
