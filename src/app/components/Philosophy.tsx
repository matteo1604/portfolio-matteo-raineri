"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Philosophy — manifesto layout
//
// Structure:
//   Eyebrow  (Philosophy — 02)
//   Manifesto line — single sentence framing the three principles
//   Top separator
//   Three principle rows: [index] [NAME — Syne display] [descriptor — DM Mono]
//   Row separators
//
// Hover (PrincipleRow):
//   — name: drop-shadow glow + translateY(-3px) + scale(1.015)
//   — descriptor: opacity 0.50 → 0.70 (row reads as a single unit)
//   — color change on name removed — glow + scale carry the full weight
//
// Entrance: blur(8px) → blur(0) + y(40) → y(0), matching Hero motion language.
// Stagger: non-uniform — first gap 0.23s, second 0.26s — avoids mechanical feel.
//
// Ghost "02": anchored bottom-right, clipped — emerges from the section floor.
//   GSAP (future): y: 0 → -60px, scrub: 1.5 for parallax depth.
//
// All element refs exposed for GSAP scroll timeline.
// ─────────────────────────────────────────────────────────────────────────────

const MANIFESTO =
  "Interfaces should be fast enough to disappear and precise enough to be trusted.";

const PRINCIPLES = [
  {
    index: "01",
    name: "Performance",
    descriptor:
      "Speed is felt before it's measured.\nA slow interface doesn't just frustrate — it breaks trust.",
  },
  {
    index: "02",
    name: "Elegance",
    descriptor:
      "Reduction is the hardest discipline —\nwhat stays must earn its place.",
  },
  {
    index: "03",
    name: "Craft",
    descriptor:
      "The gap between working and refined\nis where the real work begins.",
  },
] as const;

// Stagger timing — non-uniform increments (0.23s, 0.26s)
const SEPARATOR_DELAYS = [0.28, 0.51, 0.77] as const;
const ROW_DELAYS       = [0.35, 0.58, 0.84] as const;

// Shared expo easing — matches Hero
const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ── PrincipleRow ──────────────────────────────────────────────────────────────
// Extracted so hover state is self-contained and refs are cleanly typed.
// GSAP integration: pass rowRef to gsap.context() in the parent's useEffect.
interface PrincipleRowProps {
  rowIndex: number;
  index: string;
  name: string;
  descriptor: string;
  rowRef: React.RefObject<HTMLDivElement | null>;
  isInView: boolean;
  isActive: boolean;
  isDimmed: boolean;
  hasActiveRow: boolean;
  onActivate: (index: number) => void;
  onDeactivate: () => void;
  delay: number;
  "data-philosophy": string;
}

