import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/keys";

/**
 * Client Supabase con la Service Role Key, utilizzabile SOLO lato server
 * (route handler / server action). Bypassa le policy RLS: necessario per
 * leggere dati non esposti al client, come l'email in auth.users.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SECRET_KEY non è impostata in .env.local");
  }
  return createSupabaseClient(getSupabaseUrl(), serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Recupera l'email di un utente tramite l'Auth Admin API (auth.users). */
export async function getUserEmail(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error) {
    console.error("Errore recupero email utente:", error.message);
    return null;
  }
  return data.user?.email ?? null;
}
