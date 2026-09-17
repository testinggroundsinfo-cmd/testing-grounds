import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ApplicationsPanel, type ProjectApplicationRow } from "@/components/dashboard/ApplicationsPanel";

export default async function DashboardProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, title")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (projectError || !project) notFound();

  const { data: applications, error: applicationsError } = await supabase
    .from("project_applications")
    .select("id, project_id, user_id, role, message, portfolio_url, status, created_at")
    .eq("project_id", id)
    .order("created_at", { ascending: false });
  if (applicationsError) console.error("Errore caricamento candidature:", applicationsError);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent">Gestione progetto</p>
        <h1 className="text-2xl font-semibold">{project.title || "Progetto"}</h1>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <Link href={`/dashboard/projects/${id}/edit`} className="rounded-md border border-white/10 px-3 py-1.5">Modifica scheda</Link>
          <Link href={`/dashboard/projects/${id}/releases`} className="rounded-md border border-white/10 px-3 py-1.5">Release</Link>
          <Link href={`/projects/${id}`} className="rounded-md border border-white/10 px-3 py-1.5">Visualizza pagina pubblica</Link>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Candidature collaboratori</h2>
        <ApplicationsPanel applications={(applications ?? []) as ProjectApplicationRow[]} />
      </section>
    </div>
  );
}
