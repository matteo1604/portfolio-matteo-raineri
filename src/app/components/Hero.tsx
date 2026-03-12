import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

// ── Animated counter hook ─────────────────────────────────────────────────────
// FIX ts(7006): explicit types on all params
// FIX ts(7034): frame and start typed explicitly so TS can narrow them
function useCounter(
  target: number,
  duration: number = 2000,
  startDelay: number = 1400
): number {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let frame: number | undefined;   // FIX ts(7034) — was implicitly `any`
    const timeout = setTimeout(() => {
      let start: number | null = null; // FIX ts(7034) — was implicitly `any`

      const step = (timestamp: number): void => { // FIX ts(7006)
        if (start === null) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * target));
        if (progress < 1) {
          frame = requestAnimationFrame(step);
        } else {
          setCount(target);
        }
      };

      frame = requestAnimationFrame(step);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      if (frame !== undefined) cancelAnimationFrame(frame); // guard matches type
    };
  }, [target, duration, startDelay]);

  return count;
}

// ── Styles injected once into <head> ─────────────────────────────────────────
const HERO_CSS = `
  .hero-stroke {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    -webkit-text-fill-color: transparent;
    -webkit-text-stroke: 2px rgba(255, 255, 255, 0.75);
    background: linear-gradient(
      105deg,
      transparent 0%,
      rgba(255, 255, 255, 0.55) 50%,
      transparent 100%
    );
    background-size: 250% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    animation: hero-shimmer 3.5s linear infinite;
  }

  @keyframes hero-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .hero-noise {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 200px 200px;
  }

  body.hero-cursor-active { cursor: none !important; }
`;

