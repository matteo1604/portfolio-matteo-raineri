import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCounter(target, duration = 2000, startDelay = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let frame;
    const timeout = setTimeout(() => {
      let start = null;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setCount(Math.floor(eased * target));
        if (progress < 1) frame = requestAnimationFrame(step);
        else setCount(target);
      };
      frame = requestAnimationFrame(step);
    }, startDelay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(frame); };
  }, [target, duration, startDelay]);
  return count;
}

export function Hero() {
  const [mounted, setMounted] = useState(false);

  // ── Cursor motion values ────────────────────────────────────────────────────
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);
  const dotX  = useSpring(mouseX, { damping: 28, stiffness: 400 });
  const dotY  = useSpring(mouseY, { damping: 28, stiffness: 400 });
  const ringX = useSpring(mouseX, { damping: 18, stiffness: 160 });
  const ringY = useSpring(mouseY, { damping: 18, stiffness: 160 });

  useEffect(() => {
    setMounted(true);
    const move = (e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // ── Counters — adjust numbers to fit your real story ──────────────────────
  const years    = useCounter(5);
  const projects = useCounter(40);
  const clients  = useCounter(12);

  return (
    <>
      {/* ── Google Fonts + keyframes ───────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');

        /* Hide native cursor globally while Hero is mounted */
        body { cursor: none; }

        /* Stroke text with travelling shimmer */
        .hero-stroke {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 2px rgba(255 255 255 / 0.75);
          background: linear-gradient(
            105deg,
            transparent     0%,
            rgba(255 255 255 / 0.55) 50%,
            transparent     100%
          );
          background-size: 250% 100%;
          -webkit-background-clip: text;
          animation: shimmer 3.5s linear infinite;
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Noise texture via repeating SVG */
        .noise {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 200px 200px;
        }
      `}</style>

      {/* ── Custom cursor ─────────────────────────────────────────────────── */}
      {mounted && (
        <>
          {/* small filled dot */}
          <motion.span
            className="fixed z-[9999] w-2 h-2 rounded-full bg-cyan-400 pointer-events-none"
            style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
          />
          {/* outer lagging ring */}
          <motion.span
            className="fixed z-[9998] w-9 h-9 rounded-full border border-blue-400/50 pointer-events-none"
            style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
          />
        </>
      )}

      {/* ── Hero section ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030712]">

        {/* Gradient mesh background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: [
              "radial-gradient(ellipse 90% 70% at 15% 45%, rgba(29,78,216,0.28) 0%, transparent 55%)",
              "radial-gradient(ellipse 55% 60% at 85% 15%, rgba(6,182,212,0.13) 0%, transparent 50%)",
              "radial-gradient(ellipse 50% 70% at 75% 90%, rgba(37,99,235,0.10) 0%, transparent 50%)",
            ].join(", "),
          }}
        />

        {/* Noise overlay — subtle grain */}
        <div className="noise absolute inset-0 z-[1] opacity-[0.032] pointer-events-none" />

        {/* Fine grid */}
        <div
          className="absolute inset-0 z-[1] opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(147,197,253,1) 1px, transparent 1px), linear-gradient(90deg, rgba(147,197,253,1) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        {/* Vertical accent lines */}
        <div className="absolute top-0 left-[28%] w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent z-[2] pointer-events-none" />
        <div className="absolute top-0 right-[18%] w-px h-full bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent z-[2] pointer-events-none" />

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="relative z-10 w-full max-w-[1600px] px-6 md:px-12 lg:px-20">

          {/* Eyebrow label */}
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

          {/* Display name */}
          <div className="select-none">
            <motion.h1
              className="text-[clamp(4.5rem,13.5vw,17rem)] leading-[0.83] tracking-[-0.03em] font-extrabold text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
              initial={{ opacity: 0, x: -70 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              Matteo
            </motion.h1>

            {/* "Raineri" — outline + shimmer */}
            <motion.h1
              className="hero-stroke text-[clamp(4.5rem,13.5vw,17rem)] leading-[0.83] tracking-[-0.03em] ml-[8%]"
              initial={{ opacity: 0, x: 70 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              Raineri
            </motion.h1>
          </div>

          {/* Bottom strip: subtitle / CTAs  ·  counters */}
          <div className="mt-16 flex flex-col lg:flex-row lg:items-end justify-between gap-14">

            {/* Left block */}
            <motion.div
              className="ml-[3%] space-y-8 max-w-md"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.85 }}
            >
              <p
                className="text-[clamp(1rem,1.8vw,1.45rem)] leading-relaxed text-blue-100/60"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Crafting immersive<br />digital experiences
              </p>

              {/* Status badge */}
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-blue-500/35 bg-blue-500/5 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span
                  className="text-blue-200/75 text-[11px] tracking-[0.28em] uppercase"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Frontend Developer
                </span>
              </div>

              {/* CTA row */}
              <div className="flex flex-wrap items-center gap-4">
                <motion.a
                  href="#work"
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
                  className="inline-flex items-center px-7 py-3.5 rounded-full border border-blue-500/35 hover:border-blue-400/60 text-blue-200/70 hover:text-blue-100 text-sm font-medium backdrop-blur-sm transition-all duration-200"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Contact
                </motion.a>
              </div>
            </motion.div>

            {/* Right block — animated counters */}
            <motion.div
              className="flex gap-10 lg:gap-14 lg:mr-[3%] pb-1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              {[
                { val: years,    label: "Years\nExperience" },
                { val: projects, label: "Projects\nDelivered"  },
                { val: clients,  label: "Happy\nClients"      },
              ].map(({ val, label }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <span
                    className="text-[clamp(2.8rem,4.5vw,5rem)] leading-none font-bold text-white tabular-nums"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {val}+
                  </span>
                  <span
                    className="text-blue-400/55 text-[10px] tracking-[0.28em] uppercase whitespace-pre-line leading-relaxed"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── Scroll indicator ─────────────────────────────────────────────── */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.9 }}
        >
          <span
            className="text-blue-400/35 text-[10px] tracking-[0.4em] uppercase"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-4 h-4 text-blue-500/35" />
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}