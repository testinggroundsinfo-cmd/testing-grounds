"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, AppWindow, Puzzle } from "lucide-react";

const items = [
  { href: "/gaming", label: "Gaming", icon: Gamepad2 },
  { href: "/software", label: "App & Software", icon: AppWindow },
  { href: "/modding", label: "Modding", icon: Puzzle },
] as const;

export function CategorySwitch() {
  const pathname = usePathname();
  return (
    <div className="flex rounded-full border border-white/10 bg-ink-800 p-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition ${
              active ? "bg-accent text-ink-950" : "text-zinc-300 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
