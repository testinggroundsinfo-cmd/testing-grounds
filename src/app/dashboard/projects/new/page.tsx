"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureProfile } from "@/lib/auth/ensure-profile";
import { createClient } from "@/lib/supabaseClient";
import { moddingGames } from "@/data/modding-games";
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
  game_slug: string | null;
  game_title: string | null;
  game_cover_url: string | null;
  mod_file_url: string | null;
  is_published: boolean;
};

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

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = error.message;
    if (typeof message === "string" && message) return message;
  }
  if (error instanceof Error && error.message) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return "Errore imprevisto durante il salvataggio.";
  }
}

export default function NewProjectPage() {
  const router = useRouter();
  const [category, setCategory] = useState<FormCategory>("gaming");
  const [publicationType, setPublicationType] =
    useState<PublicationType>("full_game");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alternativeLinks, setAlternativeLinks] = useState<AlternativeLink[]>([]);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("type") === "mod") {
      setPublicationType("mod");
      setCategory("modding");
    }
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
      setMessage(
        "Lo slug deve contenere almeno 3 caratteri alfanumerici o trattini.",
      );
      setSubmitting(false);
      return;
    }

    if (
      selectedDistribution &&
      !distributionKinds.some(([kind]) => kind === selectedDistribution)
    ) {
      setMessage("Il tipo di distribuzione selezionato non è valido.");
      setSubmitting(false);
      return;
    }

    const isModding = category === "modding";
    if (isModding && !selectedGame) {
      setMessage("Seleziona il gioco di destinazione della mod.");
      setSubmitting(false);
      return;
    }
    if (
      coverFile &&
      (!["image/jpeg", "image/png", "image/webp"].includes(coverFile.type) ||
        coverFile.size > 5 * 1024 * 1024)
    ) {
      setMessage("La cover deve essere JPG, PNG o WebP e non superare 5 MB.");
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
      if (!user) throw new Error("Devi accedere per pubblicare un progetto.");
      await ensureProfile(supabase, user);

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
        game_slug: isModding ? selectedGame?.slug || null : null,
        game_title: isModding ? selectedGame?.name || null : null,
        game_cover_url: isModding
          ? optionalValue(form, "game_cover_url") || selectedGame?.cover_url || null
          : null,
        mod_file_url: isModding ? optionalValue(form, "mod_file_url") : null,
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
      <h1 className="text-2xl font-semibold">Nuova scheda</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-white/10 bg-ink-800 p-6"
      >
        <label className="block text-sm">
          Categoria
          <select
            value={category}
            onChange={(event) => {
                const nextCategory = event.target.value as FormCategory;
                setCategory(nextCategory);
                setPublicationType(publicationTypes[nextCategory][0][0]);
              }}
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          >
            <option value="gaming">Gaming</option>
            <option value="software">App &amp; Software</option>
            <option value="modding">Modding</option>
          </select>
        </label>

        <label className="block text-sm">
          Tipo di pubblicazione
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
            {publicationTypes[category].map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        {category === "modding" || publicationType === "mod" ? (
          <div className="space-y-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
            <p className="text-sm font-medium text-accent">Dettagli mod</p>
            <label className="block text-sm">
              Gioco di destinazione
              <select
                name="game_slug"
                required
                defaultValue=""
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
              >
                <option value="" disabled>
                  Seleziona un gioco
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
                Versione mod
                <input
                  name="mod_version"
                  required
                  maxLength={40}
                  placeholder="1.0.0"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
                />
              </label>
              <label className="text-sm">
                Compatibilità
                <input
                  name="compatibility"
                  required
                  maxLength={120}
                  placeholder="Minecraft 1.21 · PC"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
                />
              </label>
            </div>
            <label className="block text-sm">
              Link esterno / File download
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
          Titolo
          <input
            name="title"
            required
            minLength={2}
            maxLength={80}
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          Slug (opzionale)
          <input
            name="slug"
            pattern="[a-z0-9-]{3,80}"
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          Descrizione breve
          <input
            name="short_description"
            required
            minLength={10}
            maxLength={180}
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          Descrizione
          <textarea
            name="description"
            required
            rows={6}
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          Stato di sviluppo
          <select
            name="status"
            defaultValue="alpha"
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          >
            {developmentStatuses.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm">Piattaforme</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {platformsByCategory[category === "software" ? "software" : "gaming"].map(
              ([value, label]) => (
              <label key={value} className="text-sm">
                <input
                  type="checkbox"
                  name="platforms"
                  value={value}
                  className="mr-2"
                />
                {label}
              </label>
              ),
            )}
          </div>
        </fieldset>

        {category !== "software" ? (
          <label className="block text-sm">
            Genere
            <select
              name="genre"
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
            >
              <option value="">Nessuno</option>
              {gamingGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-zinc-400">
              Il genere viene salvato tra i tag e alimenta i filtri del catalogo.
            </span>
          </label>
        ) : null}

        <label className="block text-sm">
          Tag (separati da virgola)
          <input
            name="tags"
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          />
        </label>

        {category !== "modding" && publicationType !== "mod" ? <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Cover URL
            <input
              name="cover_url"
              type="url"
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            YouTube URL
            <input
              name="youtube_url"
              type="url"
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Iframe URL
            <input
              name="iframe_url"
              type="url"
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Tipo distribuzione
            <select
              name="distribution_type"
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
            >
              <option value="">Nessuno</option>
              {distributionKinds.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div> : null}

        {category !== "modding" && publicationType !== "mod" ? <label className="block text-sm">
          Link distribuzione
          <input
            name="distribution_link"
            type="url"
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          />
        </label> : null}

        <fieldset className="space-y-3 rounded-xl border border-white/10 bg-ink-900/50 p-4">
          <legend className="text-sm font-medium">Link Alternativi / Mirror</legend>
          <p className="text-xs text-zinc-400">
            Aggiungi fonti alternative per il download o l&apos;accesso.
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
                aria-label={`Etichetta mirror ${index + 1}`}
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
                aria-label={`URL mirror ${index + 1}`}
                className="rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setAlternativeLinks((current) => current.filter((_, itemIndex) => itemIndex !== index))
                }
                className="rounded-lg border border-red-400/30 px-3 py-2 text-sm text-red-300"
              >
                Rimuovi
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setAlternativeLinks((current) => [...current, { label: "", url: "" }])}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm"
          >
            + Aggiungi mirror
          </button>
        </fieldset>

        <label className="block text-sm">
          Immagine di copertina
          <input
            name="cover_file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-1 block w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-xs text-zinc-400">
            JPG, PNG o WebP. Massimo 5 MB.
          </span>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input name="is_published" type="checkbox" />
          Pubblica subito
        </label>

        <button
          disabled={submitting}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50"
        >
          {submitting ? "Salvataggio..." : "Salva scheda"}
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
