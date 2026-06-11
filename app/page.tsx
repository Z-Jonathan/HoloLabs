import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { ConceptMockup } from "./components/ConceptMockup";
import { HowItWorks } from "./components/HowItWorks";
import { Features } from "./components/Features";
import { Waitlist } from "./components/Waitlist";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative z-10">
        <Hero />
        <ConceptMockup />
        <HowItWorks />
        <Features />
        <Waitlist />
      </main>
      <Footer />
    </>
  );
}
