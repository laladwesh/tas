import type { ServiceDTO } from "@/server/services/content";
import SafeImage from "@/components/SafeImage";

export default function ServicesSection({ services }: { services: ServiceDTO[] }) {
  if (services.length === 0) return null;

  return (
    <section className="w-full bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Our Services
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-3 lg:mt-10 lg:grid-cols-4">
          {services.map((service, i) => (
            <article key={service.title + i} className="group">
              <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg bg-gray-100">
                <SafeImage
                  src={service.image}
                  alt={service.title}
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                />
              </div>
              <h3 className="mt-3 text-base font-semibold text-gray-900">
                {service.title}
              </h3>
              {service.price && (
                <p className="mt-1 text-sm text-gray-500">
                  Starting from{" "}
                  <span className="font-medium text-brand">{service.price}</span>
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
