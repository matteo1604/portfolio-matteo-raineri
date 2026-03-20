"use client";

import { useRef, useEffect, useState } from "react";
import { subscribeVelocity, getVelocitySnapshot } from "../../systems/ScrollVelocity";

// ── VelocityEffects ───────────────────────────────────────────────────────────
// Fixed overlay: subtle opacity veil during fast scroll.
// Replaces backdrop-filter (GPU-intensive) with opacity on a solid gradient
// (~0.1ms/frame vs ~8ms/frame).

export function VelocityEffects() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [shouldApply, setShouldApply] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const prefersNormal = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    setShouldApply(isDesktop && prefersNormal);
  }, []);

  useEffect(() => {
    if (!shouldApply) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    let lastIntensity = -1;

    const unsubscribe = subscribeVelocity(() => {
      const { intensity } = getVelocitySnapshot();
      if (Math.abs(intensity - lastIntensity) < 0.02) return;
      lastIntensity = intensity;

      if (intensity > 0.5) {
        const opacity = ((intensity - 0.5) * 0.06).toFixed(3);
        overlay.style.opacity = opacity;
      } else {
        overlay.style.opacity = "0";
      }
    });

    return unsubscribe;
  }, [shouldApply]);

  if (!shouldApply) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 pointer-events-none z-[3]"
      style={{
        background: "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%)",
        opacity: 0,
        transition: "opacity 0.2s ease-out",
        willChange: "opacity",
      }}
    />
  );
}
