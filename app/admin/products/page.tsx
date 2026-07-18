import { listAllProducts } from "@/server/services/adminContent";
import {
  createProduct,
  updateProduct,
  deleteProduct,
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
import { formatCents } from "@/lib/money";

export default async function ProductsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const products = await listAllProducts();

  return (
    <>
      <PageHeader
        title="Products"
        description="Powers the shop, product pages and the homepage product rows."
      />
      <Banner ok={ok} error={error} />

      <div className="space-y-6">
        <Card title="Add a product">
          <form action={createProduct} className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <input name="title" required placeholder="Colorbond Fencing Panel" className={inputClass} />
            </Field>
            <Field label="Slug (URL)">
              <input name="slug" required placeholder="colorbond-fencing-panel" className={inputClass} />
            </Field>

            <Field label="Price label (shown to customers)">
              <input name="price" placeholder="$99.50 – $146.80" className={inputClass} />
            </Field>
            <Field label="Price charged ($) — used for cart & Stripe">
              <input name="priceDollars" type="number" step="0.01" min="0" placeholder="99.50" className={inputClass} />
            </Field>

            <Field label="Category">
              <input name="category" placeholder="Color Bond Fencing" className={inputClass} />
            </Field>
            <Field label="Sub-category (optional)">
              <input name="subCategory" placeholder="Colorbond fencing" className={inputClass} />
            </Field>
            <Field label="Homepage row">
              <select name="homeRow" defaultValue="" className={inputClass}>
                <option value="popular">Popular right now</option>
                <option value="affordable">Affordable picks</option>
                <option value="">Shop only (no homepage row)</option>
              </select>
            </Field>

            <div className="sm:col-span-2">
              <ImageField name="image" label="Product image" folder="products" required />
            </div>

            <div className="sm:col-span-2">
              <Field label="Description">
                <textarea name="description" rows={2} className={`${inputClass} resize-y`} />
              </Field>
            </div>

            <details className="sm:col-span-2">
              <summary className="cursor-pointer text-sm font-semibold text-gray-700">
                Product detail page (SKU, options, specs…) — optional
              </summary>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="SKU">
                  <input name="sku" placeholder="116321" className={inputClass} />
                </Field>
                <Field label="Gallery images — one path/URL per line">
                  <textarea name="images" rows={3} className={`${inputClass} resize-y font-mono text-xs`} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Options — one per line: Group | val1, val2, val3">
                    <textarea name="options" rows={4} placeholder="Colour | Monument, Black, Surfmist" className={`${inputClass} resize-y font-mono text-xs`} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="What's included — one per line">
                    <textarea name="included" rows={3} className={`${inputClass} resize-y font-mono text-xs`} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Specifications — one per line: label | value">
                    <textarea name="specs" rows={4} className={`${inputClass} resize-y font-mono text-xs`} />
                  </Field>
                </div>
              </div>
            </details>

            <Field label="Stock">
              <input name="stock" type="number" defaultValue={0} className={inputClass} />
            </Field>
            <div className="flex items-end pb-2">
              <Checkbox name="trackStock" label="Track stock (block overselling)" />
            </div>
            <Field label="Order">
              <input name="order" type="number" defaultValue={products.length} className={inputClass} />
            </Field>

            <div className="flex items-center gap-4 sm:col-span-2">
              <Checkbox name="active" label="Visible in shop" defaultChecked />
              <PrimaryButton type="submit">Add product</PrimaryButton>
            </div>
          </form>
        </Card>

        <Card title={`Products (${products.length})`}>
          {products.length === 0 ? (
            <p className="text-sm text-gray-500">
              None yet. Run <code className="rounded bg-gray-100 px-1">npm run seed</code>{" "}
              to import the sample products, or add one above.
            </p>
          ) : (
            <ul className="space-y-4">
              {products.map((product) => (
                <li key={product.id} className="rounded-sm border border-gray-200 p-4">
                  <form action={updateProduct} className="grid gap-3 sm:grid-cols-2">
                    <input type="hidden" name="id" value={product.id} />

                    <Field label="Title">
                      <input name="title" defaultValue={product.title} className={inputClass} />
                    </Field>
                    <Field label="Slug">
                      <input name="slug" defaultValue={product.slug} className={inputClass} />
                    </Field>

                    <Field label="Price label">
                      <input name="price" defaultValue={product.price} className={inputClass} />
                    </Field>
                    <Field
                      label={`Price charged ($) — currently ${formatCents(product.priceCents)}`}
                    >
                      <input
                        name="priceDollars"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={(product.priceCents / 100).toFixed(2)}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Category">
                      <input name="category" defaultValue={product.category} className={inputClass} />
                    </Field>
                    <Field label="Sub-category (optional)">
                      <input name="subCategory" defaultValue={product.subCategory} className={inputClass} />
                    </Field>
                    <Field label="Homepage row">
                      <select name="homeRow" defaultValue={product.homeRow} className={inputClass}>
                        <option value="popular">Popular right now</option>
                        <option value="affordable">Affordable picks</option>
                        <option value="">Shop only (no homepage row)</option>
                      </select>
                    </Field>

                    <div className="sm:col-span-2">
                      <ImageField
                        name="image"
                        label="Product image"
                        defaultValue={product.image}
                        folder="products"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Field label="Description">
                        <textarea
                          name="description"
                          rows={2}
                          defaultValue={product.description}
                          className={`${inputClass} resize-y`}
                        />
                      </Field>
                    </div>

                    <details className="sm:col-span-2">
                      <summary className="cursor-pointer text-sm font-semibold text-gray-700">
                        Product detail page (SKU, options, specs…) — optional
                      </summary>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Field label="SKU">
                          <input name="sku" defaultValue={product.sku} className={inputClass} />
                        </Field>
                        <Field label="Gallery images — one path/URL per line">
                          <textarea name="images" rows={3} defaultValue={product.images} className={`${inputClass} resize-y font-mono text-xs`} />
                        </Field>
                        <div className="sm:col-span-2">
                          <Field label="Options — one per line: Group | val1, val2, val3">
                            <textarea name="options" rows={4} defaultValue={product.options} className={`${inputClass} resize-y font-mono text-xs`} />
                          </Field>
                        </div>
                        <div className="sm:col-span-2">
                          <Field label="What's included — one per line">
                            <textarea name="included" rows={3} defaultValue={product.included} className={`${inputClass} resize-y font-mono text-xs`} />
                          </Field>
                        </div>
                        <div className="sm:col-span-2">
                          <Field label="Specifications — one per line: label | value">
                            <textarea name="specs" rows={4} defaultValue={product.specs} className={`${inputClass} resize-y font-mono text-xs`} />
                          </Field>
                        </div>
                      </div>
                    </details>

                    <Field label="Stock">
                      <input name="stock" type="number" defaultValue={product.stock} className={inputClass} />
                    </Field>
                    <div className="flex items-end pb-2">
                      <Checkbox
                        name="trackStock"
                        label="Track stock"
                        defaultChecked={product.trackStock}
                      />
                    </div>
                    <Field label="Order">
                      <input name="order" type="number" defaultValue={product.order} className={inputClass} />
                    </Field>

                    <div className="flex items-center gap-4 sm:col-span-2">
                      <Checkbox name="active" label="Visible" defaultChecked={product.active} />
                      <GhostButton type="submit">Save</GhostButton>
                    </div>
                  </form>

                  <form action={deleteProduct} className="mt-3 border-t border-gray-100 pt-3">
                    <input type="hidden" name="id" value={product.id} />
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
