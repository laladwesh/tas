import { connectDB } from "@/server/db/mongoose";
import { Lead } from "@/server/models";
import type { LeadInput } from "@/lib/validation";

/** Persist the lead FIRST so a mail failure can never lose an enquiry. */
export async function createLead(input: LeadInput) {
  await connectDB();
  const lead = await Lead.create({ ...input, status: "new", emailed: false });
  return lead;
}

export async function markLeadEmailed(id: string, error?: string) {
  await connectDB();
  await Lead.findByIdAndUpdate(id, {
    emailed: !error,
    emailError: error ?? "",
  });
}

export async function listLeads() {
  await connectDB();
  const docs = await Lead.find().sort({ createdAt: -1 }).limit(200).lean();
  return docs.map((d) => ({
    id: String(d._id),
    name: d.name,
    email: d.email,
    phone: d.phone ?? "",
    address: d.address ?? "",
    fenceType: d.fenceType ?? "",
    message: d.message ?? "",
    status: d.status ?? "new",
    emailed: Boolean(d.emailed),
    emailError: d.emailError ?? "",
    createdAt: (d.createdAt as Date)?.toISOString() ?? "",
  }));
}

export async function countLeads() {
  await connectDB();
  const [total, fresh] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ status: "new" }),
  ]);
  return { total, fresh };
}
