import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ProjectUpdate = {
  title?: string;
  slug?: string;
  short_description?: string | null;
  description?: string;
  youtube_url?: string | null;
  vimeo_url?: string | null;
  iframe_url?: string | null;
  distribution_url?: string | null;
  alternative_links?: { label: string; url: string }[];
  cover_url?: string | null;
  is_published?: boolean;
  notify_new_bugs?: boolean;
};

function isValidPayload(value: unknown): value is ProjectUpdate {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 401 });
  }
  if (!user) {
    return NextResponse.json({ error: "Autenticazione richiesta." }, { status: 401 });
  }

  const body: unknown = await request.json();
  if (!isValidPayload(body)) {
    return NextResponse.json({ error: "Payload non valido." }, { status: 400 });
  }

  const cleanData: ProjectUpdate = {};
  const allowedKeys: (keyof ProjectUpdate)[] = [
    "title",
    "slug",
    "short_description",
    "description",
    "youtube_url",
    "vimeo_url",
    "iframe_url",
    "distribution_url",
    "alternative_links",
    "cover_url",
    "is_published",
    "notify_new_bugs",
  ];
  for (const key of allowedKeys) {
    if (key in body) cleanData[key] = body[key] as never;
  }

  const { data: project, error: updateError } = await supabase
    .from("projects")
    .update(cleanData)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id, slug")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  revalidatePath(`/projects/${project.id}`);
  revalidatePath(`/projects/${project.slug}`);
  revalidatePath("/");
  revalidatePath("/gaming");
  revalidatePath("/software");
  revalidatePath("/modding");

  return NextResponse.json({ project });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 401 });
  }
  if (!user) {
    return NextResponse.json({ error: "Autenticazione richiesta." }, { status: 401 });
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, slug, game_slug")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 400 });
  }
  if (!project) {
    return NextResponse.json({ error: "Progetto non trovato." }, { status: 404 });
  }

  const { data: deleted, error: deleteError } = await supabase
    .from("projects")
    .delete()
    .eq("id", project.id)
    .eq("owner_id", user.id)
    .select("id");

  if (deleteError) {
    console.error("Errore eliminazione:", deleteError);
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  if (!deleted?.length) {
    return NextResponse.json(
      { error: "Eliminazione non consentita per questo progetto." },
      { status: 403 },
    );
  }

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath("/projects/[id]", "page");
  revalidatePath(`/projects/${project.id}`);
  revalidatePath(`/projects/${project.slug}`);
  revalidatePath("/gaming");
  revalidatePath("/software");
  revalidatePath("/modding");
  if (project.game_slug) {
    revalidatePath(`/modding/${project.game_slug}`);
  }

  return NextResponse.json({ deleted: true });
}
