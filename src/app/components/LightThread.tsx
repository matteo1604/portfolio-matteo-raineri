"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "../utils/gsap";
import { useScrollState, SECTION_ACCENTS, SECTION_IDS } from "../../contexts/ScrollContext";

// ── Light Thread ─────────────────────────────────────────────────────────────
// A persistent, ultra-subtle horizontal accent line fixed at ~48% vertical
// position. It's the visual thread that stitches the entire scroll journey.
//
// Behavior:
// - Normally near-invisible (opacity ~0.06)
// - Intensifies at section boundaries (opacity ~0.28, width expands)
// - Color morphs to match the current section's accent (via ScrollContext)
// - Line width pulses subtly — wider during transitions, narrower within sections

export function LightThread() {
  const threadRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const { currentSection } = useScrollState();
  const accent = SECTION_ACCENTS[currentSection];

  // ── GSAP: single scroll-driven opacity pulse ────────────────────────────
  // One document-wide scrub. Brightens near section boundaries, dims within.
  // Section boundaries are cached (not queried per-frame) to avoid forced reflow.
  useGSAP(
    () => {
      const thread = threadRef.current;
      const glow = glowRef.current;
      if (!thread || !glow) return;

      // Cache absolute Y positions of every section boundary (top + bottom).
      // Rebuild on ScrollTrigger refresh (which fires after pin spacers change).
      let boundaries: number[] = [];

      const cacheBoundaries = () => {
        boundaries = [];
        SECTION_IDS.forEach((id) => {
          const el = document.getElementById(id);
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const scrollTop = window.scrollY;
          boundaries.push(rect.top + scrollTop);
          boundaries.push(rect.bottom + scrollTop);
        });
      };

      cacheBoundaries();
      ScrollTrigger.addEventListener("refresh", cacheBoundaries);

      ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        onUpdate: () => {
          // Viewport center in absolute document coordinates
          const viewCenterY = window.scrollY + window.innerHeight / 2;

          // Find closest boundary distance, normalized to viewport height
          let minBoundaryDist = 1;
          for (let i = 0; i < boundaries.length; i++) {
            const dist = Math.abs(viewCenterY - boundaries[i]) / window.innerHeight;
            if (dist < minBoundaryDist) minBoundaryDist = dist;
          }

          const intensity = Math.max(0, 1 - minBoundaryDist / 0.3);
          const smoothIntensity = intensity * intensity;

          gsap.set(thread, { opacity: 0.04 + smoothIntensity * 0.22 });
          gsap.set(glow, {
            opacity: smoothIntensity * 0.6,
            scaleX: 0.3 + smoothIntensity * 0.7,
          });
        },
      });

      return () => {
        ScrollTrigger.removeEventListener("refresh", cacheBoundaries);
      };
    },
    [],
    threadRef,
  );

  return (
    <div
      ref={threadRef}
      className="fixed left-0 right-0 z-[2] pointer-events-none h-px"
      style={{
        top: "48%",
        opacity: 0.04,
        background: `linear-gradient(90deg,
          transparent 0%,
          rgba(${accent}, 0.30) 20%,
          rgba(${accent}, 0.50) 50%,
          rgba(${accent}, 0.30) 80%,
          transparent 100%)`,
        transition: "background 1.2s ease",
      }}
    >
      {/* Center glow — intensifies at boundaries */}
      <div
        ref={glowRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[3px] rounded-full"
        style={{
          background: `radial-gradient(ellipse at center,
            rgba(${accent}, 0.40) 0%,
            rgba(${accent}, 0.12) 40%,
            transparent 70%)`,
          filter: "blur(1px)",
          opacity: 0,
          transition: "background 1.2s ease",
        }}
      />
    </div>
  );
}
