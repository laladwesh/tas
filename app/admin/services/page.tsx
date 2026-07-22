import Image from "next/image";
import { listAllServices, type AdminService } from "@/server/services/adminContent";
import {
  createService,
  updateService,
  deleteService,
} from "@/app/admin/_actions/content";
import ImageField from "@/app/admin/_components/ImageField";
import TagListField from "@/app/admin/_components/TagListField";
import RepeaterField from "@/app/admin/_components/RepeaterField";
import ServiceListFilter from "@/app/admin/_components/ServiceListFilter";
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

const VISUALS = [
  "solid",
  "gapped",
  "glass",
  "radiator",
  "sleeper",
  "mesh",
  "perf-slot",
  "perf-custom",
  "perf-round",
];

/** Empty defaults so the "Add" form can share the rich-fields block. */
const BLANK: Partial<AdminService> = {};

/** A visually separated group inside the rich-fields form. */
function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="sm:col-span-2 rounded-sm border border-gray-200 p-4">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

/**
 * Rich service-detail fields, grouped to match the sections they power on the
 * public page, with real add/remove-row editors instead of raw
 * pipe-delimited textareas. Every group hides its section on the public page
 * when left empty.
 */
function RichServiceFields({ s = BLANK }: { s?: Partial<AdminService> }) {
  return (
    <details className="sm:col-span-2" open>
      <summary className="cursor-pointer text-sm font-semibold text-gray-700">
        Detail page content (colours, sizes, FAQs…) — optional, expand to edit
      </summary>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Group title="Header" hint="The intro text and price card at the top of the page.">
          <div className="sm:col-span-2">
            <Field label="Intro paragraph">
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
            <TagListField
              name="badges"
              label="Trust badges"
              defaultValue={s.badges}
              placeholder="e.g. Licensed & insured"
            />
          </div>
        </Group>

        <Group title="Stats row" hint="The 4 small tiles under the header.">
          <div className="sm:col-span-2">
            <RepeaterField
              name="stats"
              label="Stats"
              addLabel="Add stat"
              defaultValue={s.stats}
              columns={[
                { key: "value", label: "Value", type: "text", placeholder: "10 yr" },
                { key: "label", label: "Label", type: "text", placeholder: "BlueScope warranty" },
              ]}
            />
          </div>
        </Group>

        <Group title="Colours / finishes" hint="Optional — leave empty to hide this section entirely.">
          <Field label='Section title (e.g. "Pick your colour", "Sleeper finishes")'>
            <input name="coloursTitle" defaultValue={s.coloursTitle} placeholder="Pick your colour" className={inputClass} />
          </Field>
          <Field label='Note (e.g. "All 9 colours in stock")'>
            <input name="coloursNote" defaultValue={s.coloursNote} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <RepeaterField
              name="colours"
              label="Swatches"
              addLabel="Add colour"
              defaultValue={s.colours}
              columns={[
                { key: "name", label: "Name", type: "text", placeholder: "Monument" },
                { key: "hex", label: "Colour", type: "color", placeholder: "#4a4a48" },
              ]}
            />
          </div>
        </Group>

        <Group title="Sizes & pricing tiles" hint="Optional — leave empty to hide this section entirely.">
          <div className="sm:col-span-2">
            <Field label='Section title (e.g. "Heights & pricing", "Sleeper sizes & pricing", "Styles & pricing")'>
              <input name="heightsTitle" defaultValue={s.heightsTitle} placeholder="Heights & pricing" className={inputClass} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <RepeaterField
              name="heights"
              label="Tiles"
              addLabel="Add tile"
              defaultValue={s.heights}
              hint="Visual = the little illustration on the tile"
              columns={[
                { key: "label", label: "Label", type: "text", placeholder: "1800mm" },
                { key: "priceLabel", label: "Price", type: "text", placeholder: "from $104 / lm" },
                { key: "popular", label: "Most popular", type: "checkbox" },
                { key: "visual", label: "Visual", type: "select", options: VISUALS },
              ]}
            />
          </div>
        </Group>

        <Group title="Included & add-ons">
          <Field label='"Includes" section title'>
            <input name="includesTitle" defaultValue={s.includesTitle} placeholder="Every install includes" className={inputClass} />
          </Field>
          <Field label='"Add-ons" section title'>
            <input name="addonsTitle" defaultValue={s.addonsTitle} placeholder="Popular add-ons" className={inputClass} />
          </Field>
          <TagListField
            name="includes"
            label="Includes list"
            defaultValue={s.includes}
            placeholder="e.g. Free on-site measure"
          />
          <TagListField
            name="addons"
            label="Add-ons list"
            defaultValue={s.addons}
            placeholder="e.g. Old fence removal & tip fees"
          />
        </Group>

        <Group title="WA compliance callout" hint="Optional — leave empty to hide this section entirely.">
          <div className="sm:col-span-2">
            <Field label="Heading">
              <input name="complianceTitle" defaultValue={s.complianceTitle} className={inputClass} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <TagListField
              name="compliance"
              label="Points"
              defaultValue={s.compliance}
              placeholder="e.g. AS 1926.1 minimum height…"
            />
          </div>
        </Group>

        <Group title="Process steps">
          <div className="sm:col-span-2">
            <Field label='Section title (default "From first call to last panel")'>
              <input name="processTitle" defaultValue={s.processTitle} placeholder="From first call to last panel" className={inputClass} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <RepeaterField
              name="process"
              label="Steps"
              addLabel="Add step"
              defaultValue={s.process}
              columns={[
                { key: "title", label: "Title", type: "text", placeholder: "Call or book online" },
                { key: "body", label: "Description", type: "textarea", placeholder: "Tell us the boundary length…" },
              ]}
            />
          </div>
        </Group>

        <Group title="FAQs">
          <div className="sm:col-span-2">
            <RepeaterField
              name="faqs"
              label="Questions"
              addLabel="Add FAQ"
              defaultValue={s.faqs}
              columns={[
                { key: "question", label: "Question", type: "text", placeholder: "How much does this cost?" },
                { key: "answer", label: "Answer", type: "textarea", placeholder: "Your written quote is fixed…" },
              ]}
            />
          </div>
        </Group>

        <Group
          title="Reviews, related content & areas"
          hint="Reviews/related links are pulled in automatically — these only control labels and matching."
        >
          <Field label='Reviews section title (default "What Perth homeowners say")'>
            <input name="reviewsTitle" defaultValue={s.reviewsTitle} placeholder="What Perth homeowners say" className={inputClass} />
          </Field>
          <div />
          <Field label='Gallery match (matches a Project "category" tag, e.g. "Colorbond")'>
            <input name="projectCategory" defaultValue={s.projectCategory} className={inputClass} />
          </Field>
          <Field label='Shop match (matches a Product "category", e.g. "Color Bond Fencing")'>
            <input name="productCategory" defaultValue={s.productCategory} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <TagListField
              name="areas"
              label="Areas we service"
              defaultValue={s.areas}
              placeholder="e.g. Perth metro"
            />
          </div>
        </Group>

        <Group
          title="Range grouping"
          hint="Turns a set of services into a 'pick your option' range grid before the detail page."
        >
          <div className="sm:col-span-2">
            <Field label="Parent service slug — leave blank for a normal top-level service">
              <input name="parentSlug" defaultValue={s.parentSlug} placeholder="pool-fencing" className={inputClass} />
            </Field>
          </div>
          <Field label='Range page heading (only used if OTHER services set this one as their parent). Default: "The {title} range"'>
            <input name="rangeHeading" defaultValue={s.rangeHeading} placeholder="The pool fencing range" className={inputClass} />
          </Field>
          <Field label="Range page intro paragraph">
            <input name="rangeIntro" defaultValue={s.rangeIntro} className={inputClass} />
          </Field>
        </Group>
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
            <ServiceListFilter>
              {services.map((service) => (
                <li
                  key={service.id}
                  data-search={`${service.title} ${service.slug}`.toLowerCase()}
                  className="rounded-sm border border-gray-200 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative h-20 w-40 shrink-0 overflow-hidden rounded-sm bg-gray-100">
                      {service.image.startsWith("/") ? (
                        // Local /public path — safe to optimise with next/image.
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          sizes="160px"
                          className="object-cover"
                        />
                      ) : service.image.startsWith("http") ? (
                        // External URL from an unknown host: next/image would throw
                        // at runtime unless the host is whitelisted in
                        // next.config.js. Fall back to a plain <img> so one bad
                        // pasted URL can't crash the whole admin page.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={service.image}
                          alt={service.title}
                          className="h-full w-full object-cover"
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
            </ServiceListFilter>
          )}
        </Card>
      </div>
    </>
  );
}
