"use client";

import { Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { User } from "@supabase/supabase-js";

type SlotsState =
  | { status: "loading" }
  | { status: "ready"; count: number }
  | { status: "error" };

export function PublishSlotsBadge({ user }: { user: User }) {
  const { t } = useLocale();
  const [slots, setSlots] = useState<SlotsState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setSlots({ status: "loading" });

    async function loadSlots() {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("available_publish_slots", {
        target_user: user.id,
      });
      if (cancelled) return;
      if (error || typeof data !== "number") {
        setSlots({ status: "error" });
        return;
      }
      setSlots({ status: "ready", count: data });
    }

    void loadSlots();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  return (
    <span
      role="status"
      aria-label={t("nav.publishSlotsAriaLabel")}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300"
    >
      <Ticket className="h-3.5 w-3.5 text-accent" aria-hidden />
      {slots.status === "loading" ? (
        <span className="animate-pulse text-zinc-400">{t("nav.publishSlotsLoading")}</span>
      ) : slots.status === "error" ? (
        <span className="text-zinc-500">{t("nav.publishSlotsError")}</span>
      ) : (
        <span>{t("nav.publishSlots", { count: slots.count })}</span>
      )}
    </span>
  );
}
