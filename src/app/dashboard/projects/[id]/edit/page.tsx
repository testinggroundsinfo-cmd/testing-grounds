import { notFound, redirect } from "next/navigation";
import ProjectEditForm from "@/components/dashboard/ProjectEditForm";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/types/database";
import { T } from "@/components/i18n/T";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).eq("owner_id", user.id).maybeSingle();
  if (error || !data) notFound();
  return <div className="mx-auto max-w-2xl space-y-4"><h1 className="text-2xl font-semibold"><T k="dashboard.editProject" /></h1><ProjectEditForm project={data as Project} /></div>;
}