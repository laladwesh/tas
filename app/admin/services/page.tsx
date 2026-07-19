import Image from "next/image";
import { listAllServices, type AdminService } from "@/server/services/adminContent";
import {
  createService,
  updateService,
  deleteService,
} from "@/app/admin/_actions/content";
import ImageField from "@/app/admin/_components/ImageField";
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

/** Empty defaults so the "Add" form can share the rich-fields block. */
const BLANK: Partial<AdminService> = {};

/**
 * The rich service-detail fields. Arrays are entered as plain text — one item
 * per line, and "|" separates columns — so no custom array widgets are needed.
 * Each section on the public page hides itself when its box is left empty.
 */
function RichServiceFields({ s = BLANK }: { s?: Partial<AdminService> }) {
  const ta = `${inputClass} resize-y font-mono text-xs`;
  return (
    <details className="sm:col-span-2">
      <summary className="cursor-pointer text-sm font-semibold text-gray-700">
        Detail page content (colours, heights, FAQ…) — optional
      </summary>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Intro paragraph (header)">
            <textarea name="intro" rows={3} defaultValue={s.intro} className={`${inputClass} resize-y`} />
          </Field>
        </div>
        <Field label='Price value (big number, e.g. "$95")'>
          <input name="priceValue" defaultValue={s.priceValue} className={inputClass} />
        </Field>
        <Field label='Price unit (e.g. "Supplied & installed")'>
          <input name="priceUnit" defaultValue={s.priceUnit} className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Badges — one per line (e.g. Licensed & insured)">
            <textarea name="badges" rows={2} defaultValue={s.badges} className={ta} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Stats — one per line: value | label   (e.g. 10 yr | BlueScope warranty)">
            <textarea name="stats" rows={4} defaultValue={s.stats} className={ta} />
          </Field>
        </div>
        <Field label='Colours section title (e.g. "Pick your colour", "Sleeper finishes")'>
          <input name="coloursTitle" defaultValue={s.coloursTitle} placeholder="Pick your colour" className={inputClass} />
        </Field>
        <Field label='Colours note (e.g. "All 9 colours in stock")'>
          <input name="coloursNote" defaultValue={s.coloursNote} className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Colours — one per line: name | #hex   (e.g. Monument | #4a4a48)">
            <textarea name="colours" rows={4} defaultValue={s.colours} className={ta} />
          </Field>
        </div>
        <Field label='Sizes section title (e.g. "Heights & pricing", "Sleeper sizes & pricing", "Styles & pricing")'>
          <input name="heightsTitle" defaultValue={s.heightsTitle} placeholder="Heights & pricing" className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Sizes — one per line: label | price | popular?   (e.g. 1800mm | from $104 / lm | yes)">
            <textarea name="heights" rows={4} defaultValue={s.heights} className={ta} />
          </Field>
        </div>
        <Field label='"Includes" section title (default "Every install includes")'>
          <input name="includesTitle" defaultValue={s.includesTitle} placeholder="Every install includes" className={inputClass} />
        </Field>
        <Field label='"Add-ons" section title (default "Popular add-ons")'>
          <input name="addonsTitle" defaultValue={s.addonsTitle} placeholder="Popular add-ons" className={inputClass} />
        </Field>
        <div>
          <Field label="Includes list — one per line">
            <textarea name="includes" rows={4} defaultValue={s.includes} className={ta} />
          </Field>
        </div>
        <div>
          <Field label="Add-ons list — one per line">
            <textarea name="addons" rows={4} defaultValue={s.addons} className={ta} />
          </Field>
        </div>
        <Field label="Compliance heading">
          <input name="complianceTitle" defaultValue={s.complianceTitle} className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Compliance points — one per line">
            <textarea name="compliance" rows={3} defaultValue={s.compliance} className={ta} />
          </Field>
        </div>
        <Field label='Process section title (default "From first call to last panel")'>
          <input name="processTitle" defaultValue={s.processTitle} placeholder="From first call to last panel" className={inputClass} />
        </Field>
        <Field label='Reviews section title (default "What Perth homeowners say")'>
          <input name="reviewsTitle" defaultValue={s.reviewsTitle} placeholder="What Perth homeowners say" className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Process steps — one per line: title | description">
            <textarea name="process" rows={4} defaultValue={s.process} className={ta} />
          </Field>
        </div>
        <Field label='Project category (matches Gallery tag, e.g. "Colorbond")'>
          <input name="projectCategory" defaultValue={s.projectCategory} className={inputClass} />
        </Field>
        <Field label='Product category (matches Shop category, e.g. "Color Bond Fencing")'>
          <input name="productCategory" defaultValue={s.productCategory} className={inputClass} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="FAQs — one per line: question | answer">
            <textarea name="faqs" rows={5} defaultValue={s.faqs} className={ta} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Areas we service — one per line">
            <textarea name="areas" rows={3} defaultValue={s.areas} className={ta} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Parent service slug (leave blank for a top-level service). Set this to make this service a RANGE ITEM of another — e.g. parent 'pool-fencing'.">
            <input name="parentSlug" defaultValue={s.parentSlug} placeholder="pool-fencing" className={inputClass} />
          </Field>
        </div>
      </div>
    </details>
  );
}

