import { BenefitsSection } from "@/components/landing/benefits";
import { CommunityPreviewSection } from "@/components/landing/community-preview";
import { FaqSection } from "@/components/landing/faq";
import { FeaturedPsychologistsSection } from "@/components/landing/featured-psychologists";
import { HeroSection } from "@/components/landing/hero";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { PricingSection } from "@/components/landing/pricing";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { Button } from "@/components/ui/button";
import {
  fetchCommunityPosts,
  fetchDirectory,
  fetchSubscriptionPlans,
} from "@/lib/api/server";

export default async function HomePage() {
  const [directory, community, plans] = await Promise.all([
    fetchDirectory({ limit: "3" }),
    fetchCommunityPosts({ limit: "2" }),
    fetchSubscriptionPlans(),
  ]);

  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <HowItWorksSection />
      <FeaturedPsychologistsSection psychologists={directory?.items} />
      <TestimonialsSection />
      <CommunityPreviewSection posts={community?.items} />
      <PricingSection apiPlans={plans ?? undefined} />
      <FaqSection />

      <section
        className="border-t border-mu-border bg-mu-primary py-16 text-center text-white sm:py-20"
        aria-labelledby="cta-final-title"
      >
        <div className="mu-container">
          <h2
            id="cta-final-title"
            className="font-heading text-2xl font-bold sm:text-3xl"
          >
            Da el siguiente paso hacia una comunidad de bienestar y crecimiento profesional
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/90">
            Ya sea que busques apoyo para tu salud mental o quieras fortalecer tu
            práctica profesional, aquí encontrarás un espacio construido para
            acompañarte.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              href="/registro"
              className="bg-white text-mu-primary hover:bg-mu-accent"
            >
              Crear cuenta gratis
            </Button>
            <Button
              size="lg"
              variant="outline"
              href="/directorio"
              className="border-white text-white hover:bg-white/10"
            >
              Encontrar apoyo profesional
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
