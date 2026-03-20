"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, useGSAP, ScrollTrigger } from "../utils/gsap";

// ─────────────────────────────────────────────────────────────────────────────
// NOTE (Next.js): move Syne + DM Mono to app/layout.tsx via `next/font/google`
// for optimal LCP. The useEffect injection below is a self-contained fallback.
// ─────────────────────────────────────────────────────────────────────────────

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
  }

  .hero-stroke-live {
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

  .hero-terminal-cursor {
    display: inline-block;
    width: 5px;
    height: 9px;
    background: rgba(125, 211, 252, 0.52);
    margin-left: 3px;
    vertical-align: middle;
    animation: hero-cursor-blink 1.1s step-end infinite;
  }

  @keyframes hero-cursor-blink {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0; }
  }
`;

// ── Counter config ──────────────────────────────────────────────────────────
const COUNTER_DATA = [
  { label: "Years", sublabel: "active" },
  { label: "Projects", sublabel: "shipped" },
  { label: "Clients", sublabel: "selected" },
] as const;

// ── Pre-computed letter scatter vectors ───────────────────────────────────────
// Stable module-level const — never recreated on render.
// Heavier letters (M, o) scatter less; lighter ones scatter more.
// Direction: first letter up-left, last letter down-right, middles diverge.
const MATTEO_SCATTER = [
  { x: -110, y: -70,  blur: 2,   r: -8 },
  { x: -40,  y: -95,  blur: 3.5, r:  4 },
  { x:  20,  y: -80,  blur: 5,   r: -3 },
  { x:  60,  y: -65,  blur: 6.5, r:  6 },
  { x:  95,  y: -40,  blur: 8,   r: -5 },
  { x:  130, y: -55,  blur: 9.5, r:  8 },
] as const;

const LETTER_WEIGHTS = [0.6, 1.0, 0.9, 0.9, 1.0, 0.95] as const;

// ── Final opacities for code panels (match original motion/react keyframes) ──
const PANEL_OPACITIES = {
  TR: 0.62,
  RC: 0.48,
  BL: 0.56,
  BR: 0.46,
} as const;

export function Hero() {
  // ── Refs ──────────────────────────────────────────────────────────────────
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
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const leftOrbRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const raineriWrapRef = useRef<HTMLSpanElement>(null);

  // ── State ─────────────────────────────────────────────────────────────────
  const [entranceComplete, setEntranceComplete] = useState(false);
  const [raineriRevealed, setRaineriRevealed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // ── Scene parallax motionValues (mouse-driven) ──────────────────────────
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

  // ── Reduced-motion detection ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setPrefersReducedMotion(mq.matches);
      if (mq.matches) setRaineriRevealed(true);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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

  // ═══════════════════════════════════════════════════════════════════════════
  // GSAP ENTRANCE TIMELINE — time-based, NOT scroll-driven
  // Replaces all motion/react entrance animations with a single GSAP timeline.
  // ═══════════════════════════════════════════════════════════════════════════
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      // Check reduced motion directly (state may not be settled yet)
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reducedMotion) {
        // Instantly reveal everything
        const allEls = [
          eyebrowRef.current, subtitleRef.current, countersRef.current,
          scrollIndicatorRef.current, ghostRef.current, beamRef.current,
        ].filter(Boolean);
        gsap.set(allEls, { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 });

        const letterEls = letterRefs.current.filter(Boolean) as HTMLSpanElement[];
        gsap.set(letterEls, { opacity: 1, y: 0 });

        if (raineriWrapRef.current) gsap.set(raineriWrapRef.current, { clipPath: "inset(0 0% 0 0)" });
        if (separatorRef.current)   gsap.set(separatorRef.current, { scaleX: 1 });

        if (codeTRRef.current) gsap.set(codeTRRef.current, { opacity: PANEL_OPACITIES.TR, y: 0, filter: "blur(0px)", scale: 1 });
        if (codeRCRef.current) gsap.set(codeRCRef.current, { opacity: PANEL_OPACITIES.RC, y: 0, filter: "blur(0px)", scale: 1 });
        if (codeBLRef.current) gsap.set(codeBLRef.current, { opacity: PANEL_OPACITIES.BL, y: 0, filter: "blur(0px)", scale: 1 });
        if (codeBRRef.current) gsap.set(codeBRRef.current, { opacity: PANEL_OPACITIES.BR, y: 0, filter: "blur(0px)", scale: 1 });

        setRaineriRevealed(true);
        setEntranceComplete(true);
        return;
      }

      const intro = gsap.timeline({
        delay: 0.1,
        onComplete: () => setEntranceComplete(true),
      });

      // ── Eyebrow — 0.0s ──
      if (eyebrowRef.current) {
        intro.to(eyebrowRef.current, {
          opacity: 1, y: 0, duration: 0.7, ease: "power4.out",
        }, 0);
      }

      // ── Letters "Matteo" — staggered from 0.2s ──
      const letterEls = letterRefs.current.filter(Boolean) as HTMLSpanElement[];
      if (letterEls.length > 0) {
        intro.to(letterEls, {
          opacity: 1, y: 0, duration: 0.72, ease: "power4.out",
          stagger: 0.032,
        }, 0.2);
      }

      // ── "Raineri" — clip-path reveal from 0.55s ──
      if (raineriWrapRef.current) {
        intro.to(raineriWrapRef.current, {
          clipPath: "inset(0 0% 0 0)", duration: 1.0, ease: "power4.out",
          onComplete: () => {
            // Force clipPath removal so no residual clipping exists
            // (text-stroke extends beyond layout box on rightmost letter)
            if (raineriWrapRef.current) {
              raineriWrapRef.current.style.clipPath = "none";
            }
            setRaineriRevealed(true);
          },
        }, 0.55);
      }

      // ── Beam — from 0.58s ──
      if (beamRef.current) {
        intro.to(beamRef.current, {
          opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.8, ease: "power4.out",
        }, 0.58);
      }

      // ── Separator — from 0.72s ──
      if (separatorRef.current) {
        intro.to(separatorRef.current, {
          scaleX: 1, duration: 1.25, ease: "power4.out",
        }, 0.72);
      }

      // ── Subtitle — from 0.82s ──
      if (subtitleRef.current) {
        intro.to(subtitleRef.current, {
          opacity: 1, y: 0, duration: 0.95, ease: "power4.out",
        }, 0.82);
      }

      // ── Ghost "01" — from 0.92s ──
      if (ghostRef.current) {
        intro.to(ghostRef.current, {
          opacity: 1, filter: "blur(0px)", duration: 1.7, ease: "power4.out",
        }, 0.92);
      }

      // ── Counters — from 1.02s ──
      if (countersRef.current) {
        intro.to(countersRef.current, {
          opacity: 1, y: 0, duration: 0.95, ease: "power4.out",
        }, 1.02);
      }

      // ── Code panels — staggered from 1.15s ──
      const panelEntrance = [
        { el: codeTRRef.current, delay: 1.15, finalOpacity: PANEL_OPACITIES.TR },
        { el: codeRCRef.current, delay: 1.35, finalOpacity: PANEL_OPACITIES.RC },
        { el: codeBLRef.current, delay: 1.55, finalOpacity: PANEL_OPACITIES.BL },
        { el: codeBRRef.current, delay: 1.75, finalOpacity: PANEL_OPACITIES.BR },
      ];
      panelEntrance.forEach(({ el, delay, finalOpacity }) => {
        if (!el) return;
        intro.to(el, {
          opacity: finalOpacity, y: 0, filter: "blur(0px)", scale: 1,
          duration: 1.2, ease: "power4.out",
        }, delay);
      });

      // ── Scroll indicator — from 2.1s ──
      if (scrollIndicatorRef.current) {
        intro.to(scrollIndicatorRef.current, {
          opacity: 1, duration: 1.15, ease: "power2.out",
        }, 2.1);
      }
    },
    [],
    sectionRef,
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // GSAP SCROLL EXIT TIMELINE — scroll-driven, gated behind entranceComplete
  // Only created after entrance finishes so GSAP FROM values are correct.
  // ═══════════════════════════════════════════════════════════════════════════
  useGSAP(
    () => {
      if (!entranceComplete) return;

      const section = sectionRef.current;
      if (!section) return;

      const isMobile = !window.matchMedia("(min-width: 1024px)").matches;

      if (isMobile) {
        const shared = {
          ease: "none" as const,
          scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 1.2 },
        };
        if (titleRef.current)    gsap.to(titleRef.current,    { y: -60, opacity: 0, filter: "blur(4px)", ...shared });
        if (subtitleRef.current) gsap.to(subtitleRef.current, { y: -40, opacity: 0, ...shared });
        if (countersRef.current) gsap.to(countersRef.current, { y: -35, opacity: 0, ...shared });
        return;
      }

      const letterEls = letterRefs.current.filter(Boolean) as HTMLSpanElement[];
      const panelEls = [codeTRRef.current, codeRCRef.current, codeBLRef.current, codeBRRef.current];

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          onLeave:     () => setTimeout(() => ScrollTrigger.refresh(), 100),
          onEnterBack: () => setTimeout(() => ScrollTrigger.refresh(), 100),
          onUpdate: (self) => {
            // When timeline scrubs back to the dead zone (progress < 0.05),
            // force-restore all elements to their entrance-complete state
            if (self.progress < 0.05 && self.direction === -1) {
              // Letters
              letterEls.forEach((el) => {
                gsap.set(el, { x: 0, y: 0, rotation: 0, opacity: 1, filter: "blur(0px)", clearProps: "transform" });
              });
              // Raineri
              if (raineriWrapRef.current) {
                gsap.set(raineriWrapRef.current, { x: 0, opacity: 1, clearProps: "clipPath" });
                raineriWrapRef.current.style.clipPath = "none";
              }
              // Separator
              if (separatorRef.current) {
                gsap.set(separatorRef.current, { scaleX: 1, opacity: 1, transformOrigin: "left center" });
              }
              // Ghost
              if (ghostRef.current) {
                gsap.set(ghostRef.current, { scale: 1, opacity: 1, filter: "blur(0px)" });
              }
              // Eyebrow
              if (eyebrowRef.current) {
                gsap.set(eyebrowRef.current, { y: 0, opacity: 1 });
              }
              // Subtitle & Counters
              if (subtitleRef.current) {
                gsap.set(subtitleRef.current, { y: 0, opacity: 1, filter: "blur(0px)" });
              }
              if (countersRef.current) {
                gsap.set(countersRef.current, { y: 0, opacity: 1, filter: "blur(0px)" });
              }
              // Code panels — restore to entrance-complete opacity + clear transforms
              panelEls.forEach((el) => {
                if (el) gsap.set(el, { clearProps: "x,y,rotation,filter,scale" });
              });
              if (codeTRRef.current) gsap.set(codeTRRef.current, { opacity: PANEL_OPACITIES.TR });
              if (codeRCRef.current) gsap.set(codeRCRef.current, { opacity: PANEL_OPACITIES.RC });
              if (codeBLRef.current) gsap.set(codeBLRef.current, { opacity: PANEL_OPACITIES.BL });
              if (codeBRRef.current) gsap.set(codeBRRef.current, { opacity: PANEL_OPACITIES.BR });
              // Scroll indicator
              if (scrollIndicatorRef.current) {
                gsap.set(scrollIndicatorRef.current, { opacity: 1, y: 0 });
              }
              // Left orb
              if (leftOrbRef.current) {
                gsap.set(leftOrbRef.current, { scale: 1, opacity: 0.09, filter: "blur(120px)" });
              }
            }
          },
        },
      });

      // ── Dead zone: 0→0.10 — nothing animates ─────────────────────────
      tl.to({}, { duration: 0.10 });

      // ── Phase 1: 0.10→0.20 — Breath (power1.out for subtle deceleration) ──
      if (scrollIndicatorRef.current) {
        tl.to(scrollIndicatorRef.current, { opacity: 0, y: -20, ease: "power1.out", duration: 0.10 }, 0.10);
      }
      if (ghostRef.current) {
        tl.to(ghostRef.current, { scale: 1.04, ease: "power1.out", duration: 0.10 }, 0.10);
      }
      panelEls.forEach((el) => {
        if (el) tl.to(el, { y: "-=8", ease: "power1.out", duration: 0.10 }, 0.10);
      });

      // ── Phase 2: 0.20→0.50 — Departure (power2.in for outward acceleration) ──
      letterEls.forEach((el, i) => {
        const s = MATTEO_SCATTER[i] ?? { x: 0, y: 0, blur: 0, r: 0 };
        tl.to(el, {
          x: s.x, y: s.y, rotation: s.r, filter: `blur(${s.blur}px)`,
          ease: "power2.in", duration: 0.30,
        }, 0.20 + i * 0.012);
        tl.to(el, { opacity: 0, ease: "power2.in", duration: 0.10 }, 0.32 + i * 0.015);
      });

      if (raineriWrapRef.current) {
        tl.to(raineriWrapRef.current, {
          clipPath: "inset(0 0 0 100%)", x: -60, opacity: 0,
          ease: "power2.in", duration: 0.15,
        }, 0.28);
      }

      if (separatorRef.current) {
        tl.to(separatorRef.current, {
          scaleX: 0, transformOrigin: "right center", ease: "power2.in", duration: 0.15,
        }, 0.24);
      }

      // ── Phase 3: 0.50→0.75 — Disintegration (power1.in for accelerating exit) ──
      const panelExits = [
        { el: codeTRRef.current,  x:  200, y: -180, r:  8, blur: 12 },
        { el: codeRCRef.current,  x:  260, y:  100, r: -5, blur: 10 },
        { el: codeBLRef.current,  x: -220, y:  150, r:  6, blur: 14 },
        { el: codeBRRef.current,  x:  180, y:  200, r: -7, blur: 11 },
      ];
      panelExits.forEach(({ el, x, y, r, blur }, i) => {
        if (!el) return;
        tl.to(el, {
          x, y, rotation: r, opacity: 0, filter: `blur(${blur}px)`,
          ease: "power1.in", duration: 0.22,
        }, 0.50 + i * 0.025);
      });

      if (subtitleRef.current) {
        tl.to(subtitleRef.current, { y: -100, opacity: 0, filter: "blur(8px)", ease: "power1.in", duration: 0.18 }, 0.50);
      }
      if (countersRef.current) {
        tl.to(countersRef.current, { y: -100, opacity: 0, filter: "blur(8px)", ease: "power1.in", duration: 0.18 }, 0.54);
      }
      if (eyebrowRef.current) {
        tl.to(eyebrowRef.current, { y: -40, opacity: 0, ease: "power1.in", duration: 0.10 }, 0.55);
      }

      // ── Phase 4: 0.75→1.0 — Void (linear dissolve) ─────────────────
      if (ghostRef.current) {
        tl.to(ghostRef.current, { scale: 1.15, opacity: 0, filter: "blur(20px)", ease: "none", duration: 0.25 }, 0.75);
      }
      if (leftOrbRef.current) {
        tl.to(leftOrbRef.current, { scale: 1.3, opacity: 0, filter: "blur(160px)", ease: "none", duration: 0.25 }, 0.75);
      }

      // Force refresh so downstream sections recalculate with pin spacer
      setTimeout(() => ScrollTrigger.refresh(), 200);
    },
    [entranceComplete],
    sectionRef,
  );

  // ── Ambient pulse — fires once when "Raineri" reveal completes ───────────
  useEffect(() => {
    if (!raineriRevealed || prefersReducedMotion || !leftOrbRef.current) return;
    gsap.to(leftOrbRef.current, {
      scale: 1.10,
      opacity: 0.14,
      duration: 0.7,
      ease: "power2.out",
      onComplete: () => {
        if (leftOrbRef.current) {
          gsap.to(leftOrbRef.current, {
            scale: 1,
            opacity: 0.09,
            duration: 0.7,
            ease: "power2.in",
          });
        }
      },
    });
  }, [raineriRevealed, prefersReducedMotion]);

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
      <section
        ref={sectionRef}
        className="relative flex min-h-screen items-center justify-center bg-[#060c1a]"
        onMouseLeave={resetSceneParallax}
        onMouseMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          const normalizedX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
          const normalizedY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

          titleOffsetX.set(normalizedX * 22);
          titleOffsetY.set(normalizedY * 14);
          beamOffsetX.set(normalizedX * 42);
          beamOffsetY.set(normalizedY * 26);
          ghostOffsetX.set(normalizedX * 18);
          ghostOffsetY.set(normalizedY * 24);
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
          ref={leftOrbRef}
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

        {/* Ghost "01" — motion.div is parallax wrapper only, inner div is GSAP target */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-1%] top-[18%] z-[2] hidden select-none lg:block"
          style={{ x: ghostParallaxX, y: ghostParallaxY }}
        >
          <div
            ref={ghostRef}
            style={{ opacity: 0, filter: "blur(12px)" }}
          >
            <div
              className="text-[clamp(11rem,25vw,29rem)] font-extrabold leading-none tracking-[-0.08em]"
              style={{
                fontFamily: "'Syne', sans-serif",
                color: "rgba(147,197,253,0.075)",
                WebkitTextStroke: "1px rgba(191,219,254,0.09)",
                textShadow: "0 0 42px rgba(59,130,246,0.08)",
              }}
            >
              01
            </div>
          </div>
        </motion.div>

        {/* Scenic code panels — plain divs, GSAP handles entrance + exit */}
        <div
          ref={codeTRRef}
          aria-hidden="true"
          data-hero-code="scene-panel"
          className="hero-panel hero-code hero-float-tr absolute right-[4.5%] top-[8%] z-[2] hidden w-[min(27rem,29vw)] px-6 py-5 lg:block"
          style={{ opacity: 0, transform: "translateY(18px) scale(0.985)", filter: "blur(8px)" }}
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
        </div>

        <div
          ref={codeRCRef}
          aria-hidden="true"
          data-hero-code="stage-map"
          className="hero-panel hero-code hero-float-rc absolute right-[2.4%] top-[35%] z-[2] hidden w-[210px] px-5 py-5 xl:block"
          style={{ opacity: 0, transform: "translateY(18px) scale(0.985)", filter: "blur(8px)" }}
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
        </div>

        <div
          ref={codeBLRef}
          aria-hidden="true"
          data-hero-code="terminal"
          className="hero-panel hero-float-bl absolute bottom-[11%] left-[2.8%] z-[2] hidden w-[240px] lg:block"
          style={{ opacity: 0, transform: "translateY(18px) scale(0.985)", filter: "blur(8px)" }}
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
            {"\n"}<span className="hero-terminal-cursor" aria-hidden="true" />
          </div>
        </div>

        <div
          ref={codeBRRef}
          aria-hidden="true"
          data-hero-code="build-strip"
          className="hero-panel hero-code hero-float-br absolute bottom-[13%] right-[4.2%] z-[2] hidden w-[250px] px-5 py-5 xl:block"
          style={{ opacity: 0, transform: "translateY(18px) scale(0.985)", filter: "blur(8px)" }}
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
        </div>

        {/* Main content */}
        <div className="relative z-10 mx-auto w-full max-w-[1720px] px-6 py-28 md:px-12 lg:px-20 lg:py-32 xl:py-36">
          {/* Eyebrow — plain div, GSAP entrance */}
          <div
            ref={eyebrowRef}
            className="mb-10 flex items-center gap-3"
            style={{ opacity: 0, transform: "translateY(10px)" }}
          >
            <div className="h-px w-8 bg-blue-400/60" />
            <span
              className="text-[10px] uppercase tracking-[0.42em] text-blue-300/65"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              MR — Frontend Engineer / Motion Systems
            </span>
          </div>

          <div className="relative max-w-[1460px]">
            {/* Beam — motion.div for parallax only, inner div for GSAP entrance */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-[5%] top-[24%] z-0 hidden lg:block"
              style={{ x: beamParallaxX, y: beamParallaxY }}
            >
              <div
                ref={beamRef}
                style={{ opacity: 0, transform: "scale(0.92)", filter: "blur(28px)" }}
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
              </div>
            </motion.div>

            {/* Title — motion.div for parallax only */}
            <motion.div style={{ x: titleParallaxX, y: titleParallaxY }}>
              <h1
                ref={titleRef}
                className="relative z-10 -ml-1 select-none md:-ml-2 lg:-ml-3 xl:-ml-4"
                aria-label="Matteo Raineri"
              >
                {/* "Matteo" — single span per letter, no overflow:hidden, GSAP handles all */}
                <span
                  className="block text-[clamp(4.9rem,11.8vw,14.8rem)] font-extrabold leading-[0.84] tracking-[-0.05em] text-white"
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    textShadow: "0 0 24px rgba(59,130,246,0.08)",
                  }}
                >
                  {"Matteo".split("").map((char, i) => (
                    <span
                      key={i}
                      ref={(el) => { letterRefs.current[i] = el; }}
                      style={{
                        display: "inline-block",
                        opacity: 0,
                        transform: "translateY(40px)",
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </span>

                {/* "Raineri" — clip-path on wrapper, GSAP handles reveal + exit */}
                <span
                  ref={raineriWrapRef}
                  style={{ display: "block", clipPath: "inset(0 100% 0 0)", paddingRight: "0.05em" }}
                >
                  <span
                    className={`hero-stroke${raineriRevealed ? " hero-stroke-live" : ""} block ml-[6%] text-[clamp(5.6rem,14.6vw,18.5rem)] leading-[0.8] tracking-[-0.06em]`}
                  >
                    Raineri
                  </span>
                </span>
              </h1>
            </motion.div>
          </div>

          {/* Separator — plain div, GSAP entrance + exit */}
          <div
            ref={separatorRef}
            aria-hidden="true"
            className="mt-12 ml-[2%] h-px bg-gradient-to-r from-blue-300/55 via-blue-400/18 to-transparent"
            style={{ width: "94%", transform: "scaleX(0)", transformOrigin: "left center" }}
          />

          <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,18rem)] lg:items-end lg:gap-16 xl:gap-24">
            {/* Subtitle — plain div, GSAP entrance + exit */}
            <div
              ref={subtitleRef}
              className="ml-[2%] max-w-[38rem] space-y-7"
              style={{ opacity: 0, transform: "translateY(22px)" }}
            >
              <p
                className="text-[clamp(1rem,1.8vw,1.34rem)] leading-relaxed text-white/66"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Motion is the argument. Precision is the proof.
              </p>

              <div className="inline-flex items-center rounded-full border border-blue-300/16 bg-white/[0.03] px-5 py-2.5 backdrop-blur-xl">
                <span
                  className="text-[10px] uppercase tracking-[0.32em] text-blue-200/64"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  React · GSAP · Motion Design
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                {/* CTA — keeps motion.a for whileHover/whileTap (no GSAP conflict) */}
                <motion.a
                  href="#work"
                  aria-label="View selected work"
                  data-magnetic=""
                  className="group inline-flex items-center gap-2 rounded-full border border-blue-200/14 bg-blue-600/90 px-6 py-3.5 text-[13px] font-medium text-white shadow-[0_16px_46px_rgba(29,78,216,0.24)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_18px_54px_rgba(29,78,216,0.34)]"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Enter the Archive
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </motion.a>

                <a
                  href="#contact"
                  aria-label="Start a conversation"
                  data-magnetic=""
                  className="hero-cta-text text-[13px] text-white/58 transition-colors duration-300 hover:text-white/86"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Let's build something
                  <ArrowRight className="h-3 w-3 opacity-40" />
                </a>
              </div>
            </div>

            {/* Counters — plain div, GSAP entrance + exit */}
            <div
              ref={countersRef}
              className="grid grid-cols-3 gap-4 sm:gap-5 lg:grid-cols-1 lg:justify-items-end lg:gap-5"
              style={{ opacity: 0, transform: "translateY(22px)" }}
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
            </div>
          </div>
        </div>

        {/* Scroll indicator — plain div, GSAP entrance + exit.
            Inner bouncing line stays as motion.div (continuous loop, no conflict). */}
        <div
          ref={scrollIndicatorRef}
          aria-hidden="true"
          className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
          style={{ opacity: 0 }}
        >
          <div className="flex flex-col items-center gap-1">
            <span
              className="text-[9px] tracking-[0.45em] text-blue-300/44"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              01
            </span>
            <span
              className="text-[7px] tracking-[0.32em] text-blue-300/28"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              scroll.init
            </span>
          </div>
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
        </div>
      </section>
    </>
  );
}
