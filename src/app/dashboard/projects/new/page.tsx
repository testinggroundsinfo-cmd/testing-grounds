"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureProfile } from "@/lib/auth/ensure-profile";
import { createClient } from "@/lib/supabaseClient";
import { moddingGames } from "@/data/modding-games";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type {
  DevelopmentStatus,
  DistributionKind,
  PlatformKind,
  ProjectType,
  ProjectCategory,
  AlternativeLink,
} from "@/types/database";

type FormCategory = "gaming" | "software" | "modding";
type PublicationType =
  | "full_game"
  | "demo"
  | "asset_pack"
  | "mod"
  | "plugin"
  | "preset"
  | "desktop_app"
  | "web_app"
  | "browser_extension"
  | "tool";

type CleanProjectPayload = {
  owner_id: string;
  title: string;
  short_description: string | null;
  slug: string;
  description: string;
  category: ProjectCategory;
  project_type: ProjectType;
  development_status: DevelopmentStatus;
  platforms: PlatformKind[];
  tags: string[];
  cover_url: string | null;
  youtube_url: string | null;
  iframe_url: string | null;
  distribution_kind: DistributionKind | null;
  distribution_url: string | null;
  alternative_links: AlternativeLink[];
  mod_version: string | null;
  compatibility: string | null;
  mod_type: string | null;
  mod_dependencies: string | null;
  game_slug: string | null;
  game_title: string | null;
  game_cover_url: string | null;
  mod_file_url: string | null;
  content_locale: string;
  is_published: boolean;
};

// The second tuple value is the Italian label used for the auto-generated
// searchable tag stored in the DB (kept stable across locales so catalog
// filtering/search stays consistent). Displayed <option> labels are always
// translated via the *Keys maps below with t().
const publicationTypes: Record<FormCategory, readonly [PublicationType, string][]> = {
  gaming: [
    ["full_game", "Videogioco completo"],
    ["demo", "Demo / Prototype"],
    ["asset_pack", "Asset / Resource Pack"],
  ],
  modding: [
    ["mod", "Mod per videogioco"],
    ["plugin", "Plugin / Addon"],
    ["preset", "Preset / Config"],
  ],
  software: [
    ["desktop_app", "Applicazione Desktop"],
    ["web_app", "Web App / SaaS"],
    ["browser_extension", "Estensione Browser"],
    ["tool", "Tool / Script"],
  ],
};

const publicationTypeKeys: Record<PublicationType, string> = {
  full_game: "publicationTypes.fullGame",
  demo: "publicationTypes.demo",
  asset_pack: "publicationTypes.assetPack",
  mod: "publicationTypes.mod",
  plugin: "publicationTypes.plugin",
  preset: "publicationTypes.preset",
  desktop_app: "publicationTypes.desktopApp",
  web_app: "publicationTypes.webApp",
  browser_extension: "publicationTypes.browserExtension",
  tool: "publicationTypes.tool",
};

const platformsByCategory: Record<
  ProjectCategory,
  readonly [PlatformKind, string][]
> = {
  gaming: [
    ["pc", "PC"],
    ["mobile", "Mobile"],
    ["webgl", "WebGL"],
    ["console", "Console"],
  ],
  software: [
    ["web_saas", "Web / SaaS"],
    ["mobile_ios", "iOS"],
    ["mobile_android", "Android"],
    ["desktop", "Desktop"],
    ["browser_extension", "Estensione browser"],
  ],
};

const platformKeys: Record<PlatformKind, string> = {
  pc: "platform.pc",
  mobile: "platform.mobile",
  webgl: "platform.webgl",
  console: "platform.console",
  web_saas: "platform.webSaas",
  mobile_ios: "platform.mobileIos",
  mobile_android: "platform.mobileAndroid",
  desktop: "platform.desktop",
  browser_extension: "platform.browserExtension",
};

const gamingGenres = [
  "Action",
  "RPG",
  "Adventure",
  "Platformer",
  "Horror",
  "Strategy",
  "Simulation",
  "Puzzle",
  "Indie",
] as const;

