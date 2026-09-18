import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Server-side OAuth/PKCE callback: exchanges the `code` query param for a
// Supabase session and persists it via cookies before redirecting onward.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const login = new URL("/login", origin);
  login.searchParams.set("error", "oauth");
  return NextResponse.redirect(login);
}
