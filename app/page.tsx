import { LandingNavbar }      from "@/components/landing/landing-navbar";
import { HeroSection }        from "@/components/landing/hero-section";
import { FeaturesSection }    from "@/components/landing/features-section";
import { HowItWorks }         from "@/components/landing/how-it-works";
import { PricingSection }     from "@/components/landing/pricing-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FaqSection }         from "@/components/landing/faq-section";
import { CtaSection }         from "@/components/landing/cta-section";
import { LandingFooter }      from "@/components/landing/landing-footer";

export const metadata = {
  title:       "GetKempt — Salon & Barbershop Booking Software",
  description: "The smarter way to manage bookings, staff, clients and loyalty for your grooming business. Built in Melbourne.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
