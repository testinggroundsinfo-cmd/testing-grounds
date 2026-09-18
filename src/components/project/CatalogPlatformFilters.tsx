"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import type { PlatformKind } from "@/types/database";

export type QuickPlatform = "all" | "windows" | "mac" | "linux" | "android";

const platformKeys: Record<QuickPlatform, string> = {
  all: "filter.allPlatforms",
  windows: "platform.windows",
  mac: "platform.mac",
  linux: "platform.linux",
  android: "platform.android",
};

export function projectMatchesPlatform(
  project: { platforms?: PlatformKind[] | null; tags?: string[] | null },
  platform: QuickPlatform,
) {
  if (platform === "all") return true;
  const values = [
    ...(project.platforms ?? []),
    ...(project.tags ?? []),
  ].join(" ").toLowerCase();
  const terms: Record<Exclude<QuickPlatform, "all">, string[]> = {
    windows: ["windows", "win", "pc", "desktop"],
    mac: ["mac", "macos", "osx"],
    linux: ["linux"],
    android: ["android", "mobile_android"],
  };
  return terms[platform].some((term) => values.includes(term));
}

export function CatalogPlatformFilters({
  value,
  onChange,
}: {
  value: QuickPlatform;
  onChange: (platform: QuickPlatform) => void;
}) {
  const { t } = useLocale();
  const platforms: QuickPlatform[] = ["all", "windows", "mac", "linux", "android"];

  return (
    <div className="flex flex-wrap gap-2" aria-label={t("filter.platforms")}>
      {platforms.map((platform) => (
        <button
          key={platform}
          type="button"
          aria-pressed={value === platform}
          onClick={() => onChange(platform)}
          className={`rounded-full px-3 py-1.5 text-xs transition ${
            value === platform
              ? "bg-accent text-ink-950"
              : "bg-white/5 text-zinc-300 hover:bg-white/10"
          }`}
        >
          {t(platformKeys[platform])}
        </button>
      ))}
    </div>
  );
}
