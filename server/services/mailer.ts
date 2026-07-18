import nodemailer from "nodemailer";

/**
 * Shared SMTP transport (Hostinger). Used by the quote form and OTP emails.
 * Cached so we don't rebuild a pool on every request.
 */
const globalForMail = globalThis as unknown as {
  _mailTransport?: nodemailer.Transporter;
};

export function getTransport() {
  if (globalForMail._mailTransport) return globalForMail._mailTransport;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) {
    throw new Error("EMAIL_USER / EMAIL_PASS are not configured");
  }

  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT) || 587;

  const transport = host
    ? nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      })
    : nodemailer.createTransport({ service: "gmail", auth: { user, pass } });

  globalForMail._mailTransport = transport;
  return transport;
}

export function mailFrom() {
  return `"Stag Fencing" <${process.env.EMAIL_USER}>`;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}) {
  const transport = getTransport();
  await transport.sendMail({ from: mailFrom(), ...options });
}
