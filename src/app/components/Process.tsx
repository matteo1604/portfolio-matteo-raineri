"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

type ExecutionMetric = {
  label: string;
  value: string;
  detail: string;
};

type ExecutionIndicator = {
  label: string;
  value: string;
};

type ExecutionAccent = {
  line: string;
  glow: string;
  surface: string;
  text: string;
  muted: string;
};

type ExecutionPhase = {
  id: "signal" | "structure" | "build" | "release";
  index: string;
  title: "Signal" | "Structure" | "Build" | "Release";
  summary: string;
  description: string;
  outputs: string[];
  tags: string[];
  metrics: ExecutionMetric[];
  telemetry: ExecutionIndicator[];
  diagnostics: ExecutionMetric[];
  console: string[];
  checks: string[];
  stateLabel: string;
  note: string;
  accent: ExecutionAccent;
};

type ExecutionPhaseScrollSegment = {
  id: ExecutionPhase["id"];
  index: number;
  start: number;
  end: number;
  midpoint: number;
};

interface ExecutionNodeProps {
  phase: ExecutionPhase;
  isActive: boolean;
  isPreviewed: boolean;
  canHover: boolean;
  onSelect: (phaseId: ExecutionPhase["id"]) => void;
  onHoverStart: (phaseId: ExecutionPhase["id"]) => void;
  onHoverEnd: () => void;
}

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const DISPLAY_FONT = "'Syne', sans-serif";
const MONO_FONT = "'DM Mono', monospace";
const RAIL_NODE_POSITIONS = ["16.666%", "50%", "83.333%"] as const;

