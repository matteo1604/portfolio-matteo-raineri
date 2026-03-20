"use client";

import { useRef, useEffect, useState } from "react";
import { gsap, ScrollTrigger } from "../utils/gsap";
import { useScrollState, SECTION_ACCENTS, type SectionId } from "../../contexts/ScrollContext";

// ── Magnetic Cursor System ────────────────────────────────────────────────────
// Dual element (dot + ring) with:
//   - 6-element ghost trail (GSAP-delayed following)
//   - Magnetic field pulling [data-magnetic] elements toward cursor
//   - Section-aware ring color morphing via ScrollContext
//   - Click ripple expansion
//   - Auto-hide when entering [data-cursor-interactive] zones
//
// Gated behind (min-width: 1024px) and (pointer: fine).

const TRAIL_LENGTH = 6;

const CURSOR_COLORS: Record<SectionId, string> = {
  hero:       "rgba(59,130,246,0.30)",
  philosophy: "rgba(147,197,253,0.22)",
  skills:     "rgba(99,102,241,0.28)",
  projects:   "rgba(34,197,94,0.22)",
  process:    "rgba(14,165,233,0.25)",
  contact:    "rgba(147,197,253,0.20)",
};

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const inInteractiveZoneRef = useRef(false);

  const [active, setActive] = useState(false);

  const { currentSection } = useScrollState();
  const prevSectionRef = useRef<SectionId>(currentSection);

  // Section-aware ring color
  useEffect(() => {
    if (currentSection !== prevSectionRef.current && ringRef.current) {
      prevSectionRef.current = currentSection;
      gsap.to(ringRef.current, {
        borderColor: CURSOR_COLORS[currentSection],
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, [currentSection]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Gate: desktop + fine pointer only
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const isFine = window.matchMedia("(pointer: fine)").matches;
    if (!isDesktop || !isFine) return;

    setActive(true);

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Set initial ring color
    gsap.set(ring, { borderColor: CURSOR_COLORS[currentSection] });

    // ── Magnetic element cache ─────────────────────────────────────────────
    let magneticEls: Element[] = [];

    const cacheMagnetics = () => {
      magneticEls = Array.from(document.querySelectorAll("[data-magnetic]")).filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
    };

    cacheMagnetics();

    // Refresh cache on layout changes (e.g. ScrollTrigger pins)
    const refreshInterval = setInterval(cacheMagnetics, 2000);
    ScrollTrigger.addEventListener("refresh", cacheMagnetics);

    // ── CTA proximity helper ────────────────────────────────────────────────
    const CTA_DETECT_RADIUS = 140;

    function findClosestCTA(mx: number, my: number): { dist: number; maxDist: number } | null {
      let closest: { dist: number; maxDist: number } | null = null;
      magneticEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
        if (dist < CTA_DETECT_RADIUS && (!closest || dist < closest.dist)) {
          closest = { dist, maxDist: CTA_DETECT_RADIUS };
        }
      });
      return closest;
    }

    // ── Mouse tracking ─────────────────────────────────────────────────────
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;

      // ── Detect interactive zone ───────────────────────────────────────
      const interactiveZone = (e.target as HTMLElement).closest("[data-cursor-interactive]");
      inInteractiveZoneRef.current = !!interactiveZone;

      if (interactiveZone) {
        // Fade out custom cursor
        gsap.to(dot, { opacity: 0, duration: 0.18, overwrite: "auto" });
        gsap.to(ring, { opacity: 0, duration: 0.18, overwrite: "auto" });
        trailRefs.current.forEach((el) => {
          if (el) gsap.to(el, { opacity: 0, duration: 0.12, overwrite: "auto" });
        });

        // Still update positions silently (so cursor is correct when leaving zone)
        gsap.set(dot, { x: x - 4, y: y - 4 });
        gsap.set(ring, { x: x - 20, y: y - 20 });

        // Skip magnetic pull and CTA proximity inside interactive zones
        return;
      }

      // ── Restore custom cursor visibility ──────────────────────────────
      gsap.to(dot, { opacity: 1, duration: 0.12, overwrite: "auto" });
      gsap.to(ring, { opacity: 1, duration: 0.12, overwrite: "auto" });
      trailRefs.current.forEach((el, i) => {
        if (el) gsap.to(el, { opacity: 0.28 - i * 0.042, duration: 0.12, overwrite: "auto" });
      });

      // Dot — tight follow
      gsap.to(dot, {
        x: x - 4,
        y: y - 4,
        duration: 0.08,
        ease: "none",
        overwrite: "auto",
      });

      // Ring — soft follow
      gsap.to(ring, {
        x: x - 20,
        y: y - 20,
        duration: 0.18,
        ease: "power2.out",
        overwrite: "auto",
      });

      // Trail — each dot arrives slightly later
      trailRefs.current.forEach((el, i) => {
        if (!el) return;
        const size = 4 - i * 0.5;
        gsap.to(el, {
          x: x - size / 2,
          y: y - size / 2,
          duration: 0.15 + i * 0.06,
          ease: "power2.out",
          overwrite: "auto",
        });
      });

      // ── Magnetic pull ────────────────────────────────────────────────────
      magneticEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        if (Math.abs(y - centerY) > 250) {
          gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "power2.out", overwrite: "auto" });
          return;
        }
        const centerX = rect.left + rect.width / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const magnetRadius = 120;

        if (dist < magnetRadius) {
          const pull = (1 - dist / magnetRadius) * 0.35;
          gsap.to(el, {
            x: dx * pull,
            y: dy * pull,
            duration: 0.4,
            ease: "power3.out",
            overwrite: "auto",
          });
        } else {
          gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.7,
            ease: "elastic.out(1, 0.4)",
            overwrite: "auto",
          });
        }
      });

      // ── CTA proximity feedback ──────────────────────────────────────────
      const closestCTA = findClosestCTA(x, y);

      if (closestCTA) {
        const proximity = 1 - closestCTA.dist / closestCTA.maxDist;

        // Dot grows from 8px to ~19px as you approach
        const dotScale = 1 + proximity * 1.4;
        gsap.to(dot, {
          width: 8 * dotScale,
          height: 8 * dotScale,
          x: x - (4 * dotScale),
          y: y - (4 * dotScale),
          duration: 0.15,
          ease: "power2.out",
          overwrite: "auto",
        });

        // Dot gets a glow at close range
        dot.style.boxShadow = proximity > 0.6
          ? `0 0 ${12 * proximity}px rgba(147,197,253,${(0.3 * proximity).toFixed(2)})`
          : "none";

        // Ring grows gradually (not snap)
        gsap.to(ring, {
          scale: 1 + proximity * 0.8,
          duration: 0.2,
          ease: "power2.out",
          overwrite: "auto",
        });
      } else {
        // Reset to default
        gsap.to(dot, {
          width: 8,
          height: 8,
          x: x - 4,
          y: y - 4,
          duration: 0.2,
          ease: "power2.out",
          overwrite: "auto",
        });
        dot.style.boxShadow = "none";

        gsap.to(ring, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    // ── Click ripple ──────────────────────────────────────────────────────
    const handleMouseDown = () => {
      if (!ring || inInteractiveZoneRef.current) return;
      gsap.fromTo(
        ring,
        { scale: 1, opacity: 1 },
        {
          scale: 2.5,
          opacity: 0,
          duration: 0.38,
          ease: "expo.out",
          overwrite: "auto",
          onComplete: () => {
            gsap.fromTo(ring, { scale: 0 }, {
              scale: 1,
              duration: 0.35,
              ease: "back.out(2)",
            });
          },
        },
      );
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      ScrollTrigger.removeEventListener("refresh", cacheMagnetics);
      clearInterval(refreshInterval);

      // Reset all magnetic elements on unmount
      magneticEls.forEach((el) => {
        gsap.to(el, { x: 0, y: 0, duration: 0.3 });
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!active) return null;

  return (
    <>
      {/* Ghost trail — 6 dots with increasing delay */}
      {Array.from({ length: TRAIL_LENGTH }, (_, i) => {
        const size = 4 - i * 0.5;
        return (
          <div
            key={i}
            ref={(el) => {
              trailRefs.current[i] = el;
            }}
            aria-hidden="true"
            className="fixed pointer-events-none rounded-full mix-blend-screen z-[9997]"
            style={{
              width: size,
              height: size,
              background: `rgba(147, 197, 253, ${0.28 - i * 0.042})`,
              top: 0,
              left: 0,
              transform: "translate(-500px, -500px)",
            }}
          />
        );
      })}

      {/* Dot — tight follow */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed pointer-events-none z-[9999] rounded-full bg-white/90 mix-blend-screen"
        style={{
          width: 8,
          height: 8,
          top: 0,
          left: 0,
          transform: "translate(-500px, -500px)",
        }}
      />

      {/* Ring — section-colored border, soft follow */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed pointer-events-none z-[9998] rounded-full"
        style={{
          width: 40,
          height: 40,
          border: `1px solid ${CURSOR_COLORS.hero}`,
          background: "rgba(59,130,246,0.03)",
          top: 0,
          left: 0,
          transform: "translate(-500px, -500px)",
        }}
      />
    </>
  );
}
