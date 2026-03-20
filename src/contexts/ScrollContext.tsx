"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SectionId =
  | "hero"
  | "philosophy"
  | "skills"
  | "projects"
  | "process"
  | "contact";

export interface ScrollState {
  globalProgress: number;          // 0–1, document-wide scroll progress
  currentSection: SectionId;
  previousSection: SectionId | null;
  sectionProgress: number;         // 0–1, position within current section
  transitionState: "entering" | "active" | "leaving";
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const SECTION_IDS: SectionId[] = [
  "hero",
  "philosophy",
  "skills",
  "projects",
  "process",
  "contact",
];

export const SECTION_ACCENTS: Record<SectionId, string> = {
  hero:       "59, 130, 246",
  philosophy: "147, 197, 253",
  skills:     "99, 102, 241",
  projects:   "34, 197, 94",
  process:    "14, 165, 233",
  contact:    "147, 197, 253",
};

const DEFAULT_STATE: ScrollState = {
  globalProgress: 0,
  currentSection: "hero",
  previousSection: null,
  sectionProgress: 0,
  transitionState: "entering",
};

// ── Store (module-level singleton) ────────────────────────────────────────────
// Using useSyncExternalStore pattern: a mutable ref holds state, listeners are
// notified only when rounded values change — avoiding per-frame re-render storms.

type Listener = () => void;

function createScrollStore() {
  let state: ScrollState = { ...DEFAULT_STATE };
  const listeners = new Set<Listener>();

  function getSnapshot(): ScrollState {
    return state;
  }

  function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function commit(next: Partial<ScrollState>) {
    const candidate: ScrollState = {
      ...state,
      ...next,
      // Round progress values to 3 decimal places to cap notification frequency
      globalProgress:
        next.globalProgress !== undefined
          ? Math.round(next.globalProgress * 1000) / 1000
          : state.globalProgress,
      sectionProgress:
        next.sectionProgress !== undefined
          ? Math.round(next.sectionProgress * 1000) / 1000
          : state.sectionProgress,
    };

    if (
      candidate.globalProgress !== state.globalProgress ||
      candidate.sectionProgress !== state.sectionProgress ||
      candidate.currentSection !== state.currentSection ||
      candidate.previousSection !== state.previousSection ||
      candidate.transitionState !== state.transitionState
    ) {
      state = candidate;
      listeners.forEach((l) => l());
    }
  }

  return { getSnapshot, subscribe, commit };
}

const store = createScrollStore();

// ── Context (used only to signal provider is mounted) ─────────────────────────

const ScrollContext = createContext(false);

// ── Provider ──────────────────────────────────────────────────────────────────

export function ScrollProvider({ children }: { children: ReactNode }) {
  const currentSectionRef = useRef<SectionId>("hero");
  const previousSectionRef = useRef<SectionId | null>(null);

  useEffect(() => {
    // ── Scroll progress ──────────────────────────────────────────────────────
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const globalProgress = docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0;

      // Section progress: viewport center relative to current section
      const currentEl = document.getElementById(currentSectionRef.current);
      let sectionProgress = 0;
      if (currentEl) {
        const rect = currentEl.getBoundingClientRect();
        const viewCenter = window.innerHeight / 2;
        sectionProgress = Math.max(
          0,
          Math.min(1, (viewCenter - rect.top) / Math.max(1, rect.height)),
        );
      }

      const transitionState: ScrollState["transitionState"] =
        sectionProgress < 0.15
          ? "entering"
          : sectionProgress > 0.85
            ? "leaving"
            : "active";

      store.commit({
        globalProgress,
        currentSection: currentSectionRef.current,
        previousSection: previousSectionRef.current,
        sectionProgress,
        transitionState,
      });
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    // ── Section detection via IntersectionObserver ───────────────────────────
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      Boolean,
    ) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const id = visible[0].target.id as SectionId;
          if (id !== currentSectionRef.current) {
            previousSectionRef.current = currentSectionRef.current;
            currentSectionRef.current = id;
            updateProgress();
          }
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));

    return () => {
      window.removeEventListener("scroll", updateProgress);
      observer.disconnect();
    };
  }, []);

  return (
    <ScrollContext.Provider value={true}>{children}</ScrollContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useScrollState(): ScrollState {
  // Accessing context just to encourage correct provider usage in dev
  useContext(ScrollContext);
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => DEFAULT_STATE,
  );
}
