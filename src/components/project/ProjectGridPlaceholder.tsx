import Link from "next/link";
import type { ProjectCategory } from "@/types/database";

export function ProjectGridPlaceholder({
  category,
}: {
  category: ProjectCategory;
}) {
  const samples =
    category === "gaming"
      ? ["neon-drift", "dungeon-seed", "orbit-protocol"]
      : ["inbox-zero-kit", "palette-lab", "tab-sorter"];

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {samples.map((slug) => (
        <li key={slug}>
          <Link
            href={`/projects/${slug}`}
            className="block rounded-2xl border border-white/10 bg-ink-800 p-5 transition hover:border-accent/40"
          >
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              {category === "gaming" ? "Playtest" : "Closed Beta"}
            </p>
            <h2 className="mt-2 text-lg font-medium">{slug.replaceAll("-", " ")}</h2>
          </Link>
        </li>
      ))}
    </ul>
  );
}
