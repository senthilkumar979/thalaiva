import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  if (!resend || !process.env.RESEND_FROM_EMAIL) return;
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: "Welcome to Thalaiva IPL Fantasy",
    html: `<p>Hi ${name},</p><p>Your Thalaiva account is ready. Good luck in the league!</p>`,
  });
}
