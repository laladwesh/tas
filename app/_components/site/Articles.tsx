"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowPillLink, Container, Eyebrow } from "@/app/_components/site/ui";
import { ChevronLeft, ChevronRight, ClockIcon } from "@/components/icons";
import SafeImage from "@/components/SafeImage";
import type { ArticleItem } from "@/server/services/catalog";


function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Articles({ articles }: { articles: ArticleItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (articles.length === 0) return null;

  const scrollBy = (direction: 1 | -1) =>
    trackRef.current?.scrollBy({ left: direction * 316, behavior: "smooth" });

  return (
    <section className="w-full bg-white py-16 lg:py-[64px]">
      <Container>
        <div className="flex flex-col gap-[32px]">
          {/* Heading (centred) */}
          <div className="flex flex-col items-center justify-center gap-[17px]">
            <Eyebrow>Articles</Eyebrow>
            <h2 className="text-center text-[28px] font-semibold leading-normal text-black sm:text-[36px]">
              Fencing advice worth reading
            </h2>
          </div>

          <div className="flex flex-col items-end gap-[9px]">
            {/* Arrows */}
            <div className="flex items-center justify-end gap-[8px]">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                aria-label="Previous articles"
                className="flex size-[24px] items-center justify-center rounded-full border border-ink/60 text-ink transition hover:bg-ink hover:text-white"
              >
                <ChevronLeft className="size-[12px]" />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                aria-label="Next articles"
                className="flex size-[24px] items-center justify-center rounded-full border border-ink/60 text-ink transition hover:bg-ink hover:text-white"
              >
                <ChevronRight className="size-[12px]" />
              </button>
            </div>

            {/* Cards */}
            <div
              ref={trackRef}
              className="flex w-full snap-x snap-mandatory gap-[20px] overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {articles.map((article) => (
                <Link
                  key={article.title}
                  href={`/articles/${article.slug}`}
                  className="flex w-[296px] shrink-0 snap-start flex-col gap-[4px] rounded-[12px] pb-[12px] drop-shadow-[4px_4px_16px_rgba(0,0,0,0.1)]"
                >
                  <div className="relative h-[166px] w-[296px] overflow-hidden rounded-[4px]">
                    <SafeImage
                      src={article.image}
                      alt=""
                      sizes="296px"
                      className="object-cover"
                    />
                    <span className="absolute left-[8px] top-[8px] flex items-center gap-[4px] rounded-[8px] bg-black/60 py-[2px] pl-[4px] pr-[8px]">
                      <ClockIcon className="size-[16px] text-cool-20" />
                      <span className="font-roboto text-[12px] leading-[1.4] text-cool-20">
                        {article.readTime}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-col items-start">
                    <div className="flex w-[296px] items-center gap-[8px]">
                      <span className="flex items-center justify-center overflow-hidden rounded-[20px] bg-ink px-[20px] py-[4px] text-[10px] font-light leading-normal text-[#f2efea]">
                        {article.category}
                      </span>
                      <span aria-hidden className="h-px flex-1 bg-black/20" />
                      <span className="whitespace-nowrap text-[10px] font-light leading-[1.4] text-black">
                        {formatDate(article.publishedAt)}
                      </span>
                    </div>
                    <p className="w-[216px] text-[14px] font-semibold leading-[1.4] text-black">
                      {article.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col items-center">
            <ArrowPillLink href="/articles">Read more articles</ArrowPillLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
