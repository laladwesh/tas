import { listAllReviews } from "@/server/services/adminContent";
import {
  createReview,
  updateReview,
  deleteReview,
} from "@/app/admin/_actions/catalog";
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

export default async function ReviewsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const reviews = await listAllReviews();

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Customer reviews shown on the homepage and About page."
      />
      <Banner ok={ok} error={error} />

      <div className="space-y-6">
        <Card title="Add a review">
          <form action={createReview} className="grid gap-4 sm:grid-cols-2">
            <Field label="Customer name">
              <input name="name" required placeholder="Blake West" className={inputClass} />
            </Field>
            <Field label="Role">
              <input name="role" defaultValue="Home Owner" className={inputClass} />
            </Field>

            <Field label="Rating">
              <input name="rating" defaultValue="5.0" className={inputClass} />
            </Field>
            <Field label="Order">
              <input name="order" type="number" defaultValue={reviews.length} className={inputClass} />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Review text">
                <textarea name="quote" required rows={3} className={`${inputClass} resize-y`} />
              </Field>
            </div>

            <ImageField name="image" label="Job photo" folder="reviews" />
            <ImageField name="avatar" label="Customer avatar" folder="reviews" />

            <div className="flex items-center gap-4 sm:col-span-2">
              <Checkbox name="active" label="Visible on site" defaultChecked />
              <PrimaryButton type="submit">Add review</PrimaryButton>
            </div>
          </form>
        </Card>

        <Card title={`Reviews (${reviews.length})`}>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">None yet.</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li key={review.id} className="rounded-sm border border-gray-200 p-4">
                  <form action={updateReview} className="grid gap-3 sm:grid-cols-2">
                    <input type="hidden" name="id" value={review.id} />

                    <Field label="Customer name">
                      <input name="name" defaultValue={review.name} className={inputClass} />
                    </Field>
                    <Field label="Role">
                      <input name="role" defaultValue={review.role} className={inputClass} />
                    </Field>

                    <Field label="Rating">
                      <input name="rating" defaultValue={review.rating} className={inputClass} />
                    </Field>
                    <Field label="Order">
                      <input name="order" type="number" defaultValue={review.order} className={inputClass} />
                    </Field>

                    <div className="sm:col-span-2">
                      <Field label="Review text">
                        <textarea
                          name="quote"
                          rows={3}
                          defaultValue={review.quote}
                          className={`${inputClass} resize-y`}
                        />
                      </Field>
                    </div>

                    <ImageField
                      name="image"
                      label="Job photo"
                      defaultValue={review.image}
                      folder="reviews"
                    />
                    <ImageField
                      name="avatar"
                      label="Customer avatar"
                      defaultValue={review.avatar}
                      folder="reviews"
                    />

                    <div className="flex items-center gap-4 sm:col-span-2">
                      <Checkbox name="active" label="Visible" defaultChecked={review.active} />
                      <GhostButton type="submit">Save</GhostButton>
                    </div>
                  </form>

                  <form action={deleteReview} className="mt-3 border-t border-gray-100 pt-3">
                    <input type="hidden" name="id" value={review.id} />
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
