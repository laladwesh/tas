import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/app/_components/site/ui";
import JsonLd from "@/components/JsonLd";
import { CheckIcon, StarIcon } from "@/components/icons";
import SafeImage from "@/components/SafeImage";
import ProductGallery from "./ProductGallery";
import ProductPurchasePanel from "./ProductPurchasePanel";
import ReviewForm from "./ReviewForm";
import {
  getProducts,
  getProductDetail,
  getReviews,
} from "@/server/services/catalog";
import { getSettings } from "@/server/services/content";
import { formatCents } from "@/lib/money";
import { siteConfig } from "@/lib/seo";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetail(slug);
  if (!product) return {};

  return {
    title: product.title,
    description: `${product.title} — ${product.price}. Trade-quality fencing supplies, pick up or delivered across Perth.`,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: { title: product.title, images: [{ url: product.image }] },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;

  const [product, all, reviews, settings] = await Promise.all([
    getProductDetail(slug),
    getProducts(),
    getReviews(),
    getSettings(),
  ]);

  if (!product) notFound();

  const related = all
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, 3);

  const gallery = [product.image, ...product.images].filter(
    (src, i, arr) => src && arr.indexOf(src) === i,
  );

  const priceLabel = product.price || formatCents(product.priceCents);

  // Review summary
  const avg =
    reviews.length > 0
      ? (
          reviews.reduce((n, r) => n + (parseFloat(r.rating) || 0), 0) /
          reviews.length
        ).toFixed(1)
      : null;
  const reviewPhotos = reviews.map((r) => r.image).filter(Boolean).slice(0, 6);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: `${siteConfig.url}${product.image}`,
    sku: product.sku || undefined,
    category: product.category,
    brand: { "@type": "Brand", name: "Stag Fencing" },
    offers: {
      "@type": "Offer",
      priceCurrency: "AUD",
      price: (product.priceCents / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      url: `${siteConfig.url}/shop/${product.slug}`,
    },
  };

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    product.category
      ? { label: product.category, href: "/shop" }
      : null,
    product.subCategory ? { label: product.subCategory } : null,
    { label: product.title },
  ].filter(Boolean) as { label: string; href?: string }[];

  return (
    <>
      {/* Slim breadcrumb bar (Figma hero is just this on the product page) */}
      <div className="w-full border-b border-cool-20 bg-white pt-[92px]">
        <Container>
          <nav aria-label="Breadcrumb" className="py-[16px]">
            <ol className="flex flex-wrap items-center gap-[6px] text-xs text-black/50">
              {crumbs.map((c, i) => (
                <li key={c.label} className="flex items-center gap-[6px]">
                  {c.href ? (
                    <Link href={c.href} className="hover:text-black">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="line-clamp-1 text-black">{c.label}</span>
                  )}
                  {i < crumbs.length - 1 && <span className="text-black/30">/</span>}
                </li>
              ))}
            </ol>
          </nav>
        </Container>
      </div>

      {/* Gallery + purchase */}
      <section className="w-full bg-white pt-[32px]">
        <Container>
          <div className="flex flex-col gap-[40px] lg:flex-row lg:gap-[56px]">
            <div className="w-full lg:w-[45%]">
              <ProductGallery images={gallery} alt={product.title} />
            </div>
            <div className="w-full lg:flex-1">
              <ProductPurchasePanel
                slug={product.slug}
                category={product.category}
                title={product.title}
                sku={product.sku}
                price={priceLabel}
                options={product.options}
                inStock={product.trackStock ? product.stock : null}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Description & Specifications */}
      {(product.description || product.included.length > 0 || product.specs.length > 0) && (
        <section className="w-full bg-white pt-[56px]">
          <Container>
            <div className="grid gap-[32px] lg:grid-cols-[1fr_360px]">
              <div className="flex flex-col gap-[20px]">
                {product.description && (
                  <div className="flex flex-col gap-[8px]">
                    <h2 className="text-xl font-semibold text-black">Description</h2>
                    <p className="whitespace-pre-line text-sm leading-[1.7] text-black/75">
                      {product.description}
                    </p>
                  </div>
                )}
                {product.included.length > 0 && (
                  <div className="flex flex-col gap-[8px]">
                    <h3 className="text-base font-semibold text-black">
                      What’s included
                    </h3>
                    <ul className="flex flex-col gap-[8px]">
                      {product.included.map((item) => (
                        <li key={item} className="flex items-start gap-[10px]">
                          <CheckIcon className="mt-[2px] size-[16px] shrink-0 text-brand" />
                          <span className="text-sm leading-[1.5] text-black/75">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {product.specs.length > 0 && (
                <div className="h-fit rounded-[8px] bg-field p-[24px]">
                  <h3 className="mb-[12px] text-base font-semibold text-black">
                    Specifications
                  </h3>
                  <dl className="flex flex-col">
                    {product.specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex justify-between gap-4 border-b border-black/10 py-[10px] last:border-0"
                      >
                        <dt className="text-sm text-black/55">{spec.label}</dt>
                        <dd className="text-right text-sm font-medium text-black">
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* Customer reviews */}
      {reviews.length > 0 && (
        <section className="w-full bg-white pt-[56px]">
          <Container>
            <div className="mb-[16px] flex items-center gap-[10px]">
              <h2 className="text-xl font-semibold text-black sm:text-2xl">
                Customer reviews
              </h2>
              {avg && (
                <span className="flex items-center gap-[4px] text-sm text-black/60">
                  <StarIcon className="size-[16px] text-brand" />
                  {avg} · {reviews.length} reviews
                </span>
              )}
            </div>

            {reviewPhotos.length > 0 && (
              <div className="mb-[24px]">
                <p className="mb-[10px] text-sm text-black/60">Photos from customers</p>
                <div className="flex gap-[10px] overflow-x-auto pb-1">
                  {reviewPhotos.map((src, i) => {
                    const isLast = i === reviewPhotos.length - 1;
                    const more = reviews.length - reviewPhotos.length;
                    return (
                      <div
                        key={`${src}-${i}`}
                        className="relative size-[92px] shrink-0 overflow-hidden rounded-[6px] bg-field"
                      >
                        <SafeImage src={src} alt="" sizes="92px" className="object-cover" />
                        {isLast && more > 0 && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold text-white">
                            +{more}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid gap-[16px] sm:grid-cols-3">
              {reviews.slice(0, 3).map((review) => (
                <div
                  key={review.name}
                  className="flex flex-col gap-[10px] rounded-[8px] border border-cool-20 p-[20px]"
                >
                  <div className="flex items-center gap-[2px] text-brand">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} className="size-[13px]" />
                    ))}
                  </div>
                  <p className="text-sm leading-[1.6] text-black/75">“{review.quote}”</p>
                  <div className="mt-auto flex items-center gap-[10px]">
                    {review.avatar && (
                      <span className="relative size-[30px] overflow-hidden rounded-full bg-gray-100">
                        <SafeImage src={review.avatar} alt={review.name} sizes="30px" className="object-cover" />
                      </span>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-black">{review.name}</span>
                      <span className="text-xs text-black/50">{review.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-[24px] max-w-[560px]">
              <ReviewForm />
            </div>
          </Container>
        </section>
      )}

      {/* You might also need */}
      {related.length > 0 && (
        <section className="w-full bg-white py-[56px]">
          <Container>
            <h2 className="mb-[16px] text-xl font-semibold text-black sm:text-2xl">
              You might also need
            </h2>
            <div className="grid grid-cols-2 gap-x-[20px] gap-y-[32px] md:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/shop/${item.slug}`}
                  className="group flex flex-col gap-[8px]"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-[8px] bg-field">
                    <SafeImage
                      src={item.image}
                      alt={item.title}
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {item.category && (
                    <p className="text-xs text-black/50">{item.category}</p>
                  )}
                  <h3 className="line-clamp-2 text-base font-medium leading-[1.4] text-black">
                    {item.title}
                  </h3>
                  <p className="text-sm text-black/70">{item.price}</p>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      <JsonLd data={productJsonLd} />
    </>
  );
}