export function Hero() {
  // ── Font + style injection ─────────────────────────────────────────────────
  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap";
    document.head.appendChild(link);

    if (!document.getElementById("hero-component-styles")) {
      const style = document.createElement("style");
      style.id = "hero-component-styles";
      style.textContent = HERO_CSS;
      document.head.appendChild(style);
    }

    return () => {
      if (link.parentNode) link.parentNode.removeChild(link);
      const s = document.getElementById("hero-component-styles");
      // FIX ts(18047): check s.parentNode before calling removeChild
      if (s?.parentNode) s.parentNode.removeChild(s);
    };
  }, []);

  // ── Custom cursor — fine pointer only (no touch devices) ──────────────────
  const [cursorVisible, setCursorVisible] = useState<boolean>(false);
  const mouseX = useMotionValue<number>(-400);
  const mouseY = useMotionValue<number>(-400);
  const dotX  = useSpring(mouseX, { damping: 28, stiffness: 400 });
  const dotY  = useSpring(mouseY, { damping: 28, stiffness: 400 });
  const ringX = useSpring(mouseX, { damping: 18, stiffness: 160 });
  const ringY = useSpring(mouseY, { damping: 18, stiffness: 160 });

  useEffect(() => {
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasFinePointer) return;

    let visible = false;

    // FIX ts(7006): MouseEvent explicit type
    const onMove = (e: MouseEvent): void => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) { visible = true; setCursorVisible(true); }
    };

    document.body.classList.add("hero-cursor-active");
    window.addEventListener("mousemove", onMove);
    return () => {
      document.body.classList.remove("hero-cursor-active");
      window.removeEventListener("mousemove", onMove);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Counters — update numbers to match your real story ────────────────────
  const years    = useCounter(5);
  const projects = useCounter(40);
  const clients  = useCounter(12);

  const COUNTERS: { val: number; top: string; bot: string }[] = [
    { val: years,    top: "Years",    bot: "Experience" },
    { val: projects, top: "Projects", bot: "Delivered"  },
    { val: clients,  top: "Happy",    bot: "Clients"    },
  ];

  return (
    <>
      {/* ── Custom cursor ─────────────────────────────────────────────────── */}
      {cursorVisible && (
        <>
          <motion.div
            aria-hidden="true"
            className="fixed z-[9999] w-2 h-2 rounded-full bg-cyan-400 pointer-events-none"
            style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
          />
          <motion.div
            aria-hidden="true"
            className="fixed z-[9998] w-9 h-9 rounded-full border border-blue-400/50 pointer-events-none"
            style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
          />
        </>
      )}

      {/* ── Hero section ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030712]">

        {/* Gradient mesh */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: [
              "radial-gradient(ellipse 90% 70% at 15% 45%, rgba(29,78,216,0.28) 0%, transparent 55%)",
              "radial-gradient(ellipse 55% 60% at 85% 15%, rgba(6,182,212,0.13) 0%, transparent 50%)",
              "radial-gradient(ellipse 50% 70% at 75% 90%, rgba(37,99,235,0.10) 0%, transparent 50%)",
            ].join(", "),
          }}
        />

        {/* Film-grain noise */}
        <div aria-hidden="true" className="hero-noise absolute inset-0 z-[1] opacity-[0.032] pointer-events-none" />

        {/* Fine grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] opacity-[0.055] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(147,197,253,1) 1px, transparent 1px), linear-gradient(90deg, rgba(147,197,253,1) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        {/* Vertical accent lines */}
        <div aria-hidden="true" className="absolute top-0 left-[28%] w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent z-[2] pointer-events-none" />
        <div aria-hidden="true" className="absolute top-0 right-[18%] w-px h-full bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent z-[2] pointer-events-none" />

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="relative z-10 w-full max-w-[1600px] px-6 md:px-12 lg:px-20">

          {/* Eyebrow */}
          <motion.div
            className="mb-10 flex items-center gap-3"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="w-8 h-px bg-blue-400/50" />
            <span
              className="text-blue-400/60 text-[11px] tracking-[0.35em] uppercase"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Portfolio — 2025
            </span>
          </motion.div>

          {/* Single <h1> with two display lines as <span> blocks */}
          <h1 className="select-none" aria-label="Matteo Raineri">
            <motion.span
              className="block text-[clamp(4.5rem,13.5vw,17rem)] leading-[0.83] tracking-[-0.03em] font-extrabold text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
              initial={{ opacity: 0, x: -70 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              Matteo
            </motion.span>

            <motion.span
              className="hero-stroke block text-[clamp(4.5rem,13.5vw,17rem)] leading-[0.83] tracking-[-0.03em] ml-[8%]"
              initial={{ opacity: 0, x: 70 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              Raineri
            </motion.span>
          </h1>

          {/* Editorial separator */}
          <motion.div
            aria-hidden="true"
            className="mt-10 ml-[3%] h-px bg-gradient-to-r from-blue-500/25 via-blue-400/10 to-transparent"
            style={{ width: "92%" }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.1, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Bottom strip */}
          <div className="mt-10 flex flex-col lg:flex-row lg:items-end justify-between gap-12">

            {/* Left: tagline + badge + CTAs */}
            <motion.div
              className="ml-[3%] space-y-7"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <p
                className="text-[clamp(1rem,1.8vw,1.4rem)] leading-relaxed text-blue-100/55"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Crafting immersive<br />digital experiences
              </p>

              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-blue-500/30 bg-blue-500/5 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
                <span
                  className="text-blue-200/70 text-[11px] tracking-[0.28em] uppercase"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Frontend Developer
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <motion.a
                  href="#work"
                  aria-label="View my work"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-full transition-colors duration-200"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  View Work
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </motion.a>

                <motion.a
                  href="#contact"
                  aria-label="Get in touch"
                  className="inline-flex items-center px-7 py-3.5 rounded-full border border-blue-500/35 hover:border-blue-400/60 text-blue-200/70 hover:text-blue-100 text-sm font-medium backdrop-blur-sm transition-all duration-200"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Contact
                </motion.a>
              </div>
            </motion.div>

            {/* Right: counters */}
            <motion.div
              className="flex gap-10 lg:gap-14 lg:mr-[3%]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              {COUNTERS.map(({ val, top, bot }) => (
                <div key={top} className="flex flex-col gap-1.5">
                  <span
                    className="text-[clamp(2.6rem,4.2vw,4.8rem)] leading-none font-bold text-white tabular-nums"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {val}+
                  </span>
                  <span
                    className="flex flex-col text-blue-400/55 text-[10px] tracking-[0.26em] uppercase leading-relaxed"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    <span>{top}</span>
                    <span>{bot}</span>
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── Scroll indicator ─────────────────────────────────────────────── */}
        <motion.div
          aria-hidden="true"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.9 }}
        >
          <span
            className="text-blue-400/30 text-[10px] tracking-[0.4em] uppercase"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Scroll
          </span>
          <div className="relative w-px h-10 bg-blue-500/15 overflow-hidden rounded-full">
            <motion.div
              className="absolute top-0 w-full rounded-full bg-gradient-to-b from-blue-400/80 to-transparent"
              style={{ height: "40%" }}
              animate={{ y: ["0%", "250%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.3 }}
            />
          </div>
        </motion.div>

      </section>
    </>
  );
}