export default async function ServicesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const services = await listAllServices();

  return (
    <>
      <PageHeader
        title="Services"
        description="These power the “Our Services” grid, the quote form dropdown, and each service detail page."
      />
      <Banner ok={ok} error={error} />

      <div className="space-y-6">
        <Card title="Add a service">
          <form action={createService} className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <input name="title" required placeholder="Colorbond Fencing" className={inputClass} />
            </Field>
            <Field label="Slug (URL)">
              <input name="slug" placeholder="colorbond-fencing" className={inputClass} />
            </Field>
            <Field label="Price label">
              <input name="price" placeholder="$99/lm" className={inputClass} />
            </Field>
            <Field label="Price from (services grid)">
              <input name="priceFrom" placeholder="from $95 / lm" className={inputClass} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Excerpt">
                <textarea name="excerpt" rows={2} className={`${inputClass} resize-y`} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <ImageField name="image" label="Service image" folder="services" required />
            </div>
            <Field label="Order">
              <input name="order" type="number" defaultValue={services.length} className={inputClass} />
            </Field>
            <RichServiceFields />
            <div className="flex items-center gap-4 sm:col-span-2">
              <Checkbox name="active" label="Visible on site" defaultChecked />
              <PrimaryButton type="submit">Add service</PrimaryButton>
            </div>
          </form>
        </Card>

        <Card title={`Existing services (${services.length})`}>
          {services.length === 0 ? (
            <p className="text-sm text-gray-500">
              None yet. Run <code className="rounded bg-gray-100 px-1">npm run seed:demo</code> to load
              the demo content, or add one above.
            </p>
          ) : (
            <ul className="space-y-4">
              {services.map((service) => (
                <li key={service.id} className="rounded-sm border border-gray-200 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative h-20 w-40 shrink-0 overflow-hidden rounded-sm bg-gray-100">
                      {service.image.startsWith("/") || service.image.startsWith("http") ? (
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          sizes="160px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>

                    <form action={updateService} className="grid flex-1 gap-3 sm:grid-cols-2">
                      <input type="hidden" name="id" value={service.id} />
                      <Field label="Title">
                        <input name="title" defaultValue={service.title} className={inputClass} />
                      </Field>
                      <Field label="Slug (URL)">
                        <input name="slug" defaultValue={service.slug} className={inputClass} />
                      </Field>
                      <Field label="Price label">
                        <input name="price" defaultValue={service.price} className={inputClass} />
                      </Field>
                      <Field label="Price from">
                        <input name="priceFrom" defaultValue={service.priceFrom} className={inputClass} />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="Excerpt">
                          <textarea name="excerpt" rows={2} defaultValue={service.excerpt} className={`${inputClass} resize-y`} />
                        </Field>
                      </div>
                      <div className="sm:col-span-2">
                        <ImageField name="image" label="Service image" defaultValue={service.image} folder="services" />
                      </div>
                      <Field label="Order">
                        <input name="order" type="number" defaultValue={service.order} className={inputClass} />
                      </Field>
                      <RichServiceFields s={service} />
                      <div className="flex items-center gap-4 sm:col-span-2">
                        <Checkbox name="active" label="Visible" defaultChecked={service.active} />
                        <GhostButton type="submit">Save</GhostButton>
                      </div>
                    </form>
                  </div>

                  <form action={deleteService} className="mt-3 border-t border-gray-100 pt-3">
                    <input type="hidden" name="id" value={service.id} />
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
