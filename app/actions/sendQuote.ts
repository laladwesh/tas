"use server";

import { leadSchema } from "@/lib/validation";
import { createLead, markLeadEmailed } from "@/server/services/leads";
import { sendMail } from "@/server/services/mailer";

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
  const parsed = leadSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address: String(formData.get("address") ?? ""),
    fenceType: String(formData.get("fenceType1") ?? ""),
    message: String(formData.get("message") ?? ""),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }
  const lead = parsed.data;

  /* 1. Persist FIRST. An SMTP outage must never lose an enquiry. */
  let leadId: string | null = null;
  try {
    const doc = await createLead(lead);
    leadId = String(doc._id);
  } catch (error) {
    console.error("[sendQuote] failed to save lead:", error);
    // Keep going — a saved-but-unemailed lead is better than nothing, but a
    // DB outage shouldn't stop us from at least trying to email the enquiry.
  }

  /* 2. Then notify. */
  const to = process.env.QUOTE_TO || "STAGGMANAGEMENT@gmail.com";
  const textBody = [
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone || "-"}`,
    `Address: ${lead.address || "-"}`,
    `Fence type: ${lead.fenceType || "-"}`,
    "",
    "Message:",
    lead.message || "-",
  ].join("\n");

  const htmlBody = `
    <h2 style="margin:0 0 12px">New quote request</h2>
    <p><strong>Name:</strong> ${escapeHtml(lead.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(lead.phone) || "-"}</p>
    <p><strong>Address:</strong> ${escapeHtml(lead.address) || "-"}</p>
    <p><strong>Fence type:</strong> ${escapeHtml(lead.fenceType) || "-"}</p>
    <p><strong>Message:</strong><br/>${
      escapeHtml(lead.message).replace(/\n/g, "<br/>") || "-"
    }</p>
  `;

  try {
    await sendMail({
      to,
      replyTo: lead.email,
      subject: `New quote request — ${lead.name}`,
      text: textBody,
      html: htmlBody,
    });
    if (leadId) await markLeadEmailed(leadId);
  } catch (error) {
    console.error("[sendQuote] email failed:", error);
    if (leadId) {
      await markLeadEmailed(leadId, String(error)).catch(() => {});
      // The enquiry is safely stored and flagged in /admin/leads.
      return {
        ok: true,
        message:
          "Thanks! We've received your request and will get back to you within one day.",
      };
    }
    return {
      ok: false,
      message:
        "Sorry, something went wrong sending your request. Please try again or call us.",
    };
  }

  return {
    ok: true,
    message:
      "Thanks! Your request has been sent — we'll get back to you within one day.",
  };
}
