import Image from "next/image";
import { ArrowPillLink, Container, Eyebrow } from "@/app/_components/site/ui";

/** Bottom gradient from the Figma frame. */
const overlay =
  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 77.404%, rgba(0,0,0,0.48) 87.019%, rgba(0,0,0,0.6) 100%)";

export default function AboutUs() {
  return (
    <section className="w-full bg-white py-16 lg:py-[64px]">
      <Container>
        <div className="flex flex-col gap-[32px]">
          {/* Heading + copy + CTA */}
          <div className="flex flex-col items-start gap-[24px] lg:flex-row lg:items-center lg:gap-[115px]">
            <div className="flex w-full flex-col items-start gap-[17px] lg:w-[359px]">
              <Eyebrow>About us</Eyebrow>
              <h2 className="text-[28px] font-semibold leading-normal text-black sm:text-[36px]">
                The Perth fencing team that does the hard jobs too
              </h2>
            </div>

            <div className="flex w-full max-w-[453px] flex-col items-start gap-[20px]">
              <div className="flex flex-col gap-[12px] leading-[1.4]">
                <p className="text-[14px] font-medium text-black">
                  Fencing for Perth homes and businesses, done properly and without
                  the run-around
                </p>
                <p className="text-[12px] font-normal text-black/80">
                  We quote most jobs the same day you call, use materials made for
                  the WA climate, and clean up before we leave. From a back fence to
                  a full commercial run, you get one crew, one clear price, and a
                  fence built to last.
                </p>
              </div>
              <ArrowPillLink href="/about">More About Us</ArrowPillLink>
            </div>
          </div>

          {/* Wide image */}
          <div className="relative h-[260px] w-full overflow-hidden rounded-[4px] bg-black sm:h-[360px] lg:h-[450px]">
            <Image
              src="/figma/about.jpg"
              alt="Stag Fencing crew on a Perth job site"
              fill
              sizes="(max-width: 1024px) 100vw, 928px"
              className="object-cover"
            />
            <span
              aria-hidden
              className="absolute inset-0"
              style={{ backgroundImage: overlay }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
