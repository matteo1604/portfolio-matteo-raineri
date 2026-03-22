import { useRef } from "react";
import { gsap, useGSAP } from "../utils/gsap";
import { SECTION_ACCENTS, type SectionId } from "../../contexts/ScrollContext";

interface SectionTransitionProps {
  from: SectionId;
  to: SectionId;
}

// ── Per-pair config ───────────────────────────────────────────────────────────
// height: controls breathing room between sections
// treatment: drives which visual layer renders
type Treatment = "gradient" | "grid" | "particles";

interface TransitionConfig {
  height: number;
  treatment: Treatment;
}

type PairKey = `${SectionId}-${SectionId}`;

const TRANSITION_CONFIG: Record<PairKey, TransitionConfig> = {
  "hero-philosophy":     { height: 80,  treatment: "gradient" },
  "philosophy-skills":   { height: 160, treatment: "grid"     },
  "skills-projects":     { height: 192, treatment: "particles" },
  "projects-process":    { height: 160, treatment: "gradient" },
  "process-contact":     { height: 128, treatment: "grid"     },
  // Fallbacks for any unspecified pair
  "hero-skills":         { height: 160, treatment: "gradient" },
  "hero-projects":       { height: 160, treatment: "gradient" },
  "hero-process":        { height: 160, treatment: "gradient" },
  "hero-contact":        { height: 160, treatment: "gradient" },
  "philosophy-projects": { height: 160, treatment: "gradient" },
  "philosophy-process":  { height: 160, treatment: "gradient" },
  "philosophy-contact":  { height: 160, treatment: "gradient" },
  "skills-process":      { height: 160, treatment: "gradient" },
  "skills-contact":      { height: 160, treatment: "gradient" },
  "projects-contact":    { height: 128, treatment: "gradient" },
};

// Static particle positions — defined outside render to avoid Math.random() in JSX
const BURST_POSITIONS: Array<{ x: string; y: string; size: number; from: boolean }> = [
  { x: "20%",  y: "30%",  size: 5, from: true  },
  { x: "45%",  y: "55%",  size: 3, from: false },
  { x: "72%",  y: "25%",  size: 4, from: true  },
  { x: "60%",  y: "70%",  size: 3, from: false },
  { x: "85%",  y: "45%",  size: 5, from: true  },
  { x: "35%",  y: "65%",  size: 3, from: false },
  { x: "55%",  y: "20%",  size: 4, from: true  },
  { x: "15%",  y: "75%",  size: 3, from: false },
  { x: "90%",  y: "60%",  size: 5, from: true  },
  { x: "10%",  y: "50%",  size: 3, from: false },
  { x: "50%",  y: "40%",  size: 4, from: true  },
  { x: "78%",  y: "80%",  size: 3, from: false },
];

function getConfig(from: SectionId, to: SectionId): TransitionConfig {
  const key = `${from}-${to}` as PairKey;
  return TRANSITION_CONFIG[key] ?? { height: 160, treatment: "gradient" };
}

export function SectionTransition({ from, to }: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const accentFrom = SECTION_ACCENTS[from];
  const accentTo = SECTION_ACCENTS[to];
  const { height, treatment } = getConfig(from, to);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      // Shared: fade in as element enters viewport, fade out as it leaves
      gsap.fromTo(
        el,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "top 60%",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        },
      );
      gsap.to(el, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "bottom 40%",
          end: "bottom top",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      // Connector line — draws left-to-right through scroll
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              end: "bottom 20%",
              scrub: 1.2,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      // Glow orb — scales up through scroll
      if (glowRef.current) {
        gsap.fromTo(
          glowRef.current,
          { scale: 0.3, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              end: "bottom 20%",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      // Grid overlay — y parallax
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: -24,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      // Particles — staggered vertical drift
      if (particlesRef.current) {
        const dots = particlesRef.current.querySelectorAll("[data-particle]");
        if (dots.length) {
          gsap.fromTo(
            dots,
            { y: 40, opacity: 0 },
            {
              y: -40,
              opacity: (i: number) => 0.25 + (i % 4) * 0.12,
              ease: "none",
              stagger: 0.03,
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                end: "bottom 15%",
                scrub: 1,
                invalidateOnRefresh: true,
              },
            },
          );
        }
      }
    },
    [],
    ref,
  );

  return (
    <div
      ref={ref}
      className="relative overflow-hidden"
      style={{ height, opacity: 0 }}
    >
      {/* Base gradient crossfade — always present */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            rgba(${accentFrom}, 0.03) 0%,
            rgba(${accentFrom}, 0.055) 30%,
            rgba(${accentTo}, 0.055) 70%,
            rgba(${accentTo}, 0.03) 100%)`,
        }}
      />

      {/* Glow orb — color-blended between sections */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full"
        style={{
          background: `radial-gradient(circle,
            rgba(${accentTo}, 0.09) 0%,
            rgba(${accentFrom}, 0.04) 40%,
            transparent 70%)`,
          filter: "blur(60px)",
        }}
      />

      {/* Connector line — draws left-to-right, color transitions from→to */}
      <div
        ref={lineRef}
        aria-hidden="true"
        className="absolute top-1/2 left-0 right-0 h-px origin-left"
        style={{
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(${accentFrom}, 0.20) 15%,
            rgba(${accentFrom}, 0.30) 35%,
            rgba(${accentTo}, 0.30) 65%,
            rgba(${accentTo}, 0.20) 85%,
            transparent 100%)`,
          transformOrigin: "left center",
        }}
      />

      {/* Grid treatment — philosophy→skills, process→contact */}
      {treatment === "grid" && (
        <div
          ref={gridRef}
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(${accentTo}, 0.09) 1px, transparent 1px),
              linear-gradient(90deg, rgba(${accentTo}, 0.09) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            maskImage:
              "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0.5) 75%, transparent 100%)",
          }}
        />
      )}

      {/* Particle burst — skills→projects */}
      {treatment === "particles" && (
        <div
          ref={particlesRef}
          aria-hidden="true"
          className="absolute inset-0"
        >
          {BURST_POSITIONS.map((p, i) => (
            <div
              key={i}
              data-particle=""
              className="absolute rounded-full"
              style={{
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                background: `rgba(${p.from ? accentFrom : accentTo}, ${0.18 + (i % 4) * 0.07})`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
