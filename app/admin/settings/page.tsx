import { getSettingsForAdmin } from "@/server/services/adminContent";
import { updateSettings } from "@/app/admin/_actions/content";
import {
  Banner,
  Card,
  Field,
  PageHeader,
  PrimaryButton,
  inputClass,
} from "@/app/admin/_components/ui";

export default async function SettingsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const s = await getSettingsForAdmin();

  return (
    <>
      <PageHeader
        title="Site settings"
        description="Contact details, hero copy, footer text and SEO — all rendered live on the public site."
      />
      <Banner ok={ok} error={error} />

      <form action={updateSettings} className="space-y-6">
        <Card title="Contact">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Phone (displayed)">
              <input name="phoneDisplay" defaultValue={s.phoneDisplay} className={inputClass} />
            </Field>
            <Field label="Phone link (tel:...)">
              <input name="phoneHref" defaultValue={s.phoneHref} className={inputClass} />
            </Field>
            <Field label="Email">
              <input name="email" type="email" defaultValue={s.email} className={inputClass} />
            </Field>
          </div>
        </Card>

        <Card title="Hero section">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Badge text">
              <input name="heroBadge" defaultValue={s.heroBadge} className={inputClass} />
            </Field>
            <Field label="Google rating">
              <input name="googleRating" defaultValue={s.googleRating} className={inputClass} />
            </Field>
            <Field label="Heading line 1">
              <input name="heroHeadingLine1" defaultValue={s.heroHeadingLine1} className={inputClass} />
            </Field>
            <Field label="Heading line 2">
              <input name="heroHeadingLine2" defaultValue={s.heroHeadingLine2} className={inputClass} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Sub copy">
                <textarea name="heroSubcopy" rows={3} defaultValue={s.heroSubcopy} className={`${inputClass} resize-y`} />
              </Field>
            </div>
            <Field label="CTA button label">
              <input name="heroCtaLabel" defaultValue={s.heroCtaLabel} className={inputClass} />
            </Field>
          </div>
        </Card>

        <Card title="Footer">
          <Field label="Footer paragraph">
            <textarea name="footerText" rows={4} defaultValue={s.footerText} className={`${inputClass} resize-y`} />
          </Field>
        </Card>

        <Card
          title="SEO & local business"
          description="Feeds the page title, meta description and your LocalBusiness structured data."
        >
          <div className="grid gap-4">
            <Field label="SEO title">
              <input name="seoTitle" defaultValue={s.seoTitle} className={inputClass} />
            </Field>
            <Field label="SEO description">
              <textarea name="seoDescription" rows={2} defaultValue={s.seoDescription} className={`${inputClass} resize-y`} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Street address">
                <input name="addressStreet" defaultValue={s.addressStreet} className={inputClass} />
              </Field>
              <Field label="Suburb / city">
                <input name="addressLocality" defaultValue={s.addressLocality} className={inputClass} />
              </Field>
              <Field label="State">
                <input name="addressRegion" defaultValue={s.addressRegion} className={inputClass} />
              </Field>
              <Field label="Postcode">
                <input name="addressPostalCode" defaultValue={s.addressPostalCode} className={inputClass} />
              </Field>
              <Field label="Country code">
                <input name="addressCountry" defaultValue={s.addressCountry} className={inputClass} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Latitude">
                <input name="geoLat" type="number" step="any" defaultValue={s.geoLat} className={inputClass} />
              </Field>
              <Field label="Longitude">
                <input name="geoLng" type="number" step="any" defaultValue={s.geoLng} className={inputClass} />
              </Field>
            </div>
          </div>
        </Card>

        <PrimaryButton type="submit">Save settings</PrimaryButton>
      </form>
    </>
  );
}
