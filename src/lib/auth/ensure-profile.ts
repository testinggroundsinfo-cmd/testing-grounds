import type { User } from "@supabase/supabase-js";
import type { createClient } from "@/lib/supabase/client";

type BrowserClient = ReturnType<typeof createClient>;

export async function ensureProfile(supabase: BrowserClient, user: User) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  const fromEmail = user.email?.split("@")[0] ?? "tester";
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    (user.user_metadata?.username as string | undefined) ||
    fromEmail;

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    display_name: fullName,
    full_name: fullName,
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