const EXECUTION_PHASES: ExecutionPhase[] = [
  {
    id: "signal",
    index: "01",
    title: "Signal",
    summary: "Goal alignment, product direction, intent clarification.",
    description:
      "Execution opens by isolating the right signal: product direction, interface intent, and the attention path that needs to be established before structure or code enters the system. This phase locks what the UI must communicate and what it cannot afford to dilute.",
    outputs: [
      "Intent framing and product direction lock",
      "Primary user path with interface priority map",
      "Constraint envelope, risk map, and performance targets",
    ],
    tags: ["alignment", "direction", "intent", "scope"],
    metrics: [
      { label: "input lanes", value: "03", detail: "core product signals aligned" },
      { label: "priority map", value: "locked", detail: "primary path isolated early" },
      { label: "execution state", value: "stable", detail: "handoff ready for topology" },
    ],
    telemetry: [
      { label: "signal integrity", value: "99.2%" },
      { label: "structure stability", value: "queued" },
      { label: "runtime readiness", value: "primed" },
    ],
    diagnostics: [
      { label: "active nodes", value: "12", detail: "signal routes validated" },
      { label: "dependency depth", value: "02", detail: "pre-structure chain depth" },
      { label: "execution latency", value: "06ms", detail: "intent handoff response" },
    ],
    console: [
      "signal locked",
      "priority path isolated",
      "handoff staged",
      "structure pending",
    ],
    checks: [
      "Goal envelope defined and approved",
      "Primary conversion path ranked",
      "Risk boundaries mapped before structure",
    ],
    stateLabel: "intent aligned",
    note: "Signal is treated as a control layer, not discovery theater. The objective is to reduce ambiguity before layout or component logic begins.",
    accent: {
      line: "rgba(103,232,249,0.92)",
      glow: "rgba(8,145,178,0.18)",
      surface: "rgba(6,182,212,0.08)",
      text: "rgba(165,243,252,0.94)",
      muted: "rgba(186,230,253,0.42)",
    },
  },
  {
    id: "structure",
    index: "02",
    title: "Structure",
    summary: "Interface topology, hierarchy, layout system, blueprint logic.",
    description:
      "Once the signal is stable, the execution flow converts intent into readable interface topology. Hierarchy, module boundaries, layout rhythm, and blueprint logic are defined so the system can scale cleanly across viewports, states, and component surfaces.",
    outputs: [
      "Information architecture and hierarchy mapping",
      "Layout system, surface rhythm, and module boundaries",
      "Blueprint-ready interface topology for implementation",
    ],
    tags: ["hierarchy", "topology", "layout", "blueprint"],
    metrics: [
      { label: "system rows", value: "08", detail: "layout cadence structured" },
      { label: "viewport logic", value: "responsive", detail: "topology holds across states" },
      { label: "surface map", value: "wired", detail: "panels and rails resolved" },
    ],
    telemetry: [
      { label: "signal integrity", value: "stable" },
      { label: "structure stability", value: "97.8%" },
      { label: "runtime readiness", value: "staged" },
    ],
    diagnostics: [
      { label: "active nodes", value: "18", detail: "layout anchors synchronized" },
      { label: "dependency depth", value: "04", detail: "surface chain expanded" },
      { label: "execution latency", value: "08ms", detail: "topology propagation time" },
    ],
    console: [
      "signal locked",
      "topology mapped",
      "hierarchy stabilized",
      "build pending",
    ],
    checks: [
      "Primary and secondary surfaces separated",
      "Navigation hierarchy tuned for scan speed",
      "Blueprint logic prepared for build handoff",
    ],
    stateLabel: "topology mapped",
    note: "Structure exists to create a reliable execution grid. The goal is not decoration, but a system that supports clarity under real product constraints.",
    accent: {
      line: "rgba(147,197,253,0.92)",
      glow: "rgba(37,99,235,0.18)",
      surface: "rgba(59,130,246,0.08)",
      text: "rgba(219,234,254,0.94)",
      muted: "rgba(191,219,254,0.42)",
    },
  },
  {
    id: "build",
    index: "03",
    title: "Build",
    summary:
      "Frontend systems, interaction logic, component assembly, motion-ready implementation.",
    description:
      "Build is where the topology becomes a controlled frontend system. Components, states, interaction logic, and motion-ready implementation details are assembled so the interface behaves deliberately under load, across transitions, and through product complexity.",
    outputs: [
      "Component system assembly with state wiring",
      "Interaction logic, feedback layers, and response timing",
      "Motion-ready implementation aligned to system behavior",
    ],
    tags: ["components", "interaction", "logic", "motion-ready"],
    metrics: [
      { label: "assembly", value: "modular", detail: "reusable interfaces online" },
      { label: "response layers", value: "04", detail: "interaction tiers calibrated" },
      { label: "build state", value: "active", detail: "system logic assembled" },
    ],
    telemetry: [
      { label: "signal integrity", value: "stable" },
      { label: "structure stability", value: "locked" },
      { label: "runtime readiness", value: "98.4%" },
    ],
    diagnostics: [
      { label: "active nodes", value: "26", detail: "component graph online" },
      { label: "dependency depth", value: "06", detail: "runtime chain resolved" },
      { label: "execution latency", value: "11ms", detail: "interaction response window" },
    ],
    console: [
      "signal locked",
      "topology mapped",
      "components assembled",
      "runtime staged",
    ],
    checks: [
      "Component boundaries keep logic isolated",
      "Interaction states remain explicit and testable",
      "Animation hooks reserved without overbuilding",
    ],
    stateLabel: "system assembled",
    note: "Build is treated as orchestration, not output. The emphasis is on control, response quality, and the ability to extend motion and behavior later without restructuring the section.",
    accent: {
      line: "rgba(134,239,172,0.9)",
      glow: "rgba(22,163,74,0.18)",
      surface: "rgba(34,197,94,0.08)",
      text: "rgba(220,252,231,0.94)",
      muted: "rgba(187,247,208,0.4)",
    },
  },
  {
    id: "release",
    index: "04",
    title: "Release",
    summary:
      "Optimization, hardening, deployment readiness, production confidence.",
    description:
      "Release is where the execution flow is hardened for public conditions. Performance is tuned, edge states are stabilized, and the interface is prepared for deployment with the confidence that visual quality, response clarity, and system integrity hold up in production.",
    outputs: [
      "Payload review, optimization, and runtime tuning",
      "QA checks, edge-state hardening, and production safeguards",
      "Deployment readiness with stable release confidence",
    ],
    tags: ["performance", "hardening", "qa", "release"],
    metrics: [
      { label: "payload pass", value: "trimmed", detail: "unnecessary weight removed" },
      { label: "release checks", value: "green", detail: "critical validation complete" },
      { label: "state", value: "ready", detail: "production confidence established" },
    ],
    telemetry: [
      { label: "signal integrity", value: "stable" },
      { label: "structure stability", value: "sealed" },
      { label: "runtime readiness", value: "100%" },
    ],
    diagnostics: [
      { label: "active nodes", value: "31", detail: "production graph verified" },
      { label: "dependency depth", value: "07", detail: "runtime chain hardened" },
      { label: "execution latency", value: "09ms", detail: "release response window" },
    ],
    console: [
      "signal locked",
      "topology mapped",
      "components assembled",
      "system ready",
    ],
    checks: [
      "Performance budget reviewed against targets",
      "Failure states resolved before deployment",
      "Production handoff prepared with confidence",
    ],
    stateLabel: "production ready",
    note: "Release is not a final polish card. It is the production hardening layer that protects the system once real traffic, latency, and content variance enter the interface.",
    accent: {
      line: "rgba(226,232,240,0.82)",
      glow: "rgba(71,85,105,0.18)",
      surface: "rgba(71,85,105,0.08)",
      text: "rgba(226,232,240,0.92)",
      muted: "rgba(148,163,184,0.4)",
    },
  },
];

const EXECUTION_PHASE_SCROLL_MAP: ExecutionPhaseScrollSegment[] = EXECUTION_PHASES.map(
  (phase, index, phases) => {
    const segmentSize = 1 / phases.length;
    const start = index * segmentSize;
    const end = index === phases.length - 1 ? 1 : (index + 1) * segmentSize;

    return {
      id: phase.id,
      index,
      start,
      end,
      midpoint: start + (end - start) / 2,
    };
  },
);

function clampExecutionProgress(value: number) {
  return Math.min(1, Math.max(0, value));
}

function resolvePhaseSegmentFromProgress(progress: number) {
  const normalized = clampExecutionProgress(progress);

  return (
    EXECUTION_PHASE_SCROLL_MAP.find((segment, index) =>
      index === EXECUTION_PHASE_SCROLL_MAP.length - 1
        ? normalized >= segment.start && normalized <= segment.end
        : normalized >= segment.start && normalized < segment.end,
    ) ?? EXECUTION_PHASE_SCROLL_MAP[0]
  );
}

