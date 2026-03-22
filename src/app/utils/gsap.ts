import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

// ── Register GSAP plugins ──────────────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// ── Shared easing constants ────────────────────────────────────────────────────
// CSS cubic-bezier format (for motion/react and CSS transitions)
export const EXPO_CSS: [number, number, number, number] = [0.16, 1, 0.3, 1];

// GSAP CustomEase string equivalent of EXPO
export const EXPO_GSAP = "power4.out";

// Exit easing — slower start, content "letting go"
export const EXIT_GSAP = "power2.inOut";

// ── useGSAP hook ───────────────────────────────────────────────────────────────
// Provides automatic cleanup via gsap.context() scoped to a ref.
// Pass a callback that receives the GSAP context scope — all gsap.to/from/timeline
// calls inside are auto-cleaned on unmount.
export function useGSAP(
  callback: (ctx: gsap.Context) => void,
  deps: React.DependencyList = [],
  scopeRef?: React.RefObject<HTMLElement | null>,
) {
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const ctx = gsap.context((self) => {
      callback(self);
    }, scopeRef?.current ?? undefined);

    ctxRef.current = ctx;

    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ctxRef;
}

// ── ScrollTrigger refresh helper ───────────────────────────────────────────────
// Debounced: multiple rapid calls collapse into a single refresh after 200ms.
// Prevents layout recalculation storms when multiple sections fire refresh
// simultaneously (e.g. onLeave/onEnterBack callbacks during fast scroll).
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

export function refreshScrollTriggers() {
  if (refreshTimer !== null) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    ScrollTrigger.refresh();
  }, 200);
}

// Force immediate refresh — use sparingly (e.g. initial boot sort + refresh)
export function refreshScrollTriggersNow() {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  ScrollTrigger.refresh();
}

export { gsap, ScrollTrigger };
