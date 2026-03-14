"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// NOTE (Next.js): move Syne + DM Mono to app/layout.tsx via `next/font/google`
// for optimal LCP. The useEffect injection below is a self-contained fallback.
// ─────────────────────────────────────────────────────────────────────────────

const EXPO_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ── Animated counter ────────────────────────────────────────────────────────
function useCounter(
  target: number,
  duration: number = 2200,
  startDelay: number = 1450,
): number {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let frame: number | undefined;
    const timeout = setTimeout(() => {
      let start: number | null = null;

      const step = (timestamp: number): void => {
        if (start === null) {
          start = timestamp;
        }

        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
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
      if (frame !== undefined) {
        cancelAnimationFrame(frame);
      }
    };
  }, [target, duration, startDelay]);

  return count;
}

// ── Injected styles ─────────────────────────────────────────────────────────
const HERO_CSS = `
  .hero-stroke {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    -webkit-text-fill-color: transparent;
    -webkit-text-stroke: 1.35px rgba(255, 255, 255, 0.66);
    background:
      linear-gradient(
        90deg,
        transparent 28%,
        rgba(255, 255, 255, 0.12) 42%,
        rgba(186, 230, 253, 0.52) 50%,
        rgba(255, 255, 255, 0.16) 58%,
        transparent 72%
      );
    background-size: 520% 100%;
    background-position: 0% center;
    -webkit-background-clip: text;
    background-clip: text;
    text-shadow: 0 0 34px rgba(59, 130, 246, 0.10);
    animation: hero-shimmer 10.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }

  @keyframes hero-shimmer {
    0%, 18%   { background-position:   0% center; }
    48%, 100% { background-position: 100% center; }
  }

  .hero-noise {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='260' height='260' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 180px 180px;
  }

  .hero-panel {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(96, 165, 250, 0.16);
    border-radius: 22px;
    background:
      linear-gradient(180deg, rgba(11, 18, 38, 0.82) 0%, rgba(5, 10, 24, 0.58) 100%);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 24px 90px rgba(2, 6, 23, 0.42);
    backdrop-filter: blur(16px);
  }

  .hero-panel::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 1px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.14), transparent 70%);
    opacity: 0.85;
  }

  .hero-panel::after {
    content: '';
    position: absolute;
    inset: -25% auto auto -10%;
    width: 65%;
    height: 55%;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.16) 0%, transparent 72%);
    opacity: 0.75;
    pointer-events: none;
  }

  .hero-panel-label {
    margin-bottom: 0.9rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.34em;
    text-transform: uppercase;
    color: rgba(191, 219, 254, 0.46);
  }

  .hero-panel-label::before {
    content: '';
    width: 18px;
    height: 1px;
    background: rgba(125, 211, 252, 0.36);
  }

  .hero-code {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    line-height: 1.9;
    letter-spacing: 0.01em;
    pointer-events: none;
    user-select: none;
    white-space: pre;
  }

  .t-dim  { color: rgba(148, 163, 184, 0.30); }
  .t-kw   { color: rgba(186, 230, 253, 0.58); }
  .t-fn   { color: rgba(125, 211, 252, 0.62); }
  .t-str  { color: rgba(255, 255, 255, 0.60); }
  .t-cmt  { color: rgba(148, 163, 184, 0.22); font-style: italic; }
  .t-num  { color: rgba(96, 165, 250, 0.58); }
  .t-sym  { color: rgba(226, 232, 240, 0.28); }
  .t-type { color: rgba(147, 197, 253, 0.48); }
  .t-op   { color: rgba(148, 163, 184, 0.34); }

  .hero-terminal-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0.95rem 1.1rem 0.8rem;
    border-bottom: 1px solid rgba(96, 165, 250, 0.10);
  }

  .hero-terminal-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
  }

  .hero-terminal-body {
    padding: 1rem 1.1rem 1.2rem;
  }

  .hero-cta-text {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
  }

  .hero-cta-text::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: rgba(147, 197, 253, 0.55);
    transition: width 0.42s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .hero-cta-text:hover::after {
    width: 100%;
  }

  .hero-float-tr {
    animation: hero-float-tr 30s ease-in-out infinite;
  }

  @keyframes hero-float-tr {
    0%, 100% { transform: translate3d(0px, 0px, 0px) rotate(0deg); }
    36%      { transform: translate3d(-10px, -18px, 0px) rotate(-1.4deg); }
    68%      { transform: translate3d(5px, -8px, 0px) rotate(0.8deg); }
  }

  .hero-float-rc {
    animation: hero-float-rc 26s ease-in-out infinite;
    animation-delay: -7s;
  }

  @keyframes hero-float-rc {
    0%, 100% { transform: translate3d(0px, 0px, 0px) rotate(0deg); }
    40%      { transform: translate3d(8px, 12px, 0px) rotate(1deg); }
    75%      { transform: translate3d(-4px, 6px, 0px) rotate(-0.7deg); }
  }

  .hero-float-bl {
    animation: hero-float-bl 24s ease-in-out infinite;
    animation-delay: -4s;
  }

  @keyframes hero-float-bl {
    0%, 100% { transform: translate3d(0px, 0px, 0px) rotate(0deg); }
    42%      { transform: translate3d(7px, -14px, 0px) rotate(0.9deg); }
    72%      { transform: translate3d(-3px, -6px, 0px) rotate(-0.4deg); }
  }

  .hero-float-br {
    animation: hero-float-br 28s ease-in-out infinite;
    animation-delay: -11s;
  }

  @keyframes hero-float-br {
    0%, 100% { transform: translate3d(0px, 0px, 0px) rotate(0deg); }
    32%      { transform: translate3d(-8px, 10px, 0px) rotate(-1deg); }
    65%      { transform: translate3d(5px, 16px, 0px) rotate(0.7deg); }
  }
`;

