import { useState, useEffect } from "react";
import { Hero } from "./components/Hero";
import { Philosophy } from "./components/Philosophy";
import { Skills } from "./components/Skills";
import { Projects } from "./components/Projects";
import { Process } from "./components/Process";
import { Contact } from "./components/Contact";
import { Navigation } from "./components/Navigation";
import { CustomCursor } from "./components/CustomCursor";
import { PageLoader } from "./components/PageLoader";
import { SectionTransition } from "./components/SectionTransition";
import { SectionBleed } from "./components/SectionBleed";
import { LightThread } from "./components/LightThread";
import { FloatingElements } from "./components/FloatingElements";
import { ScrollProvider } from "../contexts/ScrollContext";
import { ScrollVelocityProvider } from "../systems/ScrollVelocity";
import { VelocityEffects } from "./components/VelocityEffects";
import { refreshScrollTriggers, ScrollTrigger } from "./utils/gsap";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  // heroReady gates Hero mounting — fires 350ms before loader exit starts,
  // so Hero's entrance overlaps the loader fade-out for a seamless handoff.
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    // Hero mounts and begins its entrance while the loader is still visible
    const heroTimer = setTimeout(() => setHeroReady(true), 2150);
    // Loader exit starts here (0.9s exit transition in PageLoader)
    const loaderTimer = setTimeout(() => setIsLoading(false), 2500);
    // After all sections mount and GSAP pins are created, recalculate
    // ScrollTrigger positions so downstream triggers account for pin spacers
    // Hero entrance ~3.25s after mount at 2150ms ≈ 5400ms, then pin creates.
    // First refresh after pin exists, second as safety net.
    const refreshTimer  = setTimeout(() => { ScrollTrigger.sort(); refreshScrollTriggers(); }, 6000);
    const refresh2Timer = setTimeout(() => refreshScrollTriggers(), 8000);
    const refresh3Timer = setTimeout(() => refreshScrollTriggers(), 10000);
    return () => {
      clearTimeout(heroTimer);
      clearTimeout(loaderTimer);
      clearTimeout(refreshTimer);
      clearTimeout(refresh2Timer);
      clearTimeout(refresh3Timer);
    };
  }, []);

  return (
    <ScrollProvider>
      <ScrollVelocityProvider>
      <div className="min-h-screen bg-[#000000] overflow-x-hidden">
        <PageLoader isLoading={isLoading} />
        <VelocityEffects />
        <CustomCursor />
        <FloatingElements />
        <LightThread />
        <Navigation />
        <div id="hero">
          {heroReady && <Hero />}
        </div>
        <SectionBleed from="hero" to="philosophy" />
        <SectionTransition from="hero" to="philosophy" />
        <div id="philosophy">
          <Philosophy />
        </div>
        <SectionBleed from="philosophy" to="skills" />
        <SectionTransition from="philosophy" to="skills" />
        <div id="skills">
          <Skills />
        </div>
        <SectionBleed from="skills" to="projects" />
        <SectionTransition from="skills" to="projects" />
        <div id="projects">
          <Projects />
        </div>
        <SectionBleed from="projects" to="process" />
        <SectionTransition from="projects" to="process" />
        <div id="process">
          <Process />
        </div>
        <SectionBleed from="process" to="contact" />
        <SectionTransition from="process" to="contact" />
        <div id="contact">
          <Contact />
        </div>
      </div>
      </ScrollVelocityProvider>
    </ScrollProvider>
  );
}
