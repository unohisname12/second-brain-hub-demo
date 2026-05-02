import { Hero } from "@/components/landing/hero";
import { FeatureStrip } from "@/components/landing/feature-strip";
import { ArchitectureDiagram } from "@/components/landing/architecture-diagram";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <FeatureStrip />
      <ArchitectureDiagram />
      <Footer />
    </>
  );
}