const developmentStatuses: readonly [DevelopmentStatus, string][] = [
  ["pre_alpha", "Pre-alpha"],
  ["alpha", "Alpha"],
  ["closed_beta", "Closed beta"],
  ["mvp", "MVP"],
  ["playtest", "Playtest"],
];

const devStatusKeys: Record<DevelopmentStatus, string> = {
  pre_alpha: "devStatus.preAlpha",
  alpha: "devStatus.alpha",
  closed_beta: "devStatus.closedBeta",
  mvp: "devStatus.mvp",
  playtest: "devStatus.playtest",
};

const distributionKinds: readonly [DistributionKind, string][] = [
  ["iframe", "Iframe"],
  ["direct_link", "Link diretto"],
  ["testflight", "TestFlight"],
  ["play_beta", "Play Beta"],
  ["steam_playtest", "Steam Playtest"],
  ["drive", "Google Drive"],
  ["mega", "MEGA"],
  ["itch", "itch.io"],
  ["zip", "ZIP"],
];

const distributionKeys: Record<DistributionKind, string> = {
  iframe: "distribution.iframe",
  direct_link: "distribution.directLink",
  testflight: "distribution.testflight",
  play_beta: "distribution.playBeta",
  steam_playtest: "distribution.steamPlaytest",
  drive: "distribution.drive",
  mega: "distribution.mega",
  itch: "distribution.itch",
  zip: "distribution.zip",
};

