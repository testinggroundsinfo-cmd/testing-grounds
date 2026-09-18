"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, AppWindow, Puzzle, Container } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";

const items = [
  { href: "/gaming", key: "categorySwitch.gaming", icon: Gamepad2 },
  { href: "/software", key: "categorySwitch.software", icon: AppWindow },
  { href: "/modding", key: "categorySwitch.modding", icon: Puzzle },
  { href: "/docker", key: "categorySwitch.docker", icon: Container },
] as const;

export function CategorySwitch() {
  const pathname = usePathname();
  const { t } = useLocale();
  return (
    <nav
      aria-label={t("nav.categories")}
      className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8 [scrollbar-width:thin]"
    >
      {items.map(({ href, key, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
              active ? "bg-accent text-ink-950" : "text-zinc-300 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{t(key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}