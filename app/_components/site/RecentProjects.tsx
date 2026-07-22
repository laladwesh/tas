"use client";

import { useState } from "react";
import { Container, SectionHeading } from "@/app/_components/site/ui";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import SafeImage from "@/components/SafeImage";
import type { ProjectItem } from "@/server/services/catalog";

/** Bottom gradient from the Figma frame. */
const overlay =
  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 77.404%, rgba(0,0,0,0.48) 87.019%, rgba(0,0,0,0.6) 100%)";

export default function RecentProjects({ projects }: { projects: ProjectItem[] }) {
  const [index, setIndex] = useState(0);
  const count = projects.length;

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count);
  const current = projects[index];

  // An admin could deactivate every project.
  if (count === 0 || !current) return null;

  return (
    <section className="w-full bg-white py-16 lg:py-[64px]">
      <Container>
        <div className="flex flex-col gap-[32px]">
          <SectionHeading
            eyebrow="Recent Projects"
            title={<>Fences we&rsquo;ve put up around Perth</>}
            copy="Real jobs across Perth homes and businesses. Have a look before you get a quote. Chances are we've done one near you."
          />

          <div className="flex flex-col items-end gap-[9px]">
            {/* Arrows */}
            <div className="flex items-center justify-end gap-[8px]">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous project"
                className="flex size-[24px] items-center justify-center rounded-full border border-ink/60 text-ink transition hover:bg-ink hover:text-white"
              >
                <ChevronLeft className="size-[12px]" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next project"
                className="flex size-[24px] items-center justify-center rounded-full border border-ink/60 text-ink transition hover:bg-ink hover:text-white"
              >
                <ChevronRight className="size-[12px]" />
              </button>
            </div>

            {/* Big image */}
            <div className="w-full rounded-[12px] pb-[12px] drop-shadow-[4px_4px_16px_rgba(0,0,0,0.1)]">
              <div className="relative aspect-[928/522] w-full overflow-hidden rounded-[4px] bg-black">
                <SafeImage
                  src={current.image}
                  alt={current.title || `${current.category} fencing in ${current.suburb}`}
                  sizes="(max-width: 1024px) 100vw, 928px"
                  className="object-cover"
                />
                <span
                  aria-hidden
                  className="absolute inset-0"
                  style={{ backgroundImage: overlay }}
                />

                {/* Progress dashes */}
                <div className="absolute bottom-[16px] left-1/2 flex -translate-x-1/2 items-center gap-[3px]">
                  {projects.map((project, i) => (
                    <button
                      key={project.image + i}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Go to project ${i + 1}`}
                      aria-current={i === index}
                      className={`h-[5px] rounded-[5px] transition-all ${
                        i === index ? "w-[40px] bg-white/80" : "w-[8px] bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
