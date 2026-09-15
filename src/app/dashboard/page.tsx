import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard sviluppatore</h1>
      <p className="text-sm text-zinc-400">
        Qui arriveranno feedback, bug report e candidature collaboratori.
      </p>
      <Link
        href="/dashboard/projects/new"
        className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950"
      >
        Pubblica una scheda
      </Link>
    </div>
  );
}
