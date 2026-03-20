"use client";

import { useSyncExternalStore, useEffect, type ReactNode } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface VelocityState {
  velocity: number;      // px/frame, smoothed (0 = still, ~2-8 = normal, 15+ = fast)
  direction: 1 | -1 | 0; // 1 = down, -1 = up, 0 = still
  intensity: number;     // 0→1 normalized (0 = still, 1 = max speed)
  isResting: boolean;    // true when velocity < 0.5 for 300ms+
}

const DEFAULT_STATE: VelocityState = {
  velocity: 0,
  direction: 0,
  intensity: 0,
  isResting: true,
};

// ── Module-level singleton store ──────────────────────────────────────────────
// Single RAF loop for the entire app. No per-component overhead.

type Listener = () => void;
let state: VelocityState = { ...DEFAULT_STATE };
const listeners = new Set<Listener>();

function getSnapshot(): VelocityState {
  return state;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commit(next: VelocityState) {
  const candidate: VelocityState = {
    ...next,
    velocity: Math.round(next.velocity * 100) / 100,
    intensity: Math.round(next.intensity * 100) / 100,
  };
  if (
    candidate.velocity !== state.velocity ||
    candidate.intensity !== state.intensity ||
    candidate.direction !== state.direction ||
    candidate.isResting !== state.isResting
  ) {
    state = candidate;
    listeners.forEach((l) => l());
  }
}

// ── RAF engine ────────────────────────────────────────────────────────────────

let rafId: number | null = null;
let prevScrollY = typeof window !== "undefined" ? window.scrollY : 0;
let smoothedVelocity = 0;
let restTimer: ReturnType<typeof setTimeout> | null = null;

function tick() {
  const currentScrollY = window.scrollY;
  const rawDelta = currentScrollY - prevScrollY;
  const raw = Math.abs(rawDelta);
  prevScrollY = currentScrollY;

  smoothedVelocity = smoothedVelocity * 0.85 + raw * 0.15;

  const intensity = Math.min(1, smoothedVelocity / 20);
  const direction: 1 | -1 | 0 = raw < 0.1 ? 0 : rawDelta > 0 ? 1 : -1;

  // Set CSS variables directly — no React overhead, any CSS can consume these
  document.documentElement.style.setProperty("--scroll-intensity", intensity.toFixed(3));
  document.documentElement.style.setProperty(
    "--scroll-velocity-y",
    `${(direction * intensity * 1.5).toFixed(2)}px`,
  );

  // Manage rest timer
  if (raw > 0.5) {
    if (restTimer !== null) {
      clearTimeout(restTimer);
      restTimer = null;
    }
  } else if (restTimer === null && !state.isResting) {
    restTimer = setTimeout(() => {
      commit({ ...state, isResting: true });
      restTimer = null;
    }, 300);
  }

  const isResting = raw < 0.5 && restTimer === null;
  commit({ velocity: smoothedVelocity, direction, intensity, isResting });

  rafId = requestAnimationFrame(tick);
}

function startRAF() {
  if (rafId !== null) return;
  prevScrollY = window.scrollY;
  rafId = requestAnimationFrame(tick);
}

function stopRAF() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────
// Reference-counted: multiple providers won't create multiple RAFs.

let providerCount = 0;

export function ScrollVelocityProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    providerCount++;
    if (providerCount === 1) startRAF();
    return () => {
      providerCount--;
      if (providerCount === 0) stopRAF();
    };
  }, []);

  return <>{children}</>;
}

// ── React hook ────────────────────────────────────────────────────────────────

export function useScrollVelocity(): VelocityState {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_STATE);
}

// ── Direct subscription (for non-React DOM updates) ───────────────────────────

export { subscribe as subscribeVelocity, getSnapshot as getVelocitySnapshot };