function PrincipleRow({
  rowIndex,
  index,
  name,
  descriptor,
  rowRef,
  isInView,
  isActive,
  isDimmed,
  hasActiveRow,
  onActivate,
  onDeactivate,
  delay,
  "data-philosophy": dataAttr,
}: PrincipleRowProps) {
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const wrapperEl = titleWrapRef.current;
    const titleEl = titleRef.current;

    if (!wrapperEl || !titleEl || typeof window === "undefined") {
      return;
    }

    let frame = 0;

    const fitTitle = () => {
      cancelAnimationFrame(frame);

      frame = window.requestAnimationFrame(() => {
        titleEl.style.fontSize = "";
        titleEl.style.letterSpacing = "";

        const availableWidth = Math.max(
          0,
          Math.min(wrapperEl.clientWidth - 40, wrapperEl.clientWidth * 0.92),
        );

        if (availableWidth <= 0) {
          return;
        }

        const baseWidth = titleEl.scrollWidth;

        if (baseWidth <= availableWidth) {
          return;
        }

        const widthRatio = availableWidth / baseWidth;
        const compressedTracking = Math.max(-0.035 - (1 - widthRatio) * 0.11, -0.082);
        titleEl.style.letterSpacing = `${compressedTracking}em`;

        const trackedWidth = titleEl.scrollWidth;

        if (trackedWidth <= availableWidth) {
          return;
        }

        const currentFontSize = Number.parseFloat(
          window.getComputedStyle(titleEl).fontSize,
        );
        const nextFontSize = Math.max(
          currentFontSize * (availableWidth / trackedWidth),
          52,
        );

        titleEl.style.fontSize = `${nextFontSize}px`;
      });
    };

    fitTitle();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => fitTitle())
        : null;

    resizeObserver?.observe(wrapperEl);
    window.addEventListener("resize", fitTitle);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => fitTitle()).catch(() => fitTitle());
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", fitTitle);
    };
  }, [name]);

  return (
    <motion.div
      ref={rowRef}
      data-philosophy={dataAttr}
      className="grid gap-y-4 py-[clamp(2.8rem,4vw,4.5rem)] lg:grid-cols-[var(--ph-index-col)_minmax(0,1fr)_minmax(17rem,20rem)] lg:items-end lg:gap-x-[var(--ph-gap)] lg:gap-y-0 xl:grid-cols-[var(--ph-index-col)_minmax(0,1fr)_minmax(19rem,22rem)] 2xl:grid-cols-[var(--ph-index-col)_minmax(0,1fr)_minmax(20rem,24rem)]"
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 1.1, delay, ease: EXPO }}
      onMouseEnter={() => onActivate(rowIndex)}
      onMouseLeave={onDeactivate}
    >
      {/* Index */}
      <span
        className="flex-shrink-0 text-blue-400/65 text-[11px] tracking-[0.40em] uppercase lg:pb-3"
        style={{
          fontFamily: "'DM Mono', monospace",
          color: isDimmed
            ? "rgba(96,165,250,0.22)"
            : isActive
              ? "rgba(125,211,252,0.88)"
              : "rgba(96,165,250,0.65)",
          transition: "color 0.55s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {index}
      </span>

      {/* ── Principle name ─────────────────────────────────────────────────────
          Three-axis hover response:
            1. drop-shadow glow — light source switches on behind the word
            2. translateY(-3px) — word lifts toward the cursor
            3. scale(1.015)     — word expands slightly, feels physical
          transformOrigin: "left center" so the scale grows rightward,
          not outward in both directions (which would shift the separator below).
          Color change removed — glow + scale are sufficient.
          ─
          GSAP (future): replace inline style mutations with
            gsap.to(nameRef.current, { ... }) inside mouseenter/mouseleave
          for timeline-compatible control.
      ─────────────────────────────────────────────────────────────────────── */}
      <div
        ref={titleWrapRef}
        className="relative z-0 min-w-0 lg:col-start-2 lg:pr-10 xl:pr-12"
      >
        <h2
          ref={titleRef}
          className="min-w-0 max-w-full text-[clamp(3.5rem,14vw,5.25rem)] leading-[0.88] tracking-[-0.035em] font-extrabold lg:text-[clamp(4rem,5.6vw,5.75rem)] xl:text-[clamp(4.75rem,5.8vw,6.85rem)] 2xl:text-[clamp(5.6rem,6.6vw,8.5rem)]"
          style={{
            fontFamily:      "'Syne', sans-serif",
            color:           isDimmed
              ? "rgba(255,255,255,0.32)"
              : isActive
                ? "rgba(255,255,255,0.95)"
                : "rgba(255,255,255,0.86)",
            filter:          isActive
              ? "drop-shadow(0 0 40px rgba(147,197,253,0.42))"
              : "drop-shadow(0 0 0px rgba(147,197,253,0))",
            transform:       isActive ? "translateY(-3px) scale(1.015)" : "translateY(0px) scale(1)",
            opacity:         hasActiveRow && !isActive ? 0.78 : 1,
            transition:      "color 0.55s cubic-bezier(0.16,1,0.3,1), opacity 0.55s cubic-bezier(0.16,1,0.3,1), filter 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1)",
            transformOrigin: "left center",
          }}
        >
          {name}
        </h2>
      </div>

      {/* ── Descriptor ─────────────────────────────────────────────────────────
          Brightens when the row is hovered: 0.50 → 0.70 opacity.
          No movement — the name already moves. The descriptor stays anchored,
          creating a visual counterweight that reads the row as a single unit.
          Transition duration matches the name for coherent timing.
      ─────────────────────────────────────────────────────────────────────── */}
      <motion.p
        className="relative z-10 max-w-[34rem] leading-relaxed whitespace-pre-line lg:col-start-3 lg:row-start-1 lg:max-w-none lg:min-w-[17rem] lg:justify-self-end lg:pl-3 lg:text-right lg:pb-3 xl:min-w-[19rem] xl:pl-4 2xl:min-w-[20rem]"
        animate={{
          opacity: isDimmed ? 0.18 : isActive ? 0.74 : 0.46,
          y: isActive ? -2 : hasActiveRow ? 6 : 0,
          filter: isDimmed ? "blur(1px)" : "blur(0px)",
          clipPath: isActive
            ? "inset(0% 0% 0% 0%)"
            : hasActiveRow
              ? "inset(10% 0% 0% 0%)"
              : "inset(0% 0% 0% 0%)",
        }}
        transition={{ duration: 0.6, ease: EXPO }}
        style={{
          fontFamily:    "'DM Mono', monospace",
          fontSize:      "clamp(0.78rem, 1.15vw, 0.88rem)",
          color:         "rgba(255,255,255,0.74)",
          letterSpacing: "0.01em",
          transition:    "color 0.6s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {descriptor}
      </motion.p>
    </motion.div>
  );
}

// ── Philosophy ────────────────────────────────────────────────────────────────
export function Philosophy() {
  // Section ref — useInView trigger + future GSAP context scope
  const sectionRef = useRef<HTMLElement>(null);
  const isInView   = useInView(sectionRef, { once: true, margin: "-120px" });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Per-element refs — GSAP scroll animation targets
  const eyebrowRef   = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLParagraphElement>(null);
  const ghostNumRef  = useRef<HTMLDivElement>(null);
  const rowRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ] as const;
  const separatorRefs = [
    useRef<HTMLDivElement>(null), // before row 0
    useRef<HTMLDivElement>(null), // after  row 0
    useRef<HTMLDivElement>(null), // after  row 1
    useRef<HTMLDivElement>(null), // after  row 2
  ] as const;

  const activeGhost = activeIndex === null ? "02" : PRINCIPLES[activeIndex].index;
  const hasActiveRow = activeIndex !== null;
  const isSeparatorActive = (separatorIndex: number) =>
    activeIndex !== null &&
    (activeIndex === separatorIndex || activeIndex === separatorIndex - 1);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#060c1a] px-6 md:px-12 lg:px-20 py-[clamp(5rem,12vw,10rem)]"
    >

      {/* ── Ambient gradient ─────────────────────────────────────────────────
          Blue-right / faint-cyan-left: mirror-opposite of the Hero's
          left-heavy gradient — continuous lit environment, not two clones.
      ─────────────────────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: [
            "radial-gradient(ellipse 65% 55% at 82% 35%, rgba(29,78,216,0.22) 0%, transparent 58%)",
            "radial-gradient(ellipse 45% 45% at 15% 70%, rgba(6,182,212,0.07) 0%, transparent 55%)",
          ].join(", "),
        }}
      />

      {/* ── Ghost "02" ───────────────────────────────────────────────────────
          Anchored bottom-right, ~30% clipped. Emerges from the section floor.
          Slow fade-in reads as atmosphere, not content.
          ─
          GSAP (future — inside useEffect with gsap.context(sectionRef)):
            gsap.to(ghostNumRef.current, {
              y: -60,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.5,
              },
            });
      ─────────────────────────────────────────────────────────────────────── */}
      <motion.div
        ref={ghostNumRef}
        aria-hidden="true"
        data-philosophy="ghost-num"
        className="absolute bottom-[-0.18em] right-[-0.04em] z-0 leading-none select-none pointer-events-none"
        style={{
          fontFamily:    "'Syne', sans-serif",
          fontWeight:    800,
          fontSize:      "clamp(14rem, 28vw, 38rem)",
          letterSpacing: "-0.04em",
        }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1.8, delay: 0.6, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={activeGhost}
            className="block"
            initial={{ opacity: 0, y: 18, filter: "blur(10px)", scale: 0.965 }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              scale: 1,
              color: hasActiveRow
                ? "rgba(125, 211, 252, 0.085)"
                : "rgba(96, 165, 250, 0.052)",
            }}
            exit={{ opacity: 0, y: -18, filter: "blur(8px)", scale: 1.03 }}
            transition={{ duration: 0.6, ease: EXPO }}
          >
            {activeGhost}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-[1600px] [--ph-gap:2.5rem] [--ph-index-col:4.5rem] xl:[--ph-gap:3rem] xl:[--ph-index-col:5rem]">

        {/* Eyebrow */}
        <motion.div
          ref={eyebrowRef}
          data-philosophy="eyebrow"
          className="mb-10 flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: EXPO }}
        >
          <div className="w-6 h-px bg-blue-400/60" />
          <span
            className="text-blue-300/65 text-[10px] tracking-[0.42em] uppercase"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Philosophy — 02
          </span>
        </motion.div>

        {/* ── Manifesto line ────────────────────────────────────────────────────
            Premise, not title. Quiet: DM Mono, small, low-opacity.
            mb-16 vs eyebrow mb-10: visible hierarchy of breathing room.
        ─────────────────────────────────────────────────────────────────────── */}
        <motion.p
          ref={manifestoRef}
          data-philosophy="manifesto"
          className="mb-16 max-w-2xl leading-relaxed lg:ml-[calc(var(--ph-index-col)+var(--ph-gap))] lg:max-w-[38rem] xl:max-w-[42rem]"
          style={{
            fontFamily:    "'DM Mono', monospace",
            fontSize:      "clamp(0.80rem, 1.2vw, 0.92rem)",
            color:         "rgba(255,255,255,0.38)",
            letterSpacing: "0.01em",
          }}
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.18, ease: EXPO }}
        >
          {MANIFESTO}
        </motion.p>

        {/* Top separator */}
        <motion.div
          ref={separatorRefs[0]}
          aria-hidden="true"
          data-philosophy="sep-0"
          className="h-px origin-left"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.1, delay: 0.22, ease: EXPO }}
          style={{
            background: isSeparatorActive(0)
              ? "linear-gradient(90deg, rgba(186,230,253,0.42) 0%, rgba(96,165,250,0.18) 40%, transparent 100%)"
              : "linear-gradient(90deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
            boxShadow: isSeparatorActive(0)
              ? "0 0 26px rgba(125,211,252,0.14)"
              : "none",
            opacity: isSeparatorActive(0) ? 1 : 0.9,
            transition:
              "background 0.55s cubic-bezier(0.16,1,0.3,1), box-shadow 0.55s cubic-bezier(0.16,1,0.3,1), opacity 0.55s cubic-bezier(0.16,1,0.3,1)",
          }}
        />

        {/* ── Principle rows ────────────────────────────────────────────────── */}
        {PRINCIPLES.map((p, i) => (
          <div key={p.name}>
            <PrincipleRow
              rowIndex={i}
              index={p.index}
              name={p.name}
              descriptor={p.descriptor}
              rowRef={rowRefs[i]}
              isInView={isInView}
              isActive={activeIndex === i}
              isDimmed={activeIndex !== null && activeIndex !== i}
              hasActiveRow={hasActiveRow}
              onActivate={setActiveIndex}
              onDeactivate={() => setActiveIndex(null)}
              delay={ROW_DELAYS[i]}
              data-philosophy={`row-${i}`}
            />

            <motion.div
              ref={separatorRefs[i + 1]}
              aria-hidden="true"
              data-philosophy={`sep-${i + 1}`}
              className="h-px origin-left"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{
                duration: 1.1,
                delay:    SEPARATOR_DELAYS[i],
                ease:     EXPO,
              }}
              style={{
                background: isSeparatorActive(i + 1)
                  ? "linear-gradient(90deg, rgba(186,230,253,0.36) 0%, rgba(96,165,250,0.14) 42%, transparent 100%)"
                  : "linear-gradient(90deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 46%, transparent 100%)",
                boxShadow: isSeparatorActive(i + 1)
                  ? "0 0 22px rgba(125,211,252,0.12)"
                  : "none",
                opacity: isSeparatorActive(i + 1) ? 1 : 0.82,
                transition:
                  "background 0.55s cubic-bezier(0.16,1,0.3,1), box-shadow 0.55s cubic-bezier(0.16,1,0.3,1), opacity 0.55s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
          </div>
        ))}

      </div>
    </section>
  );
}
