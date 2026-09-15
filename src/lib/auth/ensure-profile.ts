import type { User } from "@supabase/supabase-js";
import type { createClient } from "@/lib/supabase/client";

type BrowserClient = ReturnType<typeof createClient>;

function sanitizeUsername(raw: string) {
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 24);
  return cleaned.length >= 3 ? cleaned : `user_${crypto.randomUUID().slice(0, 8)}`;
}

export async function ensureProfile(supabase: BrowserClient, user: User) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  const fromMeta = (user.user_metadata?.username as string | undefined) ?? "";
  const fromEmail = user.email?.split("@")[0] ?? "tester";
  const username = sanitizeUsername(fromMeta || fromEmail);
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    username;

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    username,
    display_name: displayName,
    is_developer: true,
    is_tester: true,
  });

  if (error && !error.message.toLowerCase().includes("duplicate")) {
    throw error;
  }
}

export async function requireBrowserUser(supabase: BrowserClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("Devi accedere per continuare.");
  }
  await ensureProfile(supabase, user);
  return user;
}
