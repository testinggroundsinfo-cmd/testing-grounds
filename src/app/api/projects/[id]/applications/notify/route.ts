import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const endpoint = process.env.SUPABASE_APPLICATION_NOTIFY_URL;
  const payload = await request.json();

  if (!endpoint) {
    console.warn(
      "SUPABASE_APPLICATION_NOTIFY_URL non configurata: candidatura salvata senza invio email.",
    );
    return NextResponse.json({ notified: false }, { status: 202 });
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "La notifica della candidatura non è stata consegnata." },
      { status: 502 },
    );
  }

  return NextResponse.json({ notified: true });
}
