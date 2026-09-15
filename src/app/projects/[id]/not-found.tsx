import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function ProjectNotFound() {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-glow text-accent">
        <SearchX className="h-8 w-8" />
      </div>
      <p className="mt-6 text-xs uppercase tracking-widest text-accent">
        Progetto non trovato
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Questa scheda non esiste</h1>
      <p className="mt-3 text-zinc-400">
        Il progetto potrebbe essere stato rimosso o il link potrebbe non essere
        più valido.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-accent-dim"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna ai progetti
      </Link>
    </div>
  );
}
