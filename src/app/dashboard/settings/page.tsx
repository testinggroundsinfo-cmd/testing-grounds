import Link from "next/link";
import ProfileSettingsForm from "@/components/dashboard/ProfileSettingsForm";

export default function DashboardSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/dashboard" className="inline-flex text-sm text-accent">← Torna ai Progetti</Link>
      <header>
        <p className="text-xs uppercase tracking-widest text-accent">Dashboard sviluppatore</p>
        <h1 className="mt-2 text-3xl font-semibold">Impostazioni Profilo</h1>
        <p className="mt-2 text-sm text-zinc-400">Gestisci i dati visibili nella tua pagina pubblica.</p>
      </header>
      <ProfileSettingsForm />
    </div>
  );
}
