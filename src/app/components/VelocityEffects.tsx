"use client";

import { useRef, useEffect, useState } from "react";
import { subscribeVelocity, getVelocitySnapshot } from "../../systems/ScrollVelocity";

// ── VelocityEffects ───────────────────────────────────────────────────────────
// Fixed overlay that applies velocity-reactive visual effects:
//   A. Motion blur (backdrop-filter) on fast scroll — desktop + no-reduced-motion only
//
// Performance: uses direct DOM manipulation via store subscription, avoiding
// React re-renders on every scroll frame.

export function VelocityEffects() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [shouldApply, setShouldApply] = useState(false);

  // Gate behind media query checks — runs once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const prefersNormal = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    setShouldApply(isDesktop && prefersNormal);
  }, []);

  // Subscribe directly to velocity store — no React state, no re-renders
  useEffect(() => {
    if (!shouldApply) return;

    const overlay = overlayRef.current;
    if (!overlay) return;

    let lastIntensity = -1;

    const unsubscribe = subscribeVelocity(() => {
      const { intensity } = getVelocitySnapshot();
      // Only update DOM when intensity changes meaningfully
      if (Math.abs(intensity - lastIntensity) < 0.01) return;
      lastIntensity = intensity;

      if (intensity > 0.3) {
        const blurPx = ((intensity - 0.3) * 2.8).toFixed(2);
        overlay.style.backdropFilter = `blur(${blurPx}px)`;
      } else {
        overlay.style.backdropFilter = "";
      }
    });

    return unsubscribe;
  }, [shouldApply]);

  if (!shouldApply) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 pointer-events-none z-[3]"
      style={{ transition: "backdrop-filter 0.15s ease-out" }}
    />
  );
}
