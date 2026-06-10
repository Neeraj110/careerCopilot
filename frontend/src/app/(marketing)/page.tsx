import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { Testimonials } from "@/components/marketing/testimonials";
import { Pricing } from "@/components/marketing/pricing";
import { FAQ } from "@/components/marketing/faq";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <ProductShowcase />
      <Testimonials />
      <Pricing />
      <FAQ />
    </>
  );
}
