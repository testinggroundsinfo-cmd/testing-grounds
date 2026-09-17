import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserEmail } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

type NotifyPayload = {
  project_id: string;
  title: string | null;
  bug_type: string | null;
  steps: string | null;
  reporter_id: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<NotifyPayload>;
  const projectId = payload.project_id;
  const reporterId = payload.reporter_id;

  if (!projectId || !reporterId) {
    return NextResponse.json({ error: "Payload non valido." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("title, owner_id, notify_new_bugs")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) {
    return NextResponse.json({ error: "Progetto non trovato." }, { status: 404 });
  }

  if (!project.notify_new_bugs) {
    return NextResponse.json({ notified: false, reason: "disabled" }, { status: 202 });
  }

  const { data: reporter } = await supabase
    .from("profiles")
    .select("display_name, username")
    .eq("id", reporterId)
    .maybeSingle();

  const ownerEmail = await getUserEmail(project.owner_id);
  if (!ownerEmail) {
    console.warn(
      `Nessuna email trovata per il proprietario ${project.owner_id}: notifica bug non inviata.`,
    );
    return NextResponse.json({ notified: false }, { status: 202 });
  }

  const reporterName = reporter?.display_name || reporter?.username || "Un tester";

  const html = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h2>Nuovo bug segnalato su "${project.title}"</h2>
      <p><strong>${reporterName}</strong> ha segnalato un problema${payload.title ? `: <strong>${payload.title}</strong>` : "."}</p>
      ${payload.bug_type ? `<p><strong>Tipo:</strong> ${payload.bug_type}</p>` : ""}
      ${payload.steps ? `<p><strong>Passaggi per riprodurlo:</strong><br/>${payload.steps}</p>` : ""}
      <p>Puoi vedere tutti i dettagli nella pagina pubblica del progetto o dalla tua dashboard.</p>
      <p style="font-size: 12px; color: #888;">Puoi disattivare queste notifiche dalla dashboard di modifica del progetto.</p>
    </div>
  `;

  const result = await sendEmail({
    to: ownerEmail,
    subject: `Nuovo bug segnalato su "${project.title}"`,
    html,
  });

  return NextResponse.json({ notified: result.sent });
}