// ── Counter config ──────────────────────────────────────────────────────────
const COUNTER_DATA = [
  { label: "Years", sublabel: "of craft" },
  { label: "Projects", sublabel: "launched" },
  { label: "Clients", sublabel: "selected" },
] as const;

export function Hero() {
  // ── GSAP refs — scope + per-element targets ─────────────────────────────
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const separatorRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const countersRef = useRef<HTMLDivElement>(null);
  const codeTRRef = useRef<HTMLDivElement>(null);
  const codeRCRef = useRef<HTMLDivElement>(null);
  const codeBLRef = useRef<HTMLDivElement>(null);
  const codeBRRef = useRef<HTMLDivElement>(null);

  // ── Font + style injection ──────────────────────────────────────────────
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
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
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }

      const style = document.getElementById("hero-component-styles");
      if (style?.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  // ── Custom cursor ───────────────────────────────────────────────────────
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const mouseX = useMotionValue(-400);
  const mouseY = useMotionValue(-400);
  const dotX = useSpring(mouseX, { damping: 34, stiffness: 440 });
  const dotY = useSpring(mouseY, { damping: 34, stiffness: 440 });
  const ringX = useSpring(mouseX, { damping: 22, stiffness: 170 });
  const ringY = useSpring(mouseY, { damping: 22, stiffness: 170 });
  const titleOffsetX = useMotionValue(0);
  const titleOffsetY = useMotionValue(0);
  const beamOffsetX = useMotionValue(0);
  const beamOffsetY = useMotionValue(0);
  const ghostOffsetX = useMotionValue(0);
  const ghostOffsetY = useMotionValue(0);
  const titleParallaxX = useSpring(titleOffsetX, { damping: 36, stiffness: 110 });
  const titleParallaxY = useSpring(titleOffsetY, { damping: 36, stiffness: 110 });
  const beamParallaxX = useSpring(beamOffsetX, { damping: 28, stiffness: 84 });
  const beamParallaxY = useSpring(beamOffsetY, { damping: 28, stiffness: 84 });
  const ghostParallaxX = useSpring(ghostOffsetX, { damping: 32, stiffness: 92 });
  const ghostParallaxY = useSpring(ghostOffsetY, { damping: 32, stiffness: 92 });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(pointer: fine)");
    const syncPointer = () => {
      setHasFinePointer(media.matches);
      if (!media.matches) {
        setCursorVisible(false);
      }
    };

    syncPointer();

    if (media.addEventListener) {
      media.addEventListener("change", syncPointer);
      return () => media.removeEventListener("change", syncPointer);
    }

    media.addListener(syncPointer);
    return () => media.removeListener(syncPointer);
  }, []);

  // ── Counters ────────────────────────────────────────────────────────────
  const years = useCounter(5);
  const projects = useCounter(40);
  const clients = useCounter(12);
  const counterValues = [years, projects, clients];

  const resetSceneParallax = () => {
    titleOffsetX.set(0);
    titleOffsetY.set(0);
    beamOffsetX.set(0);
    beamOffsetY.set(0);
    ghostOffsetX.set(0);
    ghostOffsetY.set(0);
  };

  return (
    <>
      {cursorVisible && hasFinePointer && (
        <>
          <motion.div
            aria-hidden="true"
            className="fixed z-[9999] h-1.5 w-1.5 rounded-full bg-white/90 pointer-events-none mix-blend-screen"
            style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
          />
          <motion.div
            aria-hidden="true"
            className="fixed z-[9998] h-10 w-10 rounded-full border border-blue-300/20 bg-blue-400/[0.04] pointer-events-none"
            style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
          />
        </>
      )}

      <section
        ref={sectionRef}
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060c1a]"
        onMouseEnter={() => {
          if (hasFinePointer) {
            setCursorVisible(true);
          }
        }}
        onMouseLeave={() => {
          setCursorVisible(false);
          resetSceneParallax();
        }}
        onMouseMove={(event) => {
          if (!hasFinePointer) {
            return;
          }

          mouseX.set(event.clientX);
          mouseY.set(event.clientY);

          const bounds = event.currentTarget.getBoundingClientRect();
          const normalizedX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
          const normalizedY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

          titleOffsetX.set(normalizedX * 12);
          titleOffsetY.set(normalizedY * 8);
          beamOffsetX.set(normalizedX * 26);
          beamOffsetY.set(normalizedY * 16);
          ghostOffsetX.set(normalizedX * 10);
          ghostOffsetY.set(normalizedY * 14);

          if (!cursorVisible) {
            setCursorVisible(true);
          }
        }}
      >
        {/* Ambient gradients */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: [
              "radial-gradient(ellipse 85% 68% at 14% 52%, rgba(29,78,216,0.42) 0%, transparent 58%)",
              "radial-gradient(ellipse 52% 48% at 82% 18%, rgba(14,165,233,0.18) 0%, transparent 58%)",
              "radial-gradient(ellipse 42% 38% at 62% 88%, rgba(37,99,235,0.17) 0%, transparent 54%)",
              "linear-gradient(180deg, rgba(1,4,12,0.08) 0%, rgba(1,4,12,0.34) 55%, rgba(1,4,12,0.62) 100%)",
            ].join(", "),
          }}
        />

        {/* Scenic beams + vignette */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: [
              "radial-gradient(ellipse 48% 32% at 36% 36%, rgba(125,211,252,0.12) 0%, transparent 72%)",
              "radial-gradient(ellipse 60% 40% at 56% 48%, rgba(59,130,246,0.12) 0%, transparent 70%)",
              "radial-gradient(ellipse 95% 88% at 50% 50%, transparent 48%, rgba(2,6,23,0.46) 100%)",
            ].join(", "),
          }}
        />

        <div
          aria-hidden="true"
          className="absolute left-[-10%] top-[16%] z-[1] h-[26rem] w-[58rem] rounded-full bg-blue-500/[0.09] blur-[120px] pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute right-[-6%] top-[12%] z-[1] h-[20rem] w-[30rem] rounded-full bg-sky-400/[0.08] blur-[110px] pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[-8%] left-[24%] z-[1] h-[18rem] w-[36rem] rounded-full bg-blue-600/[0.07] blur-[130px] pointer-events-none"
        />

        {/* Film grain */}
        <div
          aria-hidden="true"
          className="hero-noise absolute inset-0 z-[1] opacity-[0.04] pointer-events-none"
        />

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-1%] top-[18%] z-[2] hidden select-none lg:block"
          initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.7, delay: 0.92, ease: EXPO_EASE }}
          style={{ x: ghostParallaxX, y: ghostParallaxY }}
        >
          <div
            className="text-[clamp(11rem,25vw,29rem)] font-extrabold leading-none tracking-[-0.08em]"
            style={{
              fontFamily: "'Syne', sans-serif",
              color: "rgba(147,197,253,0.045)",
              WebkitTextStroke: "1px rgba(191,219,254,0.06)",
              textShadow: "0 0 42px rgba(59,130,246,0.08)",
            }}
          >
            01
          </div>
        </motion.div>

        {/* Scenic props */}
        <motion.div
          ref={codeTRRef}
          aria-hidden="true"
          data-hero-code="scene-panel"
          className="hero-panel hero-code hero-float-tr absolute right-[4.5%] top-[8%] z-[2] hidden w-[min(27rem,29vw)] px-6 py-5 lg:block"
          initial={{ opacity: 0, y: 18, filter: "blur(8px)", scale: 0.985 }}
          animate={{
            opacity: [0, 0.96, 0.62],
            y: [18, 0, 0],
            filter: ["blur(8px)", "blur(0px)", "blur(0px)"],
            scale: [0.985, 1, 0.99],
          }}
          transition={{ duration: 2.5, delay: 1.15, ease: EXPO_EASE, times: [0, 0.44, 1] }}
        >
          <div className="hero-panel-label">Scene Builder</div>
          <span className="t-cmt">{"// headline staging"}</span>{"\n"}
          <span className="t-kw">const </span>
          <span className="t-fn">scene</span>
          <span className="t-op"> = </span>
          <span className="t-fn">composeHero</span>
          <span className="t-sym">({"{"}</span>{"\n"}
          {"  "}<span className="t-fn">palette</span>
          <span className="t-op">: </span>
          <span className="t-str">"midnight-blue"</span>
          <span className="t-sym">,</span>{"\n"}
          {"  "}<span className="t-fn">focus</span>
          <span className="t-op">: </span>
          <span className="t-str">"typography"</span>
          <span className="t-sym">,</span>{"\n"}
          {"  "}<span className="t-fn">motion</span>
          <span className="t-op">: </span>
          <span className="t-str">"measured"</span>
          <span className="t-sym">,</span>{"\n"}
          {"  "}<span className="t-fn">depth</span>
          <span className="t-op">: </span>
          <span className="t-num">0.82</span>{"\n"}
          <span className="t-sym">{"});"}</span>
        </motion.div>

        <motion.div
          ref={codeRCRef}
          aria-hidden="true"
          data-hero-code="stage-map"
          className="hero-panel hero-code hero-float-rc absolute right-[2.4%] top-[35%] z-[2] hidden w-[210px] px-5 py-5 xl:block"
          initial={{ opacity: 0, y: 18, filter: "blur(8px)", scale: 0.985 }}
          animate={{
            opacity: [0, 0.84, 0.48],
            y: [18, 0, 0],
            filter: ["blur(8px)", "blur(0px)", "blur(0px)"],
            scale: [0.985, 1, 0.99],
          }}
          transition={{ duration: 2.35, delay: 1.35, ease: EXPO_EASE, times: [0, 0.4, 1] }}
        >
          <div className="hero-panel-label">Stage Map</div>
          <span className="t-dim">x-axis</span>{"  "}
          <span className="t-num">1280</span>{"\n"}
          <span className="t-dim">y-axis</span>{"  "}
          <span className="t-num">0720</span>{"\n"}
          <span className="t-dim">depth </span>{"  "}
          <span className="t-num">0.62</span>{"\n"}
          <span className="t-dim">light </span>{"  "}
          <span className="t-str">soft-blue</span>{"\n"}
          <span className="t-dim">focus </span>{"  "}
          <span className="t-str">headline</span>
        </motion.div>

        <motion.div
          ref={codeBLRef}
          aria-hidden="true"
          data-hero-code="terminal"
          className="hero-panel hero-float-bl absolute bottom-[11%] left-[2.8%] z-[2] hidden w-[240px] lg:block"
          initial={{ opacity: 0, y: 18, filter: "blur(8px)", scale: 0.985 }}
          animate={{
            opacity: [0, 0.88, 0.56],
            y: [18, 0, 0],
            filter: ["blur(8px)", "blur(0px)", "blur(0px)"],
            scale: [0.985, 1, 0.992],
          }}
          transition={{ duration: 2.45, delay: 1.55, ease: EXPO_EASE, times: [0, 0.42, 1] }}
        >
          <div className="hero-terminal-bar">
            <div
              className="hero-terminal-dot"
              style={{ background: "rgba(255,95,87,0.55)" }}
            />
            <div
              className="hero-terminal-dot"
              style={{ background: "rgba(255,189,46,0.55)" }}
            />
            <div
              className="hero-terminal-dot"
              style={{ background: "rgba(40,201,64,0.55)" }}
            />
            <span
              className="ml-auto text-[9px] tracking-[0.34em] uppercase"
              style={{
                color: "rgba(191,219,254,0.38)",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              scene
            </span>
          </div>
          <div className="hero-terminal-body hero-code">
            <span className="t-fn">▶ </span>
            <span className="t-str">boot matteo-raineri.dev</span>{"\n"}
            <span className="t-fn">✓ </span>
            <span className="t-dim">headline locked</span>{"\n"}
            <span className="t-fn">✓ </span>
            <span className="t-dim">motion calibrated</span>{"\n"}
            <span className="t-num">⚡ </span>
            <span className="t-dim">render stage ready</span>
          </div>
        </motion.div>

        <motion.div
          ref={codeBRRef}
          aria-hidden="true"
          data-hero-code="build-strip"
          className="hero-panel hero-code hero-float-br absolute bottom-[13%] right-[4.2%] z-[2] hidden w-[250px] px-5 py-5 xl:block"
          initial={{ opacity: 0, y: 18, filter: "blur(8px)", scale: 0.985 }}
          animate={{
            opacity: [0, 0.82, 0.46],
            y: [18, 0, 0],
            filter: ["blur(8px)", "blur(0px)", "blur(0px)"],
            scale: [0.985, 1, 0.99],
          }}
          transition={{ duration: 2.3, delay: 1.75, ease: EXPO_EASE, times: [0, 0.4, 1] }}
        >
          <div className="hero-panel-label">Render Notes</div>
          <span className="t-cmt">{"// supporting system"}</span>{"\n"}
          <span className="t-fn">performance</span>
          <span className="t-op">:</span>{"  "}
          <span className="t-num">98/100</span>{"\n"}
          <span className="t-fn">parallax</span>
          <span className="t-op">:</span>{"    "}
          <span className="t-str">scaffolded</span>{"\n"}
          <span className="t-fn">timing</span>
          <span className="t-op">:</span>{"      "}
          <span className="t-str">cinematic</span>
        </motion.div>

        {/* Main content */}
        <div className="relative z-10 mx-auto w-full max-w-[1720px] px-6 py-28 md:px-12 lg:px-20 lg:py-32 xl:py-36">
          <motion.div
            ref={eyebrowRef}
            className="mb-10 flex items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EXPO_EASE }}
          >
            <div className="h-px w-8 bg-blue-400/60" />
            <span
              className="text-[10px] uppercase tracking-[0.42em] text-blue-300/65"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Matteo Raineri — Frontend Developer
            </span>
          </motion.div>

          <div className="relative max-w-[1460px]">
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-[5%] top-[24%] z-0 hidden lg:block"
              initial={{ opacity: 0, scale: 0.92, filter: "blur(28px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.8, delay: 0.58, ease: EXPO_EASE }}
              style={{ x: beamParallaxX, y: beamParallaxY }}
            >
              <div
                className="h-[6.25rem] w-[36rem] -rotate-[7deg] rounded-full blur-[26px]"
                style={{
                  background:
                    "radial-gradient(ellipse 56% 62% at 42% 50%, rgba(219,234,254,0.55) 0%, rgba(125,211,252,0.32) 32%, rgba(59,130,246,0.16) 58%, transparent 78%)",
                }}
              />
              <div
                className="absolute left-[16%] top-[20%] h-[2.1rem] w-[19rem] -rotate-[4deg] rounded-full blur-[10px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(191,219,254,0.12) 18%, rgba(219,234,254,0.42) 48%, rgba(96,165,250,0.18) 76%, transparent 100%)",
                }}
              />
            </motion.div>

            <motion.div style={{ x: titleParallaxX, y: titleParallaxY }}>
              <h1
                ref={titleRef}
                className="relative z-10 -ml-1 select-none md:-ml-2 lg:-ml-3 xl:-ml-4"
                aria-label="Matteo Raineri"
              >
                <motion.span
                  className="block text-[clamp(4.9rem,11.8vw,14.8rem)] font-extrabold leading-[0.84] tracking-[-0.05em] text-white"
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    textShadow: "0 0 24px rgba(59,130,246,0.08)",
                  }}
                  initial={{ opacity: 0, y: 55, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 1.2, delay: 0.22, ease: EXPO_EASE }}
                >
                  Matteo
                </motion.span>

                <motion.span
                  className="hero-stroke block ml-[6%] text-[clamp(5.6rem,14.6vw,18.5rem)] leading-[0.8] tracking-[-0.06em]"
                  initial={{ opacity: 0, y: 55, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 1.2, delay: 0.4, ease: EXPO_EASE }}
                >
                  Raineri
                </motion.span>
              </h1>
            </motion.div>
          </div>

          <motion.div
            ref={separatorRef}
            aria-hidden="true"
            className="mt-12 ml-[2%] h-px bg-gradient-to-r from-blue-300/55 via-blue-400/18 to-transparent"
            style={{ width: "94%" }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.25, delay: 0.72, ease: EXPO_EASE }}
          />

          <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,18rem)] lg:items-end lg:gap-16 xl:gap-24">
            <motion.div
              ref={subtitleRef}
              className="ml-[2%] max-w-[38rem] space-y-7"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.82, ease: EXPO_EASE }}
            >
              <p
                className="text-[clamp(1rem,1.8vw,1.34rem)] leading-relaxed text-white/66"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                I build web experiences that land with cinematic force
                and hold with frontend precision.
              </p>

              <div className="inline-flex items-center rounded-full border border-blue-300/16 bg-white/[0.03] px-5 py-2.5 backdrop-blur-xl">
                <span
                  className="text-[10px] uppercase tracking-[0.32em] text-blue-200/64"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Premium Frontend / Motion Systems
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <motion.a
                  href="#work"
                  aria-label="View selected work"
                  className="group inline-flex items-center gap-2 rounded-full border border-blue-200/14 bg-blue-600/90 px-6 py-3.5 text-[13px] font-medium text-white shadow-[0_16px_46px_rgba(29,78,216,0.24)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_18px_54px_rgba(29,78,216,0.34)]"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Selected Work
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </motion.a>

                <a
                  href="#contact"
                  aria-label="Start a conversation"
                  className="hero-cta-text text-[13px] text-white/58 transition-colors duration-300 hover:text-white/86"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Start a conversation
                  <ArrowRight className="h-3 w-3 opacity-40" />
                </a>
              </div>
            </motion.div>

            <motion.div
              ref={countersRef}
              className="grid grid-cols-3 gap-4 sm:gap-5 lg:grid-cols-1 lg:justify-items-end lg:gap-5"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 1.02, ease: EXPO_EASE }}
            >
              {COUNTER_DATA.map(({ label, sublabel }, index) => (
                <div
                  key={label}
                  className="min-w-0 border-l border-blue-300/16 pl-4 lg:max-w-[14rem] lg:pl-5"
                >
                  <span
                    className="block text-[clamp(2rem,3vw,3.35rem)] font-bold leading-none text-white/92 tabular-nums"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {counterValues[index]}+
                  </span>
                  <span
                    className="mt-2 flex flex-col text-[9px] uppercase leading-snug tracking-[0.28em] text-blue-200/46"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    <span>{label}</span>
                    <span>{sublabel}</span>
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div
          aria-hidden="true"
          className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.15, delay: 2.1 }}
        >
          <span
            className="text-[9px] tracking-[0.45em] text-blue-300/44"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            01
          </span>
          <div className="relative h-12 w-px overflow-hidden rounded-full bg-blue-500/18">
            <motion.div
              className="absolute top-0 h-[45%] w-full rounded-full bg-gradient-to-b from-blue-300/55 to-transparent"
              animate={{ y: ["0%", "230%"] }}
              transition={{
                duration: 2.1,
                repeat: Infinity,
                ease: [0.4, 0, 0.6, 1],
                repeatDelay: 0.8,
              }}
            />
          </div>
        </motion.div>
      </section>
    </>
  );
}
