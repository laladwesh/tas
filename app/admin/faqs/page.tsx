import { listAllFaqs } from "@/server/services/adminContent";
import { createFaq, updateFaq, deleteFaq } from "@/app/admin/_actions/content";
import {
  Banner,
  Card,
  Checkbox,
  DangerButton,
  Field,
  GhostButton,
  PageHeader,
  PrimaryButton,
  inputClass,
} from "@/app/admin/_components/ui";

export default async function FaqsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const faqs = await listAllFaqs();

  return (
    <>
      <PageHeader
        title="FAQs"
        description="Shown in the FAQ accordion and published as FAQPage structured data for Google rich results."
      />
      <Banner ok={ok} error={error} />

      <div className="space-y-6">
        <Card title="Add an FAQ">
          <form action={createFaq} className="space-y-4">
            <Field label="Question">
              <input name="question" required placeholder="What types of fencing do you offer in Perth?" className={inputClass} />
            </Field>
            <Field label="Answer (plain text — also used by Google)">
              <textarea name="answer" required rows={3} className={`${inputClass} resize-y`} />
            </Field>
            <div className="flex flex-wrap items-center gap-4">
              <Field label="Shown on">
                <select name="page" defaultValue="home" className={`${inputClass} w-32`}>
                  <option value="home">Home</option>
                  <option value="services">Services</option>
                  <option value="shop">Shop</option>
                </select>
              </Field>
              <Field label="Order">
                <input name="order" type="number" defaultValue={faqs.length} className={`${inputClass} w-24`} />
              </Field>
              <Checkbox name="defaultOpen" label="Open by default" />
              <Checkbox name="active" label="Visible on site" defaultChecked />
              <PrimaryButton type="submit">Add FAQ</PrimaryButton>
            </div>
          </form>
        </Card>

        <Card title={`Existing FAQs (${faqs.length})`}>
          {faqs.length === 0 ? (
            <p className="text-sm text-gray-500">
              None yet. Run <code className="rounded bg-gray-100 px-1">npm run seed</code> or add one above.
            </p>
          ) : (
            <ul className="space-y-4">
              {faqs.map((faq) => (
                <li key={faq.id} className="rounded-sm border border-gray-200 p-4">
                  <form action={updateFaq} className="space-y-3">
                    <input type="hidden" name="id" value={faq.id} />
                    <Field label="Question">
                      <input name="question" defaultValue={faq.question} className={inputClass} />
                    </Field>
                    <Field label="Answer">
                      <textarea name="answer" defaultValue={faq.answer} rows={3} className={`${inputClass} resize-y`} />
                    </Field>
                    <div className="flex flex-wrap items-center gap-4">
                      <Field label="Shown on">
                        <select name="page" defaultValue={faq.page} className={`${inputClass} w-32`}>
                          <option value="home">Home</option>
                          <option value="services">Services</option>
                          <option value="shop">Shop</option>
                        </select>
                      </Field>
                      <Field label="Order">
                        <input name="order" type="number" defaultValue={faq.order} className={`${inputClass} w-24`} />
                      </Field>
                      <Checkbox name="defaultOpen" label="Open by default" defaultChecked={faq.defaultOpen} />
                      <Checkbox name="active" label="Visible" defaultChecked={faq.active} />
                      <GhostButton type="submit">Save</GhostButton>
                    </div>
                  </form>

                  <form action={deleteFaq} className="mt-3 border-t border-gray-100 pt-3">
                    <input type="hidden" name="id" value={faq.id} />
                    <DangerButton type="submit">Delete</DangerButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
