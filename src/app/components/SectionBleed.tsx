import { useRef } from "react";
import { gsap, useGSAP } from "../utils/gsap";

// ── Section bleed-through ──────────────────────────────────────────────────────
// Gradient overlays that span across section boundaries, creating the illusion
// that each section's atmosphere bleeds into the next. Positioned at App level
// (outside section overflow:hidden) so the gradients are never clipped.
//
// Each bleed targets the gap between two sections by anchoring to the "from"
// section's bottom edge and extending ~260px downward (overlapping the transition
// zone and the top of the "to" section).
//
// GSAP ScrollTrigger drives opacity: the bleed fades in as the user approaches
// the section boundary and fades out once the new section is established.

type SectionId = "hero" | "philosophy" | "skills" | "projects" | "process" | "contact";

interface SectionBleedProps {
  from: SectionId;
  to: SectionId;
}

const SECTION_COLORS: Record<SectionId, { primary: string; secondary: string }> = {
  hero:       { primary: "29,78,216",  secondary: "14,165,233" },
  philosophy: { primary: "29,78,216",  secondary: "6,182,212" },
  skills:     { primary: "99,102,241", secondary: "59,130,246" },
  projects:   { primary: "34,197,94",  secondary: "22,163,74" },
  process:    { primary: "14,165,233", secondary: "37,99,235" },
  contact:    { primary: "29,78,216",  secondary: "6,182,212" },
};

export function SectionBleed({ from, to }: SectionBleedProps) {
  const bleedRef = useRef<HTMLDivElement>(null);

  const colorsFrom = SECTION_COLORS[from];
  const colorsTo = SECTION_COLORS[to];

  useGSAP(
    () => {
      const el = bleedRef.current;
      if (!el) return;

      // Trigger from the bleed element itself — this is pin-agnostic.
      // The bleed sits in the document flow between sections, so its own
      // position is the most reliable trigger regardless of pin spacers.
      gsap.fromTo(
        el,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "center center",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        },
      );

      gsap.to(el, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "center center",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    },
    [],
    bleedRef,
  );

  return (
    <div
      ref={bleedRef}
      aria-hidden="true"
      className="pointer-events-none relative z-[1] h-[320px]"
      style={{
        // Positioned to overlap the transition zone: starts inside the "from" section's
        // bottom area and extends into the "to" section's top. The exact placement is
        // handled by the parent's layout flow — we use negative margin to pull it up
        // from the natural document position.
        marginTop: "-160px",
        marginBottom: "-160px",
        opacity: 0,
        background: [
          // Outgoing section glow — fading downward
          `radial-gradient(ellipse 80% 50% at 50% 20%, rgba(${colorsFrom.primary}, 0.12) 0%, transparent 70%)`,
          // Incoming section glow — growing from below
          `radial-gradient(ellipse 70% 50% at 50% 80%, rgba(${colorsTo.primary}, 0.10) 0%, transparent 70%)`,
          // Subtle crossfade mix in the center
          `radial-gradient(ellipse 50% 30% at 50% 50%, rgba(${colorsTo.secondary}, 0.06) 0%, transparent 60%)`,
        ].join(", "),
      }}
    />
  );
}
