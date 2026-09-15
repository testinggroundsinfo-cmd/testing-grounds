"use client";

import Link from "next/link";
import { Gamepad2, LogOut, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { CategorySwitch } from "@/components/layout/CategorySwitch";
import { GlobalProjectSearch } from "@/components/layout/GlobalProjectSearch";
import { createClient } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

const supabase = createClient();

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Gamepad2 className="h-5 w-5 text-accent" />
          <span className="hidden sm:inline">Testing-Grounds</span>
        </Link>
        <CategorySwitch />
        <GlobalProjectSearch />
        <nav className="flex items-center gap-2 text-sm text-zinc-300">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/15"
              >
                <UserRound className="h-4 w-4" />
                Dashboard / Il mio profilo
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Esci
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/15">
                Accedi
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-accent px-3 py-1.5 font-semibold text-ink-950 hover:bg-accent-dim"
              >
                Registrati
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
