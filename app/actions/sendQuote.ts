"use server";

import nodemailer from "nodemailer";

export type QuoteState = { ok: boolean; message: string } | null;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendQuote(
  _prevState: QuoteState,
  formData: FormData
): Promise<QuoteState> {
  const get = (key: string) =>
    (formData.get(key) as string | null)?.trim() ?? "";

  const name = get("name");
  const email = get("email");
  const phone = get("phone");
  const address = get("address");
  const fenceType = get("fenceType1");
  const message = get("message");

  if (!name || !email) {
    return { ok: false, message: "Please enter at least your name and email." };
  }

  // Credentials come from environment variables (see .env.local).
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) {
    return {
      ok: false,
      message:
        "Email isn't configured on the server yet. Set EMAIL_USER and EMAIL_PASS.",
    };
  }

  const to = process.env.QUOTE_TO || "STAGGMANAGEMENT@gmail.com";

  // If EMAIL_HOST is set (e.g. your domain's mail server), use it.
  // Otherwise fall back to Gmail. Set EMAIL_HOST for non-Gmail accounts
  // such as quote@stagfencing.com.au (unless that's a Google Workspace mailbox).
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT) || 587;
  const transporter = nodemailer.createTransport(
    host
      ? { host, port, secure: port === 465, auth: { user, pass } }
      : { service: "gmail", auth: { user, pass } }
  );

  const textBody = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "-"}`,
    `Address: ${address || "-"}`,
    `Fence type: ${fenceType || "-"}`,
    "",
    "Message:",
    message || "-",
  ].join("\n");

  const htmlBody = `
    <h2 style="margin:0 0 12px">New quote request</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone) || "-"}</p>
    <p><strong>Address:</strong> ${escapeHtml(address) || "-"}</p>
    <p><strong>Fence type:</strong> ${escapeHtml(fenceType) || "-"}</p>
    <p><strong>Message:</strong><br/>${
      escapeHtml(message).replace(/\n/g, "<br/>") || "-"
    }</p>
  `;

  try {
    await transporter.sendMail({
      from: `"Stag Fencing Website" <${user}>`,
      to,
      replyTo: email,
      subject: `New quote request — ${name}`,
      text: textBody,
      html: htmlBody,
    });

    return {
      ok: true,
      message:
        "Thanks! Your request has been sent — we'll get back to you within one day.",
    };
  } catch (error) {
    console.error("sendQuote failed:", error);
    return {
      ok: false,
      message:
        "Sorry, something went wrong sending your request. Please try again or call us.",
    };
  }
}
