"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { requireBrowserUser } from "@/lib/auth/ensure-profile";
import { createClient } from "@/lib/supabaseClient";
import { moddingGames } from "@/data/modding-games";
import type {
  DevelopmentStatus,
  DistributionKind,
  PlatformKind,
  ProjectCategory,
} from "@/types/database";

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
  if (error instanceof Error) return error.message;
  return "Si è verificato un errore imprevisto durante il salvataggio.";
}

export default function NewProjectPage() {
  const router = useRouter();
  const [category, setCategory] = useState<ProjectCategory>("gaming");
  const [publicationType, setPublicationType] = useState<"project" | "mod">(
    "project",
  );
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const effectiveCategory: ProjectCategory =
      publicationType === "mod" ? "gaming" : category;
    const title = String(form.get("title") ?? "").trim();
    const slug = slugify(String(form.get("slug") || title));
    const selectedPlatforms = form
      .getAll("platforms")
      .map(String)
      .filter((value): value is PlatformKind =>
        platformsByCategory[effectiveCategory].some(
          ([platform]) => platform === value,
        ),
      );
    const selectedDistribution = optionalValue(form, "distribution_type");
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

    if (publicationType === "mod" && !selectedGame) {
      setMessage("Seleziona il gioco di destinazione della mod.");
      setSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();
      const user = await requireBrowserUser(supabase);

      const { error } = await supabase.from("projects").insert({
        // user_id richiesto dall'interfaccia corrisponde a owner_id nello schema.
        owner_id: user.id,
        category: publicationType === "mod" ? "gaming" : category,
        project_type: publicationType,
        title,
        slug,
        short_pitch: String(form.get("short_pitch") ?? "").trim(),
        description: String(form.get("description") ?? "").trim(),
        // status -> development_status
        development_status: String(
          form.get("status") || "alpha",
        ) as DevelopmentStatus,
        platforms: selectedPlatforms,
        tags: String(form.get("tags") ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        // cover_url -> cover_image_url
        cover_image_url: optionalValue(form, "cover_url"),
        youtube_url: optionalValue(form, "youtube_url"),
        iframe_url: optionalValue(form, "iframe_url"),
        // distribution_type/link -> distribution_kind/url
        distribution_kind: selectedDistribution as DistributionKind | null,
        distribution_url: optionalValue(form, "distribution_link"),
        is_published: form.get("is_published") === "on",
        game_slug: publicationType === "mod" ? selectedGame?.slug : null,
        game_title: publicationType === "mod" ? selectedGame?.name : null,
        mod_version:
          publicationType === "mod" ? optionalValue(form, "mod_version") : null,
        compatibility:
          publicationType === "mod"
            ? optionalValue(form, "compatibility")
            : null,
        game_cover_url:
          publicationType === "mod"
            ? optionalValue(form, "game_cover_url") || selectedGame?.cover_url
            : null,
        mod_file_url:
          publicationType === "mod"
            ? optionalValue(form, "mod_file_url")
            : null,
      });

      if (error) {
        throw new Error(
          `Impossibile salvare il progetto: ${error.message}`,
        );
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
            disabled={publicationType === "mod"}
            onChange={(event) =>
              setCategory(event.target.value as ProjectCategory)
            }
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          >
            <option value="gaming">Gaming</option>
            <option value="software">Software</option>
          </select>
        </label>

        <label className="block text-sm">
          Tipo di pubblicazione
          <select
            name="publication_type"
            value={publicationType}
            onChange={(event) =>
              (() => {
                const nextType = event.target.value as typeof publicationType;
                setPublicationType(nextType);
                if (nextType === "mod") setCategory("gaming");
              })()
            }
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          >
            <option value="project">Gioco / Software</option>
            <option value="mod">Mod per videogioco</option>
          </select>
        </label>

        {publicationType === "mod" ? (
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
              Cover del gioco (opzionale)
              <input
                name="game_cover_url"
                type="url"
                placeholder="Se vuoto usa la cover del catalogo"
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              File mod o link esterno
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
            name="short_pitch"
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
            {platformsByCategory[category].map(([value, label]) => (
              <label key={value} className="text-sm">
                <input
                  type="checkbox"
                  name="platforms"
                  value={value}
                  className="mr-2"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm">
          Tag (separati da virgola)
          <input
            name="tags"
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
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
        </div>

        <label className="block text-sm">
          Link distribuzione
          <input
            name="distribution_link"
            type="url"
            className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
          />
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
