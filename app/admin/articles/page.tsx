import { listAllArticles } from "@/server/services/adminContent";
import {
  createArticle,
  updateArticle,
  deleteArticle,
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

export default async function ArticlesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const articles = await listAllArticles();

  return (
    <>
      <PageHeader
        title="Articles"
        description="Blog posts shown under Resources and on the homepage."
      />
      <Banner ok={ok} error={error} />

      <div className="space-y-6">
        <Card title="Write an article">
          <form action={createArticle} className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <input name="title" required className={inputClass} />
            </Field>
            <Field label="Slug (URL)">
              <input name="slug" required placeholder="pool-fencing-laws-wa" className={inputClass} />
            </Field>

            <Field label="Category">
              <input name="category" defaultValue="Instructions" className={inputClass} />
            </Field>
            <Field label="Read time">
              <input name="readTime" defaultValue="5 min read" className={inputClass} />
            </Field>

            <div className="sm:col-span-2">
              <ImageField name="image" label="Cover image" folder="articles" required />
            </div>

            <div className="sm:col-span-2">
              <Field label="Excerpt (shown on cards + used for SEO)">
                <textarea name="excerpt" rows={2} className={`${inputClass} resize-y`} />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Body">
                <textarea name="body" rows={8} className={`${inputClass} resize-y`} />
              </Field>
            </div>

            <div className="flex items-center gap-4 sm:col-span-2">
              <Checkbox name="active" label="Published" defaultChecked />
              <PrimaryButton type="submit">Publish</PrimaryButton>
            </div>
          </form>
        </Card>

        <Card title={`Articles (${articles.length})`}>
          {articles.length === 0 ? (
            <p className="text-sm text-gray-500">None yet.</p>
          ) : (
            <ul className="space-y-4">
              {articles.map((article) => (
                <li key={article.id} className="rounded-sm border border-gray-200 p-4">
                  <form action={updateArticle} className="grid gap-3 sm:grid-cols-2">
                    <input type="hidden" name="id" value={article.id} />

                    <Field label="Title">
                      <input name="title" defaultValue={article.title} className={inputClass} />
                    </Field>
                    <Field label="Slug">
                      <input name="slug" defaultValue={article.slug} className={inputClass} />
                    </Field>

                    <Field label="Category">
                      <input name="category" defaultValue={article.category} className={inputClass} />
                    </Field>
                    <Field label="Read time">
                      <input name="readTime" defaultValue={article.readTime} className={inputClass} />
                    </Field>

                    <div className="sm:col-span-2">
                      <ImageField
                        name="image"
                        label="Cover image"
                        defaultValue={article.image}
                        folder="articles"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Field label="Excerpt">
                        <textarea
                          name="excerpt"
                          rows={2}
                          defaultValue={article.excerpt}
                          className={`${inputClass} resize-y`}
                        />
                      </Field>
                    </div>

                    <div className="sm:col-span-2">
                      <Field label="Body">
                        <textarea
                          name="body"
                          rows={8}
                          defaultValue={article.body}
                          className={`${inputClass} resize-y`}
                        />
                      </Field>
                    </div>

                    <div className="flex items-center gap-4 sm:col-span-2">
                      <Checkbox name="active" label="Published" defaultChecked={article.active} />
                      <GhostButton type="submit">Save</GhostButton>
                    </div>
                  </form>

                  <form action={deleteArticle} className="mt-3 border-t border-gray-100 pt-3">
                    <input type="hidden" name="id" value={article.id} />
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
