"use client";

import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { createClient } from "@/lib/supabaseClient";

type Notification = {
  id: string;
  type: "comment" | "bug" | "new_mod";
  title: string;
  body: string | null;
  link: string | null;
  created_at: string;
};

export function NotificationsMenu() {
  const { t } = useLocale();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadNotifications() {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, type, title, body, link, created_at")
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(10);
      if (!error && active) setItems((data ?? []) as Notification[]);
      if (active) setLoading(false);
    }

    void loadNotifications();
    const channel = supabase
      .channel("header-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        const notification = payload.new as Notification & { is_read: boolean };
        if (notification.is_read || !active) return;
        setItems((current) => [notification, ...current].slice(0, 10));
      })
      .subscribe();
    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      active = false;
      document.removeEventListener("mousedown", handlePointerDown);
      void supabase.removeChannel(channel);
    };
  }, []);

  async function markAllRead() {
    const ids = items.map((item) => item.id);
    if (!ids.length) return;
    const { error } = await createClient().from("notifications").update({ is_read: true }).in("id", ids);
    if (error) {
      console.error("Unable to mark notifications as read:", error);
      return;
    }

    setItems([]);
  }

  function notificationTitle(item: Notification) {
    if (item.type === "comment") return t("notifications.commentTitle", { title: item.title });
    if (item.type === "bug") return t("notifications.bugTitle", { title: item.title });
    return t("notifications.modTitle", { title: item.title });
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={t("notifications.open")}
        aria-expanded={open}
        className="relative inline-flex rounded-lg p-2 text-zinc-300 hover:bg-white/10 hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {!loading && items.length ? <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-400 ring-2 ring-ink-950" /> : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-white/10 bg-ink-900 shadow-panel">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold">{t("notifications.title")}</p>
            {items.length ? (
              <button type="button" onClick={() => void markAllRead()} className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-dim">
                <CheckCheck className="h-3.5 w-3.5" /> {t("notifications.markAllRead")}
              </button>
            ) : null}
          </div>
          {loading ? <p className="p-4 text-sm text-zinc-400">{t("common.loading")}</p> : null}
          {!loading && !items.length ? <p className="p-4 text-sm text-zinc-400">{t("notifications.empty")}</p> : null}
          {!loading && items.length ? (
            <ul className="max-h-96 divide-y divide-white/10 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id}>
                  <Link href={item.link || "/dashboard"} onClick={() => setOpen(false)} className="block px-4 py-3 hover:bg-white/5">
                    <p className="text-sm font-medium text-white">{notificationTitle(item)}</p>
                    {item.body ? <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{item.body}</p> : null}
                    <time className="mt-1 block text-xs text-zinc-500">{new Date(item.created_at).toLocaleString()}</time>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
