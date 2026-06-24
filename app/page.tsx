import Navbar from "@/components/Navbar";
import HeroSection from "@/app/_components/HeroSection";
import ServicesSection from "@/app/_components/ServicesSection";
import WhyUsSection from "@/app/_components/WhyUsSection";
import QuoteSection from "@/app/_components/QuoteSection";
import FaqSection from "@/app/_components/FaqSection";
import Footer from "@/app/_components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Red header bar */}
      <Navbar />

      {/* Section 1 — Hero */}
      <HeroSection />

      {/* Section 2 — Our Services */}
      <ServicesSection />

      {/* Section 3 — Why Work with Our Fencing Specialists */}
      <WhyUsSection />

      {/* Section 4 — Get Free Quote */}
      <QuoteSection />

      {/* Section 5 — FAQ */}
      <FaqSection />

      {/* Footer */}
      <Footer />

    </main>
  );
}
