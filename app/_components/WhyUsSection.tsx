import Image from "next/image";

const blocks = [
  {
    title: "Fencing Contractors in Perth",
    paragraphs: [
      "Stag Fencing is a trusted and professional Perth fencing contractor, delivering durable, well-built fencing solutions for both residential and commercial across Western Australia. With years of hands-on industry experience, we understand Perth's harsh climate, local council requirements, and the importance of fences that last not just look good on day one.",
      "We specialise in a wide range of fencing services, including Colorbond fencing, aluminium slat fencing, pool fencing, gates, retaining wall fencing. Our team focuses on residential and light commercial projects, long-lasting fencing solutions tailored to each property.",
    ],
  },
  {
    title: "Your Local Perth Fencing Installers",
    paragraphs: [
      "Stag Fencing is a locally owned and operated Perth fencing installer providing professional fence installation services for both residential and commercial properties.",
      "We service Perth's metropolitan and surrounding areas, delivering tailored fencing solutions for new builds, replacements, upgrades, and insurance-related work.",
    ],
  },
];

export default function WhyUsSection() {
  return (
    <section className="w-full bg-[#E7E7E7] py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left: copy */}
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Why Work with Our Fencing Specialists?
            </h2>

            <div className="mt-7 space-y-8">
              {blocks.map((block) => (
                <div key={block.title}>
                  <h3 className="text-base font-bold text-gray-900 underline underline-offset-2">
                    {block.title}
                  </h3>
                  <div className="mt-3 space-y-4">
                    {block.paragraphs.map((paragraph, i) => (
                      <p
                        key={i}
                        className="text-sm leading-relaxed text-gray-600"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: image (drop your photo at /public/const.png) */}
          <div className="lg:col-span-5">
            <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-gray-100 lg:aspect-auto lg:h-full lg:min-h-[420px]">
              <Image
                src="/const.png"
                alt="Stag Fencing specialist building a brick pier fence"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
