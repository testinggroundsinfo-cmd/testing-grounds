import { AppShell } from "@/components/layout/AppShell";
import { ProjectTabs } from "@/components/project/ProjectTabs";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, title, category, short_pitch, description")
    .eq("slug", slug)
    .maybeSingle();
  if (!project) notFound();

  return (
    <AppShell>
      <article className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-accent">Scheda prodotto</p>
          <h1 className="text-3xl font-semibold">{project.title}</h1>
          <p className="text-zinc-300">{project.short_pitch}</p>
          <p className="whitespace-pre-wrap text-zinc-400">{project.description}</p>
        </header>
        <ProjectTabs slug={slug} projectId={project.id} category={project.category} />
      </article>
    </AppShell>
  );
}
