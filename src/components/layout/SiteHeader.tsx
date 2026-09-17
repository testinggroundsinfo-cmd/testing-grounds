"use client";

import Link from "next/link";
import { Gamepad2, LogOut, Menu, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CategorySwitch } from "@/components/layout/CategorySwitch";
import { GlobalProjectSearch } from "@/components/layout/GlobalProjectSearch";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { createClient } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";


export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

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
    await createClient().auth.signOut();
    setUser(null);
    setMobileMenuOpen(false);
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" onClick={closeMobileMenu} className="flex min-w-0 items-center gap-2 font-semibold tracking-tight">
          <Gamepad2 className="h-5 w-5 text-accent" />
          <span className="hidden sm:inline">Testing-Grounds</span>
        </Link>
        <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
          <CategorySwitch />
          <GlobalProjectSearch />
        </div>
        <nav className="ml-auto hidden items-center gap-2 text-sm text-zinc-300 md:flex">
          <LanguageSelector />
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/15"
              >
                <UserRound className="h-4 w-4" />
                {t("nav.dashboard")}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/15">
                {t("nav.login")}
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-accent px-3 py-1.5 font-semibold text-ink-950 hover:bg-accent-dim"
              >
                {t("nav.register")}
              </Link>
            </>
          )}
        </nav>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
          className="ml-auto inline-flex rounded-lg p-2 text-zinc-300 hover:bg-white/10 hover:text-white md:hidden"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
      {mobileMenuOpen ? (
        <div id="mobile-navigation" className="border-t border-white/10 px-4 pb-4 pt-3 sm:px-6 md:hidden">
          <div className="space-y-4">
            <LanguageSelector />
            <CategorySwitch />
            <GlobalProjectSearch />
            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4 text-sm text-zinc-300">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={closeMobileMenu}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/15"
                  >
                    <UserRound className="h-4 w-4" />
                    {t("nav.dashboard")}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 hover:bg-white/10 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/15"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="rounded-lg bg-accent px-3 py-1.5 font-semibold text-ink-950 hover:bg-accent-dim"
                  >
                    {t("nav.register")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