function getPhaseSegmentById(phaseId: ExecutionPhase["id"]) {
  return (
    EXECUTION_PHASE_SCROLL_MAP.find((segment) => segment.id === phaseId) ??
    EXECUTION_PHASE_SCROLL_MAP[0]
  );
}

function ExecutionNode({
  phase,
  isActive,
  isPreviewed,
  canHover,
  onSelect,
  onHoverStart,
  onHoverEnd,
}: ExecutionNodeProps) {
  const shouldPreview = canHover && isPreviewed && !isActive;
  const phaseSegment = getPhaseSegmentById(phase.id);

  return (
    <motion.button
      type="button"
      onClick={() => {
        onSelect(phase.id);
        onHoverEnd();
      }}
      onPointerEnter={canHover ? () => onHoverStart(phase.id) : undefined}
      onPointerLeave={canHover ? onHoverEnd : undefined}
      onPointerCancel={canHover ? onHoverEnd : undefined}
      onFocus={() => onHoverStart(phase.id)}
      onBlur={onHoverEnd}
      data-execution-node=""
      data-execution-active={isActive ? "" : undefined}
      data-phase-id={phase.id}
      data-phase-index={phaseSegment.index}
      data-phase-progress={`${phaseSegment.start.toFixed(2)}-${phaseSegment.end.toFixed(2)}`}
      whileTap={{ opacity: 0.96 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
      className="group relative w-full min-w-[15.75rem] flex-[0_0_15.75rem] snap-start text-left focus-visible:outline-none sm:min-w-0 sm:flex-auto"
      style={{ color: "inherit", touchAction: "manipulation" }}
    >
      <div className="relative pt-2">
        <div className="mb-5 flex items-center gap-3">
          <span
            className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white/[0.12] bg-[#050b18] transition-colors duration-100"
            data-execution-active={isActive ? "" : undefined}
            style={
              isActive
                ? {
                    borderColor: phase.accent.line,
                    background: phase.accent.surface,
                    boxShadow: `0 0 0 4px ${phase.accent.surface}, 0 0 16px ${phase.accent.glow}`,
                  }
                : shouldPreview
                  ? {
                      borderColor: "rgba(255,255,255,0.3)",
                      background: "rgba(255,255,255,0.06)",
                    }
                : undefined
            }
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-white/[0.36] transition-colors duration-100"
              style={
                isActive
                  ? {
                      background: phase.accent.line,
                      boxShadow: `0 0 12px ${phase.accent.glow}`,
                    }
                  : shouldPreview
                    ? {
                        background: "rgba(255,255,255,0.72)",
                      }
                  : undefined
              }
            />
          </span>

          <span
            className="text-[10px] uppercase tracking-[0.32em] text-blue-100/[0.42] transition-colors duration-100"
            style={{
              fontFamily: MONO_FONT,
              ...(isActive
                ? { color: phase.accent.text }
                : shouldPreview
                  ? { color: "rgba(255,255,255,0.72)" }
                  : {}),
            }}
          >
            {phase.index}
          </span>

          <span
            className="h-px flex-1 bg-white/[0.05] transition-colors duration-100"
            style={
              isActive
                ? {
                    background: `linear-gradient(90deg, ${phase.accent.line}, rgba(255,255,255,0.08))`,
                  }
                : shouldPreview
                  ? {
                      background: "linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
                    }
                : undefined
            }
          />
        </div>

        <div
          className="relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.012] px-4 py-4 transition-[border-color,background,box-shadow] duration-100 ease-out"
          style={
            isActive
              ? {
                  borderColor: phase.accent.line,
                  background: `linear-gradient(180deg, ${phase.accent.surface} 0%, rgba(255,255,255,0.024) 62%, rgba(255,255,255,0.01) 100%)`,
                  boxShadow: `inset 2px 0 0 ${phase.accent.line}, inset 0 1px 0 rgba(255,255,255,0.05), 0 14px 30px rgba(2,6,23,0.18), 0 0 16px ${phase.accent.glow}`,
                }
              : shouldPreview
                ? {
                    borderColor: "rgba(255,255,255,0.16)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.024) 0%, rgba(255,255,255,0.012) 100%)",
                    boxShadow: "0 8px 20px rgba(2,6,23,0.12)",
                  }
              : undefined
          }
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-4 top-0 h-px opacity-0 transition-opacity duration-100"
            style={
              isActive
                ? {
                    opacity: 1,
                    background: `linear-gradient(90deg, ${phase.accent.line}, transparent 72%)`,
                  }
                : shouldPreview
                  ? {
                      opacity: 0.8,
                      background:
                        "linear-gradient(90deg, rgba(255,255,255,0.18), transparent 72%)",
                    }
                : undefined
            }
          />

          <p
            className="text-[9px] uppercase tracking-[0.3em] text-white/[0.28] transition-colors duration-100"
            style={{
              fontFamily: MONO_FONT,
              ...(isActive
                ? { color: phase.accent.text }
                : shouldPreview
                  ? { color: "rgba(255,255,255,0.38)" }
                  : {}),
            }}
          >
            {phase.stateLabel}
          </p>

          <h3
            className="mt-3 text-[1.05rem] font-semibold leading-tight text-white/[0.9] transition-colors duration-100"
            style={{
              fontFamily: DISPLAY_FONT,
              ...(shouldPreview ? { color: "rgba(255,255,255,0.97)" } : {}),
            }}
          >
            {phase.title}
          </h3>

          <p
            className="mt-3 text-[0.76rem] leading-relaxed text-white/[0.38] transition-colors duration-100"
            style={{
              fontFamily: MONO_FONT,
              ...(shouldPreview ? { color: "rgba(255,255,255,0.48)" } : {}),
            }}
          >
            {phase.summary}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export function Process() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const laneRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const supportRef = useRef<HTMLDivElement | null>(null);
  const futureLayerRef = useRef<HTMLDivElement | null>(null);

  const isInView = useInView(sectionRef, { once: true, margin: "-120px" });
  const [hoveredPhaseId, setHoveredPhaseId] = useState<ExecutionPhase["id"] | null>(null);
  const [canHover, setCanHover] = useState(false);
  const [phaseProgress, setPhaseProgress] = useState(
    EXECUTION_PHASE_SCROLL_MAP[0]?.midpoint ?? 0,
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateHoverCapability = () => {
      setCanHover(mediaQuery.matches);
      if (!mediaQuery.matches) {
        setHoveredPhaseId(null);
      }
    };

    updateHoverCapability();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateHoverCapability);
      return () => mediaQuery.removeEventListener("change", updateHoverCapability);
    }

    mediaQuery.addListener(updateHoverCapability);
    return () => mediaQuery.removeListener(updateHoverCapability);
  }, []);

  const activeScrollSegment = resolvePhaseSegmentFromProgress(phaseProgress);
  const resolvedActiveIndex = activeScrollSegment.index;
  const activePhase = EXECUTION_PHASES[resolvedActiveIndex];
  const phaseProgressValue = clampExecutionProgress(phaseProgress);
  const phaseProgressAttr = phaseProgressValue.toFixed(3);
  const connectorProgress =
    EXECUTION_PHASES.length > 1
      ? `${(resolvedActiveIndex / (EXECUTION_PHASES.length - 1)) * 100}%`
      : "0%";

  const setExecutionPhaseProgress = (nextProgress: number) => {
    setPhaseProgress(clampExecutionProgress(nextProgress));
    setHoveredPhaseId(null);
  };

  const handlePhaseSelect = (phaseId: ExecutionPhase["id"]) => {
    setExecutionPhaseProgress(getPhaseSegmentById(phaseId).midpoint);
  };

  const handlePhaseHoverStart = (phaseId: ExecutionPhase["id"]) => {
    if (!canHover) {
      return;
    }

    setHoveredPhaseId(phaseId);
  };

  const handlePhaseHoverEnd = () => {
    setHoveredPhaseId(null);
  };

  if (!activePhase) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      data-execution-section=""
      data-phase-id={activePhase.id}
      data-phase-index={resolvedActiveIndex}
      data-phase-progress={phaseProgressAttr}
      className="relative overflow-hidden bg-[#040914] px-6 py-[clamp(5rem,12vw,9rem)] md:px-12 lg:px-20"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 66% 54% at 14% 18%, rgba(37,99,235,0.14) 0%, transparent 60%)",
            "radial-gradient(ellipse 54% 46% at 84% 18%, rgba(14,165,233,0.1) 0%, transparent 58%)",
            "linear-gradient(180deg, rgba(2,6,23,0.12) 0%, rgba(2,6,23,0.44) 52%, rgba(2,6,23,0.8) 100%)",
          ].join(", "),
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "92px 92px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-8%] top-[24%] h-[24rem] w-[32rem] rounded-full bg-blue-500/[0.06] blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-10%] right-[2%] h-[22rem] w-[28rem] rounded-full bg-sky-400/[0.05] blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-0.14em] right-[-0.04em] z-0 select-none text-[clamp(12rem,24vw,32rem)] font-extrabold leading-none tracking-[-0.05em] text-blue-300/[0.03]"
        style={{ fontFamily: DISPLAY_FONT }}
      >
        05
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1640px]">
        <div
          data-execution-orchestrator=""
          data-phase-index={resolvedActiveIndex}
          data-phase-progress={phaseProgressAttr}
          className="relative"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[7%] top-[6.25rem] h-[29rem] rounded-[40px] border border-white/[0.03] bg-white/[0.01]"
          />

          <motion.div
            ref={headerRef}
            data-execution-header=""
            initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.95, ease: EXPO }}
            className="relative -mb-px"
          >
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-7 bg-gradient-to-r from-blue-300/75 to-transparent" />
            <span
              className="text-[10px] uppercase tracking-[0.4em] text-blue-200/56"
              style={{ fontFamily: MONO_FONT }}
            >
              Execution Flow - 05
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-end lg:gap-8">
            <div className="min-w-0">
              <h2
                data-execution-title=""
                className="max-w-[8.8ch] text-[clamp(3rem,6.9vw,6.95rem)] font-extrabold leading-[0.9] tracking-[-0.054em] text-white"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                Execution
                <br />
                <span style={{ color: "rgba(186,230,253,0.95)" }}>Flow</span>
              </h2>

              <p
                className="mt-4 max-w-[44rem] text-[clamp(0.92rem,1.25vw,1.05rem)] leading-relaxed text-white/48"
                style={{ fontFamily: MONO_FONT }}
              >
                A controlled frontend system that moves from signal isolation
                to release hardening through a lane designed for future pinned
                scroll choreography, staged activation, and connector progress
                without needing to rebuild the section.
              </p>
            </div>

            <div
              ref={statsRef}
              data-execution-stats=""
              className="rounded-[22px] border border-white/[0.07] bg-white/[0.016] p-3 backdrop-blur-xl"
            >
              <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.012] px-4 py-3">
                  <span
                    className="block text-[1rem] font-semibold text-white/86"
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    04
                  </span>
                  <span
                    className="mt-1 block text-[10px] uppercase tracking-[0.28em] text-blue-200/34"
                    style={{ fontFamily: MONO_FONT }}
                  >
                    controlled phases
                  </span>
                </div>

                <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.012] px-4 py-3">
                  <span
                    className="block text-[1rem] font-semibold text-white/86"
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    {activePhase.stateLabel}
                  </span>
                  <span
                    className="mt-1 block text-[10px] uppercase tracking-[0.28em] text-blue-200/34"
                    style={{ fontFamily: MONO_FONT }}
                  >
                    live phase state
                  </span>
                </div>

                <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.012] px-4 py-3">
                  <span
                    className="block text-[1rem] font-semibold text-white/86"
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    gsap://reserved
                  </span>
                  <span
                    className="mt-1 block text-[10px] uppercase tracking-[0.28em] text-blue-200/34"
                    style={{ fontFamily: MONO_FONT }}
                  >
                    orchestration layer
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="mt-5 h-px bg-gradient-to-r from-white/10 via-white/[0.05] to-transparent"
          />
          </motion.div>

          <motion.div
            ref={shellRef}
            data-execution-shell=""
            data-phase-index={resolvedActiveIndex}
            data-phase-progress={phaseProgressAttr}
            initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 1, delay: 0.08, ease: EXPO }}
            className="relative -mt-px overflow-hidden rounded-[34px] border border-white/10 backdrop-blur-2xl"
            style={{
              background:
                "linear-gradient(180deg, rgba(8,13,28,0.96) 0%, rgba(5,10,22,0.94) 42%, rgba(3,7,17,0.98) 100%)",
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 44px 130px rgba(2,6,23,0.42), 0 0 0 1px ${activePhase.accent.surface}`,
            }}
          >
          <div
            aria-hidden="true"
            className="absolute inset-[1px] rounded-[33px]"
            style={{
              background: `linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 12%, ${activePhase.accent.surface} 100%)`,
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-[10px] rounded-[26px] border border-white/[0.05]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-[28px] rounded-[22px] border border-white/[0.03]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
              backgroundSize: "74px 74px",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, ${activePhase.accent.line}, rgba(255,255,255,0.14) 42%, transparent 78%)`,
            }}
          />
          <div
            aria-hidden="true"
            className="absolute right-[-7%] top-[14%] h-[18rem] w-[22rem] rounded-full blur-[110px]"
            style={{ background: activePhase.accent.glow }}
          />
          <div
            aria-hidden="true"
            className="absolute left-[-8%] bottom-[-10%] h-[16rem] w-[22rem] rounded-full blur-[120px]"
            style={{ background: activePhase.accent.glow }}
          />

          <div className="relative z-10">
            <div className="border-b border-white/[0.07] px-5 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-white/8 bg-black/20 px-3 py-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-300/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/60" />
                  </div>

                  <div>
                    <p
                      className="text-[9px] uppercase tracking-[0.3em] text-white/28"
                      style={{ fontFamily: MONO_FONT }}
                    >
                      active execution lane
                    </p>
                    <p
                      className="mt-1 text-[10px] uppercase tracking-[0.32em] text-white/40"
                      style={{ fontFamily: MONO_FONT }}
                    >
                      execution://{activePhase.id}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/40"
                    style={{ fontFamily: MONO_FONT }}
                  >
                    phase {activePhase.index}
                  </span>
                  <span
                    className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.24em]"
                    style={{
                      fontFamily: MONO_FONT,
                      borderColor: activePhase.accent.line,
                      background: activePhase.accent.surface,
                      color: activePhase.accent.text,
                    }}
                  >
                    {activePhase.stateLabel}
                  </span>
                </div>
              </div>
            </div>

            <div
              ref={laneRef}
              data-execution-lane=""
              data-phase-index={resolvedActiveIndex}
              data-phase-progress={phaseProgressAttr}
              onPointerLeave={canHover ? handlePhaseHoverEnd : undefined}
              className="relative overflow-hidden border-b border-white/[0.07] px-5 py-6 sm:px-6 lg:px-8"
            >
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 hidden grid-cols-4 gap-4 lg:grid"
                >
                  {EXECUTION_PHASES.map((phase) => (
                    <div
                      key={phase.id}
                      data-phase-marker=""
                      data-phase-index={getPhaseSegmentById(phase.id).index}
                      data-phase-progress={`${getPhaseSegmentById(phase.id).start.toFixed(2)}-${getPhaseSegmentById(phase.id).end.toFixed(2)}`}
                      className="flex items-start justify-center pt-2"
                      style={{
                        fontFamily: DISPLAY_FONT,
                        fontSize: "clamp(3.8rem, 6vw, 5.4rem)",
                        fontWeight: 800,
                        lineHeight: 0.84,
                        letterSpacing: "-0.08em",
                        color:
                          phase.id === activePhase.id
                            ? activePhase.accent.muted.replace("0.42", "0.18").replace("0.4", "0.18")
                            : "rgba(191,219,254,0.06)",
                      }}
                    >
                      {phase.index}
                    </div>
                  ))}
                </div>

                <div
                  data-execution-rail=""
                  data-execution-connector=""
                  data-phase-progress={phaseProgressAttr}
                  className="absolute left-[12.5%] right-[12.5%] top-[1.05rem] hidden h-px overflow-hidden rounded-full bg-white/[0.08] lg:block"
                  style={{
                    boxShadow: "0 0 18px rgba(59,130,246,0.06)",
                  }}
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
                    }}
                  />
                  <div
                    data-execution-progress=""
                    data-phase-progress={phaseProgressAttr}
                    className="absolute left-0 top-0 h-full"
                    style={{
                      width: connectorProgress,
                      background: `linear-gradient(90deg, ${activePhase.accent.line}, rgba(255,255,255,0.14))`,
                      boxShadow: `0 0 16px ${activePhase.accent.glow}, 0 0 28px ${activePhase.accent.glow}`,
                    }}
                  />
                </div>

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[0.7rem] hidden h-3 lg:block"
                >
                  {RAIL_NODE_POSITIONS.map((position, index) => (
                    <span
                      key={position}
                      className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border"
                      style={{
                        left: position,
                        borderColor: activePhase.accent.line,
                        background:
                          index <= resolvedActiveIndex - 1
                            ? activePhase.accent.line
                            : "rgba(255,255,255,0.08)",
                        boxShadow:
                          index <= resolvedActiveIndex - 1
                            ? `0 0 12px ${activePhase.accent.glow}`
                            : "0 0 0 3px rgba(255,255,255,0.02)",
                      }}
                    />
                  ))}
                </div>

                <div className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
                  {EXECUTION_PHASES.map((phase) => (
                    <ExecutionNode
                      key={phase.id}
                      phase={phase}
                      isActive={phase.id === activePhase.id}
                      isPreviewed={phase.id === hoveredPhaseId}
                      canHover={canHover}
                      onSelect={handlePhaseSelect}
                      onHoverStart={handlePhaseHoverStart}
                      onHoverEnd={handlePhaseHoverEnd}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-6 sm:px-6 lg:px-8 lg:py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePhase.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="grid gap-6 xl:grid-cols-[minmax(0,1.16fr)_minmax(20rem,24rem)]"
                >
                  <section
                    ref={panelRef}
                    data-execution-panel=""
                    data-phase-panel=""
                    data-phase-index={resolvedActiveIndex}
                    data-phase-progress={phaseProgressAttr}
                    className="relative min-w-0 overflow-hidden rounded-[32px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.026)_0%,rgba(255,255,255,0.012)_100%)] px-5 py-6 sm:px-6 lg:px-7 lg:py-7"
                  >
                    <div
                      aria-hidden="true"
                      className="absolute inset-y-[12%] right-[-10%] w-[20rem] rounded-full blur-[110px]"
                      style={{ background: activePhase.accent.glow }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${activePhase.accent.surface} 0%, rgba(255,255,255,0.012) 34%, transparent 78%)`,
                      }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 opacity-[0.1]"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
                        backgroundSize: "70px 70px",
                      }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute right-5 top-5 hidden select-none xl:block"
                      style={{
                        fontFamily: DISPLAY_FONT,
                        fontWeight: 800,
                        fontSize: "clamp(4.6rem, 8vw, 8rem)",
                        lineHeight: 0.9,
                        letterSpacing: "-0.08em",
                        color: activePhase.accent.muted.replace("0.42", "0.16").replace("0.4", "0.16"),
                      }}
                    >
                      {activePhase.index}
                    </div>

                    <div
                      data-execution-panel-meta=""
                      className="relative z-10 flex flex-wrap items-center gap-3 border-b border-white/[0.07] pb-4"
                    >
                      <span
                        className="text-[10px] uppercase tracking-[0.34em]"
                        style={{
                          fontFamily: MONO_FONT,
                          color: activePhase.accent.text,
                        }}
                      >
                        phase {activePhase.index}
                      </span>
                      <span
                        className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em]"
                        style={{
                          fontFamily: MONO_FONT,
                          borderColor: activePhase.accent.line,
                          background: activePhase.accent.surface,
                          color: activePhase.accent.text,
                        }}
                      >
                        {activePhase.stateLabel}
                      </span>
                      <span
                        className="text-[10px] uppercase tracking-[0.22em] text-white/30"
                        style={{ fontFamily: MONO_FONT }}
                      >
                        live execution surface
                      </span>
                    </div>

                    <div className="relative z-10 mt-6 min-w-0">
                      <p
                        className="text-[10px] uppercase tracking-[0.32em]"
                        style={{
                          fontFamily: MONO_FONT,
                          color: activePhase.accent.text,
                        }}
                      >
                        frontend system phase
                      </p>

                      <div className="relative mt-4">
                        <div
                          aria-hidden="true"
                          className="absolute inset-x-0 top-[0.95rem] h-[7rem] opacity-[0.18]"
                          style={{
                            backgroundImage:
                              "linear-gradient(rgba(148,163,184,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
                            backgroundSize: "22px 22px",
                            maskImage:
                              "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.18), transparent)",
                          }}
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-x-0 top-[3.1rem] h-px"
                          style={{
                            background: `linear-gradient(90deg, ${activePhase.accent.line}, transparent 72%)`,
                            opacity: 0.9,
                          }}
                        />

                        <h3
                          data-execution-panel-title=""
                          data-phase-title=""
                          className="relative max-w-[9ch] text-[clamp(3.1rem,5.8vw,6.2rem)] font-extrabold leading-[0.9] tracking-[-0.055em] text-white"
                          style={{ fontFamily: DISPLAY_FONT }}
                        >
                          {activePhase.title}
                        </h3>
                      </div>

                      <div data-phase-description="">
                        <p
                          className="mt-6 max-w-[42rem] text-[clamp(1rem,1.38vw,1.18rem)] leading-relaxed text-white/72"
                          style={{ fontFamily: MONO_FONT }}
                        >
                          {activePhase.summary}
                        </p>

                        <p
                          className="mt-5 max-w-[44rem] text-[0.95rem] leading-relaxed text-white/46"
                          style={{ fontFamily: MONO_FONT }}
                        >
                          {activePhase.description}
                        </p>
                      </div>

                      <div
                        data-telemetry=""
                        data-phase-index={resolvedActiveIndex}
                        data-phase-progress={phaseProgressAttr}
                        className="mt-6 grid gap-3 sm:grid-cols-3"
                      >
                        {activePhase.telemetry.map((item) => (
                          <div
                            key={item.label}
                            className="rounded-[18px] border border-white/[0.07] bg-white/[0.012] px-4 py-3"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  background: activePhase.accent.line,
                                  boxShadow: `0 0 10px ${activePhase.accent.glow}`,
                                }}
                              />
                              <span
                                className="text-[9px] uppercase tracking-[0.28em] text-white/30"
                                style={{ fontFamily: MONO_FONT }}
                              >
                                {item.label}
                              </span>
                            </div>
                            <span
                              className="mt-3 block text-[0.96rem] font-semibold"
                              style={{
                                fontFamily: DISPLAY_FONT,
                                color: activePhase.accent.text,
                              }}
                            >
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative z-10 mt-8 border-t border-white/[0.07] pt-5">
                      <p
                        className="text-[10px] uppercase tracking-[0.3em] text-white/28"
                        style={{ fontFamily: MONO_FONT }}
                      >
                        execution markers
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2.5">
                        {activePhase.tags.map((tag) => (
                          <span
                            key={tag}
                            className="border px-3 py-2 text-[10px] uppercase tracking-[0.2em]"
                            style={{
                              fontFamily: MONO_FONT,
                              borderColor: "rgba(255,255,255,0.08)",
                              background: "rgba(255,255,255,0.012)",
                              color: activePhase.accent.text,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div
                      data-execution-console=""
                      data-console=""
                      data-phase-index={resolvedActiveIndex}
                      data-phase-progress={phaseProgressAttr}
                      className="relative z-10 mt-6 overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#050913]/88 px-4 py-4"
                    >
                      <div
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 h-px"
                        style={{
                          background: `linear-gradient(90deg, ${activePhase.accent.line}, transparent 72%)`,
                        }}
                      />
                      <div className="mb-3 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-300/50" />
                        <span className="h-2 w-2 rounded-full bg-amber-300/50" />
                        <span className="h-2 w-2 rounded-full bg-emerald-300/50" />
                        <span
                          className="ml-2 text-[10px] uppercase tracking-[0.28em] text-white/26"
                          style={{ fontFamily: MONO_FONT }}
                        >
                          execution log
                        </span>
                      </div>

                      <div className="space-y-2">
                        {activePhase.console.map((entry) => (
                          <p
                            key={entry}
                            className="text-[0.79rem] leading-relaxed text-white/48"
                            style={{ fontFamily: MONO_FONT }}
                          >
                            <span style={{ color: activePhase.accent.text }}>{">"}</span> {entry}
                          </p>
                        ))}
                      </div>
                    </div>
                  </section>

                  <aside
                    ref={supportRef}
                    data-execution-support=""
                    className="relative min-w-0 overflow-hidden rounded-[28px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.018)_0%,rgba(255,255,255,0.01)_100%)] px-4 py-4 sm:px-5"
                  >
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(180deg, ${activePhase.accent.surface} 0%, rgba(255,255,255,0.01) 38%, transparent 100%)`,
                      }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
                        <div>
                          <p
                            className="text-[10px] uppercase tracking-[0.32em] text-white/30"
                            style={{ fontFamily: MONO_FONT }}
                          >
                            support registry
                          </p>
                          <p
                            className="mt-1 text-[10px] uppercase tracking-[0.26em] text-white/22"
                            style={{ fontFamily: MONO_FONT }}
                          >
                            outputs, checks, diagnostics
                          </p>
                        </div>

                        <span
                          className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em]"
                          style={{
                            fontFamily: MONO_FONT,
                            borderColor: activePhase.accent.line,
                            color: activePhase.accent.text,
                          }}
                        >
                          {activePhase.stateLabel}
                        </span>
                      </div>

                      <div className="pt-5">
                        <p
                          className="text-[10px] uppercase tracking-[0.3em] text-white/28"
                          style={{ fontFamily: MONO_FONT }}
                        >
                          outputs registry
                        </p>

                        <div className="mt-4 space-y-0">
                          {activePhase.outputs.map((output, outputIndex) => (
                            <div
                              key={output}
                              data-execution-output=""
                              className={
                                outputIndex === 0 ? "pb-4" : "border-t border-white/[0.07] py-4"
                              }
                            >
                              <div className="flex items-start gap-3">
                                <span
                                  className="mt-1.5 h-1.5 w-1.5 rounded-full"
                                  style={{
                                    background: activePhase.accent.line,
                                    boxShadow: `0 0 12px ${activePhase.accent.glow}`,
                                  }}
                                />
                                <p
                                  className="text-[0.88rem] leading-relaxed text-white/52"
                                  style={{ fontFamily: MONO_FONT }}
                                >
                                  {output}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 border-t border-white/[0.07] pt-5">
                        <p
                          className="text-[10px] uppercase tracking-[0.3em] text-white/28"
                          style={{ fontFamily: MONO_FONT }}
                        >
                          technical metrics
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                          {activePhase.metrics.map((metric) => (
                            <div
                              key={metric.label}
                              data-execution-metric=""
                              className="rounded-[18px] border border-white/[0.07] bg-white/[0.012] px-4 py-3"
                            >
                              <span
                                className="block text-[1rem] font-semibold text-white/88"
                                style={{ fontFamily: DISPLAY_FONT }}
                              >
                                {metric.value}
                              </span>
                              <span
                                className="mt-1 block text-[10px] uppercase tracking-[0.24em]"
                                style={{
                                  fontFamily: MONO_FONT,
                                  color: activePhase.accent.text,
                                }}
                              >
                                {metric.label}
                              </span>
                              <span
                                className="mt-2 block text-[0.73rem] leading-relaxed text-white/36"
                                style={{ fontFamily: MONO_FONT }}
                              >
                                {metric.detail}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div
                        data-diagnostics=""
                        data-phase-index={resolvedActiveIndex}
                        data-phase-progress={phaseProgressAttr}
                        className="mt-5 border-t border-white/[0.07] pt-5"
                      >
                        <p
                          className="text-[10px] uppercase tracking-[0.3em] text-white/28"
                          style={{ fontFamily: MONO_FONT }}
                        >
                          phase diagnostics
                        </p>

                        <div className="mt-4 space-y-3">
                          {activePhase.diagnostics.map((diagnostic) => (
                            <div
                              key={diagnostic.label}
                              className="rounded-[18px] border border-white/[0.07] bg-white/[0.012] px-4 py-3"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span
                                  className="text-[10px] uppercase tracking-[0.24em] text-white/34"
                                  style={{ fontFamily: MONO_FONT }}
                                >
                                  {diagnostic.label}
                                </span>
                                <span
                                  className="text-[0.96rem] font-semibold"
                                  style={{
                                    fontFamily: DISPLAY_FONT,
                                    color: activePhase.accent.text,
                                  }}
                                >
                                  {diagnostic.value}
                                </span>
                              </div>
                              <p
                                className="mt-2 text-[0.73rem] leading-relaxed text-white/34"
                                style={{ fontFamily: MONO_FONT }}
                              >
                                {diagnostic.detail}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 border-t border-white/[0.07] pt-5">
                        <p
                          className="text-[10px] uppercase tracking-[0.3em] text-white/28"
                          style={{ fontFamily: MONO_FONT }}
                        >
                          technical checks
                        </p>

                        <div className="mt-4 space-y-3">
                          {activePhase.checks.map((check) => (
                            <div key={check} className="flex items-start gap-3">
                              <span
                                className="mt-1.5 h-1.5 w-1.5 rounded-full"
                                style={{
                                  background: activePhase.accent.line,
                                  opacity: 0.92,
                                }}
                              />
                              <p
                                className="text-[0.82rem] leading-relaxed text-white/46"
                                style={{ fontFamily: MONO_FONT }}
                              >
                                {check}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 border-t border-white/[0.07] pt-5">
                        <p
                          className="text-[10px] uppercase tracking-[0.3em] text-white/28"
                          style={{ fontFamily: MONO_FONT }}
                        >
                          system note
                        </p>
                        <p
                          className="mt-3 text-[0.82rem] leading-relaxed text-white/42"
                          style={{ fontFamily: MONO_FONT }}
                        >
                          {activePhase.note}
                        </p>
                      </div>
                    </div>
                  </aside>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          </motion.div>

          <motion.div
            ref={futureLayerRef}
            data-execution-future-layer=""
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.16, ease: EXPO }}
            className="relative mt-4 overflow-hidden rounded-[24px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.012)_0%,rgba(255,255,255,0.008)_100%)] px-5 py-4 sm:px-6"
          >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
              backgroundSize: "88px 88px",
            }}
          />

          <div className="relative z-10 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p
                className="text-[10px] uppercase tracking-[0.3em] text-white/24"
                style={{ fontFamily: MONO_FONT }}
              >
                future animation support
              </p>
              <p
                className="mt-2 max-w-[46rem] text-[0.82rem] leading-relaxed text-white/34"
                style={{ fontFamily: MONO_FONT }}
              >
                Reserved strip for pinned scroll state, connector scrub,
                execution diagnostics, and staged phase activation when GSAP
                choreography is attached later.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {["pin-ready", "progress-ready", "phase diagnostics reserved"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/[0.06] bg-white/[0.01] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/28"
                    style={{ fontFamily: MONO_FONT }}
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
