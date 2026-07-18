import Hero from "@/app/_components/site/Hero";
import HeroQuoteForm from "@/app/_components/site/HeroQuoteForm";
import ServicesList from "@/app/_components/site/ServicesList";
import WhyChooseUs from "@/app/_components/site/WhyChooseUs";
import Reviews from "@/app/_components/site/Reviews";
import RecentProjects from "@/app/_components/site/RecentProjects";
import Process from "@/app/_components/site/Process";
import ShopHighlights from "@/app/_components/site/ShopHighlights";
import AboutUs from "@/app/_components/site/AboutUs";
import Articles from "@/app/_components/site/Articles";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";

import { getServices, getFaqs, getSettings } from "@/server/services/content";
import {
  getServiceCatalog,
  getProducts,
  getProjects,
  getArticles,
  getReviews,
} from "@/server/services/catalog";
import { businessJsonLd, websiteJsonLd, faqJsonLd } from "@/lib/seo";

export const revalidate = 60;

export default async function Home() {
  // Everything below is admin-editable — the homepage reads the same data the
  // inner pages do, so an edit in /admin shows up here too.
  const [
    services,
    faqs,
    settings,
    serviceCatalog,
    popular,
    affordable,
    projects,
    articles,
    reviews,
  ] = await Promise.all([
    getServices(),
    getFaqs(),
    getSettings(),
    getServiceCatalog(),
    getProducts("popular"),
    getProducts("affordable"),
    getProjects(true), // featured only
    getArticles(),
    getReviews(),
  ]);

  return (
    <>
      <Hero settings={settings} />

      {/* Quote card overlapping the bottom of the hero */}
      <div className="relative z-10 flex justify-center px-5 lg:-mt-[100px]">
        <Reveal className="flex w-full justify-center" delay={100}>
          <HeroQuoteForm services={serviceCatalog.map((s) => s.title)} />
        </Reveal>
      </div>

      <Reveal>
        <ServicesList items={serviceCatalog} />
      </Reveal>
      <Reveal>
        <WhyChooseUs />
      </Reveal>

      {/* Continuous dark band: reviews + process */}
      <Reveal>
        <Reviews reviews={reviews} />
      </Reveal>
      <Reveal>
        <Process />
      </Reveal>

      <Reveal>
        <RecentProjects projects={projects} />
      </Reveal>
      <Reveal>
        <ShopHighlights popular={popular} affordable={affordable} />
      </Reveal>
      <Reveal>
        <AboutUs />
      </Reveal>
      <Reveal>
        <Articles articles={articles.slice(0, 6)} />
      </Reveal>

      {/* Structured data (rich results) */}
      <JsonLd data={businessJsonLd(services, settings)} />
      <JsonLd data={websiteJsonLd(settings)} />
      <JsonLd data={faqJsonLd(faqs)} />
    </>
  );
}
