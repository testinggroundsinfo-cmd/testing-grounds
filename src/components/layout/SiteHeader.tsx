"use client";

import Link from "next/link";
import { AppWindow, ChevronDown, Container, Gamepad2, LogOut, Menu, Puzzle, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CategorySwitch } from "@/components/layout/CategorySwitch";
import { GlobalProjectSearch } from "@/components/layout/GlobalProjectSearch";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { createClient } from "@/lib/supabaseClient";
import { PublishSlotsBadge } from "@/components/layout/PublishSlotsBadge";
import { NotificationsMenu } from "@/components/layout/NotificationsMenu";
import type { User } from "@supabase/supabase-js";


export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLocale();
  const pathname = usePathname();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

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
    setAccountMenuOpen(false);
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  const BrandIcon =
    pathname === "/gaming" || pathname.startsWith("/gaming/")
      ? Gamepad2
      : pathname === "/software" || pathname.startsWith("/software/")
        ? AppWindow
        : pathname === "/modding" || pathname.startsWith("/modding/")
          ? Puzzle
          : pathname === "/docker" || pathname.startsWith("/docker/")
            ? Container
            : null;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" onClick={closeMobileMenu} className="flex min-w-0 items-center gap-2 font-semibold tracking-tight">
          {BrandIcon ? (
            <BrandIcon className="h-5 w-5 text-accent" aria-hidden="true" />
          ) : (
            <img src="/logo-completo.jpg" alt="" className="h-6 w-6 rounded-md object-cover" />
          )}
          <span className="hidden sm:inline">Testing-Grounds</span>
        </Link>
        <div className="hidden min-w-0 flex-1 md:block">
          <GlobalProjectSearch />
        </div>
        <nav className="ml-auto hidden items-center gap-2 text-sm text-zinc-300 md:flex">
          <LanguageSelector />
          {user ? (
            <>
              <PublishSlotsBadge user={user} />
              <NotificationsMenu />
              <div className="relative">
                <button type="button" onClick={() => setAccountMenuOpen((open) => !open)} aria-expanded={accountMenuOpen} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/15">
                  <UserRound className="h-4 w-4" />
                  <span className="hidden lg:inline">{t("nav.dashboard")}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {accountMenuOpen ? (
                  <div className="absolute right-0 z-50 mt-2 min-w-44 rounded-xl border border-white/10 bg-ink-900 p-1.5 shadow-panel">
                    <Link href="/dashboard" onClick={() => setAccountMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10">{t("nav.dashboard")}</Link>
                    <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10">
                      <LogOut className="h-4 w-4" /> {t("nav.logout")}
                    </button>
                  </div>
                ) : null}
              </div>
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
      <div className="border-t border-white/10">
        <CategorySwitch />
      </div>
      {mobileMenuOpen ? (
        <div id="mobile-navigation" className="border-t border-white/10 px-4 pb-4 pt-3 sm:px-6 md:hidden">
          <div className="space-y-4">
            <LanguageSelector />
            <GlobalProjectSearch />
            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4 text-sm text-zinc-300">
              {user ? (
                <>
                  <PublishSlotsBadge user={user} />
                  <NotificationsMenu />
                  <Link
                    href="/dashboard"
                    onClick={closeMobileMenu}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/15"
                  >
                    <UserRound className="h-4 w-4" />
                    {t("nav.dashboard")}
                  </Link>
                  <button type="button" onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 hover:bg-white/10 hover:text-white"><LogOut className="h-4 w-4" />{t("nav.logout")}</button>
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
