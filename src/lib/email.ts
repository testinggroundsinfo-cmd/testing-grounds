import { Resend } from "resend";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Invia un'email tramite Resend. Se RESEND_API_KEY non è configurata,
 * l'invio viene saltato con un warning (utile in sviluppo/staging senza
 * chiave API), senza far fallire il flusso principale (candidatura/bug).
 */
export async function sendEmail({ to, subject, html }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      `RESEND_API_KEY non configurata: email "${subject}" a ${to} non inviata.`,
    );
    return { sent: false as const };
  }

  const from = process.env.EMAIL_FROM || "Testing Grounds <notifiche@testing-grounds.app>";

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from, to, subject, html });

  if (error) {
    console.error("Errore invio email Resend:", error);
    return { sent: false as const, error: error.message };
  }

  return { sent: true as const };
}
