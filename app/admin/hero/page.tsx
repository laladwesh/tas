import Image from "next/image";
import { listAllHeroImages } from "@/server/services/adminContent";
import {
  createHeroImage,
  updateHeroImage,
  deleteHeroImage,
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

export default async function HeroAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const slides = await listAllHeroImages();

  return (
    <>
      <PageHeader
        title="Hero slides"
        description="The rotating images in the homepage hero. Arrows and dots only appear with 2+ active slides."
      />
      <Banner ok={ok} error={error} />

      <div className="space-y-6">
        <Card title="Add a slide">
          <form action={createHeroImage} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ImageField name="src" label="Slide image" folder="hero" required />
            </div>
            <Field label="Alt text (for SEO & accessibility)">
              <input name="alt" placeholder="Colorbond fence in a Perth backyard" className={inputClass} />
            </Field>
            <Field label="Order">
              <input name="order" type="number" defaultValue={slides.length} className={inputClass} />
            </Field>
            <div className="flex items-center gap-4 sm:col-span-2">
              <Checkbox name="active" label="Visible on site" defaultChecked />
              <PrimaryButton type="submit">Add slide</PrimaryButton>
            </div>
          </form>
        </Card>

        <Card title={`Existing slides (${slides.length})`}>
          {slides.length === 0 ? (
            <p className="text-sm text-gray-500">
              None yet. Run <code className="rounded bg-gray-100 px-1">npm run seed</code> or add one above.
            </p>
          ) : (
            <ul className="space-y-4">
              {slides.map((slide) => (
                <li key={slide.id} className="rounded-sm border border-gray-200 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative h-20 w-40 shrink-0 overflow-hidden rounded-sm bg-gray-100">
                      {slide.src.startsWith("/") || slide.src.startsWith("http") ? (
                        <Image src={slide.src} alt={slide.alt} fill sizes="160px" className="object-cover" />
                      ) : null}
                    </div>

                    <form action={updateHeroImage} className="grid flex-1 gap-3 sm:grid-cols-2">
                      <input type="hidden" name="id" value={slide.id} />
                      <div className="sm:col-span-2">
                        <ImageField name="src" label="Slide image" defaultValue={slide.src} folder="hero" />
                      </div>
                      <Field label="Alt text">
                        <input name="alt" defaultValue={slide.alt} className={inputClass} />
                      </Field>
                      <Field label="Order">
                        <input name="order" type="number" defaultValue={slide.order} className={inputClass} />
                      </Field>
                      <div className="flex items-center gap-4 sm:col-span-2">
                        <Checkbox name="active" label="Visible" defaultChecked={slide.active} />
                        <GhostButton type="submit">Save</GhostButton>
                      </div>
                    </form>
                  </div>

                  <form action={deleteHeroImage} className="mt-3 border-t border-gray-100 pt-3">
                    <input type="hidden" name="id" value={slide.id} />
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
