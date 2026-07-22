import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/app/_components/site/PageHero";
import { Container } from "@/app/_components/site/ui";
import { ClockIcon } from "@/components/icons";
import SafeImage from "@/components/SafeImage";
import { getArticles } from "@/server/services/catalog";
import { getSettings } from "@/server/services/content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Fencing Advice & Resources",
  description:
    "Practical fencing advice for Perth homeowners — costs, styles, pool fencing laws and what to expect from the process.",
  alternates: { canonical: "/articles" },
};

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ArticlesPage() {
  const [articles, settings] = await Promise.all([getArticles(), getSettings()]);

  return (
    <>
      <PageHero
        title="Fencing advice worth reading"
        subtitle="Straight answers on costs, styles and the rules — no fluff."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Resources" }]}
        phoneHref={settings.phoneHref}
      />

      <section className="w-full bg-white py-12 lg:py-16">
        <Container>
          <div className="grid grid-cols-1 gap-x-[20px] gap-y-[32px] sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="group flex flex-col gap-[6px] rounded-[12px] pb-3 drop-shadow-[4px_4px_16px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-out hover:-translate-y-1 motion-reduce:transform-none"
              >
                <div className="relative aspect-[296/166] w-full overflow-hidden rounded-[4px] bg-field">
                  <SafeImage
                    src={article.image}
                    alt=""
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-[8px] top-[8px] flex items-center gap-[4px] rounded-[8px] bg-black/60 py-[2px] pl-[4px] pr-[8px]">
                    <ClockIcon className="size-[14px] text-cool-20" />
                    <span className="font-roboto text-[11px] text-cool-20">
                      {article.readTime}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-[8px] px-1">
                  <span className="rounded-[20px] bg-ink px-[12px] py-[3px] text-[10px] font-light text-[#f2efea]">
                    {article.category}
                  </span>
                  <span aria-hidden className="h-px flex-1 bg-black/15" />
                  <span className="whitespace-nowrap text-[10px] font-light text-black/60">
                    {formatDate(article.publishedAt)}
                  </span>
                </div>

                <h2 className="px-1 text-[15px] font-semibold leading-[1.4] text-black">
                  {article.title}
                </h2>
                <p className="px-1 text-[12px] leading-[1.5] text-black/60">
                  {article.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
