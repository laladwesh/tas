import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import PageHero from "@/app/_components/site/PageHero";
import { Container } from "@/app/_components/site/ui";
import JsonLd from "@/components/JsonLd";
import { getArticles, getArticleBySlug } from "@/server/services/catalog";
import { getSettings } from "@/server/services/content";
import { siteConfig } from "@/lib/seo";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt,
      images: [{ url: article.image }],
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;

  const [article, all, settings] = await Promise.all([
    getArticleBySlug(slug),
    getArticles(),
    getSettings(),
  ]);

  if (!article) notFound();

  const more = all.filter((a) => a.slug !== article.slug).slice(0, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: `${siteConfig.url}${article.image}`,
    datePublished: article.publishedAt,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@id": `${siteConfig.url}/#business` },
    mainEntityOfPage: `${siteConfig.url}/articles/${article.slug}`,
  };

  return (
    <>
      <PageHero
        title={article.title}
        subtitle={article.excerpt}
        image={article.image}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Resources", href: "/articles" },
          { label: article.category },
        ]}
        showActions={false}
        phoneHref={settings.phoneHref}
      />

      <section className="w-full bg-white py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-[760px]">
            <div className="mb-8 flex items-center gap-3 text-[11px] text-black/50">
              <span className="rounded-[20px] bg-ink px-3 py-1 text-[10px] text-[#f2efea]">
                {article.category}
              </span>
              <span>{article.readTime}</span>
              <span aria-hidden>·</span>
              <span>{article.publishedAt}</span>
            </div>

            <div className="flex flex-col gap-5 text-[15px] leading-[1.75] text-black/80">
              <p className="text-[17px] font-medium text-ink">{article.excerpt}</p>

              {/* Body written in the admin. Blank lines become paragraphs; a
                  line starting with "## " becomes a subheading. */}
              {article.body
                ? article.body
                    .split(/\n{2,}/)
                    .map((block) => block.trim())
                    .filter(Boolean)
                    .map((block, i) =>
                      block.startsWith("## ") ? (
                        <h2
                          key={i}
                          className="mt-4 text-[22px] font-semibold text-ink"
                        >
                          {block.slice(3)}
                        </h2>
                      ) : (
                        <p key={i} className="whitespace-pre-line">
                          {block}
                        </p>
                      )
                    )
                : (
                    <p className="italic text-black/50">
                      This article doesn&rsquo;t have a body yet.
                    </p>
                  )}

              <div className="my-4 rounded-[8px] bg-field p-5">
                <p className="text-[14px] font-semibold text-ink">
                  Want a number right now?
                </p>
                <p className="mt-1 text-[13px] text-black/70">
                  The fence calculator gives you a Perth-metro estimate in about 30
                  seconds — no form, no waiting.
                </p>
                <Link
                  href="/calculator"
                  className="mt-3 inline-flex h-[40px] items-center rounded-[48px] bg-brand px-5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  Open the calculator
                </Link>
              </div>
            </div>
          </div>

          {/* More reading */}
          {more.length > 0 && (
            <div className="mx-auto mt-16 max-w-[760px]">
              <h2 className="mb-5 text-[20px] font-semibold text-ink">
                More reading
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {more.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/articles/${item.slug}`}
                    className="group flex flex-col gap-2"
                  >
                    <div className="relative aspect-[296/166] w-full overflow-hidden rounded-[4px] bg-field">
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <p className="text-[13px] font-semibold leading-[1.4] text-black">
                      {item.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>

      <JsonLd data={articleJsonLd} />
    </>
  );
}
