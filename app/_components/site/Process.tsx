import Image from "next/image";
import { Container } from "@/app/_components/site/ui";

const steps = [
  {
    icon: "/figma/process/1.png",
    title: "Free measure and quote",
    description:
      "We come out, measure up, and give you a clear price the same day. No obligation to go ahead.",
  },
  {
    icon: "/figma/process/2.png",
    title: "Pick your style",
    description:
      "We help you settle on the material, height and colour that suit the place and the budget.",
  },
  {
    icon: "/figma/process/3.png",
    title: "We build it",
    description:
      "Our crew installs it properly and cleans up after — usually done in a day or two.",
  },
  {
    icon: "/figma/process/4.png",
    title: "Walk it with us",
    description:
      "We check the finished fence with you before we leave, so anything you're not happy with gets sorted on the spot.",
  },
];

export default function Process() {
  return (
    <section className="w-full bg-ink py-16 lg:py-[64px]">
      <Container>
        <div className="flex flex-col items-center gap-[32px]">
          {/* Heading (dark) */}
          <div className="flex flex-col items-center gap-[17px]">
            <span className="inline-flex items-center justify-center gap-[8px] overflow-hidden rounded-[20px] border border-[#f2efea]/20 px-[20px] py-[4px]">
              <span aria-hidden className="size-[5px] shrink-0 rounded-full bg-brand" />
              <span className="text-[10px] font-bold uppercase leading-normal text-[#f2efea]">
                Process
              </span>
            </span>
            <h2 className="max-w-[458px] text-center text-[28px] font-semibold leading-normal text-[#f2efea] sm:text-[36px]">
              From first call to last panel
            </h2>
          </div>

          {/* Steps */}
          <div className="grid w-full grid-cols-1 justify-items-center gap-10 sm:grid-cols-2 lg:flex lg:items-start lg:justify-between lg:gap-0">
            {steps.map((step) => (
              <div
                key={step.title}
                className="flex flex-col items-center justify-center gap-[16px]"
              >
                <span className="relative flex size-[100px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
                  <Image
                    src={step.icon}
                    alt=""
                    width={70}
                    height={70}
                    className="size-[70px] object-contain"
                  />
                </span>
                <h3 className="whitespace-nowrap text-[16px] font-semibold leading-normal text-white">
                  {step.title}
                </h3>
                <p className="w-[215px] text-center text-[14px] font-normal leading-normal text-white">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
