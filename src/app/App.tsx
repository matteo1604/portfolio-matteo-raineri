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
import { FloatingElements } from "./components/FloatingElements";

export default function App() {
  return (
    <div className="min-h-screen bg-[#000000] overflow-x-hidden">
      <PageLoader />
      <CustomCursor />
      <FloatingElements />
      <Navigation />
      <div id="hero">
        <Hero />
      </div>
      <SectionTransition variant="gradient" />
      <div id="philosophy">
        <Philosophy />
      </div>
      <SectionTransition variant="grid" />
      <div id="skills">
        <Skills />
      </div>
      <SectionTransition variant="particles" />
      <div id="projects">
        <Projects />
      </div>
      <SectionTransition variant="gradient" />
      <div id="process">
        <Process />
      </div>
      <SectionTransition variant="grid" />
      <div id="contact">
        <Contact />
      </div>
    </div>
  );
}