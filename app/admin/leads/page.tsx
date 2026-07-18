import { listLeads } from "@/server/services/leads";
import { updateLeadStatus, deleteLead } from "@/app/admin/_actions/content";
import {
  Banner,
  Card,
  DangerButton,
  GhostButton,
  PageHeader,
  inputClass,
} from "@/app/admin/_components/ui";

const STATUSES = ["new", "contacted", "quoted", "won", "lost"] as const;

export default async function LeadsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const leads = await listLeads();

  return (
    <>
      <PageHeader
        title="Leads"
        description="Every “Get Free Quote” submission, saved before the notification email is attempted."
      />
      <Banner ok={ok} error={error} />

      <Card title={`Enquiries (${leads.length})`}>
        {leads.length === 0 ? (
          <p className="text-sm text-gray-500">No enquiries yet.</p>
        ) : (
          <ul className="space-y-4">
            {leads.map((lead) => (
              <li key={lead.id} className="rounded-sm border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{lead.name}</p>
                    <p className="text-sm text-gray-600">
                      <a href={`mailto:${lead.email}`} className="text-brand underline">
                        {lead.email}
                      </a>
                      {lead.phone && <> · {lead.phone}</>}
                    </p>
                    {lead.address && (
                      <p className="mt-0.5 text-sm text-gray-500">{lead.address}</p>
                    )}
                  </div>

                  <div className="text-right text-xs text-gray-500">
                    <p>{lead.createdAt ? new Date(lead.createdAt).toLocaleString() : ""}</p>
                    {lead.emailed ? (
                      <p className="mt-1 text-green-600">Email sent</p>
                    ) : (
                      <p className="mt-1 text-brand" title={lead.emailError}>
                        Email failed — follow up manually
                      </p>
                    )}
                  </div>
                </div>

                {lead.fenceType && (
                  <p className="mt-3 text-sm">
                    <span className="text-gray-500">Fence type:</span>{" "}
                    <span className="font-medium text-gray-800">{lead.fenceType}</span>
                  </p>
                )}

                {lead.message && (
                  <p className="mt-2 whitespace-pre-line rounded-sm bg-gray-50 p-3 text-sm text-gray-700">
                    {lead.message}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
                  <form action={updateLeadStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={lead.id} />
                    <select
                      name="status"
                      defaultValue={lead.status}
                      className={`${inputClass} w-36`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s[0].toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    <GhostButton type="submit">Update</GhostButton>
                  </form>

                  <form action={deleteLead}>
                    <input type="hidden" name="id" value={lead.id} />
                    <DangerButton type="submit">Delete</DangerButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
