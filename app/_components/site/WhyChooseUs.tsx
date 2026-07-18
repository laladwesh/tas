import Image from "next/image";
import { Container, SectionHeading } from "@/app/_components/site/ui";

const reasons = [
  {
    icon: "/figma/why-1.png",
    title: "Quoted today, on site tomorrow",
    description:
      "Call in the morning and you'll usually have your quote by knock-off, with a crew on the tools the next day.",
  },
  {
    icon: "/figma/why-2.png",
    title: "A straight price, no surprises",
    description:
      "The quote we hand you is itemised and final. Whatever we agree at the start is what you pay when the job's done.",
  },
  {
    icon: "/figma/why-3.png",
    title: "The jobs other fencers pass on",
    description:
      "Old asbestos to pull out, a retaining wall the fence can't go up without. We're licensed for both, done in the right order by one crew.",
  },
  {
    icon: "/figma/why-4.png",
    title: "We take the old fence with us",
    description:
      "The old panels, offcuts and rubbish leave when we do, so you're not left with a pile in the yard.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="w-full bg-white py-16 lg:py-[64px]">
      <Container>
        <div className="flex flex-col gap-[26px]">
          <SectionHeading
            center
            eyebrow="Why choose us"
            title="We take the whole job off your hands"
          />

          <div className="flex flex-col items-start gap-[24px] lg:flex-row lg:gap-[80px]">
            {/* Feature image */}
            <div className="relative h-[320px] w-full shrink-0 overflow-hidden rounded-[4px] lg:aspect-[374/441] lg:h-auto lg:w-[38%] lg:max-w-[480px]">
              <Image
                src="/figma/why-us.jpg"
                alt="Stag Fencing crew installing a fence"
                fill
                sizes="(max-width: 1024px) 100vw, 38vw"
                className="object-cover"
              />
              <span
                aria-hidden
                className="absolute inset-0 rounded-[inherit] shadow-[inset_-4px_-4px_16px_0px_rgba(0,0,0,0.25)]"
              />
            </div>

            {/* Reasons */}
            <ul className="flex w-full flex-col items-start">
              {reasons.map((reason, i) => (
                <li
                  key={reason.title}
                  className={`flex w-full flex-col justify-center gap-[4px] py-[16px] ${
                    i < reasons.length - 1 ? "border-b-[0.5px] border-ink" : ""
                  }`}
                >
                  <div className="flex items-center gap-[4px]">
                    <span className="relative size-[50px] shrink-0">
                      <Image
                        src={reason.icon}
                        alt=""
                        fill
                        sizes="50px"
                        className="object-contain"
                      />
                    </span>
                    <h3 className="text-[18px] font-normal leading-normal text-ink sm:text-[24px]">
                      {reason.title}
                    </h3>
                  </div>
                  <p className="text-[12px] leading-normal text-black/80">
                    {reason.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