const modTypeKeys: Record<string, string> = {
  content: "modType.content",
  gameplay: "modType.gameplay",
  visual: "modType.visual",
  ui: "modType.ui",
  utility: "modType.utility",
  total_conversion: "modType.totalConversion",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function optionalValue(form: FormData, name: string) {
  const value = String(form.get(name) ?? "").trim();
  return value || null;
}

export default function NewProjectPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [category, setCategory] = useState<FormCategory>("gaming");
  const [publicationType, setPublicationType] =
    useState<PublicationType>("full_game");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alternativeLinks, setAlternativeLinks] = useState<AlternativeLink[]>([]);
  const [availableSlots, setAvailableSlots] = useState<number | null>(null);

  function getErrorMessage(error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      const errorMessage = error.message;
      if (typeof errorMessage === "string" && errorMessage) return errorMessage;
    }
    if (error instanceof Error && error.message) return error.message;
    try {
      return JSON.stringify(error);
    } catch {
      return t("newProject.unexpectedError");
    }
  }

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("type") === "mod") {
      setPublicationType("mod");
      setCategory("modding");
    }
  }, []);

  useEffect(() => {
    async function loadSlots() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAvailableSlots(0);
        return;
      }
      const { data, error } = await supabase.rpc("available_publish_slots", {
        target_user: user.id,
      });
      if (!error && typeof data === "number") setAvailableSlots(data);
    }
    void loadSlots();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const submitCategory: ProjectCategory =
      category === "software" ? "software" : "gaming";
    const title = String(form.get("title") ?? "").trim();
    const shortPitch = String(form.get("short_description") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const cleanAlternativeLinks = alternativeLinks
      .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
      .filter((link) => link.label && link.url);
    const rawSlug = String(form.get("slug") ?? "").trim();
    const slug = slugify(rawSlug || title);
    const selectedCover = form.get("cover_file");
    const coverFile = selectedCover instanceof File && selectedCover.size > 0
      ? selectedCover
      : null;
    const selectedPlatforms = form
      .getAll("platforms")
      .map(String)
      .filter((value): value is PlatformKind =>
        platformsByCategory[submitCategory].some(
          ([platform]) => platform === value,
        ),
      );
    const selectedDistribution = optionalValue(form, "distribution_type");
    const rawGenre = optionalValue(form, "genre");
    const selectedGenre =
      submitCategory === "gaming" &&
      gamingGenres.some((genre) => genre === rawGenre)
        ? rawGenre
        : null;
    const selectedGameSlug = optionalValue(form, "game_slug");
    const selectedGame = moddingGames.find(
      (game) => game.slug === selectedGameSlug,
    );

    if (slug.length < 3) {
      setMessage(t("newProject.slugTooShort"));
      setSubmitting(false);
      return;
    }

    if (
      selectedDistribution &&
      !distributionKinds.some(([kind]) => kind === selectedDistribution)
    ) {
      setMessage(t("newProject.invalidDistribution"));
      setSubmitting(false);
      return;
    }

    const isModding = category === "modding";
    if (isModding && !selectedGame) {
      setMessage(t("newProject.selectTargetGame"));
      setSubmitting(false);
      return;
    }
    if (
      coverFile &&
      (!["image/jpeg", "image/png", "image/webp"].includes(coverFile.type) ||
        coverFile.size > 5 * 1024 * 1024)
    ) {
      setMessage(t("newProject.coverRequirementsError"));
      setSubmitting(false);
      return;
    }

    const platforms =
      selectedPlatforms.length > 0
        ? selectedPlatforms
        : submitCategory === "software"
          ? (["desktop"] as PlatformKind[])
          : (["pc"] as PlatformKind[]);
    const selectedStatus = String(form.get("status") || "alpha");
    const developmentStatus = developmentStatuses.some(
      ([status]) => status === selectedStatus,
    )
      ? (selectedStatus as DevelopmentStatus)
      : "alpha";

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error(t("newProject.mustLogin"));
      await ensureProfile(supabase, user);

      const { data: slotsData, error: slotsError } = await supabase.rpc(
        "available_publish_slots",
        { target_user: user.id },
      );
      if (slotsError) throw slotsError;
      if (typeof slotsData === "number") {
        setAvailableSlots(slotsData);
        if (slotsData <= 0) {
          setMessage(t("newProject.slotsExhausted"));
          return;
        }
      }

      const cleanData: CleanProjectPayload = {
        owner_id: user.id,
        title,
        short_description: shortPitch || null,
        slug,
        category: submitCategory,
        project_type: isModding ? "mod" : "project",
        description: `${shortPitch}\n\n${description}`.trim(),
        development_status: developmentStatus,
        platforms,
        tags: Array.from(
          new Set([
            ...(selectedGenre ? [selectedGenre] : []),
            ...String(form.get("tags") ?? "")
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
            ...(publicationTypes[category].find(
              ([type]) => type === publicationType,
            )?.[1]
              ? [
                  publicationTypes[category].find(
                    ([type]) => type === publicationType,
                  )?.[1] as string,
                ]
              : []),
          ]),
        ),
        cover_url: optionalValue(form, "cover_url"),
        youtube_url: optionalValue(form, "youtube_url"),
        iframe_url: optionalValue(form, "iframe_url"),
        distribution_kind: selectedDistribution as DistributionKind | null,
        distribution_url: optionalValue(form, "distribution_link"),
        alternative_links: cleanAlternativeLinks,
        is_published: form.get("is_published") === "on",
        mod_version: isModding ? optionalValue(form, "mod_version") : null,
        compatibility: isModding ? optionalValue(form, "compatibility") : null,
        mod_type: isModding ? optionalValue(form, "mod_type") : null,
        mod_dependencies: isModding
          ? optionalValue(form, "mod_dependencies")
          : null,
        game_slug: isModding ? selectedGame?.slug || null : null,
        game_title: isModding ? selectedGame?.name || null : null,
        game_cover_url: isModding
          ? optionalValue(form, "game_cover_url") || selectedGame?.cover_url || null
          : null,
        mod_file_url: isModding ? optionalValue(form, "mod_file_url") : null,
        content_locale: locale,
      };

      const { error } = await supabase.from("projects").insert(cleanData);

      if (error) {
        setMessage(getErrorMessage(error));
        return;
      }

      if (coverFile) {
        const extension = coverFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/${slug}/cover.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("project-media")
          .upload(path, coverFile, { upsert: true, contentType: coverFile.type });
        if (uploadError) throw uploadError;
        const { data: publicData } = supabase.storage
          .from("project-media")
          .getPublicUrl(path);
        const { error: coverError } = await supabase
          .from("projects")
          .update({ cover_url: publicData.publicUrl })
          .eq("owner_id", user.id)
          .eq("slug", slug);
        if (coverError) throw coverError;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">{t("newProject.title")}</h1>
      {availableSlots !== null ? (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            availableSlots > 0
              ? "border-accent/30 bg-accent/10 text-accent"
              : "border-amber-500/30 bg-amber-500/10 text-amber-300"
          }`}
        >
          {availableSlots > 0
            ? t("newProject.slotsAvailable", {
                count: availableSlots >= 2147483647 ? "∞" : availableSlots,
              })
            : t("newProject.slotsExhausted")}
        </p>
      ) : null}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-white/10 bg-ink-800 p-6"
      >
        <label className="block text-sm">
          {t("newProject.category")}
          <select
            value={category}
            onChange={(event) => {
                const nextCategory = event.target.value as FormCategory;
                setCategory(nextCategory);
                setPublicationType(publicationTypes[nextCategory][0][0]);
              }}
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          >
            <option value="gaming">{t("newProject.categoryGaming")}</option>
            <option value="software">{t("newProject.categorySoftware")}</option>
            <option value="modding">{t("newProject.categoryModding")}</option>
          </select>
        </label>

        <label className="block text-sm">
          {t("newProject.publicationType")}
          <select
            name="publication_type"
            value={publicationType}
            onChange={(event) =>
              (() => {
                const nextType = event.target.value as PublicationType;
                setPublicationType(nextType);
              })()
            }
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          >
            {publicationTypes[category].map(([value]) => (
              <option key={value} value={value}>
                {t(publicationTypeKeys[value])}
              </option>
            ))}
          </select>
        </label>

        {category === "modding" || publicationType === "mod" ? (
          <div className="space-y-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
            <p className="text-sm font-medium text-accent">{t("newProject.modDetails")}</p>
            <label className="block text-sm">
              {t("newProject.targetGame")}
              <select
                name="game_slug"
                required
                defaultValue=""
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
              >
                <option value="" disabled>
                  {t("newProject.selectGame")}
                </option>
                {moddingGames.map((game) => (
                  <option key={game.slug} value={game.slug}>
                    {game.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                {t("newProject.modVersion")}
                <input
                  name="mod_version"
                  required
                  maxLength={40}
                  placeholder="1.0.0"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
                />
              </label>
              <label className="text-sm">
                {t("newProject.compatibility")}
                <input
                  name="compatibility"
                  required
                  maxLength={120}
                  placeholder="Minecraft 1.21 · PC"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
                />
              </label>
              <label className="text-sm">
                {t("newProject.modType")}
                <select
                  name="mod_type"
                  required
                  defaultValue=""
                  className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
                >
                  <option value="" disabled>
                    {t("newProject.selectType")}
                  </option>
                  {Object.entries(modTypeKeys).map(([value, key]) => (
                    <option key={value} value={value}>
                      {t(key)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-sm">
              {t("newProject.modDependencies")} <span className="text-zinc-500">({t("common.optional")})</span>
              <input
                name="mod_dependencies"
                maxLength={500}
                placeholder="Es. Fabric API 0.102+, Mod Menu"
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
              />
              <span className="mt-1 block text-xs text-zinc-500">
                {t("newProject.modDependenciesHint")}
              </span>
            </label>
            <label className="block text-sm">
              {t("newProject.externalLink")}
              <input
                name="mod_file_url"
                type="url"
                required
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
              />
            </label>
          </div>
        ) : null}

        <label className="block text-sm">
          {t("newProject.titleField")}
          <input
            name="title"
            required
            minLength={2}
            maxLength={80}
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          {t("newProject.slugOptional")}
          <input
            name="slug"
            pattern="[a-z0-9-]{3,80}"
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          {t("newProject.shortDescription")}
          <input
            name="short_description"
            required
            minLength={10}
            maxLength={180}
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          {t("newProject.description")}
          <textarea
            name="description"
            required
            rows={6}
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          {t("newProject.devStatus")}
          <select
            name="status"
            defaultValue="alpha"
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          >
            {developmentStatuses.map(([value]) => (
              <option key={value} value={value}>
                {t(devStatusKeys[value])}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm">{t("newProject.platforms")}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {platformsByCategory[category === "software" ? "software" : "gaming"].map(
              ([value]) => (
              <label key={value} className="text-sm">
                <input
                  type="checkbox"
                  name="platforms"
                  value={value}
                  className="mr-2"
                />
                {t(platformKeys[value])}
              </label>
              ),
            )}
          </div>
        </fieldset>

        {category !== "software" ? (
          <label className="block text-sm">
            {t("newProject.genre")}
            <select
              name="genre"
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
            >
              <option value="">{t("common.none")}</option>
              {gamingGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-zinc-400">
              {t("newProject.genreHint")}
            </span>
          </label>
        ) : null}

        <label className="block text-sm">
          {t("newProject.tags")}
          <input
            name="tags"
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          />
        </label>

        {category !== "modding" && publicationType !== "mod" ? <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            {t("newProject.coverUrl")}
            <input
              name="cover_url"
              type="url"
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            {t("newProject.youtubeUrl")}
            <input
              name="youtube_url"
              type="url"
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            {t("newProject.iframeUrl")}
            <input
              name="iframe_url"
              type="url"
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            {t("newProject.distributionType")}
            <select
              name="distribution_type"
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
            >
              <option value="">{t("common.none")}</option>
              {distributionKinds.map(([value]) => (
                <option key={value} value={value}>
                  {t(distributionKeys[value])}
                </option>
              ))}
            </select>
          </label>
        </div> : null}

        {category !== "modding" && publicationType !== "mod" ? <label className="block text-sm">
          {t("newProject.distributionLink")}
          <input
            name="distribution_link"
            type="url"
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          />
        </label> : null}

        <fieldset className="space-y-3 rounded-xl border border-white/10 bg-ink-900/50 p-4">
          <legend className="text-sm font-medium">{t("newProject.mirrorsLegend")}</legend>
          <p className="text-xs text-zinc-400">
            {t("newProject.mirrorsHint")}
          </p>
          {alternativeLinks.map((link, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1.5fr_auto]">
              <input
                value={link.label}
                onChange={(event) =>
                  setAlternativeLinks((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, label: event.target.value } : item,
                    ),
                  )
                }
                placeholder="Mirror MediaFire"
                aria-label={t("projectEdit.mirrorLabelAria", { n: index + 1 })}
                className="rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
              />
              <input
                value={link.url}
                onChange={(event) =>
                  setAlternativeLinks((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, url: event.target.value } : item,
                    ),
                  )
                }
                type="url"
                placeholder="https://..."
                aria-label={t("projectEdit.mirrorUrlAria", { n: index + 1 })}
                className="rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setAlternativeLinks((current) => current.filter((_, itemIndex) => itemIndex !== index))
                }
                className="rounded-lg border border-red-400/30 px-3 py-2 text-sm text-red-300"
              >
                {t("newProject.removeMirror")}
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setAlternativeLinks((current) => [...current, { label: "", url: "" }])
            }
            className="rounded-lg border border-white/10 px-3 py-2 text-sm"
          >
            {t("newProject.addMirror")}
          </button>
        </fieldset>

        <label className="block text-sm">
          {t("newProject.coverImage")}
          <input
            name="cover_file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-1 block w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-xs text-zinc-400">
            {t("newProject.coverRequirements")}
          </span>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input name="is_published" type="checkbox" />
          {t("newProject.publishNow")}
        </label>

        <button
          disabled={submitting || availableSlots === 0}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50"
        >
          {submitting ? t("newProject.saving") : t("newProject.saveCard")}
        </button>
        {message ? (
          <p role="alert" className="text-sm text-red-300">
            {message}
          </p>
        ) : null}
      </form>
    </div>
  );
}