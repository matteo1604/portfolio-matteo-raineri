import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { useScrollState, SECTION_IDS, type SectionId } from "../../contexts/ScrollContext";

const navItems = [
  { name: "Home",    id: "hero" as SectionId },
  { name: "About",   id: "philosophy" as SectionId },
  { name: "Skills",  id: "skills" as SectionId },
  { name: "Work",    id: "projects" as SectionId },
  { name: "Contact", id: "contact" as SectionId },
];

// Section index for counter display
const SECTION_INDEX: Record<SectionId, number> = {
  hero:       1,
  philosophy: 2,
  skills:     3,
  projects:   4,
  process:    5,
  contact:    6,
};

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentSection, globalProgress, transitionState } = useScrollState();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sectionIndex = SECTION_INDEX[currentSection] ?? 1;
  const totalSections = SECTION_IDS.length;

  // Nav opacity dims slightly during entering/leaving transitions
  const navContentOpacity =
    transitionState === "active" ? 1 : 0.85;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 1.8 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "bg-black/80 backdrop-blur-lg border-b border-blue-500/10" : ""
      }`}
    >
      {/* Scroll progress micro-bar */}
      <div
        className="absolute top-0 left-0 right-0 h-px origin-left"
        style={{
          background: "linear-gradient(90deg, rgba(59,130,246,0.8) 0%, rgba(147,197,253,0.6) 100%)",
          transform: `scaleX(${globalProgress})`,
          transformOrigin: "left center",
          transition: "transform 0.1s linear",
          opacity: globalProgress > 0.02 ? 1 : 0,
        }}
      />

      <div
        className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-6"
        style={{
          opacity: navContentOpacity,
          transition: "opacity 0.4s ease",
        }}
      >
        <div className="flex items-center justify-between">
          {/* Logo + section counter */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-xl text-white tracking-tight hover:text-blue-400 transition-colors duration-300"
            >
              MR
            </a>

            {/* Section counter — AnimatePresence crossfade */}
            <div
              className="hidden md:flex items-center gap-1.5 overflow-hidden"
              style={{ height: "1.2em" }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={sectionIndex}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="font-mono text-[10px] tabular-nums"
                  style={{ color: "rgba(147, 197, 253, 0.45)" }}
                >
                  {String(sectionIndex).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
              <span
                className="font-mono text-[10px]"
                style={{ color: "rgba(147, 197, 253, 0.2)" }}
              >
                /
              </span>
              <span
                className="font-mono text-[10px]"
                style={{ color: "rgba(147, 197, 253, 0.2)" }}
              >
                {String(totalSections).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => {
              const isActive = currentSection === item.id;
              return (
                <motion.a
                  key={item.id}
                  href={`#${item.id}`}
                  data-magnetic=""
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 2 + index * 0.1 }}
                  className="relative text-sm tracking-wide uppercase transition-colors duration-300"
                  style={{
                    color: isActive
                      ? "rgba(147, 197, 253, 0.95)"
                      : "rgba(219, 234, 254, 0.5)",
                  }}
                >
                  {item.name}
                  {/* Active indicator dot */}
                  <motion.span
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400"
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      scale: isActive ? 1 : 0.4,
                    }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                </motion.a>
              );
            })}
          </div>

          {/* Contact Button */}
          <motion.a
            href="#contact"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 2.5 }}
            className="hidden md:inline-flex items-center gap-2 px-5 py-2 border border-blue-500/40 rounded-full text-sm text-blue-300 hover:bg-blue-500/10 hover:border-blue-400/60 transition-all duration-300"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Available for work</span>
          </motion.a>
        </div>
      </div>
    </motion.nav>
  );
}
