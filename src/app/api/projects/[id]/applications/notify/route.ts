import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserEmail } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

const ROLE_LABELS: Record<string, string> = {
  game_design: "Game Design",
  qa_tester: "QA Tester",
  translations: "Traduzioni",
  development: "Sviluppo",
  community: "Community",
  art: "Art",
  other: "Altro",
};

type NotifyPayload = {
  project_id: string;
  role: string;
  message: string | null;
  portfolio_url: string | null;
  applicant_id: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<NotifyPayload>;
  const projectId = payload.project_id;
  const applicantId = payload.applicant_id;

  if (!projectId || !applicantId) {
    return NextResponse.json({ error: "Payload non valido." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("title, owner_id")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) {
    return NextResponse.json({ error: "Progetto non trovato." }, { status: 404 });
  }

  const { data: applicant } = await supabase
    .from("profiles")
    .select("display_name, username")
    .eq("id", applicantId)
    .maybeSingle();

  const ownerEmail = await getUserEmail(project.owner_id);
  if (!ownerEmail) {
    console.warn(
      `Nessuna email trovata per il proprietario ${project.owner_id}: notifica candidatura non inviata.`,
    );
    return NextResponse.json({ notified: false }, { status: 202 });
  }

  const applicantName = applicant?.display_name || applicant?.username || "Un utente";
  const roleLabel = ROLE_LABELS[payload.role ?? ""] || payload.role || "Non specificato";

  const html = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h2>Nuova candidatura per "${project.title}"</h2>
      <p><strong>${applicantName}</strong> si è candidato/a come <strong>${roleLabel}</strong>.</p>
      ${payload.message ? `<p><strong>Messaggio:</strong><br/>${payload.message}</p>` : ""}
      ${payload.portfolio_url ? `<p><strong>Portfolio:</strong> <a href="${payload.portfolio_url}">${payload.portfolio_url}</a></p>` : ""}
      <p>Puoi gestire la candidatura dalla tua dashboard su Testing Grounds.</p>
    </div>
  `;

  const result = await sendEmail({
    to: ownerEmail,
    subject: `Nuova candidatura per "${project.title}"`,
    html,
  });

  return NextResponse.json({ notified: result.sent });
}
