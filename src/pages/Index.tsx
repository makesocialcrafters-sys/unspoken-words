import Nav from "@/components/frauenmoment/Nav";
import Hero from "@/components/frauenmoment/Hero";
import QuoteBand from "@/components/frauenmoment/QuoteBand";
import Stats from "@/components/frauenmoment/Stats";
import HowItWorks from "@/components/frauenmoment/HowItWorks";
import Feed from "@/components/frauenmoment/Feed";
import Testimonials from "@/components/frauenmoment/Testimonials";
import Pricing from "@/components/frauenmoment/Pricing";
import CTA from "@/components/frauenmoment/CTA";
import Footer from "@/components/frauenmoment/Footer";
import { useReveal } from "@/hooks/useReveal";

const Index = () => {
  useReveal();
  return (
    <main className="min-h-screen bg-background">
      <Nav />
      <Hero />
      <Stats />
      <QuoteBand />
      <HowItWorks />
      <Feed />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
};

export default Index;
