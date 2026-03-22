import { AnimatePresence, motion, useInView } from "motion/react";
import { gsap, useGSAP, ScrollTrigger, refreshScrollTriggers, EXPO_CSS } from "../utils/gsap";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from "react";

type BootPhase = "idle" | "typing" | "output" | "ready";
type CapabilityId =
  | "animate"
  | "architecture"
  | "performance"
  | "build"
  | "engineer";
type SystemNodeId =
  | "interaction-layer"
  | "capability-dispatcher"
  | "motion-engine"
  | "component-graph"
  | "render-pipeline"
  | "performance-pipeline";
type SystemMode = "standby" | "primed" | "active" | "developer";
type PerfMode = "unoptimized" | "optimized";
type Role = "admin" | "guest";
type InterfaceState = "draft" | "review" | "published" | "archived";

interface MotionProfile {
  stiffness: number;
  damping: number;
  staggerEnabled: boolean;
  hoverEnabled: boolean;
}

interface PerformanceProfile {
  lazyLoading: boolean;
  codeSplitting: boolean;
  priorityImage: boolean;
}

interface PerformanceState {
  durations: Record<"nav" | "hero" | "content", number>;
  bundle: number;
  lcp: string;
  routeIdle: string;
  optimizedCount: number;
  stability: number;
  calmness: number;
  topologyHealth: number;
  stabilityPercent: number;
  calmnessPercent: number;
  topologyPercent: number;
  healthLabel: string;
  diagnostics: string;
  terminalStatus: string;
}

interface OrchestrationCue {
  key: number;
  eyebrow: string;
  title: string;
  detail: string;
  accent: string;
}

interface MotionPreset {
  id: string;
  label: string;
  profile: MotionProfile;
}

interface SystemMemory {
  exploredCount: number;
  readiness: number;
  readinessPercent: number;
  wakeLevel: string;
  maturity: string;
  topologyRichness: number;
  activationHistory: string[];
}

const EXPO = EXPO_CSS;
const MANIFESTO =
  "Activate a subsystem. Feel the response before the explanation arrives.";
const MONO: CSSProperties = { fontFamily: "'DM Mono', monospace" };
const RECOMMENDED_CAPABILITY: CapabilityId = "animate";
const DEVELOPER_COMMAND = "open system";
const CLOSE_DEVELOPER_COMMAND = "close system";
const DEFAULT_MOTION_PROFILE: MotionProfile = {
  stiffness: 240,
  damping: 24,
  staggerEnabled: true,
  hoverEnabled: true,
};
const DEFAULT_PERFORMANCE_PROFILE: PerformanceProfile = {
  lazyLoading: false,
  codeSplitting: false,
  priorityImage: false,
};
const MOTION_PRESETS: MotionPreset[] = [
  {
    id: "precision",
    label: "precision",
    profile: {
      stiffness: 300,
      damping: 20,
      staggerEnabled: false,
      hoverEnabled: true,
    },
  },
  {
    id: "balanced",
    label: "balanced",
    profile: DEFAULT_MOTION_PROFILE,
  },
  {
    id: "drift",
    label: "drift",
    profile: {
      stiffness: 176,
      damping: 32,
      staggerEnabled: true,
      hoverEnabled: false,
    },
  },
];

const C = {
  user: "rgba(125,211,252,0.86)",
  path: "rgba(255,255,255,0.28)",
  cmd: "rgba(255,255,255,0.90)",
  output: "rgba(255,255,255,0.46)",
  accent: "rgba(147,197,253,0.84)",
  comment: "rgba(255,255,255,0.22)",
  success: "rgba(110,231,183,0.65)",
  cursor: "rgba(147,197,253,0.82)",
  kw: "rgba(147,197,253,0.88)",
  str: "rgba(110,231,183,0.78)",
} as const;

interface CapabilityTheme {
  accent: string;
  accentStrong: string;
  accentSoft: string;
  surface: string;
  glow: string;
  grid: string;
}

interface Capability {
  id: CapabilityId;
  command: string;
  title: string;
  status: string;
  tools: string[];
  statement: string;
  details: string[];
  code: string[];
  theme: CapabilityTheme;
  recommended?: boolean;
}

interface SystemNode {
  id: SystemNodeId;
  label: string;
  shortLabel: string;
  controls: string;
  impact: string;
  capabilities: CapabilityId[];
  x: number;
  y: number;
}

const CAPABILITIES: Capability[] = [
  {
    id: "animate",
    command: "animate",
    title: "Animate",
    status: "motion engine",
    tools: ["motion/react", "GSAP-ready"],
    statement:
      "Motion carries intent before copy gets a chance to explain it.",
    details: [
      "Transitions are treated as structure, not decoration.",
      "The section wakes as one system when the motion channel comes online.",
    ],
    code: [
      "motion.div({",
      "  initial: { opacity: 0, y: 24, scale: 0.96 },",
      "  animate: { opacity: 1, y: 0, scale: 1 },",
      "  transition: { type: 'spring', stiffness: 240, damping: 24 },",
      "})",
    ],
    theme: {
      accent: "rgba(125,211,252,0.88)",
      accentStrong: "rgba(186,230,253,0.96)",
      accentSoft: "rgba(56,189,248,0.22)",
      surface: "rgba(56,189,248,0.10)",
      glow: "rgba(14,165,233,0.22)",
      grid: "rgba(125,211,252,0.11)",
    },
    recommended: true,
  },
  {
    id: "architecture",
    command: "architecture",
    title: "Architecture",
    status: "system topology",
    tools: ["Design tokens", "Composition"],
    statement:
      "Structure stays visible so complexity can scale without turning opaque.",
    details: [
      "Tokens, components, and page composition stay legible as the system grows.",
      "Interfaces stay coherent because the relationships are designed up front.",
    ],
    code: [
      "const button = cva('base', {",
      "  variants: { size: { sm: '...', lg: '...' } },",
      "})",
      "",
      "export const tokens = { spacing, radius, color }",
    ],
    theme: {
      accent: "rgba(96,165,250,0.84)",
      accentStrong: "rgba(147,197,253,0.94)",
      accentSoft: "rgba(59,130,246,0.18)",
      surface: "rgba(59,130,246,0.10)",
      glow: "rgba(37,99,235,0.18)",
      grid: "rgba(96,165,250,0.10)",
    },
  },
  {
    id: "performance",
    command: "performance",
    title: "Performance",
    status: "render budget",
    tools: ["Web Vitals", "Bundle discipline"],
    statement:
      "Speed is a trust signal, so performance is designed into the interface.",
    details: [
      "Critical rendering is protected before polish gets added on top.",
      "Loading behavior is treated like product design, not cleanup work.",
    ],
    code: [
      "const Heavy = lazy(() => import('./Heavy'))",
      "",
      "<img width={1280} height={720} loading=\"eager\" />",
      "content-visibility: auto;",
    ],
    theme: {
      accent: "rgba(165,180,252,0.82)",
      accentStrong: "rgba(199,210,254,0.96)",
      accentSoft: "rgba(99,102,241,0.16)",
      surface: "rgba(99,102,241,0.10)",
      glow: "rgba(79,70,229,0.18)",
      grid: "rgba(165,180,252,0.10)",
    },
  },
  {
    id: "build",
    command: "build",
    title: "Build",
    status: "assembly graph",
    tools: ["React", "TypeScript"],
    statement:
      "Interfaces are assembled as systems with deliberate data flow and stable seams.",
    details: [
      "State lives where it can stay legible and predictable.",
      "Composition is used to keep decisions local and reuse honest.",
    ],
    code: [
      "const [state, dispatch] = useReducer(reducer, initialState)",
      "",
      "return <Layout data={state.data} onAction={dispatch} />",
    ],
    theme: {
      accent: "rgba(103,232,249,0.82)",
      accentStrong: "rgba(165,243,252,0.96)",
      accentSoft: "rgba(6,182,212,0.16)",
      surface: "rgba(6,182,212,0.08)",
      glow: "rgba(8,145,178,0.18)",
      grid: "rgba(103,232,249,0.09)",
    },
  },
  {
    id: "engineer",
    command: "engineer",
    title: "Engineer",
    status: "typed controls",
    tools: ["TypeScript", "CSS craft"],
    statement:
      "Constraints are used to sharpen decisions so the system stays trustworthy.",
    details: [
      "Types surface edge cases before they become interface bugs.",
      "Styling is engineered with the same intent as logic and state.",
    ],
    code: [
      "type Role = 'admin' | 'guest'",
      "",
      "const ui: Record<Role, Config> = {",
      "  admin: { canDelete: true },",
      "  guest: { canDelete: false },",
      "}",
    ],
    theme: {
      accent: "rgba(134,239,172,0.80)",
      accentStrong: "rgba(187,247,208,0.95)",
      accentSoft: "rgba(34,197,94,0.16)",
      surface: "rgba(34,197,94,0.08)",
      glow: "rgba(22,163,74,0.18)",
      grid: "rgba(134,239,172,0.08)",
    },
  },
];

const CAPABILITY_COUNT = CAPABILITIES.length;

function getCapabilityById(id: CapabilityId | null | undefined) {
  return CAPABILITIES.find((capability) => capability.id === id) ?? null;
}

const DEFAULT_CAPABILITY = getCapabilityById(RECOMMENDED_CAPABILITY)!;

const SYSTEM_NODES: SystemNode[] = [
  {
    id: "interaction-layer",
    label: "interaction layer",
    shortLabel: "interaction",
    controls: "Input routing, focus states, hover response, and terminal command entry.",
    impact: "Changes how users enter and manipulate the system.",
    capabilities: ["animate", "engineer"],
    x: 16,
    y: 24,
  },
  {
    id: "capability-dispatcher",
    label: "capability dispatcher",
    shortLabel: "dispatcher",
    controls: "Routes commands into subsystem activation and synchronizes shell state.",
    impact: "Touches every capability because it is the section coordinator.",
    capabilities: ["build", "architecture", "engineer"],
    x: 40,
    y: 34,
  },
  {
    id: "motion-engine",
    label: "motion engine",
    shortLabel: "motion",
    controls: "Section-wide response, demo kinetics, and ambient activation timing.",
    impact: "Changes the felt rhythm of the entire capability engine.",
    capabilities: ["animate"],
    x: 70,
    y: 22,
  },
  {
    id: "component-graph",
    label: "component graph",
    shortLabel: "components",
    controls: "Composition tree, subtree impact, and component orchestration.",
    impact: "Reshapes how the UI is assembled and what updates together.",
    capabilities: ["build", "architecture"],
    x: 22,
    y: 74,
  },
  {
    id: "render-pipeline",
    label: "render pipeline",
    shortLabel: "render",
    controls: "Stage output, shell drawing, and visual delivery across subsystems.",
    impact: "Affects what gets painted, when, and with what latency.",
    capabilities: ["architecture", "performance", "animate"],
    x: 56,
    y: 62,
  },
  {
    id: "performance-pipeline",
    label: "performance pipeline",
    shortLabel: "performance",
    controls: "Loading strategy, priority rules, and bundle pressure management.",
    impact: "Changes perceived speed, LCP, and downstream render readiness.",
    capabilities: ["performance"],
    x: 82,
    y: 78,
  },
] as const;

const SYSTEM_CONNECTIONS: Array<{ from: SystemNodeId; to: SystemNodeId }> = [
  { from: "interaction-layer", to: "capability-dispatcher" },
  { from: "capability-dispatcher", to: "motion-engine" },
  { from: "capability-dispatcher", to: "component-graph" },
  { from: "motion-engine", to: "render-pipeline" },
  { from: "component-graph", to: "render-pipeline" },
  { from: "render-pipeline", to: "performance-pipeline" },
];

const CAPABILITY_SYSTEM_MAP: Record<CapabilityId, SystemNodeId[]> = {
  animate: ["motion-engine", "interaction-layer", "render-pipeline"],
  build: ["capability-dispatcher", "component-graph"],
  architecture: ["capability-dispatcher", "render-pipeline", "component-graph"],
  performance: ["performance-pipeline", "render-pipeline"],
  engineer: ["interaction-layer", "capability-dispatcher"],
};

function getSystemNodeById(id: SystemNodeId) {
  return SYSTEM_NODES.find((node) => node.id === id)!;
}

function getPrimarySystemNodeId(capabilityId: CapabilityId | null | undefined): SystemNodeId {
  if (!capabilityId) {
    return "capability-dispatcher";
  }

  return CAPABILITY_SYSTEM_MAP[capabilityId][0] ?? "capability-dispatcher";
}

function getActiveSystemNodes(capabilityId: CapabilityId | null | undefined) {
  if (!capabilityId) {
    return ["capability-dispatcher"] as SystemNodeId[];
  }

  return CAPABILITY_SYSTEM_MAP[capabilityId];
}

function getSubsystemStatus(capabilityId: CapabilityId | null | undefined) {
  switch (capabilityId) {
    case "animate":
      return "motion engine online";
    case "build":
      return "component graph active";
    case "performance":
      return "render pipeline tuned";
    case "architecture":
      return "topology view enabled";
    case "engineer":
      return "interaction layer guarded";
    default:
      return "dispatcher synchronized";
  }
}

function getOnlineSubsystemIds(capabilityIds: CapabilityId[]) {
  const online = new Set<SystemNodeId>(["capability-dispatcher"]);

  capabilityIds.forEach((capabilityId) => {
    getActiveSystemNodes(capabilityId).forEach((nodeId) => online.add(nodeId));
  });

  return [...online];
}

function getMotionFeel(profile: MotionProfile) {
  if (profile.damping < 20) {
    return "elastic";
  }

  if (profile.damping > 30) {
    return "controlled";
  }

  return "balanced";
}

function getMotionCadence(profile: MotionProfile) {
  return profile.staggerEnabled ? "sequenced" : "direct";
}

function getMotionResponse(profile: MotionProfile) {
  return profile.hoverEnabled ? "reactive" : "locked";
}

function getMotionIntensity(profile: MotionProfile) {
  const stiffnessFactor = (profile.stiffness - 140) / 180;
  const dampingFactor = 1 - Math.min(1, Math.abs(profile.damping - 24) / 18);
  const staggerFactor = profile.staggerEnabled ? 0.14 : 0.04;
  const hoverFactor = profile.hoverEnabled ? 0.08 : 0.02;

  return 0.34 + stiffnessFactor * 0.28 + dampingFactor * 0.16 + staggerFactor + hoverFactor;
}

function getMotionPulseDuration(profile: MotionProfile) {
  return Math.max(0.56, 1.04 - (profile.stiffness - 140) / 450 + profile.damping / 180);
}

function getMotionCursorDuration(profile: MotionProfile) {
  const value =
    1.18 -
    (profile.stiffness - 140) / 420 +
    profile.damping / 120 +
    (profile.staggerEnabled ? 0.08 : -0.04);

  return Math.max(0.58, Math.min(1.28, value));
}

function getMotionTypingInterval(profile: MotionProfile) {
  const value =
    30 -
    (profile.stiffness - 140) / 18 +
    profile.damping / 5 +
    (profile.staggerEnabled ? 2 : -3) +
    (profile.hoverEnabled ? -1 : 1);

  return Math.round(Math.max(16, Math.min(34, value)));
}

function getMotionRailLift(profile: MotionProfile) {
  return 1.2 + getMotionIntensity(profile) * 2.8;
}

function motionProfilesMatch(a: MotionProfile, b: MotionProfile) {
  return (
    a.stiffness === b.stiffness &&
    a.damping === b.damping &&
    a.staggerEnabled === b.staggerEnabled &&
    a.hoverEnabled === b.hoverEnabled
  );
}

function getMotionPreset(profile: MotionProfile) {
  return MOTION_PRESETS.find((preset) => motionProfilesMatch(profile, preset.profile)) ?? null;
}

function getMotionProfileLabel(profile: MotionProfile) {
  return getMotionPreset(profile)?.label ?? "custom";
}

function getSystemMemory(exploredIds: CapabilityId[]): SystemMemory {
  const exploredCount = exploredIds.length;
  const readiness = exploredCount / CAPABILITY_COUNT;
  const readinessPercent = Math.round(readiness * 100);

  let wakeLevel = "standby";
  let maturity = "awaiting first activation";

  if (exploredCount === 1) {
    wakeLevel = "warming";
    maturity = "local memory retained";
  } else if (exploredCount === 2) {
    wakeLevel = "synchronizing";
    maturity = "linked subsystems retained";
  } else if (exploredCount === 3) {
    wakeLevel = "awake";
    maturity = "coordinated system state";
  } else if (exploredCount === 4) {
    wakeLevel = "coherent";
    maturity = "architectural awareness visible";
  } else if (exploredCount >= 5) {
    wakeLevel = "fully online";
    maturity = "capability engine internalized";
  }

  return {
    exploredCount,
    readiness,
    readinessPercent,
    wakeLevel,
    maturity,
    topologyRichness: 0.2 + readiness * 0.8,
    activationHistory: exploredIds.map((capabilityId, index) => {
      const capability = getCapabilityById(capabilityId);
      return `${String(index + 1).padStart(2, "0")} ${capability?.command ?? capabilityId}`;
    }),
  };
}

const BUILD_NODES = [
  { id: "page", label: "Page", cx: 50, cy: 10 },
  { id: "header", label: "Header", cx: 20, cy: 48 },
  { id: "main", label: "Main", cx: 74, cy: 48 },
  { id: "card1", label: "ProductCard", cx: 58, cy: 86 },
  { id: "card2", label: "ProductCard", cx: 88, cy: 86 },
] as const;

type BuildNodeId = (typeof BUILD_NODES)[number]["id"];
type BuildPhase = "idle" | "running" | "done";

const BUILD_EDGES = [
  { from: "page", to: "header" },
  { from: "page", to: "main" },
  { from: "main", to: "card1" },
  { from: "main", to: "card2" },
] as const;

const DISPATCH_IDS = new Set(["main", "card1", "card2"]);
const BUILD_NODE_META: Record<
  BuildNodeId,
  {
    surfaceLabel: string;
    scope: "global" | "branch" | "local";
    description: string;
  }
> = {
  page: {
    surfaceLabel: "Root shell",
    scope: "global",
    description: "Touches the full composition tree and propagates across every region.",
  },
  header: {
    surfaceLabel: "Frame region",
    scope: "local",
    description: "Adjusts a top-level region without forcing content recomposition.",
  },
  main: {
    surfaceLabel: "Content branch",
    scope: "branch",
    description: "Propagates through the product branch while keeping the frame stable.",
  },
  card1: {
    surfaceLabel: "Leaf component A",
    scope: "local",
    description: "Targets a single component surface with isolated downstream effect.",
  },
  card2: {
    surfaceLabel: "Leaf component B",
    scope: "local",
    description: "Targets a single component surface with isolated downstream effect.",
  },
};

function getBuildChildren(nodeId: BuildNodeId) {
  return BUILD_EDGES.filter((edge) => edge.from === nodeId).map(
    (edge) => edge.to as BuildNodeId,
  );
}

function getBuildParent(nodeId: BuildNodeId) {
  return (
    BUILD_EDGES.find((edge) => edge.to === nodeId)?.from as BuildNodeId | undefined
  ) ?? null;
}

function getBuildSubtree(nodeId: BuildNodeId) {
  const visited = new Set<BuildNodeId>([nodeId]);
  const queue: BuildNodeId[] = [nodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    getBuildChildren(current).forEach((childId) => {
      if (!visited.has(childId)) {
        visited.add(childId);
        queue.push(childId);
      }
    });
  }

  return [...visited];
}

function getBuildAncestors(nodeId: BuildNodeId) {
  const ancestors: BuildNodeId[] = [];
  let current = getBuildParent(nodeId);

  while (current) {
    ancestors.unshift(current);
    current = getBuildParent(current);
  }

  return ancestors;
}

function getBuildDepthMap(nodeId: BuildNodeId) {
  const depths: Partial<Record<BuildNodeId, number>> = { [nodeId]: 0 };
  const queue: Array<{ id: BuildNodeId; depth: number }> = [{ id: nodeId, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    getBuildChildren(current.id).forEach((childId) => {
      if (depths[childId] === undefined) {
        depths[childId] = current.depth + 1;
        queue.push({ id: childId, depth: current.depth + 1 });
      }
    });
  }

  return depths;
}

function getBuildNodeLabel(nodeId: BuildNodeId) {
  switch (nodeId) {
    case "card1":
      return "ProductCard A";
    case "card2":
      return "ProductCard B";
    default:
      return BUILD_NODES.find((node) => node.id === nodeId)?.label ?? nodeId;
  }
}

function getBuildScopeLabel(scope: "global" | "branch" | "local") {
  switch (scope) {
    case "global":
      return "full shell cascade";
    case "branch":
      return "branch propagation";
    default:
      return "isolated surface update";
  }
}

function getBuildScopeNarrative(scope: "global" | "branch" | "local") {
  switch (scope) {
    case "global":
      return "Parent and child regions realign together when the root shell moves.";
    case "branch":
      return "Only the active branch recomposes while parallel regions stay stable.";
    default:
      return "The update stays local, but the architecture makes that isolation visible.";
  }
}

const ARCH_TOKENS = [
  { id: "color-brand", label: "--color-brand", cx: 16, cy: 14 },
  { id: "space-4", label: "--space-4", cx: 50, cy: 14 },
  { id: "radius-md", label: "--radius-md", cx: 84, cy: 14 },
] as const;

const ARCH_COMPONENTS = [
  { id: "Button", label: "Button", cx: 12, cy: 52 },
  { id: "Badge", label: "Badge", cx: 36, cy: 52 },
  { id: "Card", label: "Card", cx: 62, cy: 52 },
  { id: "Header", label: "Header", cx: 88, cy: 52 },
] as const;

const ARCH_PAGES = [
  { id: "Dashboard", label: "Dashboard", cx: 30, cy: 88 },
  { id: "Product", label: "Product", cx: 70, cy: 88 },
] as const;

const ARCH_CONNECTIONS: Array<{ from: string; to: string }> = [
  { from: "color-brand", to: "Button" },
  { from: "color-brand", to: "Badge" },
  { from: "color-brand", to: "Header" },
  { from: "space-4", to: "Button" },
  { from: "space-4", to: "Card" },
  { from: "space-4", to: "Header" },
  { from: "radius-md", to: "Button" },
  { from: "radius-md", to: "Badge" },
  { from: "radius-md", to: "Card" },
  { from: "Button", to: "Dashboard" },
  { from: "Button", to: "Product" },
  { from: "Badge", to: "Dashboard" },
  { from: "Card", to: "Product" },
  { from: "Header", to: "Dashboard" },
  { from: "Header", to: "Product" },
];

const PERF_BLOCKS = [
  { id: "nav", label: "Nav", h: 20 },
  { id: "hero", label: "Hero", h: 50 },
  { id: "content", label: "Content", h: 34 },
] as const;

const PERF_TIMINGS: Record<PerfMode, Record<string, number>> = {
  unoptimized: { nav: 940, hero: 1260, content: 1480 },
  optimized: { nav: 110, hero: 260, content: 390 },
};

const PERF_LCP: Record<PerfMode, string> = {
  unoptimized: "1.48s",
  optimized: "0.39s",
};

function getPerformanceState(profile: PerformanceProfile): PerformanceState {
  const durations = { ...PERF_TIMINGS.unoptimized } as Record<"nav" | "hero" | "content", number>;
  let bundle = 100;
  let lcp = 1.48;
  let routeIdle = 2.21;

  if (profile.lazyLoading) {
    durations.content -= 420;
    routeIdle -= 0.48;
    bundle -= 8;
  }

  if (profile.codeSplitting) {
    durations.nav -= 130;
    durations.content -= 210;
    routeIdle -= 0.54;
    bundle -= 18;
  }

  if (profile.priorityImage) {
    durations.hero -= 420;
    lcp -= 0.63;
  }

  const optimizedCount = [
    profile.lazyLoading,
    profile.codeSplitting,
    profile.priorityImage,
  ].filter(Boolean).length;
  const stability = Math.min(
    1,
    0.24 +
      optimizedCount * 0.2 +
      (profile.codeSplitting ? 0.1 : 0) +
      (profile.lazyLoading ? 0.08 : 0) +
      (profile.priorityImage ? 0.07 : 0),
  );
  const calmness = Math.min(
    1,
    0.18 +
      stability * 0.44 +
      ((2.21 - routeIdle) / 1.49) * 0.2 +
      ((1.48 - lcp) / 1.09) * 0.12,
  );
  const topologyHealth = Math.min(
    1,
    0.22 + stability * 0.46 + (profile.codeSplitting ? 0.14 : 0) + (profile.lazyLoading ? 0.08 : 0),
  );

  let healthLabel = "under pressure";
  let diagnostics = "render budget exposed";
  let terminalStatus = "latency visible";

  if (optimizedCount === 1) {
    healthLabel = "stabilizing";
    diagnostics = "pipeline settling";
    terminalStatus = "shell pressure easing";
  } else if (optimizedCount === 2) {
    healthLabel = "coherent";
    diagnostics = "topology clearing";
    terminalStatus = "system becoming steady";
  } else if (optimizedCount >= 3) {
    healthLabel = "steady";
    diagnostics = "render calm";
    terminalStatus = "system stabilized";
  }

  return {
    durations,
    bundle,
    lcp: Math.max(0.39, lcp).toFixed(2),
    routeIdle: Math.max(0.72, routeIdle).toFixed(2),
    optimizedCount,
    stability,
    calmness,
    topologyHealth,
    stabilityPercent: Math.round(stability * 100),
    calmnessPercent: Math.round(calmness * 100),
    topologyPercent: Math.round(topologyHealth * 100),
    healthLabel,
    diagnostics,
    terminalStatus,
  };
}

const ENGINEER_STATES: Array<{
  id: InterfaceState;
  label: string;
  summary: string;
}> = [
  { id: "draft", label: "Draft", summary: "Local edits remain mutable and contained." },
  { id: "review", label: "Review", summary: "Shape is frozen while contract checks settle." },
  { id: "published", label: "Published", summary: "Surface is live and downstream-safe." },
  { id: "archived", label: "Archived", summary: "Interaction is retained, but release paths are sealed." },
];

const ENGINEER_ALL_TABS = ["Overview", "Audit log", "Analytics", "Release", "Settings"] as const;

const ENGINEER_CONTRACTS: Record<
  Role,
  {
    badge: string;
    badgeColor: string;
    contractLine: string;
    visibleTabs: Record<InterfaceState, readonly string[]>;
    allowedTransitions: Record<InterfaceState, InterfaceState[]>;
    deleteStates: InterfaceState[];
    restoreStates: InterfaceState[];
    blockedReasons: Partial<Record<InterfaceState, Partial<Record<InterfaceState, string>>>>;
  }
> = {
  admin: {
    badge: "elevated contract",
    badgeColor: "rgba(125,211,252,0.72)",
    contractLine: "Can move the surface through guarded release states without breaking interface shape.",
    visibleTabs: {
      draft: ["Overview", "Audit log", "Release", "Settings"],
      review: ["Overview", "Audit log", "Release", "Settings"],
      published: ["Overview", "Analytics", "Release", "Settings"],
      archived: ["Overview", "Audit log", "Settings"],
    },
    allowedTransitions: {
      draft: ["review", "archived"],
      review: ["draft", "published"],
      published: ["archived"],
      archived: ["draft"],
    },
    deleteStates: ["draft", "archived"],
    restoreStates: ["archived"],
    blockedReasons: {
      draft: {
        published: "Published is sealed until review resolves cleanly.",
      },
      review: {
        archived: "Review must resolve back to draft or forward to published.",
      },
      published: {
        draft: "Published surfaces cannot jump backwards; archive first.",
        review: "Review is closed once the contract is live.",
      },
      archived: {
        review: "Archived surfaces must be restored to draft before review resumes.",
        published: "Archived is a sealed terminal state until restored.",
      },
    },
  },
  guest: {
    badge: "bounded contract",
    badgeColor: "rgba(255,255,255,0.42)",
    contractLine: "May request a governed transition, but cannot open release or destructive paths.",
    visibleTabs: {
      draft: ["Overview", "Audit log"],
      review: ["Overview", "Audit log"],
      published: ["Overview", "Analytics"],
      archived: ["Overview"],
    },
    allowedTransitions: {
      draft: ["review"],
      review: [],
      published: [],
      archived: [],
    },
    deleteStates: [],
    restoreStates: [],
    blockedReasons: {
      draft: {
        archived: "Archive is reserved for elevated contracts.",
        published: "Publish remains sealed until an elevated review resolves.",
      },
      review: {
        draft: "Review cannot be reopened from a bounded contract.",
        published: "Only elevated contracts can release from review.",
        archived: "Archive remains outside the bounded surface.",
      },
      published: {
        draft: "Live surfaces cannot be mutated from a bounded contract.",
        review: "Published interfaces stay read-safe for guests.",
        archived: "Archive remains outside the bounded surface.",
      },
      archived: {
        draft: "Restore is reserved for elevated contracts.",
        review: "Archived surfaces stay sealed under bounded access.",
        published: "Archived surfaces stay sealed under bounded access.",
      },
    },
  },
};

function getEngineerBlockedReason(
  role: Role,
  state: InterfaceState,
  target: InterfaceState,
) {
  if (state === target) {
    return "Surface is already bound to that contract state.";
  }

  return (
    ENGINEER_CONTRACTS[role].blockedReasons[state]?.[target] ??
    `${target} is sealed by the active ${role} contract.`
  );
}

const JS_KEYWORDS = new Set([
  "const",
  "let",
  "type",
  "export",
  "default",
  "return",
  "interface",
  "true",
  "false",
  "lazy",
  "import",
  "Record",
]);

function highlightLine(line: string): ReactNode {
  if (line === "") {
    return <>&nbsp;</>;
  }

  if (line.trimStart().startsWith("//")) {
    return <span style={{ color: C.comment }}>{line}</span>;
  }

  if (/^--[\w-]+\s*:/.test(line.trimStart())) {
    const [prop, ...rest] = line.split(":");
    return (
      <>
        <span style={{ color: C.accent }}>{prop}</span>
        <span style={{ color: C.path }}>:</span>
        <span style={{ color: C.str }}>{rest.join(":")}</span>
      </>
    );
  }

  const tokens: ReactNode[] = [];
  const pattern = /(["'`])(?:(?!\1)[^\\]|\\.)*?\1|\w+|[^\w\s]/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  let key = 0;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(
        <span key={key++} style={{ color: C.output }}>
          {line.slice(lastIndex, match.index)}
        </span>,
      );
    }

    const token = match[0];

    if (/^["'`]/.test(token)) {
      tokens.push(
        <span key={key++} style={{ color: C.str }}>
          {token}
        </span>,
      );
    } else if (JS_KEYWORDS.has(token)) {
      tokens.push(
        <span key={key++} style={{ color: C.kw }}>
          {token}
        </span>,
      );
    } else if (/^[<>{}()[\]]$/.test(token)) {
      tokens.push(
        <span key={key++} style={{ color: "rgba(255,255,255,0.28)" }}>
          {token}
        </span>,
      );
    } else {
      tokens.push(
        <span key={key++} style={{ color: C.output }}>
          {token}
        </span>,
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < line.length) {
    tokens.push(
      <span key={key++} style={{ color: C.output }}>
        {line.slice(lastIndex)}
      </span>,
    );
  }

  return <>{tokens}</>;
}

function BuildDemo() {
  const [selectedId, setSelectedId] = useState<BuildNodeId>("main");
  const [dispatchOrigin, setDispatchOrigin] = useState<BuildNodeId>("main");
  const [phase, setPhase] = useState<BuildPhase>("idle");
  const [waveDepth, setWaveDepth] = useState(0);
  const [dispatchDepths, setDispatchDepths] = useState<Partial<Record<BuildNodeId, number>>>(
    {},
  );
  const timeoutsRef = useRef<number[]>([]);

  const clearDispatchTimers = useCallback(() => {
    timeoutsRef.current.forEach((timeout) => window.clearTimeout(timeout));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => clearDispatchTimers, [clearDispatchTimers]);

  const parentId = getBuildParent(selectedId);
  const childIds = getBuildChildren(selectedId);
  const subtreeIds = useMemo(() => getBuildSubtree(selectedId), [selectedId]);
  const subtree = useMemo(() => new Set(subtreeIds), [subtreeIds]);
  const ancestorIds = useMemo(() => getBuildAncestors(selectedId), [selectedId]);
  const ancestors = useMemo(() => new Set(ancestorIds), [ancestorIds]);
  const focusChain = useMemo(() => [...ancestorIds, selectedId], [ancestorIds, selectedId]);
  const selectedMeta = BUILD_NODE_META[selectedId];
  const propagationDepth = useMemo(() => {
    const values = Object.values(dispatchDepths).filter(
      (value): value is number => typeof value === "number",
    );
    return values.length > 0 ? Math.max(...values) : 0;
  }, [dispatchDepths]);

  const activeWaveNodes = useMemo(() => {
    const lit = new Set<BuildNodeId>();
    Object.entries(dispatchDepths).forEach(([nodeId, depth]) => {
      if (depth !== undefined && depth <= waveDepth) {
        lit.add(nodeId as BuildNodeId);
      }
    });
    return lit;
  }, [dispatchDepths, waveDepth]);

  const currentWaveNodes = useMemo(() => {
    const current = new Set<BuildNodeId>();
    if (phase !== "running") {
      return current;
    }

    Object.entries(dispatchDepths).forEach(([nodeId, depth]) => {
      if (depth !== undefined && depth === waveDepth) {
        current.add(nodeId as BuildNodeId);
      }
    });

    return current;
  }, [dispatchDepths, phase, waveDepth]);

  const dispatchTrace = useMemo(
    () =>
      Object.entries(dispatchDepths)
        .map(([nodeId, depth]) => ({
          id: nodeId as BuildNodeId,
          depth: depth ?? 0,
        }))
        .sort((a, b) => a.depth - b.depth),
    [dispatchDepths],
  );

  const runDispatch = useCallback(
    (sourceId: BuildNodeId) => {
      clearDispatchTimers();

      const nextDepths = getBuildDepthMap(sourceId);
      const maxDepth = Math.max(...Object.values(nextDepths), 0);

      setDispatchOrigin(sourceId);
      setDispatchDepths(nextDepths);
      setWaveDepth(0);
      setPhase("running");

      for (let depth = 1; depth <= maxDepth; depth += 1) {
        const timeout = window.setTimeout(() => {
          setWaveDepth(depth);
        }, 180 * depth);

        timeoutsRef.current.push(timeout);
      }

      const settleTimeout = window.setTimeout(() => {
        setPhase("done");
      }, 220 * (maxDepth + 1));

      timeoutsRef.current.push(settleTimeout);
    },
    [clearDispatchTimers],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => runDispatch("main"), 420);
    return () => window.clearTimeout(timeout);
  }, [runDispatch]);

  const getNodeState = useCallback(
    (nodeId: BuildNodeId) => {
      const depth = dispatchDepths[nodeId];
      return {
        active: nodeId === selectedId,
        ancestor: ancestors.has(nodeId),
        descendant: subtree.has(nodeId) && nodeId !== selectedId,
        origin: dispatchOrigin === nodeId,
        lit: activeWaveNodes.has(nodeId),
        currentWave: currentWaveNodes.has(nodeId),
        depth,
      };
    },
    [activeWaveNodes, ancestors, currentWaveNodes, dispatchDepths, dispatchOrigin, selectedId, subtree],
  );

  const renderSurface = (
    nodeId: BuildNodeId,
    className?: string,
    options?: { compact?: boolean },
  ) => {
    const compact = options?.compact ?? false;
    const state = getNodeState(nodeId);
    const label = getBuildNodeLabel(nodeId);
    const meta = BUILD_NODE_META[nodeId];
    const depthOffset = state.depth ?? 0;
    const branchSpread =
      selectedId === "page" || selectedId === "main"
        ? nodeId === "card1"
          ? -6
          : nodeId === "card2"
            ? 6
            : 0
        : 0;

    let statusLabel = meta.scope === "local" ? "local surface" : meta.surfaceLabel;
    if (state.currentWave) {
      statusLabel = `propagating depth ${state.depth ?? 0}`;
    } else if (state.origin && phase !== "idle") {
      statusLabel = "dispatch origin";
    } else if (state.active) {
      statusLabel = getBuildScopeLabel(meta.scope);
    } else if (state.descendant) {
      statusLabel = "downstream consumer";
    } else if (state.ancestor) {
      statusLabel = "upstream frame";
    }

    return (
      <motion.div
        key={`surface-${nodeId}`}
        role="button"
        tabIndex={0}
        onClick={() => setSelectedId(nodeId)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setSelectedId(nodeId);
          }
        }}
        className={className}
        animate={{
          scale: state.currentWave ? 1.025 : state.active ? 1.016 : state.descendant ? 1.004 : 1,
          opacity:
            state.active || state.currentWave || state.descendant || state.ancestor || state.lit
              ? 1
              : compact
                ? 0.58
                : 0.68,
          y:
            state.currentWave
              ? -6 - depthOffset
              : state.active
                ? -2
                : state.descendant && selectedMeta.scope !== "local"
                  ? -1
                  : 0,
          x: compact || !subtree.has(nodeId) ? 0 : branchSpread,
        }}
        transition={{ duration: 0.3, ease: EXPO }}
        style={{
          position: "relative",
          borderRadius: compact ? 16 : 18,
          border: `1px solid ${
            state.active
              ? "rgba(125,211,252,0.38)"
              : state.currentWave
                ? "rgba(186,230,253,0.30)"
                : state.descendant
                  ? "rgba(125,211,252,0.18)"
                  : state.ancestor
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.06)"
          }`,
          background: state.currentWave
            ? "rgba(125,211,252,0.12)"
            : state.lit
              ? "rgba(125,211,252,0.08)"
              : state.active
                ? "rgba(125,211,252,0.06)"
                : state.descendant
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(255,255,255,0.025)",
          boxShadow:
            state.active || state.currentWave
              ? "0 0 28px rgba(56,189,248,0.16)"
              : state.origin
                ? "0 0 18px rgba(125,211,252,0.10)"
                : "none",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              state.currentWave || state.active
                ? "linear-gradient(135deg, rgba(125,211,252,0.10), transparent 68%)"
                : "linear-gradient(135deg, rgba(255,255,255,0.03), transparent 68%)",
            opacity: state.currentWave ? 1 : 0.7,
          }}
        />

        <div className={compact ? "relative px-4 py-3" : "relative px-4 py-3.5"}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div
                style={{
                  ...MONO,
                  fontSize: "0.50rem",
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: state.currentWave
                    ? "rgba(186,230,253,0.84)"
                    : state.active
                      ? "rgba(224,242,254,0.82)"
                      : "rgba(255,255,255,0.34)",
                }}
              >
                {label}
              </div>
              <div
                className="mt-2"
                style={{
                  ...MONO,
                  fontSize: compact ? "0.55rem" : "0.58rem",
                  lineHeight: 1.6,
                  color:
                    state.active || state.currentWave || state.descendant || state.ancestor
                      ? "rgba(255,255,255,0.66)"
                      : "rgba(255,255,255,0.30)",
                }}
              >
                {statusLabel}
              </div>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                runDispatch(nodeId);
              }}
              style={{
                ...MONO,
                fontSize: "0.50rem",
                borderRadius: 999,
                padding: "4px 8px",
                border: `1px solid ${
                  state.origin && phase === "running"
                    ? "rgba(186,230,253,0.26)"
                    : "rgba(255,255,255,0.08)"
                }`,
                color:
                  state.origin && phase === "running"
                    ? "rgba(224,242,254,0.82)"
                    : "rgba(255,255,255,0.42)",
                background:
                  state.origin && phase === "running"
                    ? "rgba(125,211,252,0.10)"
                    : "rgba(255,255,255,0.02)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {state.origin && phase === "running" ? "live" : "dispatch"}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              meta.scope,
              state.currentWave
                ? `depth ${state.depth ?? 0}`
                : state.descendant
                  ? "downstream"
                  : state.ancestor
                    ? "upstream"
                    : "stable",
            ].map((token) => (
              <span
                key={`${nodeId}-${token}`}
                className="rounded-full border px-2 py-1"
                style={{
                  ...MONO,
                  fontSize: "0.46rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  borderColor:
                    state.active || state.currentWave
                      ? "rgba(125,211,252,0.20)"
                      : "rgba(255,255,255,0.07)",
                  color:
                    state.active || state.currentWave
                      ? "rgba(186,230,253,0.72)"
                      : "rgba(255,255,255,0.34)",
                  background:
                    state.active || state.currentWave
                      ? "rgba(125,211,252,0.06)"
                      : "rgba(255,255,255,0.02)",
                }}
              >
                {token}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  const chamberTint =
    selectedMeta.scope === "global"
      ? "radial-gradient(circle at 50% 18%, rgba(125,211,252,0.14), transparent 58%)"
      : selectedMeta.scope === "branch"
        ? "radial-gradient(circle at 68% 52%, rgba(125,211,252,0.12), transparent 54%)"
        : selectedId === "card1"
          ? "radial-gradient(circle at 42% 70%, rgba(125,211,252,0.12), transparent 46%)"
          : selectedId === "card2"
            ? "radial-gradient(circle at 74% 70%, rgba(125,211,252,0.12), transparent 46%)"
            : "radial-gradient(circle at 24% 22%, rgba(125,211,252,0.10), transparent 42%)";

  return (
    <div className="w-full select-none">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_18rem]">
        <div
          className="rounded-[22px] border p-4"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            background:
              "linear-gradient(180deg, rgba(8,13,28,0.80) 0%, rgba(5,10,22,0.68) 100%)",
          }}
        >
          <div className="relative h-[198px] w-full">
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {BUILD_EDGES.map((edge) => {
                const from = BUILD_NODES.find((node) => node.id === edge.from)!;
                const to = BUILD_NODES.find((node) => node.id === edge.to)!;
                const inSubtree = subtree.has(edge.from as BuildNodeId) && subtree.has(edge.to as BuildNodeId);
                const inAncestorPath =
                  ancestors.has(edge.from as BuildNodeId) &&
                  (edge.to === selectedId || ancestors.has(edge.to as BuildNodeId));
                const depth = dispatchDepths[edge.to as BuildNodeId];
                const currentWave = phase === "running" && depth !== undefined && depth === waveDepth;
                const lit = depth !== undefined && depth <= waveDepth;

                return (
                  <line
                    key={`${edge.from}-${edge.to}`}
                    x1={from.cx}
                    y1={from.cy}
                    x2={to.cx}
                    y2={to.cy}
                    stroke={
                      currentWave
                        ? "rgba(186,230,253,0.82)"
                        : lit
                          ? "rgba(125,211,252,0.62)"
                          : inSubtree
                            ? "rgba(125,211,252,0.26)"
                            : inAncestorPath
                              ? "rgba(255,255,255,0.20)"
                              : "rgba(255,255,255,0.08)"
                    }
                    strokeWidth={currentWave ? "1" : inSubtree || inAncestorPath ? "0.78" : "0.55"}
                    strokeDasharray={inAncestorPath && !inSubtree ? "2 2" : undefined}
                    style={{ transition: "all 0.24s ease" }}
                  />
                );
              })}
            </svg>

            {BUILD_NODES.map((node) => {
              const nodeId = node.id as BuildNodeId;
              const state = getNodeState(nodeId);

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedId(nodeId)}
                  style={{
                    ...MONO,
                    position: "absolute",
                    left: `${node.cx}%`,
                    top: `${node.cy}%`,
                    transform: "translate(-50%, -50%)",
                    fontSize: "0.58rem",
                    padding: "5px 10px",
                    borderRadius: 999,
                    border: `1px solid ${
                      state.active
                        ? "rgba(125,211,252,0.42)"
                        : state.currentWave
                          ? "rgba(186,230,253,0.30)"
                          : state.descendant
                            ? "rgba(125,211,252,0.18)"
                            : state.ancestor
                              ? "rgba(255,255,255,0.12)"
                              : "rgba(255,255,255,0.08)"
                    }`,
                    background: state.currentWave
                      ? "rgba(125,211,252,0.14)"
                      : state.lit
                        ? "rgba(125,211,252,0.10)"
                        : state.active
                          ? "rgba(125,211,252,0.08)"
                          : "rgba(255,255,255,0.03)",
                    color: state.currentWave
                      ? "rgba(224,242,254,0.94)"
                      : state.active
                        ? "rgba(224,242,254,0.88)"
                        : state.descendant || state.ancestor
                          ? "rgba(255,255,255,0.68)"
                          : "rgba(255,255,255,0.42)",
                    boxShadow:
                      state.active || state.currentWave
                        ? "0 0 20px rgba(56,189,248,0.18)"
                        : "none",
                    whiteSpace: "nowrap",
                    transition: "all 0.24s ease",
                  }}
                >
                  {getBuildNodeLabel(nodeId)}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="flex flex-wrap gap-2">
              {BUILD_NODES.map((node) => {
                const nodeId = node.id as BuildNodeId;
                const active = nodeId === selectedId;

                return (
                  <button
                    key={`focus-${node.id}`}
                    type="button"
                    onClick={() => setSelectedId(nodeId)}
                    style={{
                      ...MONO,
                      fontSize: "0.54rem",
                      borderRadius: 999,
                      padding: "5px 10px",
                      border: `1px solid ${
                        active ? "rgba(125,211,252,0.24)" : "rgba(255,255,255,0.08)"
                      }`,
                      background: active ? "rgba(125,211,252,0.08)" : "rgba(255,255,255,0.02)",
                      color: active ? "rgba(186,230,253,0.84)" : "rgba(255,255,255,0.42)",
                    }}
                  >
                    {getBuildNodeLabel(nodeId)}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => runDispatch(selectedId)}
              disabled={phase === "running"}
              style={{
                ...MONO,
                fontSize: "0.58rem",
                borderRadius: 999,
                border: `1px solid ${
                  phase === "running"
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(125,211,252,0.24)"
                }`,
                color: phase === "running" ? C.comment : C.accent,
                background: "rgba(255,255,255,0.02)",
                padding: "7px 12px",
                letterSpacing: "0.05em",
              }}
            >
              {phase === "running"
                ? `propagating ${getBuildNodeLabel(selectedId)}...`
                : `[dispatch from ${getBuildNodeLabel(selectedId)}]`}
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          {[
            ["impact scope", getBuildScopeLabel(selectedMeta.scope)],
            ["parent", parentId ? getBuildNodeLabel(parentId) : "root shell"],
            [
              "children",
              childIds.length ? childIds.map((id) => getBuildNodeLabel(id)).join(", ") : "leaf surface",
            ],
            ["structural consequence", getBuildScopeNarrative(selectedMeta.scope)],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[16px] border px-4 py-3"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div
                style={{
                  ...MONO,
                  fontSize: "0.50rem",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "rgba(186,230,253,0.58)",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  ...MONO,
                  marginTop: 6,
                  fontSize: "0.58rem",
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,0.66)",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_17rem]">
        <div
          className="rounded-[22px] border p-4"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            background:
              "linear-gradient(180deg, rgba(8,13,28,0.76) 0%, rgba(5,10,22,0.62) 100%)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div
                style={{
                  ...MONO,
                  fontSize: "0.52rem",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "rgba(186,230,253,0.62)",
                }}
              >
                composition chamber
              </div>
              <div
                className="mt-2"
                style={{
                  ...MONO,
                  fontSize: "0.58rem",
                  color: "rgba(255,255,255,0.58)",
                }}
              >
                {focusChain.map((nodeId) => getBuildNodeLabel(nodeId)).join(" / ")}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[selectedMeta.scope, phase === "running" ? "under pressure" : "stable seams"].map(
                (token) => (
                  <span
                    key={token}
                    className="rounded-full border px-3 py-1.5"
                    style={{
                      ...MONO,
                      fontSize: "0.48rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      borderColor: "rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.42)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    {token}
                  </span>
                ),
              )}
            </div>
          </div>

          <div
            className="mt-4 rounded-[20px] border p-3"
            style={{
              borderColor: "rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div
              className="rounded-[18px] border p-3"
              style={{
                borderColor: "rgba(255,255,255,0.06)",
                background: chamberTint,
              }}
            >
              <div className="grid gap-3">
                {renderSurface("page")}
                <div className="grid gap-3 lg:grid-cols-[12rem_minmax(0,1fr)]">
                  {renderSurface("header", undefined, { compact: true })}
                  <div className="grid gap-3">
                    {renderSurface("main")}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {renderSurface("card1")}
                      {renderSurface("card2")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {[
            ["affected surfaces", `${subtreeIds.length} nodes / ${selectedMeta.scope} scope`],
            ["propagation depth", `${propagationDepth} levels visible`],
            ["last dispatch", getBuildNodeLabel(dispatchOrigin)],
            [
              "phase",
              phase === "running"
                ? `depth ${waveDepth} traversing`
                : phase === "done"
                  ? "settled after propagation"
                  : "ready",
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[16px] border px-4 py-3"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div
                style={{
                  ...MONO,
                  fontSize: "0.50rem",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "rgba(186,230,253,0.58)",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  ...MONO,
                  marginTop: 6,
                  fontSize: "0.58rem",
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,0.68)",
                }}
              >
                {value}
              </div>
            </div>
          ))}

          <div
            className="rounded-[16px] border px-4 py-3"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                ...MONO,
                fontSize: "0.50rem",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: "rgba(186,230,253,0.58)",
              }}
            >
              propagation trace
            </div>

            <div className="mt-3 grid gap-2">
              {dispatchTrace.map((step) => {
                const state = getNodeState(step.id);
                return (
                  <div
                    key={step.id}
                    className="rounded-[12px] border px-3 py-2"
                    style={{
                      borderColor: state.currentWave
                        ? "rgba(125,211,252,0.18)"
                        : "rgba(255,255,255,0.06)",
                      background: state.currentWave
                        ? "rgba(125,211,252,0.08)"
                        : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        style={{
                          ...MONO,
                          fontSize: "0.54rem",
                          color: state.currentWave
                            ? "rgba(224,242,254,0.82)"
                            : "rgba(255,255,255,0.62)",
                        }}
                      >
                        {getBuildNodeLabel(step.id)}
                      </span>
                      <span
                        style={{
                          ...MONO,
                          fontSize: "0.46rem",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: state.currentWave
                            ? "rgba(186,230,253,0.72)"
                            : "rgba(255,255,255,0.34)",
                        }}
                      >
                        depth {step.depth}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimateCardDemo({
  profile,
  onProfileChange,
}: {
  profile: MotionProfile;
  onProfileChange: Dispatch<SetStateAction<MotionProfile>>;
}) {
  const [cycle, setCycle] = useState(1);
  const { stiffness, damping, staggerEnabled, hoverEnabled } = profile;

  useEffect(() => {
    setCycle((value) => value + 1);
  }, [stiffness, damping, staggerEnabled, hoverEnabled]);

  const transition = { type: "spring" as const, stiffness, damping };
  const staggerBase = staggerEnabled ? 0.12 : 0;
  const motionFeel = getMotionFeel(profile);
  const motionCadence = getMotionCadence(profile);
  const motionResponse = getMotionResponse(profile);
  const motionProfileLabel = getMotionProfileLabel(profile);
  const pulseDuration = getMotionPulseDuration(profile);
  const typingInterval = getMotionTypingInterval(profile);
  const activePreset = getMotionPreset(profile);

  const setStiffness = useCallback(
    (value: number) => {
      onProfileChange((current) => ({ ...current, stiffness: value }));
    },
    [onProfileChange],
  );

  const setDamping = useCallback(
    (value: number) => {
      onProfileChange((current) => ({ ...current, damping: value }));
    },
    [onProfileChange],
  );

  const toggleStagger = useCallback(() => {
    onProfileChange((current) => ({
      ...current,
      staggerEnabled: !current.staggerEnabled,
    }));
  }, [onProfileChange]);

  const toggleHover = useCallback(() => {
    onProfileChange((current) => ({
      ...current,
      hoverEnabled: !current.hoverEnabled,
    }));
  }, [onProfileChange]);

  const applyPreset = useCallback(
    (preset: MotionPreset) => {
      onProfileChange(preset.profile);
    },
    [onProfileChange],
  );

  return (
    <div className="w-full select-none">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_11rem]">
        <div
          className="relative overflow-hidden rounded-[26px] border px-4 py-4 sm:px-5 sm:py-5"
          style={{
            borderColor: "rgba(125,211,252,0.18)",
            background:
              "linear-gradient(180deg, rgba(8,15,32,0.82) 0%, rgba(5,10,22,0.68) 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.05), 0 22px 60px rgba(2,6,23,0.24)",
          }}
        >
          <motion.div
            key={`wash-${cycle}`}
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0.12, scale: 0.94 }}
            animate={{ opacity: [0.14, 0.34, 0.18], scale: [0.95, 1.02, 1] }}
            transition={{ duration: 1.2, ease: EXPO }}
            style={{
              background:
                "radial-gradient(circle at 18% 28%, rgba(56,189,248,0.18) 0%, transparent 42%), radial-gradient(circle at 82% 74%, rgba(59,130,246,0.16) 0%, transparent 40%)",
            }}
          />

          <motion.div
            key={`beam-${cycle}`}
            className="pointer-events-none absolute left-[-18%] top-[18%] h-px w-[58%]"
            initial={{ opacity: 0, x: -50, rotate: -7 }}
            animate={{ opacity: [0, 1, 0], x: 260, rotate: -7 }}
            transition={{ duration: 0.9, delay: 0.12, ease: EXPO }}
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(186,230,253,0.9) 50%, transparent 100%)",
              boxShadow: "0 0 14px rgba(125,211,252,0.34)",
            }}
          />

          <div className="relative grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <motion.div
              key={`card-${cycle}`}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={hoverEnabled ? { y: -10, scale: 1.02 } : undefined}
              transition={transition}
              className="rounded-[20px] border p-4"
              style={{
                borderColor: "rgba(125,211,252,0.18)",
                background:
                  "linear-gradient(180deg, rgba(7,14,30,0.84) 0%, rgba(6,10,20,0.72) 100%)",
              }}
            >
              <motion.div
                key={`chip-${cycle}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: staggerBase, duration: 0.42, ease: EXPO }}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
                style={{
                  ...MONO,
                  fontSize: "0.56rem",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  borderColor: "rgba(125,211,252,0.18)",
                  color: "rgba(186,230,253,0.72)",
                  background: "rgba(125,211,252,0.08)",
                }}
              >
                <span
                  className="h-[6px] w-[6px] rounded-full"
                  style={{ background: "rgba(125,211,252,0.72)" }}
                />
                motion channel online
              </motion.div>

              <div className="mt-4 grid gap-3">
                <motion.div
                  key={`frame-${cycle}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...transition, delay: staggerBase + 0.06 }}
                  className="overflow-hidden rounded-[16px] border"
                  style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    background:
                      "linear-gradient(135deg, rgba(30,41,59,0.56) 0%, rgba(15,23,42,0.92) 100%)",
                  }}
                >
                  <div
                    className="h-[108px]"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(37,99,235,0.42) 0%, rgba(14,165,233,0.20) 100%)",
                    }}
                  />
                  <div className="grid gap-3 p-4">
                    <div>
                      <div
                        style={{
                          ...MONO,
                          fontSize: "0.70rem",
                          color: "rgba(255,255,255,0.88)",
                        }}
                      >
                        Capability Engine
                      </div>
                      <div
                        style={{
                          ...MONO,
                          marginTop: 3,
                          fontSize: "0.56rem",
                          color: "rgba(255,255,255,0.38)",
                        }}
                      >
                        Calibrate the system live. The shell updates immediately.
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[
                        ["stiffness", `${stiffness}`],
                        ["damping", `${damping}`],
                      ].map(([label, value], index) => (
                        <motion.div
                          key={`${label}-${cycle}`}
                          initial={{ opacity: 0, y: 7 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            ...transition,
                            delay: staggerBase + 0.12 + index * (staggerEnabled ? 0.06 : 0),
                          }}
                          className="rounded-[12px] border px-3 py-3"
                          style={{
                            borderColor: "rgba(255,255,255,0.07)",
                            background: "rgba(255,255,255,0.03)",
                          }}
                        >
                          <div
                            style={{
                              ...MONO,
                              fontSize: "0.52rem",
                              letterSpacing: "0.09em",
                              textTransform: "uppercase",
                              color: "rgba(186,230,253,0.66)",
                            }}
                          >
                            {label}
                          </div>
                          <div
                            style={{
                              ...MONO,
                              marginTop: 8,
                              fontSize: "0.70rem",
                              color: "rgba(255,255,255,0.82)",
                            }}
                          >
                            {value}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <div className="grid gap-3">
              {[
                ["profile", motionProfileLabel],
                ["terminal", `${typingInterval}ms cadence`],
                ["shell pulse", `${pulseDuration.toFixed(2)}s`],
                ["response", `${motionFeel} / ${motionResponse}`],
              ].map(([label, value], index) => (
                <motion.div
                  key={`${label}-${cycle}`}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    ...transition,
                    delay: staggerBase + 0.08 + index * (staggerEnabled ? 0.05 : 0),
                  }}
                  className="rounded-[16px] border px-4 py-3"
                  style={{
                    borderColor: "rgba(125,211,252,0.12)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <div
                    style={{
                      ...MONO,
                      fontSize: "0.52rem",
                      letterSpacing: "0.09em",
                      textTransform: "uppercase",
                      color: "rgba(186,230,253,0.62)",
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      ...MONO,
                      marginTop: 6,
                      fontSize: "0.60rem",
                      lineHeight: 1.6,
                      color: "rgba(255,255,255,0.60)",
                    }}
                  >
                    {value}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <div
            className="rounded-[16px] border px-4 py-3"
            style={{
              borderColor: "rgba(125,211,252,0.12)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                ...MONO,
                fontSize: "0.50rem",
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: "rgba(186,230,253,0.60)",
              }}
            >
              presets
            </div>
            <div className="mt-3 grid gap-2">
              {MOTION_PRESETS.map((preset) => {
                const active = activePreset?.id === preset.id;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-full border px-3 py-2 text-left"
                    style={{
                      ...MONO,
                      fontSize: "0.54rem",
                      borderColor: active
                        ? "rgba(125,211,252,0.22)"
                        : "rgba(255,255,255,0.08)",
                      background: active
                        ? "rgba(125,211,252,0.08)"
                        : "rgba(255,255,255,0.02)",
                      color: active
                        ? "rgba(186,230,253,0.84)"
                        : "rgba(255,255,255,0.48)",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {[
            {
              label: "stiffness",
              value: stiffness,
              min: 140,
              max: 320,
              onChange: setStiffness,
            },
            {
              label: "damping",
              value: damping,
              min: 14,
              max: 38,
              onChange: setDamping,
            },
          ].map((control) => (
            <div
              key={control.label}
              className="rounded-[16px] border px-4 py-3"
              style={{
                borderColor: "rgba(125,211,252,0.12)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div
                style={{
                  ...MONO,
                  fontSize: "0.50rem",
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: "rgba(186,230,253,0.60)",
                }}
              >
                {control.label}
              </div>
              <div
                style={{
                  ...MONO,
                  marginTop: 6,
                  fontSize: "0.66rem",
                  color: "rgba(255,255,255,0.78)",
                }}
              >
                {control.value}
              </div>
              <input
                type="range"
                min={control.min}
                max={control.max}
                value={control.value}
                onChange={(event) => control.onChange(Number(event.target.value))}
                className="mt-3 w-full accent-sky-300"
              />
            </div>
          ))}

          <div className="grid gap-2">
            {[
              {
                label: "stagger",
                value: staggerEnabled,
                toggle: toggleStagger,
              },
              {
                label: "hover response",
                value: hoverEnabled,
                toggle: toggleHover,
              },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.toggle}
                className="rounded-[16px] border px-4 py-3 text-left"
                style={{
                  ...MONO,
                  borderColor: item.value
                    ? "rgba(125,211,252,0.18)"
                    : "rgba(255,255,255,0.08)",
                  background: item.value
                    ? "rgba(125,211,252,0.06)"
                    : "rgba(255,255,255,0.03)",
                  color: item.value
                    ? "rgba(186,230,253,0.84)"
                    : "rgba(255,255,255,0.52)",
                  fontSize: "0.58rem",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCycle((value) => value + 1)}
            className="self-start"
            style={{
              ...MONO,
              fontSize: "0.60rem",
              color: C.comment,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              letterSpacing: "0.05em",
              transition: "color 0.24s ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.color = "rgba(186,230,253,0.76)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.color = C.comment;
            }}
          >
            [replay signal]
          </button>
        </div>
      </div>
    </div>
  );
}

function EngineerDemo() {
  const [role, setRole] = useState<Role>("admin");
  const [interfaceState, setInterfaceState] = useState<InterfaceState>("draft");
  const [event, setEvent] = useState<{
    tone: "accent" | "success" | "sealed";
    message: string;
  }>({
    tone: "accent",
    message: "Contract bound to admin.draft.",
  });

  const contract = ENGINEER_CONTRACTS[role];
  const allowedTransitions = contract.allowedTransitions[interfaceState];
  const visibleTabs = contract.visibleTabs[interfaceState];
  const hiddenTabs = ENGINEER_ALL_TABS.filter((tab) => !visibleTabs.includes(tab));
  const blockedTargets = ENGINEER_STATES.filter(
    (state) => state.id !== interfaceState && !allowedTransitions.includes(state.id),
  );
  const currentStateMeta =
    ENGINEER_STATES.find((state) => state.id === interfaceState) ?? ENGINEER_STATES[0];
  const deleteEnabled = contract.deleteStates.includes(interfaceState);
  const restoreEnabled = contract.restoreStates.includes(interfaceState);
  const publishEnabled = interfaceState === "review" && role === "admin";
  const requestReviewEnabled = interfaceState === "draft" && allowedTransitions.includes("review");
  const archiveEnabled = interfaceState === "published" && allowedTransitions.includes("archived");

  const primaryAction = publishEnabled
    ? { label: "Publish release", target: "published" as InterfaceState }
    : requestReviewEnabled
      ? { label: "Submit for review", target: "review" as InterfaceState }
      : archiveEnabled
        ? { label: "Archive release", target: "archived" as InterfaceState }
        : restoreEnabled
          ? { label: "Restore draft", target: "draft" as InterfaceState }
          : null;

  const integrityChecks = [
    {
      label: "contract validity",
      value: "shape derived directly from role + state",
    },
    {
      label: "surface exposure",
      value: `${visibleTabs.length}/${ENGINEER_ALL_TABS.length} lanes visible`,
    },
    {
      label: "transition graph",
      value: allowedTransitions.length
        ? allowedTransitions.join(" / ")
        : "sealed in current state",
    },
    {
      label: "destructive path",
      value: deleteEnabled ? "gated and available" : "sealed by contract",
    },
  ];

  const attemptTransition = useCallback(
    (target: InterfaceState) => {
      if (target === interfaceState) {
        setEvent({
          tone: "accent",
          message: "Surface already bound to the current contract state.",
        });
        return;
      }

      if (allowedTransitions.includes(target)) {
        setInterfaceState(target);
        setEvent({
          tone: "success",
          message: `Contract accepted ${interfaceState} -> ${target}. UI shape recomposed cleanly.`,
        });
        return;
      }

      setEvent({
        tone: "sealed",
        message: getEngineerBlockedReason(role, interfaceState, target),
      });
    },
    [allowedTransitions, interfaceState, role],
  );

  const handleRoleChange = useCallback(
    (nextRole: Role) => {
      setRole(nextRole);
      setEvent({
        tone: "accent",
        message: `Contract rebound to ${nextRole}.${interfaceState}. Surface lanes resynchronized.`,
      });
    },
    [interfaceState],
  );

  const eventColor =
    event.tone === "success"
      ? "rgba(134,239,172,0.78)"
      : event.tone === "sealed"
        ? "rgba(251,191,36,0.78)"
        : "rgba(186,230,253,0.76)";

  return (
    <div className="w-full select-none">
      <div className="mb-4 flex items-center gap-2">
        {(["admin", "guest"] as const).map((value) => {
          const active = role === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => handleRoleChange(value)}
              style={{
                ...MONO,
                fontSize: "0.58rem",
                padding: "5px 10px",
                borderRadius: 999,
                border: `1px solid ${
                  active ? "rgba(125,211,252,0.24)" : "rgba(255,255,255,0.08)"
                }`,
                color: active ? "rgba(186,230,253,0.82)" : "rgba(255,255,255,0.42)",
                background: active ? "rgba(125,211,252,0.08)" : "rgba(255,255,255,0.02)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {value}
            </button>
          );
        })}
      </div>

      <div
        className="rounded-[20px] border p-4"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          background:
            "linear-gradient(180deg, rgba(8,13,28,0.84) 0%, rgba(5,9,20,0.74) 100%)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div
              style={{
                ...MONO,
                fontSize: "0.70rem",
                color: "rgba(255,255,255,0.84)",
              }}
            >
              Contract-governed interface
            </div>
            <div
              style={{
                ...MONO,
                marginTop: 4,
                fontSize: "0.56rem",
                lineHeight: 1.65,
                color: C.comment,
              }}
            >
              Behavior is derived from role and state contracts. Invalid transitions are sealed,
              not merely hidden.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border px-3 py-1"
              style={{
                ...MONO,
                fontSize: "0.50rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                borderColor: "rgba(134,239,172,0.12)",
                color: "rgba(134,239,172,0.78)",
                background: "rgba(134,239,172,0.05)",
              }}
            >
              contract valid
            </span>
            <span
              className="rounded-full border px-3 py-1"
              style={{
                ...MONO,
                fontSize: "0.54rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                borderColor: "rgba(255,255,255,0.08)",
                color: contract.badgeColor,
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {contract.badge}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.04fr)_16rem]">
          <div className="grid gap-4">
            <div
              className="rounded-[18px] border p-4"
              style={{
                borderColor: "rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div
                style={{
                  ...MONO,
                  fontSize: "0.50rem",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "rgba(186,230,253,0.58)",
                }}
              >
                transition contract
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {ENGINEER_STATES.map((state, index) => {
                  const active = state.id === interfaceState;
                  const allowed = allowedTransitions.includes(state.id);
                  const blocked = !active && !allowed;

                  return (
                    <motion.button
                      key={state.id}
                      type="button"
                      onClick={() => attemptTransition(state.id)}
                      initial={false}
                      animate={{
                        y: active ? -3 : allowed ? -1 : 0,
                        scale: active ? 1.02 : 1,
                      }}
                      transition={{ duration: 0.28, ease: EXPO, delay: index * 0.02 }}
                      className="rounded-[16px] border px-4 py-3 text-left"
                      style={{
                        borderColor: active
                          ? "rgba(125,211,252,0.22)"
                          : allowed
                            ? "rgba(125,211,252,0.14)"
                            : blocked
                              ? "rgba(255,255,255,0.06)"
                              : "rgba(255,255,255,0.08)",
                        background: active
                          ? "rgba(125,211,252,0.08)"
                          : allowed
                            ? "rgba(125,211,252,0.04)"
                            : "rgba(255,255,255,0.02)",
                        boxShadow: active ? "0 0 24px rgba(56,189,248,0.14)" : "none",
                      }}
                    >
                      <div
                        style={{
                          ...MONO,
                          fontSize: "0.52rem",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: active
                            ? "rgba(224,242,254,0.84)"
                            : allowed
                              ? "rgba(186,230,253,0.68)"
                              : "rgba(255,255,255,0.34)",
                        }}
                      >
                        {state.label}
                      </div>
                      <div
                        className="mt-2"
                        style={{
                          ...MONO,
                          fontSize: "0.55rem",
                          lineHeight: 1.55,
                          color: active || allowed
                            ? "rgba(255,255,255,0.60)"
                            : "rgba(255,255,255,0.24)",
                        }}
                      >
                        {active
                          ? "current contract state"
                          : allowed
                            ? "transition available"
                            : "sealed"}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <motion.div
                key={`${role}-${interfaceState}-${event.message}`}
                className="mt-4 rounded-[14px] border px-4 py-3"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, ease: EXPO }}
                style={{
                  borderColor:
                    event.tone === "success"
                      ? "rgba(134,239,172,0.12)"
                      : event.tone === "sealed"
                        ? "rgba(251,191,36,0.12)"
                        : "rgba(125,211,252,0.12)",
                  background:
                    event.tone === "success"
                      ? "rgba(134,239,172,0.05)"
                      : event.tone === "sealed"
                        ? "rgba(251,191,36,0.05)"
                        : "rgba(125,211,252,0.05)",
                }}
              >
                <div
                  style={{
                    ...MONO,
                    fontSize: "0.50rem",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    color: eventColor,
                  }}
                >
                  contract response
                </div>
                <div
                  className="mt-2"
                  style={{
                    ...MONO,
                    fontSize: "0.58rem",
                    lineHeight: 1.65,
                    color: "rgba(255,255,255,0.66)",
                  }}
                >
                  {event.message}
                </div>
              </motion.div>
            </div>

            <motion.div
              key={`${role}-${interfaceState}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EXPO }}
              className="rounded-[18px] border p-4"
              style={{
                borderColor: "rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div
                    style={{
                      ...MONO,
                      fontSize: "0.50rem",
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      color: "rgba(186,230,253,0.58)",
                    }}
                  >
                    governed surface
                  </div>
                  <div
                    className="mt-2"
                    style={{
                      ...MONO,
                      fontSize: "0.64rem",
                      color: "rgba(255,255,255,0.78)",
                    }}
                  >
                    {role}.{interfaceState}
                  </div>
                  <div
                    className="mt-1"
                    style={{
                      ...MONO,
                      fontSize: "0.56rem",
                      lineHeight: 1.65,
                      color: "rgba(255,255,255,0.42)",
                    }}
                  >
                    {currentStateMeta.summary}
                  </div>
                </div>

                <span
                  className="rounded-full border px-3 py-1"
                  style={{
                    ...MONO,
                    fontSize: "0.50rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    borderColor: "rgba(255,255,255,0.08)",
                    color: contract.badgeColor,
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  shape locked
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {ENGINEER_ALL_TABS.map((tab) => {
                  const visible = visibleTabs.includes(tab);
                  return (
                    <div
                      key={tab}
                      className="rounded-full border px-3 py-1.5"
                      style={{
                        ...MONO,
                        fontSize: "0.54rem",
                        borderColor: visible
                          ? "rgba(125,211,252,0.14)"
                          : "rgba(255,255,255,0.05)",
                        color: visible
                          ? "rgba(255,255,255,0.62)"
                          : "rgba(255,255,255,0.18)",
                        background: visible
                          ? "rgba(125,211,252,0.04)"
                          : "rgba(255,255,255,0.01)",
                      }}
                    >
                      {tab}
                      {!visible ? " / withheld" : ""}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "release path",
                    value: publishEnabled
                      ? "publish path open"
                      : requestReviewEnabled
                        ? "review path open"
                        : archiveEnabled
                          ? "archive path open"
                          : "sealed",
                  },
                  {
                    label: "destructive path",
                    value: deleteEnabled ? "gated and available" : "sealed by contract",
                  },
                  {
                    label: "restore path",
                    value: restoreEnabled ? "restore available" : "sealed",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[14px] border px-4 py-3"
                    style={{
                      borderColor: "rgba(255,255,255,0.07)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div
                      style={{
                        ...MONO,
                        fontSize: "0.50rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "rgba(186,230,253,0.58)",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      className="mt-2"
                      style={{
                        ...MONO,
                        fontSize: "0.58rem",
                        lineHeight: 1.6,
                        color: "rgba(255,255,255,0.62)",
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => primaryAction && attemptTransition(primaryAction.target)}
                  disabled={!primaryAction}
                  style={{
                    ...MONO,
                    fontSize: "0.58rem",
                    borderRadius: 999,
                    padding: "7px 12px",
                    border: "1px solid rgba(125,211,252,0.18)",
                    color: primaryAction
                      ? "rgba(186,230,253,0.82)"
                      : "rgba(255,255,255,0.22)",
                    background: primaryAction
                      ? "rgba(125,211,252,0.06)"
                      : "rgba(255,255,255,0.02)",
                    cursor: primaryAction ? "pointer" : "default",
                  }}
                >
                  {primaryAction ? primaryAction.label : "No valid transition"}
                </button>

                <button
                  type="button"
                  disabled={!deleteEnabled}
                  style={{
                    ...MONO,
                    fontSize: "0.58rem",
                    borderRadius: 999,
                    padding: "7px 12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: deleteEnabled
                      ? "rgba(134,239,172,0.74)"
                      : "rgba(255,255,255,0.22)",
                    background: "rgba(255,255,255,0.02)",
                    cursor: deleteEnabled ? "pointer" : "default",
                  }}
                >
                  {deleteEnabled ? "Delete asset" : "Delete sealed"}
                </button>
              </div>
            </motion.div>
          </div>

          <div className="grid gap-3">
            {integrityChecks.map((item) => (
              <div
                key={item.label}
                className="rounded-[14px] border px-4 py-3"
                style={{
                  borderColor: "rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div
                  style={{
                    ...MONO,
                    fontSize: "0.50rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(186,230,253,0.58)",
                  }}
                >
                  {item.label}
                </div>
                <div
                  className="mt-2"
                  style={{
                    ...MONO,
                    fontSize: "0.58rem",
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.62)",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}

            <div
              className="rounded-[14px] border px-4 py-3"
              style={{
                borderColor: "rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div
                style={{
                  ...MONO,
                  fontSize: "0.50rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(186,230,253,0.58)",
                }}
              >
                contract line
              </div>
              <div
                className="mt-2"
                style={{
                  ...MONO,
                  fontSize: "0.58rem",
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,0.62)",
                }}
              >
                {contract.contractLine}
              </div>
            </div>

            <div
              className="rounded-[14px] border px-4 py-3"
              style={{
                borderColor: "rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div
                style={{
                  ...MONO,
                  fontSize: "0.50rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(186,230,253,0.58)",
                }}
              >
                blocked paths
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {blockedTargets.map((state) => (
                  <span
                    key={state.id}
                    className="rounded-full border px-3 py-1"
                    style={{
                      ...MONO,
                      fontSize: "0.50rem",
                      borderColor: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.34)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    {state.label.toLowerCase()}
                  </span>
                ))}
              </div>
              {hiddenTabs.length > 0 && (
                <div
                  className="mt-3"
                  style={{
                    ...MONO,
                    fontSize: "0.54rem",
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.40)",
                  }}
                >
                  Withheld lanes: {hiddenTabs.join(", ")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PerformanceDemo({
  profile,
  performanceState,
  onProfileChange,
}: {
  profile: PerformanceProfile;
  performanceState: PerformanceState;
  onProfileChange: Dispatch<SetStateAction<PerformanceProfile>>;
}) {
  const { lazyLoading, codeSplitting, priorityImage } = profile;

  const toggleFlag = useCallback(
    (key: keyof PerformanceProfile) => {
      onProfileChange((current) => ({ ...current, [key]: !current[key] }));
    },
    [onProfileChange],
  );

  return (
    <div className="w-full select-none">
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          {
            label: "lazy loading",
            enabled: lazyLoading,
            toggle: () => toggleFlag("lazyLoading"),
          },
          {
            label: "code splitting",
            enabled: codeSplitting,
            toggle: () => toggleFlag("codeSplitting"),
          },
          {
            label: "priority image",
            enabled: priorityImage,
            toggle: () => toggleFlag("priorityImage"),
          },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.toggle}
            style={{
              ...MONO,
              fontSize: "0.58rem",
              padding: "5px 10px",
              borderRadius: 999,
              border: `1px solid ${
                item.enabled ? "rgba(165,180,252,0.24)" : "rgba(255,255,255,0.08)"
              }`,
              color: item.enabled
                ? "rgba(224,231,255,0.84)"
                : "rgba(255,255,255,0.42)",
              background: item.enabled
                ? "rgba(165,180,252,0.08)"
                : "rgba(255,255,255,0.02)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        {[
          ["system health", performanceState.healthLabel],
          ["shell stability", `${performanceState.stabilityPercent}%`],
          ["topology health", `${performanceState.topologyPercent}%`],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-[16px] border px-4 py-3"
            style={{
              borderColor: "rgba(165,180,252,0.12)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                ...MONO,
                fontSize: "0.50rem",
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: "rgba(224,231,255,0.54)",
              }}
            >
              {label}
            </div>
            <div
              style={{
                ...MONO,
                marginTop: 7,
                fontSize: "0.64rem",
                color: "rgba(255,255,255,0.78)",
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_11rem]">
        <div
          className="rounded-[20px] border p-4"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            background:
              "linear-gradient(180deg, rgba(8,13,28,0.84) 0%, rgba(5,9,20,0.74) 100%)",
          }}
        >
          {PERF_BLOCKS.map((block) => {
            const duration =
              performanceState.durations[block.id as keyof typeof performanceState.durations];
            const optimized = performanceState.optimizedCount > 0;

            return (
              <div key={block.id} className="mb-4 last:mb-0">
                <div className="mb-2 flex items-center justify-between">
                  <span style={{ ...MONO, fontSize: "0.56rem", color: C.comment }}>
                    {block.label}
                  </span>
                  <span style={{ ...MONO, fontSize: "0.56rem", color: C.accent }}>
                    {duration}ms
                  </span>
                </div>
                <div
                  className="relative overflow-hidden rounded-[12px]"
                  style={{
                    height: `${block.h}px`,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-[11px]"
                    animate={{
                      width: `${Math.max(24, Math.min(90, duration / 16))}%`,
                    }}
                    transition={{ duration: 0.55, ease: EXPO }}
                    style={{
                      background: optimized
                        ? "linear-gradient(90deg, rgba(99,102,241,0.64), rgba(165,180,252,0.84))"
                        : "linear-gradient(90deg, rgba(71,85,105,0.64), rgba(148,163,184,0.54))",
                    }}
                  />
                  <motion.div
                    className="perf-shimmer absolute inset-y-0 left-0 w-[32%]"
                    animate={{ opacity: optimized ? 0.6 : 0.18 }}
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.34) 50%, transparent 100%)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3">
          {[
            ["LCP", `${performanceState.lcp}s`],
            ["route idle", `${performanceState.routeIdle}s`],
            ["bundle", `${performanceState.bundle}%`],
            ["flags", `${performanceState.optimizedCount}/3`],
            ["shell calm", `${performanceState.calmnessPercent}%`],
            ["diagnostics", performanceState.diagnostics],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[16px] border px-4 py-3"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div
                style={{
                  ...MONO,
                  fontSize: "0.52rem",
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: "rgba(224,231,255,0.60)",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  ...MONO,
                  marginTop: 6,
                  fontSize: "0.68rem",
                  color: "rgba(255,255,255,0.80)",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArchitectureDemo({
  developerModeArmed = false,
}: {
  developerModeArmed?: boolean;
}) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [pinnedNode, setPinnedNode] = useState<string | null>(null);
  const [autoNode, setAutoNode] = useState<string>("color-brand");

  const allNodes = useMemo(
    () => [...ARCH_TOKENS, ...ARCH_COMPONENTS, ...ARCH_PAGES],
    [],
  );

  useEffect(() => {
    if (hoveredNode || pinnedNode) {
      return;
    }

    const cycle = developerModeArmed
      ? ["Button", "Dashboard", "color-brand"]
      : ["color-brand", "Card", "Product"];

    let index = 0;
    const interval = window.setInterval(() => {
      index = (index + 1) % cycle.length;
      setAutoNode(cycle[index]);
    }, developerModeArmed ? 2200 : 1700);

    return () => window.clearInterval(interval);
  }, [developerModeArmed, hoveredNode, pinnedNode]);

  const activeNode = pinnedNode ?? hoveredNode ?? autoNode;

  const dependencies = useMemo(
    () =>
      ARCH_CONNECTIONS.filter((connection) => connection.to === activeNode).map(
        (connection) => connection.from,
      ),
    [activeNode],
  );

  const consumers = useMemo(
    () =>
      ARCH_CONNECTIONS.filter((connection) => connection.from === activeNode).map(
        (connection) => connection.to,
      ),
    [activeNode],
  );

  const impact = useMemo(() => {
    const visited = new Set<string>([activeNode]);
    const queue = [activeNode];

    while (queue.length > 0) {
      const current = queue.shift()!;
      ARCH_CONNECTIONS.forEach((connection) => {
        if (connection.from === current && !visited.has(connection.to)) {
          visited.add(connection.to);
          queue.push(connection.to);
        }
      });
    }

    return visited;
  }, [activeNode]);

  const connected = useMemo(() => {
    const nodes = new Set<string>([activeNode, ...dependencies, ...consumers]);
    impact.forEach((value) => nodes.add(value));
    return nodes;
  }, [activeNode, consumers, dependencies, impact]);

  const chain = [dependencies[0], activeNode, consumers[0]].filter(Boolean).join(" -> ");

  return (
    <div className="w-full select-none">
      <div
        className="relative h-[300px] overflow-hidden rounded-[22px] border"
        style={{
          borderColor: developerModeArmed
            ? "rgba(125,211,252,0.16)"
            : "rgba(255,255,255,0.08)",
          background:
            "linear-gradient(180deg, rgba(8,13,28,0.84) 0%, rgba(5,9,20,0.74) 100%)",
        }}
      >
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
          <span
            className="rounded-full border px-3 py-1"
            style={{
              ...MONO,
              fontSize: "0.50rem",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              borderColor: "rgba(125,211,252,0.12)",
              color: "rgba(186,230,253,0.70)",
              background: "rgba(125,211,252,0.06)",
            }}
          >
            {developerModeArmed ? "privileged topology" : "system topology"}
          </span>
          {pinnedNode && (
            <button
              type="button"
              onClick={() => setPinnedNode(null)}
              style={{
                ...MONO,
                fontSize: "0.50rem",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.42)",
                border: "none",
                background: "none",
                padding: "0.35rem 0",
              }}
            >
              [release pin]
            </button>
          )}
        </div>

        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {ARCH_CONNECTIONS.map((connection) => {
            const from = allNodes.find((node) => node.id === connection.from)!;
            const to = allNodes.find((node) => node.id === connection.to)!;
            const lit =
              connection.from === activeNode ||
              connection.to === activeNode ||
              (impact.has(connection.from) && impact.has(connection.to));

            return (
              <line
                key={`${connection.from}-${connection.to}`}
                x1={from.cx}
                y1={from.cy}
                x2={to.cx}
                y2={to.cy}
                stroke={lit ? "rgba(147,197,253,0.46)" : "rgba(255,255,255,0.08)"}
                strokeWidth={lit ? "0.75" : "0.55"}
                style={{ transition: "all 0.24s ease" }}
              />
            );
          })}
        </svg>

        {allNodes.map((node) => {
          const active = node.id === activeNode;
          const lit = connected.has(node.id);
          const impacted = impact.has(node.id);

          return (
            <button
              key={node.id}
              type="button"
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onFocus={() => setHoveredNode(node.id)}
              onBlur={() => setHoveredNode(null)}
              onClick={() =>
                setPinnedNode((current) => (current === node.id ? null : node.id))
              }
              style={{
                ...MONO,
                position: "absolute",
                left: `${node.cx}%`,
                top: `${node.cy}%`,
                transform: "translate(-50%, -50%)",
                fontSize: "0.56rem",
                padding: "4px 8px",
                borderRadius: 999,
                border: `1px solid ${
                  active
                    ? "rgba(147,197,253,0.42)"
                    : impacted
                      ? "rgba(147,197,253,0.18)"
                      : lit
                        ? "rgba(255,255,255,0.10)"
                        : "rgba(255,255,255,0.06)"
                }`,
                color: active
                  ? "rgba(224,231,255,0.92)"
                  : impacted
                    ? "rgba(191,219,254,0.74)"
                    : lit
                      ? "rgba(255,255,255,0.62)"
                      : "rgba(255,255,255,0.26)",
                background: active
                  ? "rgba(96,165,250,0.14)"
                  : "rgba(255,255,255,0.02)",
                boxShadow: active ? "0 0 24px rgba(59,130,246,0.18)" : "none",
                transition: "all 0.24s ease",
              }}
            >
              {node.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          ["depends on", dependencies.length ? dependencies.join(", ") : "none"],
          ["consumed by", consumers.length ? consumers.join(", ") : "terminal node"],
          ["impact radius", `${impact.size - 1} downstream nodes`],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-[16px] border px-4 py-3"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                ...MONO,
                fontSize: "0.52rem",
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: "rgba(186,230,253,0.62)",
              }}
            >
              {label}
            </div>
            <div
              style={{
                ...MONO,
                marginTop: 6,
                fontSize: "0.58rem",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.62)",
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p
          style={{
            ...MONO,
            fontSize: "0.56rem",
            lineHeight: 1.6,
            color: C.comment,
          }}
        >
          {developerModeArmed
            ? `privileged chain: ${chain || activeNode}`
            : "Hover to inspect topology. Click to pin a node and trace its reach."}
        </p>
        <span style={{ ...MONO, fontSize: "0.56rem", color: C.accent }}>
          focus: {activeNode}
        </span>
      </div>
    </div>
  );
}

function CodeSnippet({
  lines,
  theme,
}: {
  lines: string[];
  theme: CapabilityTheme;
}) {
  return (
    <div
      className="mt-4 overflow-hidden rounded-[14px] border"
      style={{
        borderColor: "rgba(255,255,255,0.07)",
        background: "rgba(4,9,20,0.78)",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 0 0 1px ${theme.surface}`,
      }}
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-3"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="h-[7px] w-[7px] rounded-full"
            style={{ background: index === 0 ? theme.accent : "rgba(255,255,255,0.18)" }}
          />
        ))}
        <span
          className="ml-2"
          style={{
            ...MONO,
            fontSize: "0.54rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.28)",
          }}
        >
          code proof
        </span>
      </div>

      <pre
        className="overflow-x-auto px-4 py-4"
        style={{
          ...MONO,
          fontSize: "0.60rem",
          lineHeight: 1.85,
          color: "rgba(255,255,255,0.60)",
        }}
      >
        {lines.map((line, index) => (
          <div key={`${line}-${index}`}>{highlightLine(line)}</div>
        ))}
      </pre>
    </div>
  );
}

function CapabilityModule({
  capability,
  isActive,
  onToggle,
}: {
  capability: Capability;
  isActive: boolean;
  onToggle: (id: CapabilityId) => void;
}) {
  const [showCode, setShowCode] = useState(false);

  return (
    <motion.div
      className="mt-3 overflow-hidden rounded-[18px] border px-4 py-4 sm:px-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: EXPO }}
      style={{
        borderColor: isActive
          ? capability.theme.accentSoft
          : "rgba(255,255,255,0.08)",
        background:
          "linear-gradient(180deg, rgba(7,12,26,0.86) 0%, rgba(5,9,20,0.72) 100%)",
        boxShadow: isActive
          ? `0 18px 42px rgba(2,6,23,0.24), 0 0 0 1px ${capability.theme.surface}`
          : "0 18px 42px rgba(2,6,23,0.18)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            style={{
              ...MONO,
              fontSize: "0.52rem",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              color: capability.theme.accent,
            }}
          >
            {capability.status}
          </div>
          <div
            className="mt-2"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(1.6rem,2.8vw,2.4rem)",
              lineHeight: 0.92,
              letterSpacing: "-0.03em",
              fontWeight: 800,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            {capability.title}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggle(capability.id)}
          style={{
            ...MONO,
            fontSize: "0.54rem",
            color: "rgba(255,255,255,0.34)",
            border: "none",
            background: "none",
            padding: 0,
            cursor: "pointer",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          [close]
        </button>
      </div>

      <p
        className="mt-4 max-w-[34rem]"
        style={{
          ...MONO,
          fontSize: "0.66rem",
          lineHeight: 1.8,
          color: "rgba(255,255,255,0.58)",
        }}
      >
        {capability.statement}
      </p>

      <div className="mt-4 grid gap-2">
        {capability.details.map((detail) => (
          <div key={detail} className="flex items-start gap-3">
            <span
              className="mt-[7px] h-[4px] w-[4px] rounded-full"
              style={{ background: capability.theme.accent }}
            />
            <span
              style={{
                ...MONO,
                fontSize: "0.60rem",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.52)",
              }}
            >
              {detail}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {capability.tools.map((tool) => (
          <span
            key={tool}
            className="rounded-full border px-3 py-1"
            style={{
              ...MONO,
              fontSize: "0.52rem",
              borderColor: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.48)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            {tool}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowCode((value) => !value)}
        className="mt-4"
        style={{
          ...MONO,
          fontSize: "0.56rem",
          color: showCode ? capability.theme.accentStrong : C.comment,
          border: "none",
          background: "none",
          padding: 0,
          cursor: "pointer",
          letterSpacing: "0.06em",
        }}
      >
        {showCode ? "[hide code]" : "[show code]"}
      </button>

      <AnimatePresence initial={false}>
        {showCode && (
          <motion.div
            key="code"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: EXPO }}
          >
            <CodeSnippet lines={capability.code} theme={capability.theme} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CommandEntry({
  capability,
  isTyping,
  isOpen,
  isActive,
  promptPath = ":~$",
  motionProfile,
  onDone,
  onToggle,
}: {
  capability: Capability;
  isTyping: boolean;
  isOpen: boolean;
  isActive: boolean;
  promptPath?: string;
  motionProfile: MotionProfile;
  onDone: (id: CapabilityId) => void;
  onToggle: (id: CapabilityId) => void;
}) {
  const command = `engine --activate ${capability.command}`;
  const [typedCommand, setTypedCommand] = useState(isTyping ? "" : command);
  const completedRef = useRef(false);
  const cursorDuration = getMotionCursorDuration(motionProfile);
  const typingInterval = getMotionTypingInterval(motionProfile);

  useEffect(() => {
    if (!isTyping) {
      setTypedCommand(command);
      completedRef.current = false;
      return;
    }

    let index = 0;
    setTypedCommand("");
    completedRef.current = false;

    const interval = window.setInterval(() => {
      index += 1;
      setTypedCommand(command.slice(0, index));

      if (index >= command.length) {
        window.clearInterval(interval);

        if (!completedRef.current) {
          completedRef.current = true;
          window.setTimeout(() => onDone(capability.id), 180);
        }
      }
    }, typingInterval);

    return () => window.clearInterval(interval);
  }, [capability.id, command, isTyping, onDone, typingInterval]);

  return (
    <div className="mt-5">
      <div className="flex items-start gap-x-[0.38em]">
        <span style={{ color: C.user }}>matteo@portfolio</span>
        <span style={{ color: C.path }}>{promptPath}</span>
        <span
          style={{
            color: isActive ? capability.theme.accentStrong : C.cmd,
            textShadow: isActive ? `0 0 12px ${capability.theme.glow}` : "none",
          }}
        >
          {typedCommand}
        </span>
        {isTyping && (
          <span
            className="terminal-cursor"
            style={{ color: C.cursor, animationDuration: `${cursorDuration}s` }}
          >
            |
          </span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isOpen && !isTyping && (
          <motion.div
            key={`${capability.id}-module`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28, ease: EXPO }}
          >
            <CapabilityModule
              capability={capability}
              isActive={isActive}
              onToggle={onToggle}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SystemBackdrop({
  capability,
  activeCapabilityId,
  systemMode,
  onlineCount,
  onlineSubsystemCount,
  onlineSubsystemIds,
  systemMemory,
  motionProfile,
  performanceState,
  pulseKey,
}: {
  capability: Capability;
  activeCapabilityId: CapabilityId | null;
  systemMode: SystemMode;
  onlineCount: number;
  onlineSubsystemCount: number;
  onlineSubsystemIds: SystemNodeId[];
  systemMemory: SystemMemory;
  motionProfile: MotionProfile;
  performanceState: PerformanceState;
  pulseKey: number;
}) {
  const motionEnergy = getMotionIntensity(motionProfile);
  const pulseDuration = getMotionPulseDuration(motionProfile);
  const onlineNodeSet = new Set(onlineSubsystemIds);
  const animateActive = activeCapabilityId === "animate";
  const performanceActive = activeCapabilityId === "performance";
  const readiness = systemMemory.readiness;
  const calmness = performanceState.calmness;
  const stability = performanceState.stability;
  const topologyHealth = performanceState.topologyHealth;
  const intensity =
    systemMode === "developer"
      ? 1
      : systemMode === "active"
        ? 0.78
        : systemMode === "primed"
          ? 0.48
          : 0.28;

  const nodes = [
    { x: 10, y: 22 },
    { x: 24, y: 38 },
    { x: 46, y: 28 },
    { x: 64, y: 44 },
    { x: 82, y: 30 },
    { x: 72, y: 72 },
    { x: 38, y: 74 },
    { x: 18, y: 64 },
  ];

  const links = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [1, 7],
    [2, 6],
    [3, 5],
    [6, 5],
  ] as const;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: systemMode === "developer" ? 0.22 : 0 }}
        transition={{ duration: 0.45, ease: EXPO }}
        style={{
          background:
            "linear-gradient(180deg, rgba(2,6,23,0.36) 0%, rgba(2,6,23,0.14) 100%)",
        }}
      />

      <motion.div
        className="absolute inset-0"
        animate={{
          opacity:
            systemMode === "developer"
              ? 0.38 + motionEnergy * 0.04 + readiness * 0.06 - calmness * 0.08
              : 0.82 +
                motionEnergy * 0.08 +
                readiness * 0.08 +
                (animateActive ? 0.05 : 0) -
                calmness * 0.12 +
                (performanceActive ? 0.02 : 0),
        }}
        style={{
          background: [
            `radial-gradient(ellipse ${56 + motionEnergy * 6 + (animateActive ? 4 : 0) - calmness * 4}% ${52 + motionEnergy * 5 + (animateActive ? 3 : 0) - calmness * 3}% at 14% 28%, ${capability.theme.accentSoft} 0%, transparent 58%)`,
            `radial-gradient(ellipse 50% 46% at 82% 70%, ${capability.theme.glow} 0%, transparent 54%)`,
            "radial-gradient(ellipse 36% 40% at 48% 50%, rgba(15,23,42,0.28) 0%, transparent 70%)",
          ].join(", "),
        }}
      />

      <motion.div
        className="absolute inset-0"
        animate={{
          opacity:
            0.12 +
            intensity * 0.14 +
            Math.min(0.18, motionEnergy * 0.12) +
            onlineSubsystemCount * 0.015 +
            readiness * 0.08 +
            (animateActive ? 0.04 : 0) +
            (systemMode === "developer" ? 0.08 : 0) +
            topologyHealth * 0.06,
          backgroundPosition:
            systemMode === "standby"
              ? "0px 0px, 0px 0px"
              : motionProfile.staggerEnabled
                ? "16px 12px, 12px 16px"
                : "10px 8px, 8px 10px",
        }}
        transition={{ duration: pulseDuration, ease: EXPO }}
        style={{
          backgroundImage: `linear-gradient(${capability.theme.grid} 1px, transparent 1px), linear-gradient(90deg, ${capability.theme.grid} 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />

      <motion.svg
        className="absolute inset-[8%] h-[84%] w-[84%]"
        viewBox="0 0 100 100"
        animate={{
          opacity:
            0.1 +
            intensity * 0.14 +
            Math.min(0.12, motionEnergy * 0.08) +
            onlineSubsystemCount * 0.012 +
            readiness * 0.06 +
            topologyHealth * 0.08,
        }}
        transition={{ duration: pulseDuration, ease: EXPO }}
      >
        {links.map(([fromIndex, toIndex]) => (
          <line
            key={`${fromIndex}-${toIndex}`}
            x1={nodes[fromIndex].x}
            y1={nodes[fromIndex].y}
            x2={nodes[toIndex].x}
            y2={nodes[toIndex].y}
            stroke={capability.theme.grid}
            strokeWidth="0.32"
          />
        ))}

        {nodes.map((node, index) => (
          <circle
            key={`${node.x}-${node.y}`}
            cx={node.x}
            cy={node.y}
            r={
              index < onlineSubsystemCount
                ? 1.35 + motionEnergy * 0.18
                : index < onlineCount + 1
                  ? 1.05
                  : 0.9
            }
            fill={
              index < onlineSubsystemCount
                ? capability.theme.accent
                : index < onlineCount + 1
                  ? "rgba(191,219,254,0.56)"
                  : "rgba(255,255,255,0.16)"
            }
          />
        ))}
      </motion.svg>

      <AnimatePresence initial={false}>
        {readiness > 0 && (
          <motion.div
            key="system-memory-aura"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.03 + readiness * 0.08 + calmness * 0.04 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EXPO }}
            style={{
              background:
                "radial-gradient(circle at 50% 48%, rgba(186,230,253,0.12) 0%, transparent 58%)",
            }}
          />
        )}

        {performanceState.optimizedCount > 0 && (
          <motion.div
            key="performance-clarity-field"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.02 + calmness * 0.08 + stability * 0.04 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EXPO }}
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 38%, rgba(191,219,254,0.04) 100%)",
            }}
          />
        )}

        {systemMode === "developer" && (
          <motion.svg
            key="developer-topology-field"
            className="absolute inset-[6%] h-[88%] w-[88%]"
            viewBox="0 0 100 100"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 0.16 + onlineSubsystemCount * 0.01 + readiness * 0.08, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.5, ease: EXPO }}
          >
            {SYSTEM_CONNECTIONS.map((connection) => {
              const from = getSystemNodeById(connection.from);
              const to = getSystemNodeById(connection.to);
              const online =
                onlineNodeSet.has(connection.from) && onlineNodeSet.has(connection.to);

              return (
                <line
                  key={`field-${connection.from}-${connection.to}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={online ? "rgba(186,230,253,0.18)" : "rgba(255,255,255,0.05)"}
                  strokeWidth={online ? "0.48" : "0.32"}
                />
              );
            })}

            {SYSTEM_NODES.map((node) => {
              const online = onlineNodeSet.has(node.id);

              return (
                <circle
                  key={`field-node-${node.id}`}
                  cx={node.x}
                  cy={node.y}
                  r={online ? 1.2 : 0.82}
                  fill={online ? capability.theme.accentStrong : "rgba(255,255,255,0.18)"}
                />
              );
            })}
          </motion.svg>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {pulseKey > 0 && (
          <motion.div
            key={`${capability.id}-${pulseKey}`}
            className="absolute inset-0"
            initial={{ opacity: 0.22 + motionEnergy * 0.16, scale: 0.94 }}
            animate={{ opacity: 0, scale: 1.04 + motionEnergy * 0.06 }}
            exit={{ opacity: 0 }}
            transition={{ duration: pulseDuration, ease: EXPO }}
            style={{
              background: `radial-gradient(circle at 56% 52%, ${capability.theme.accentSoft} 0%, transparent 58%)`,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusRail({
  capability,
  activeCapability,
  activeCapabilityId,
  systemMode,
  onlineCount,
  onlineSubsystemCount,
  systemMemory,
  motionProfile,
  performanceState,
  developerRouteAvailable,
  developerModeArmed,
}: {
  capability: Capability;
  activeCapability: Capability | null;
  activeCapabilityId: CapabilityId | null;
  systemMode: SystemMode;
  onlineCount: number;
  onlineSubsystemCount: number;
  systemMemory: SystemMemory;
  motionProfile: MotionProfile;
  performanceState: PerformanceState;
  developerRouteAvailable: boolean;
  developerModeArmed: boolean;
}) {
  const driverNode = getSystemNodeById(getPrimarySystemNodeId(activeCapabilityId));
  const motionFeel = getMotionFeel(motionProfile);
  const motionCadence = getMotionCadence(motionProfile);
  const motionResponse = getMotionResponse(motionProfile);
  const motionProfileLabel = getMotionProfileLabel(motionProfile);
  const motionLift = getMotionRailLift(motionProfile);
  const pulseDuration = getMotionPulseDuration(motionProfile);

  const items = developerModeArmed
    ? [
        { label: "system state", value: "developer" },
        {
          label: "active capability",
          value: activeCapability ? activeCapability.command : capability.command,
        },
        {
          label: "driver",
          value: driverNode.label,
        },
        {
          label: "wake level",
          value: `${systemMemory.wakeLevel} / ${systemMemory.readinessPercent}%`,
        },
        {
          label: "engine",
          value:
            activeCapabilityId === "animate"
              ? `${motionProfileLabel} / ${motionFeel}`
              : activeCapabilityId === "performance"
                ? `${performanceState.healthLabel} / ${performanceState.diagnostics}`
                : `${getSubsystemStatus(activeCapabilityId)} / ${motionFeel}`,
        },
      ]
    : [
        {
          label: "mode",
          value:
            systemMode === "developer"
              ? "privileged"
              : systemMode === "active"
                ? "subsystem online"
                : systemMode === "primed"
                  ? "subsystem primed"
                  : "standby",
        },
        {
          label: "focus",
          value: activeCapability ? activeCapability.status : `${capability.command} recommended`,
        },
        {
          label: "online",
          value: `${onlineCount} capabilities / ${onlineSubsystemCount} subsystems`,
        },
        {
          label:
            activeCapabilityId === "animate"
              ? "profile"
              : activeCapabilityId === "performance"
                ? "health"
              : developerRouteAvailable
                ? "route"
                : "motion",
          value:
            activeCapabilityId === "animate"
              ? `${motionProfileLabel} / ${motionCadence}`
              : activeCapabilityId === "performance"
                ? `${performanceState.healthLabel} / ${performanceState.topologyPercent}% topology`
                : developerRouteAvailable
                  ? "developer access available"
                  : `${motionCadence} / ${motionResponse}`,
        },
      ];

  return (
    <motion.div
      data-skills="status-rail"
      className={
        developerModeArmed
          ? "mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
          : "mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      }
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.22, ease: EXPO }}
    >
      {items.map((item, index) => {
        const primary = developerModeArmed
          ? item.label === "active capability"
          : item.label === "focus";
        const emphasized =
          item.label === "engine" ||
          item.label === "motion" ||
          item.label === "health" ||
          (activeCapabilityId === "animate" && item.label === "focus") ||
          primary;

        return (
        <motion.div
          key={item.label}
          className={`${primary ? "rounded-[18px] border px-4 py-3 sm:col-span-2 xl:col-span-2" : "rounded-[16px] border px-4 py-3"}`}
          animate={{
            y: primary ? -(motionLift + 0.8) : emphasized ? -motionLift : 0,
            scale: primary ? 1.014 : emphasized ? 1.01 : 1,
          }}
          transition={{
            duration: pulseDuration,
            delay: motionProfile.staggerEnabled ? index * 0.04 : 0,
            ease: EXPO,
          }}
          style={{
            borderColor:
              item.label === "mode" || item.label === "focus" || emphasized
                ? capability.theme.surface
                : "rgba(255,255,255,0.07)",
            background:
              primary
                ? "linear-gradient(180deg, rgba(8,13,28,0.80) 0%, rgba(5,9,20,0.68) 100%)"
                : "linear-gradient(180deg, rgba(8,13,28,0.72) 0%, rgba(5,9,20,0.60) 100%)",
            boxShadow: primary
              ? `0 ${12 + motionLift * 4}px ${26 + motionLift * 12}px rgba(2,6,23,0.22), 0 0 0 1px ${capability.theme.surface}`
              : emphasized
                ? `0 ${8 + motionLift * 4}px ${20 + motionLift * 10}px rgba(2,6,23,0.18), 0 0 0 1px ${capability.theme.surface}`
              : item.label === "mode"
                ? `0 0 0 1px ${capability.theme.surface}`
                : "none",
          }}
        >
          <div
            style={{
              ...MONO,
              fontSize: "0.50rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)",
            }}
          >
            {item.label}
          </div>
          <div
            style={{
              ...MONO,
              marginTop: 7,
              fontSize: primary ? "0.78rem" : "0.64rem",
              lineHeight: primary ? 1.45 : 1.5,
              color:
                item.label === "mode" || item.label === "focus" || emphasized
                  ? capability.theme.accentStrong
                  : "rgba(255,255,255,0.72)",
            }}
          >
            {item.value}
          </div>
        </motion.div>
      )})}
    </motion.div>
  );
}

function SystemMemoryRail({
  capability,
  systemMemory,
  developerModeArmed,
}: {
  capability: Capability;
  systemMemory: SystemMemory;
  developerModeArmed: boolean;
}) {
  const hasMemory = systemMemory.exploredCount > 0;

  return (
    <motion.div
      className="mb-6 overflow-hidden rounded-[18px] border px-4 py-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.28, ease: EXPO }}
      style={{
        borderColor: developerModeArmed ? "rgba(186,230,253,0.10)" : capability.theme.surface,
        background:
          "linear-gradient(180deg, rgba(8,13,28,0.66) 0%, rgba(5,9,20,0.56) 100%)",
        boxShadow: `0 0 0 1px ${developerModeArmed ? "rgba(186,230,253,0.05)" : capability.theme.surface}`,
      }}
    >
      <div className="grid gap-4 xl:grid-cols-[13rem_minmax(0,1fr)_minmax(16rem,0.95fr)] xl:items-center">
        <div>
          <div
            style={{
              ...MONO,
              fontSize: "0.50rem",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              color: "rgba(186,230,253,0.58)",
            }}
          >
            system memory
          </div>
          <div
            className="mt-2"
            style={{
              ...MONO,
              fontSize: "0.66rem",
              color: "rgba(255,255,255,0.76)",
            }}
          >
            {systemMemory.wakeLevel}
          </div>
          <div
            className="mt-1"
            style={{
              ...MONO,
              fontSize: "0.56rem",
              lineHeight: 1.65,
              color: "rgba(255,255,255,0.42)",
            }}
          >
            {systemMemory.maturity}
          </div>
        </div>

        <div>
          <div
            className="flex items-center justify-between gap-3"
            style={{
              ...MONO,
              fontSize: "0.52rem",
              color: "rgba(255,255,255,0.34)",
            }}
          >
            <span>subsystem readiness</span>
            <span style={{ color: "rgba(186,230,253,0.72)" }}>
              {systemMemory.readinessPercent}%
            </span>
          </div>
          <div
            className="mt-3 overflow-hidden rounded-full"
            style={{
              height: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${Math.max(systemMemory.exploredCount === 0 ? 10 : 16, systemMemory.readinessPercent)}%` }}
              transition={{ duration: 0.7, ease: EXPO }}
              style={{
                background: `linear-gradient(90deg, ${capability.theme.accent} 0%, ${capability.theme.accentStrong} 100%)`,
              }}
            />
          </div>
        </div>

        <div>
          <div
            style={{
              ...MONO,
              fontSize: "0.50rem",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              color: "rgba(186,230,253,0.56)",
            }}
          >
            activation history
          </div>
          {hasMemory ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {systemMemory.activationHistory.map((entry, index) => (
                <span
                  key={`${entry}-${index}`}
                  className="rounded-full border px-3 py-1"
                  style={{
                    ...MONO,
                    fontSize: "0.50rem",
                    borderColor: "rgba(125,211,252,0.10)",
                    color: "rgba(186,230,253,0.72)",
                    background: "rgba(125,211,252,0.05)",
                  }}
                >
                  {entry}
                </span>
              ))}
            </div>
          ) : (
            <div
              className="mt-2"
              style={{
                ...MONO,
                fontSize: "0.56rem",
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.34)",
              }}
            >
              The system is waiting for its first retained activation.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ShellMotionLayer({
  capability,
  activeCapabilityId,
  motionProfile,
  developerModeArmed,
  pulseKey,
}: {
  capability: Capability;
  activeCapabilityId: CapabilityId | null;
  motionProfile: MotionProfile;
  developerModeArmed: boolean;
  pulseKey: number;
}) {
  const motionEnergy = getMotionIntensity(motionProfile);
  const pulseDuration = getMotionPulseDuration(motionProfile);
  const animateActive = activeCapabilityId === "animate";
  const sweepDuration =
    pulseDuration + (motionProfile.staggerEnabled ? 0.18 : -0.06) + (motionProfile.hoverEnabled ? -0.04 : 0.05);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-x-0 top-0 h-px origin-left"
        animate={{
          opacity: 0.16 + motionEnergy * 0.2 + (animateActive ? 0.06 : 0),
          scaleX: motionProfile.staggerEnabled ? (animateActive ? 1.04 : 1) : 0.86,
        }}
        transition={{ duration: pulseDuration, ease: EXPO }}
        style={{
          background: `linear-gradient(90deg, ${capability.theme.accentSoft}, rgba(255,255,255,0.10), transparent 72%)`,
        }}
      />

      <AnimatePresence initial={false}>
        {animateActive && (
          <motion.div
            key="motion-engine-hum"
            className="absolute inset-[12%] rounded-[28px] border"
            animate={{
              opacity: [0.05, 0.12 + motionEnergy * 0.08, 0.05],
              scale: [0.994, 1.006 + motionEnergy * 0.01, 0.998],
            }}
            transition={{
              duration: pulseDuration + 0.44,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              borderColor: "rgba(125,211,252,0.10)",
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="absolute inset-y-0 left-0 w-[34%]"
        animate={{ opacity: 0.02 + motionEnergy * 0.05 + (animateActive ? 0.02 : 0) }}
        transition={{ duration: pulseDuration, ease: EXPO }}
        style={{
          background: `linear-gradient(90deg, ${capability.theme.surface} 0%, transparent 100%)`,
        }}
      />

      <motion.div
        className="absolute inset-y-0 right-0 w-[42%]"
        animate={{ opacity: developerModeArmed ? 0.02 + motionEnergy * 0.03 : 0.01 + motionEnergy * 0.025 }}
        transition={{ duration: pulseDuration, ease: EXPO }}
        style={{
          background: `linear-gradient(270deg, ${capability.theme.surface} 0%, transparent 100%)`,
        }}
      />

      <AnimatePresence mode="wait">
        {pulseKey > 0 && (
          <motion.div
            key={`shell-sweep-${pulseKey}`}
            className="absolute inset-y-[-10%] left-[-32%] w-[40%]"
            initial={{ opacity: 0, x: 0, rotate: -8 }}
            animate={{
              opacity: [0, 0.12 + motionEnergy * 0.12 + (animateActive ? 0.05 : 0), 0],
              x: motionProfile.staggerEnabled
                ? animateActive
                  ? "204%"
                  : "190%"
                : animateActive
                  ? "184%"
                  : "170%",
              rotate: -8,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: sweepDuration, ease: EXPO }}
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(186,230,253,0.18) 46%, rgba(255,255,255,0.08) 52%, transparent 100%)",
              filter: "blur(18px)",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DeveloperThresholdLayer({
  active,
  capability,
}: {
  active: boolean;
  capability: Capability;
}) {
  return (
    <AnimatePresence initial={false}>
      {active && (
        <motion.div
          key="developer-threshold"
          className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
        >
          <motion.div
            className="absolute inset-x-0 top-0 h-[54%] origin-top"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 1 }}
            transition={{ duration: 0.5, ease: EXPO }}
            style={{
              background:
                "linear-gradient(180deg, rgba(3,7,14,0.96) 0%, rgba(4,8,16,0.86) 62%, transparent 100%)",
            }}
          />

          <motion.div
            className="absolute inset-x-0 bottom-0 h-[54%] origin-bottom"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 1 }}
            transition={{ duration: 0.5, ease: EXPO }}
            style={{
              background:
                "linear-gradient(0deg, rgba(3,7,14,0.96) 0%, rgba(4,8,16,0.86) 62%, transparent 100%)",
            }}
          />

          <motion.div
            className="absolute inset-x-[16%] top-1/2 h-px -translate-y-1/2"
            initial={{ opacity: 0, scaleX: 0.42 }}
            animate={{ opacity: 0.34, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.5 }}
            transition={{ duration: 0.46, delay: 0.08, ease: EXPO }}
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${capability.theme.accentStrong} 50%, transparent 100%)`,
            }}
          />

          <motion.div
            className="absolute inset-[5%] rounded-[28px] border"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 0.42, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.48, delay: 0.06, ease: EXPO }}
            style={{
              borderColor: "rgba(186,230,253,0.10)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ShellCueLayer({
  cue,
}: {
  cue: OrchestrationCue | null;
}) {
  return (
    <AnimatePresence mode="wait">
      {cue && (
        <motion.div
          key={cue.key}
          className="pointer-events-none absolute inset-0 z-[18] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: EXPO }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.08, 0.12, 0.04] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: EXPO }}
            style={{
              background:
                "linear-gradient(180deg, rgba(4,8,16,0.30) 0%, transparent 28%, transparent 72%, rgba(4,8,16,0.24) 100%)",
            }}
          />

          <motion.div
            className="absolute inset-x-[12%] top-[15%] h-px"
            initial={{ opacity: 0, scaleX: 0.42 }}
            animate={{ opacity: 0.34, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.6 }}
            transition={{ duration: 0.5, ease: EXPO }}
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${cue.accent} 50%, transparent 100%)`,
            }}
          />

          <motion.div
            className="absolute inset-y-[16%] left-[-28%] w-[34%]"
            initial={{ opacity: 0, x: 0, rotate: -7 }}
            animate={{ opacity: [0, 0.16, 0], x: "212%", rotate: -7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.96, ease: EXPO }}
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 48%, transparent 100%)",
              filter: "blur(18px)",
            }}
          />

          <motion.div
            className="absolute left-1/2 top-[12%] w-full max-w-[32rem] -translate-x-1/2 px-6 text-center"
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.42, delay: 0.05, ease: EXPO }}
          >
            <div
              style={{
                ...MONO,
                fontSize: "0.50rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: cue.accent,
              }}
            >
              {cue.eyebrow}
            </div>
            <div
              className="mt-2"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.5rem,2.8vw,2.8rem)",
                lineHeight: 0.96,
                letterSpacing: "-0.03em",
                color: "rgba(255,255,255,0.90)",
              }}
            >
              {cue.title}
            </div>
            <div
              className="mx-auto mt-3 max-w-[28rem]"
              style={{
                ...MONO,
                fontSize: "0.58rem",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.42)",
              }}
            >
              {cue.detail}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SystemTopologyOverlay({
  developerModeActive,
  activeCapabilityId,
  displayCapability,
  exploredIds,
  systemMemory,
  motionProfile,
  performanceState,
  pulseKey,
  onClose,
}: {
  developerModeActive: boolean;
  activeCapabilityId: CapabilityId | null;
  displayCapability: Capability;
  exploredIds: CapabilityId[];
  systemMemory: SystemMemory;
  motionProfile: MotionProfile;
  performanceState: PerformanceState;
  pulseKey: number;
  onClose: () => void;
}) {
  const [hoveredNodeId, setHoveredNodeId] = useState<SystemNodeId | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<SystemNodeId | null>(null);

  const defaultNodeId = getPrimarySystemNodeId(activeCapabilityId ?? displayCapability.id);
  const focusedNodeId = selectedNodeId ?? hoveredNodeId ?? defaultNodeId;
  const focusedNode = getSystemNodeById(focusedNodeId);
  const onlineNodes = useMemo(
    () => new Set(getOnlineSubsystemIds(exploredIds)),
    [exploredIds],
  );
  const liveNodes = new Set(getActiveSystemNodes(activeCapabilityId ?? displayCapability.id));
  const motionEnergy = getMotionIntensity(motionProfile);
  const pulseDuration = getMotionPulseDuration(motionProfile);
  const motionEngineOnline = onlineNodes.has("motion-engine");
  const animateActive = activeCapabilityId === "animate";

  const downstream = useMemo(() => {
    const visited = new Set<SystemNodeId>([focusedNodeId]);
    const queue: SystemNodeId[] = [focusedNodeId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      SYSTEM_CONNECTIONS.forEach((connection) => {
        if (connection.from === current && !visited.has(connection.to)) {
          visited.add(connection.to);
          queue.push(connection.to);
        }
      });
    }

    return visited;
  }, [focusedNodeId]);

  const consumers = useMemo(
    () =>
      SYSTEM_CONNECTIONS.filter((connection) => connection.from === focusedNodeId).map(
        (connection) => getSystemNodeById(connection.to).label,
      ),
    [focusedNodeId],
  );

  const dependencies = useMemo(
    () =>
      SYSTEM_CONNECTIONS.filter((connection) => connection.to === focusedNodeId).map(
        (connection) => getSystemNodeById(connection.from).label,
      ),
    [focusedNodeId],
  );

  return (
    <motion.div
      className="mb-5 overflow-hidden rounded-[24px] border"
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={
        developerModeActive
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 10, filter: "blur(6px)" }
      }
      transition={{ duration: 0.45, ease: EXPO }}
      style={{
        borderColor: "rgba(125,211,252,0.14)",
        background:
          "linear-gradient(180deg, rgba(5,10,22,0.88) 0%, rgba(4,8,18,0.80) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(125,211,252,0.06)",
      }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="rounded-full border px-3 py-1"
            style={{
              ...MONO,
              fontSize: "0.50rem",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              borderColor: "rgba(125,211,252,0.12)",
              color: "rgba(186,230,253,0.72)",
              background: "rgba(125,211,252,0.06)",
            }}
          >
            topology view enabled
          </span>
          <span
            style={{
              ...MONO,
              fontSize: "0.54rem",
              color: "rgba(255,255,255,0.34)",
            }}
          >
            {systemMemory.wakeLevel} / {onlineNodes.size} of {SYSTEM_NODES.length} subsystems online
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            ...MONO,
            fontSize: "0.56rem",
            color: "rgba(255,255,255,0.42)",
            border: "none",
            background: "none",
            padding: 0,
            cursor: "pointer",
            letterSpacing: "0.06em",
          }}
        >
          [close system]
        </button>
      </div>

      <div className="grid gap-5 px-4 py-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)]">
        <div
          className="relative h-[420px] overflow-hidden rounded-[20px] border"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            background:
              "linear-gradient(180deg, rgba(7,12,26,0.72) 0%, rgba(5,9,20,0.66) 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(125,211,252,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(125,211,252,0.04) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
            {SYSTEM_CONNECTIONS.map((connection) => {
              const from = getSystemNodeById(connection.from);
              const to = getSystemNodeById(connection.to);
              const lit = downstream.has(connection.from) && downstream.has(connection.to);
              const online = onlineNodes.has(connection.from) && onlineNodes.has(connection.to);
              const motionLinked =
                connection.from === "motion-engine" || connection.to === "motion-engine";
              const performanceLinked =
                connection.from === "performance-pipeline" ||
                connection.to === "performance-pipeline" ||
                connection.from === "render-pipeline" ||
                connection.to === "render-pipeline";

              return (
                <line
                  key={`${connection.from}-${connection.to}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={
                    lit
                      ? "rgba(125,211,252,0.42)"
                      : performanceLinked && performanceState.optimizedCount > 0
                        ? `rgba(199,210,254,${0.12 + performanceState.topologyHealth * 0.18})`
                      : motionLinked && motionEngineOnline
                        ? `rgba(125,211,252,${0.14 + motionEnergy * 0.14})`
                      : online
                        ? "rgba(125,211,252,0.16)"
                        : "rgba(255,255,255,0.08)"
                  }
                  strokeWidth={
                    lit
                      ? "0.85"
                      : performanceLinked && performanceState.optimizedCount > 0
                        ? `${0.52 + performanceState.topologyHealth * 0.22}`
                      : motionLinked && motionEngineOnline
                        ? `${0.56 + motionEnergy * 0.18}`
                      : online
                          ? "0.65"
                          : "0.5"
                  }
                  style={{ transition: "all 0.24s ease" }}
                />
              );
            })}
          </svg>

          {SYSTEM_NODES.map((node) => {
            const active = node.id === focusedNodeId;
            const live = liveNodes.has(node.id);
            const online = onlineNodes.has(node.id);
            const impacted = downstream.has(node.id);
            const motionDriver = node.id === "motion-engine" && motionEngineOnline;
            const performanceDriver =
              (node.id === "performance-pipeline" || node.id === "render-pipeline") &&
              performanceState.optimizedCount > 0;

            return (
              <button
                key={node.id}
                type="button"
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onFocus={() => setHoveredNodeId(node.id)}
                onBlur={() => setHoveredNodeId(null)}
                onClick={() =>
                  setSelectedNodeId((current) => (current === node.id ? null : node.id))
                }
                style={{
                  ...MONO,
                  position: "absolute",
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: "translate(-50%, -50%)",
                  fontSize: "0.54rem",
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: `1px solid ${
                    active
                      ? "rgba(125,211,252,0.34)"
                      : performanceDriver
                        ? "rgba(199,210,254,0.20)"
                      : live
                        ? "rgba(125,211,252,0.20)"
                      : online
                          ? "rgba(186,230,253,0.14)"
                        : impacted
                          ? "rgba(255,255,255,0.12)"
                          : "rgba(255,255,255,0.06)"
                  }`,
                  background: active
                    ? "rgba(125,211,252,0.12)"
                    : performanceDriver
                      ? "rgba(165,180,252,0.08)"
                    : live
                      ? "rgba(125,211,252,0.08)"
                      : online
                        ? "rgba(125,211,252,0.05)"
                      : "rgba(255,255,255,0.03)",
                  color: active
                    ? "rgba(224,242,254,0.94)"
                    : performanceDriver
                      ? "rgba(224,231,255,0.84)"
                    : live
                      ? "rgba(191,219,254,0.82)"
                      : online
                        ? "rgba(186,230,253,0.68)"
                      : impacted
                        ? "rgba(255,255,255,0.60)"
                        : "rgba(255,255,255,0.28)",
                  boxShadow:
                    active || live || online || performanceDriver
                      ? "0 0 24px rgba(59,130,246,0.14)"
                      : "none",
                  transition: "all 0.24s ease",
                }}
              >
                {motionDriver && (
                  <motion.span
                    className="pointer-events-none absolute inset-[-8px] rounded-full"
                    animate={{
                      opacity: [0.12, 0.22 + motionEnergy * 0.1, 0.12],
                      scale: [0.98, 1.06 + motionEnergy * 0.04, 1],
                    }}
                    transition={{
                      duration: pulseDuration + (animateActive ? 0.08 : 0.24),
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      border: "1px solid rgba(125,211,252,0.16)",
                    }}
                  />
                )}

                {node.shortLabel}

                {live && (
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${node.id}-${pulseKey}`}
                      className="pointer-events-none absolute inset-[-4px] rounded-full"
                      initial={{ opacity: 0.45, scale: 0.9 }}
                      animate={{ opacity: 0, scale: 1.18 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: pulseDuration, ease: EXPO }}
                      style={{
                        border: "1px solid rgba(125,211,252,0.28)",
                      }}
                    />
                  </AnimatePresence>
                )}

                {performanceDriver && (
                  <motion.span
                    className="pointer-events-none absolute inset-[-7px] rounded-full"
                    animate={{
                      opacity: [0.08, 0.16 + performanceState.calmness * 0.08, 0.08],
                      scale: [0.98, 1.04 + performanceState.topologyHealth * 0.03, 1],
                    }}
                    transition={{
                      duration: 1.4 - performanceState.calmness * 0.28,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      border: "1px solid rgba(199,210,254,0.14)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3">
          <div
            className="rounded-[18px] border px-4 py-4"
            style={{
              borderColor: "rgba(125,211,252,0.12)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                ...MONO,
                fontSize: "0.50rem",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: "rgba(186,230,253,0.62)",
              }}
            >
              {focusedNode.label}
            </div>
            <p
              className="mt-3"
              style={{
                ...MONO,
                fontSize: "0.60rem",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.58)",
              }}
            >
              {focusedNode.controls}
            </p>
            <p
              className="mt-3"
              style={{
                ...MONO,
                fontSize: "0.58rem",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.44)",
              }}
            >
              {focusedNode.impact}
            </p>

            {exploredIds.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {exploredIds.map((capabilityId) => {
                  const capability = getCapabilityById(capabilityId);
                  if (!capability) {
                    return null;
                  }

                  return (
                    <span
                      key={capabilityId}
                      className="rounded-full border px-3 py-1"
                      style={{
                        ...MONO,
                        fontSize: "0.50rem",
                        borderColor: "rgba(125,211,252,0.12)",
                        color: "rgba(186,230,253,0.74)",
                        background: "rgba(125,211,252,0.06)",
                      }}
                    >
                      {capability.command} online
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div
            className="rounded-[18px] border px-4 py-4"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                ...MONO,
                fontSize: "0.50rem",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: "rgba(186,230,253,0.58)",
              }}
            >
              system maturity
            </div>
            <div
              className="mt-3"
              style={{
                ...MONO,
                fontSize: "0.60rem",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.64)",
              }}
            >
              {systemMemory.maturity}
            </div>
            <div
              className="mt-3"
              style={{
                ...MONO,
                fontSize: "0.54rem",
                color: "rgba(255,255,255,0.40)",
              }}
            >
              readiness: {systemMemory.readinessPercent}%
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {systemMemory.activationHistory.map((entry, index) => (
                <span
                  key={`topology-history-${entry}-${index}`}
                  className="rounded-full border px-3 py-1"
                  style={{
                    ...MONO,
                    fontSize: "0.48rem",
                    borderColor: "rgba(125,211,252,0.10)",
                    color: "rgba(186,230,253,0.72)",
                    background: "rgba(125,211,252,0.05)",
                  }}
                >
                  {entry}
                </span>
              ))}
            </div>
          </div>

          {[
            [
              "capabilities",
              focusedNode.capabilities.map((capabilityId) => getCapabilityById(capabilityId)?.command).join(", "),
            ],
            ["depends on", dependencies.length ? dependencies.join(", ") : "root layer"],
            ["consumers", consumers.length ? consumers.join(", ") : "terminal nodes"],
            ["impact radius", `${downstream.size - 1} downstream nodes`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[16px] border px-4 py-3"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div
                style={{
                  ...MONO,
                  fontSize: "0.50rem",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "rgba(186,230,253,0.58)",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  ...MONO,
                  marginTop: 6,
                  fontSize: "0.58rem",
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.64)",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function StandbyField({
  capability,
  activeCount,
}: {
  capability: Capability;
  activeCount: number;
}) {
  return (
    <div className="flex h-full min-h-[360px] flex-col justify-between">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div
          className="relative overflow-hidden rounded-[24px] border px-5 py-5"
          style={{
            borderColor: capability.theme.surface,
            background:
              "linear-gradient(180deg, rgba(8,13,28,0.76) 0%, rgba(5,10,22,0.64) 100%)",
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, ${capability.theme.accentSoft}, transparent 70%)`,
            }}
          />
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
            style={{
              ...MONO,
              fontSize: "0.54rem",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              borderColor: capability.theme.surface,
              color: capability.theme.accent,
              background: capability.theme.surface,
            }}
          >
            <span
              className="h-[6px] w-[6px] rounded-full"
              style={{ background: capability.theme.accent }}
            />
            {capability.status}
          </div>

          <div className="mt-5">
            <h3
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(2.2rem,4.2vw,4.4rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.035em",
                fontWeight: 800,
                color: "rgba(255,255,255,0.90)",
              }}
            >
              Start with {capability.title}.
            </h3>
            <p
              className="mt-4 max-w-[32rem]"
              style={{
                ...MONO,
                fontSize: "0.66rem",
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.44)",
              }}
            >
              This chapter is user-driven. Activate a subsystem from the terminal and
              the shell will respond before the explanation opens.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["primary path", "animate first"],
              ["current state", activeCount === 0 ? "standby" : `${activeCount} online`],
              ["next layer", "architecture and performance"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[14px] border px-4 py-3"
                style={{
                  borderColor: "rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div
                  style={{
                    ...MONO,
                    fontSize: "0.50rem",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.30)",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    ...MONO,
                    marginTop: 6,
                    fontSize: "0.60rem",
                    color: "rgba(255,255,255,0.72)",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {[
            ["curiosity", "enter through animate and let the shell answer first"],
            ["escalation", "architecture and performance reveal what the system is doing underneath"],
            ["proof", activeCount === 0 ? "projects wait downstream as shipped evidence" : "the next chapter turns activation into proof"],
          ].map(([label, value], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.06, ease: EXPO }}
              className="rounded-[16px] border px-4 py-3"
              style={{
                borderColor: index === 0 ? capability.theme.surface : "rgba(255,255,255,0.07)",
                background: index === 0 ? capability.theme.surface : "rgba(255,255,255,0.03)",
              }}
            >
              <div
                style={{
                  ...MONO,
                  fontSize: "0.50rem",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: index === 0 ? capability.theme.accentStrong : "rgba(255,255,255,0.30)",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  ...MONO,
                  marginTop: 6,
                  fontSize: "0.58rem",
                  lineHeight: 1.65,
                  color: index === 0 ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.48)",
                }}
              >
                {value}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoPanel({
  activeId,
  primedId,
  displayCapability,
  replayKey,
  pulseKey,
  activeCount,
  exploredIds,
  systemMemory,
  motionProfile,
  performanceProfile,
  performanceState,
  onAnimateProfileChange,
  onPerformanceProfileChange,
  developerModeArmed,
  onReplay,
  onCloseDeveloperMode,
}: {
  activeId: CapabilityId | null;
  primedId: CapabilityId | null;
  displayCapability: Capability;
  replayKey: number;
  pulseKey: number;
  activeCount: number;
  exploredIds: CapabilityId[];
  systemMemory: SystemMemory;
  motionProfile: MotionProfile;
  performanceProfile: PerformanceProfile;
  performanceState: PerformanceState;
  onAnimateProfileChange: Dispatch<SetStateAction<MotionProfile>>;
  onPerformanceProfileChange: Dispatch<SetStateAction<PerformanceProfile>>;
  developerModeArmed: boolean;
  onReplay: () => void;
  onCloseDeveloperMode: () => void;
}) {
  const activeCapability = getCapabilityById(activeId);
  const primedCapability = activeCapability ? null : getCapabilityById(primedId);
  const stageCapability = activeCapability ?? primedCapability;
  const onlineSubsystemCount = getOnlineSubsystemIds(exploredIds).length;
  const exploredCapabilities = exploredIds
    .map((capabilityId) => getCapabilityById(capabilityId))
    .filter((capability): capability is Capability => capability !== null);
  const activeDriverNode = stageCapability
    ? getSystemNodeById(getPrimarySystemNodeId(stageCapability.id))
    : null;

  return (
    <div className="flex h-full flex-col" data-skills="stage" data-cursor-interactive>
      <div className="mb-5 min-h-[7rem]">
        <AnimatePresence mode="wait">
          {developerModeArmed ? (
            <motion.div
              key="developer-mode"
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.42, ease: EXPO }}
            >
              <div
                style={{
                  ...MONO,
                  fontSize: "0.52rem",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: displayCapability.theme.accent,
                }}
              >
                system layer
              </div>
              <h2
                className="mt-3"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(2.6rem,5.2vw,5rem)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.035em",
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                Internal operating structure.
              </h2>
              <p
                className="mt-3 max-w-[40rem]"
                style={{
                  ...MONO,
                  fontSize: "clamp(0.70rem,1.02vw,0.82rem)",
                  lineHeight: 1.75,
                  color: "rgba(255,255,255,0.42)",
                }}
              >
                The visible shell has stepped aside. Wake level is {systemMemory.wakeLevel} and{" "}
                {exploredIds.length} explored capabilities are now internalized as{" "}
                {onlineSubsystemCount} online subsystems.
              </p>
            </motion.div>
          ) : stageCapability ? (
            <motion.div
              key={stageCapability.id}
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.42, ease: EXPO }}
            >
              <div
                style={{
                  ...MONO,
                  fontSize: "0.52rem",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: stageCapability.theme.accent,
                }}
              >
                {stageCapability.status}
              </div>
              <h2
                className="mt-3"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(2.6rem,5.2vw,5rem)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.035em",
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                {stageCapability.title}
              </h2>
              <p
                className="mt-3 max-w-[36rem]"
                style={{
                  ...MONO,
                  fontSize: "clamp(0.70rem,1.02vw,0.82rem)",
                  lineHeight: 1.75,
                  color: "rgba(255,255,255,0.42)",
                }}
              >
                {stageCapability.statement}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="standby"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div
                style={{
                  ...MONO,
                  fontSize: "0.52rem",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: displayCapability.theme.accent,
                }}
              >
                capability engine
              </div>
              <h2
                className="mt-3"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(2.6rem,5.2vw,5rem)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.035em",
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                Living frontend system.
              </h2>
              <p
                className="mt-3 max-w-[36rem]"
                style={{
                  ...MONO,
                  fontSize: "clamp(0.70rem,1.02vw,0.82rem)",
                  lineHeight: 1.75,
                  color: "rgba(255,255,255,0.42)",
                }}
              >
                The environment is in standby. The first tactile path is{" "}
                {displayCapability.command}.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className="rounded-[26px] border p-4 sm:p-5"
        style={{
          borderColor: developerModeArmed
            ? "rgba(186,230,253,0.10)"
            : stageCapability
              ? stageCapability.theme.surface
              : displayCapability.theme.surface,
          background:
            developerModeArmed
              ? "linear-gradient(180deg, rgba(5,9,18,0.92) 0%, rgba(4,8,16,0.86) 100%)"
              : "linear-gradient(180deg, rgba(8,13,28,0.78) 0%, rgba(5,10,22,0.66) 100%)",
          boxShadow: developerModeArmed
            ? "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(186,230,253,0.06)"
            : `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px ${
                stageCapability ? stageCapability.theme.surface : displayCapability.theme.surface
              }`,
        }}
      >
        <AnimatePresence initial={false}>
          {developerModeArmed && (
            <SystemTopologyOverlay
              developerModeActive={developerModeArmed}
              activeCapabilityId={activeId}
              displayCapability={displayCapability}
              exploredIds={exploredIds}
              systemMemory={systemMemory}
              motionProfile={motionProfile}
              performanceState={performanceState}
              pulseKey={pulseKey}
              onClose={onCloseDeveloperMode}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {stageCapability ? (
            <motion.div
              key={stageCapability.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: EXPO }}
            >
              <div
                className={
                  developerModeArmed
                    ? "mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]"
                    : undefined
                }
              >
                <div
                  className={
                    developerModeArmed
                      ? "rounded-[22px] border px-4 py-4"
                      : undefined
                  }
                  style={
                    developerModeArmed
                      ? {
                          borderColor: "rgba(255,255,255,0.07)",
                          background:
                            "linear-gradient(180deg, rgba(7,12,26,0.52) 0%, rgba(5,9,20,0.42) 100%)",
                          boxShadow: "0 12px 40px rgba(2,6,23,0.18)",
                        }
                      : undefined
                  }
                >
                  {developerModeArmed && (
                    <div
                      className="mb-4 flex items-center justify-between gap-3"
                      style={{
                        ...MONO,
                        fontSize: "0.52rem",
                        letterSpacing: "0.10em",
                        textTransform: "uppercase",
                        color: "rgba(186,230,253,0.56)",
                      }}
                    >
                      <span>live subsystem viewport</span>
                      <span style={{ color: "rgba(255,255,255,0.34)" }}>
                        {stageCapability.command}
                      </span>
                    </div>
                  )}

                  {stageCapability.id === "animate" && (
                    <AnimateCardDemo
                      key={`animate-${replayKey}`}
                      profile={motionProfile}
                      onProfileChange={onAnimateProfileChange}
                    />
                  )}
                  {stageCapability.id === "architecture" && (
                    <ArchitectureDemo
                      key={`architecture-${replayKey}`}
                      developerModeArmed={developerModeArmed}
                    />
                  )}
                  {stageCapability.id === "performance" && (
                    <PerformanceDemo
                      key={`performance-${replayKey}`}
                      profile={performanceProfile}
                      performanceState={performanceState}
                      onProfileChange={onPerformanceProfileChange}
                    />
                  )}
                  {stageCapability.id === "build" && (
                    <BuildDemo key={`build-${replayKey}`} />
                  )}
                  {stageCapability.id === "engineer" && (
                    <EngineerDemo key={`engineer-${replayKey}`} />
                  )}
                </div>

                {developerModeArmed && (
                  <div className="grid gap-3">
                    {[ 
                      ["active subsystem", stageCapability.command],
                      ["driver", activeDriverNode?.label ?? "dispatcher"],
                      ["wake level", `${systemMemory.wakeLevel} / ${systemMemory.readinessPercent}%`],
                      ["system memory", `${exploredCapabilities.length} capabilities internalized`],
                      ["online state", `${onlineSubsystemCount} subsystems online`],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-[16px] border px-4 py-3"
                        style={{
                          borderColor: "rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.03)",
                        }}
                      >
                        <div
                          style={{
                            ...MONO,
                            fontSize: "0.50rem",
                            letterSpacing: "0.10em",
                            textTransform: "uppercase",
                            color: "rgba(186,230,253,0.58)",
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            ...MONO,
                            marginTop: 6,
                            fontSize: "0.58rem",
                            lineHeight: 1.65,
                            color: "rgba(255,255,255,0.68)",
                          }}
                        >
                          {value}
                        </div>
                      </div>
                    ))}

                    <div
                      className="rounded-[16px] border px-4 py-3"
                      style={{
                        borderColor: "rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <div
                        style={{
                          ...MONO,
                          fontSize: "0.50rem",
                          letterSpacing: "0.10em",
                          textTransform: "uppercase",
                          color: "rgba(186,230,253,0.58)",
                        }}
                      >
                        explored
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {exploredCapabilities.map((capability) => (
                          <span
                            key={`memory-${capability.id}`}
                            className="rounded-full border px-3 py-1"
                            style={{
                              ...MONO,
                              fontSize: "0.50rem",
                              borderColor: "rgba(125,211,252,0.10)",
                              color: "rgba(186,230,253,0.74)",
                              background: "rgba(125,211,252,0.05)",
                            }}
                          >
                            {capability.command}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <StandbyField capability={displayCapability} activeCount={activeCount} />
          )}
        </AnimatePresence>

        <div className="mt-5 flex flex-wrap gap-2">
          {CAPABILITIES.map((capability) => {
            const active = capability.id === activeId;
            const explored = exploredIds.includes(capability.id);
            const primed = !active && capability.id === primedId;

            return (
              <span
                key={capability.id}
                className="rounded-full border px-3 py-1.5"
                style={{
                  ...MONO,
                  fontSize: "0.52rem",
                  borderColor: active
                    ? capability.theme.surface
                    : primed
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(255,255,255,0.07)",
                  color: active
                    ? capability.theme.accentStrong
                    : primed
                      ? "rgba(255,255,255,0.66)"
                      : explored
                        ? "rgba(134,239,172,0.68)"
                        : "rgba(255,255,255,0.34)",
                  background: active
                    ? capability.theme.surface
                    : "rgba(255,255,255,0.02)",
                }}
              >
                {explored ? `${String(exploredIds.indexOf(capability.id) + 1).padStart(2, "0")} ` : ""}
                {capability.command}
                {explored ? " *" : ""}
              </span>
            );
          })}
        </div>
      </div>

      {stageCapability && (
        <button
          type="button"
          onClick={onReplay}
          className="mt-3 self-start"
          style={{
            ...MONO,
            fontSize: "0.60rem",
            color: C.comment,
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            letterSpacing: "0.05em",
            transition: "color 0.24s ease",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.color = displayCapability.theme.accentStrong;
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.color = C.comment;
          }}
        >
          [replay subsystem]
        </button>
      )}
    </div>
  );
}

function ProjectsBridge({ allExplored }: { allExplored: boolean }) {
  const handleScroll = () => {
    const element = document.getElementById("projects");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.div
      data-skills="projects-bridge"
      className="mt-[clamp(3rem,5vw,5rem)] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.32, ease: EXPO }}
    >
      <p
        style={{
          ...MONO,
          fontSize: "clamp(0.74rem,1.02vw,0.84rem)",
          lineHeight: 1.7,
          color: "rgba(255,255,255,0.32)",
        }}
      >
        {allExplored
          ? "All systems mapped. The next chapter is shipped proof."
          : "The engine is awake. The next chapter is shipped proof."}
      </p>

      <button
        type="button"
        onClick={handleScroll}
        style={{
          ...MONO,
          fontSize: "0.72rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "rgba(147,197,253,0.72)",
          border: "none",
          background: "none",
          padding: 0,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.color = "rgba(186,230,253,0.96)";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.color = "rgba(147,197,253,0.72)";
        }}
      >
        inspect deployed proof
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          -&gt;
        </motion.span>
      </button>
    </motion.div>
  );
}

function Terminal({
  terminalRef,
  isVisible,
  activeId,
  primedId,
  displayCapability,
  systemMode,
  motionProfile,
  performanceState,
  developerHintVisible,
  developerModeArmed,
  onCapabilityPrime,
  onCapabilityLeave,
  onCapabilityFocus,
  onDeveloperModeArm,
  onDeveloperModeClose,
  onSessionComplete,
}: {
  terminalRef: RefObject<HTMLDivElement | null>;
  isVisible: boolean;
  activeId: CapabilityId | null;
  primedId: CapabilityId | null;
  displayCapability: Capability;
  systemMode: SystemMode;
  motionProfile: MotionProfile;
  performanceState: PerformanceState;
  developerHintVisible: boolean;
  developerModeArmed: boolean;
  onCapabilityPrime: (id: CapabilityId) => void;
  onCapabilityLeave: () => void;
  onCapabilityFocus: (id: CapabilityId) => void;
  onDeveloperModeArm: () => void;
  onDeveloperModeClose: () => void;
  onSessionComplete: () => void;
}) {
  const bootStartedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const eventIdRef = useRef(0);
  const [bootPhase, setBootPhase] = useState<BootPhase>("idle");
  const [bootTyped, setBootTyped] = useState("");
  const [outputStep, setOutputStep] = useState(0);
  const [executingId, setExecutingId] = useState<CapabilityId | null>(null);
  const [commandInput, setCommandInput] = useState("");
  const [systemEvents, setSystemEvents] = useState<
    Array<{
      id: number;
      command: string | null;
      promptPath: string;
      response: string;
      tone: "success" | "error" | "accent";
    }>
  >([]);
  const [renderedIds, setRenderedIds] = useState<CapabilityId[]>([]);
  const [completedIds, setCompletedIds] = useState<CapabilityId[]>([]);
  const [expandedIds, setExpandedIds] = useState<CapabilityId[]>([]);

  useEffect(() => {
    if (!isVisible || bootStartedRef.current) {
      return;
    }

    bootStartedRef.current = true;
    const fullCommand = "capability-engine --init";
    setBootPhase("typing");
    let index = 0;

    const typing = window.setInterval(() => {
      index += 1;
      setBootTyped(fullCommand.slice(0, index));

      if (index >= fullCommand.length) {
        window.clearInterval(typing);
        setBootPhase("output");
      }
    }, 28);

    return () => window.clearInterval(typing);
  }, [isVisible]);

  useEffect(() => {
    if (bootPhase !== "output") {
      return;
    }

    const timeouts = [
      window.setTimeout(() => setOutputStep(1), 120),
      window.setTimeout(() => setOutputStep(2), 280),
      window.setTimeout(() => setOutputStep(3), 460),
      window.setTimeout(() => setBootPhase("ready"), 620),
    ];

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [bootPhase]);

  useEffect(() => {
    if (bootPhase !== "ready") {
      return;
    }

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 60);

    return () => window.clearTimeout(timeout);
  }, [bootPhase]);

  const allCompleted = completedIds.length === CAPABILITY_COUNT;
  const pillsReady = bootPhase === "ready" && executingId === null;
  const motionFeel = getMotionFeel(motionProfile);
  const motionCadence = getMotionCadence(motionProfile);
  const motionResponse = getMotionResponse(motionProfile);
  const motionEnergy = getMotionIntensity(motionProfile);
  const cursorDuration = getMotionCursorDuration(motionProfile);
  const motionProfileLabel = getMotionProfileLabel(motionProfile);
  const promptPath = developerModeArmed ? ":~/system$" : ":~$";
  const shellLabel = developerModeArmed ? "matteo@portfolio / system layer" : "matteo@portfolio / capability-engine";
  const guidedSignals = developerModeArmed
    ? [
        `state: developer`,
        `driver: ${displayCapability.command}`,
        `wake: ${performanceState.topologyPercent}% topology`,
      ]
    : activeId === "animate"
      ? [
          `profile: ${motionProfileLabel}`,
          `cadence: ${motionCadence}`,
          `response: ${motionResponse}`,
        ]
      : activeId === "performance"
        ? [
            `health: ${performanceState.healthLabel}`,
            `stability: ${performanceState.stabilityPercent}%`,
            `calmness: ${performanceState.calmnessPercent}%`,
          ]
        : [
            `wake: ${systemMode}`,
            `memory: ${completedIds.length}/${CAPABILITY_COUNT}`,
            developerHintVisible ? "route: developer access available" : `motion: ${motionFeel}`,
          ];

  const renderedCapabilities = useMemo(
    () => CAPABILITIES.filter((capability) => renderedIds.includes(capability.id)),
    [renderedIds],
  );

  const pushSystemEvent = useCallback(
    (
      command: string | null,
      eventPromptPath: string,
      response: string,
      tone: "success" | "error" | "accent",
    ) => {
      eventIdRef.current += 1;
      setSystemEvents((current) => [
        ...current,
        { id: eventIdRef.current, command, promptPath: eventPromptPath, response, tone },
      ]);
    },
    [],
  );

  const pushSystemSequence = useCallback(
    (
      items: Array<{
        command: string | null;
        promptPath: string;
        response: string;
        tone: "success" | "error" | "accent";
        delay: number;
      }>,
    ) => {
      items.forEach((item) => {
        window.setTimeout(() => {
          pushSystemEvent(item.command, item.promptPath, item.response, item.tone);
        }, item.delay);
      });
    },
    [pushSystemEvent],
  );

  const executeCapabilityCommand = useCallback(
    (id: CapabilityId, source: "input" | "shortcut") => {
      if (!pillsReady) {
        return;
      }

      onCapabilityFocus(id);

      if (completedIds.includes(id)) {
        setExpandedIds((current) => (current.includes(id) ? current : [...current, id]));
        if (source === "input") {
          pushSystemEvent(
            id,
            promptPath,
            `reopening ${getCapabilityById(id)?.status ?? id}`,
            "accent",
          );
        }
        return;
      }

      setRenderedIds((current) => (current.includes(id) ? current : [...current, id]));
      setExecutingId(id);
      if (source === "input") {
        pushSystemEvent(
          id,
          promptPath,
          `routing to ${getCapabilityById(id)?.status ?? id}`,
          "accent",
        );
      }
    },
    [completedIds, onCapabilityFocus, pillsReady, promptPath, pushSystemEvent],
  );

  const handleCommandDone = useCallback(
    (id: CapabilityId) => {
      setCompletedIds((current) => {
        const next = current.includes(id) ? current : [...current, id];
        if (next.length === CAPABILITY_COUNT) {
          onSessionComplete();
        }
        return next;
      });

      setExpandedIds((current) => (current.includes(id) ? current : [...current, id]));
      setExecutingId(null);
    },
    [onSessionComplete],
  );

  const executeTerminalCommand = useCallback(
    (rawCommand: string, source: "input" | "shortcut") => {
      const normalized = rawCommand.trim().toLowerCase();

      if (!normalized) {
        return;
      }

      const capability = CAPABILITIES.find((item) => item.command === normalized);
      if (capability) {
        executeCapabilityCommand(capability.id, source);
        return;
      }

      if (normalized === DEVELOPER_COMMAND) {
        if (developerModeArmed) {
          pushSystemEvent(normalized, promptPath, "system layer already engaged", "accent");
          return;
        }
        onDeveloperModeArm();
        pushSystemSequence([
          {
            command: normalized,
            promptPath,
            response: "privileged context granted",
            tone: "accent",
            delay: 0,
          },
          {
            command: null,
            promptPath: ":~/system$",
            response: "peeling back shell surface",
            tone: "accent",
            delay: 140,
          },
          {
            command: null,
            promptPath: ":~/system$",
            response: "internal topology now primary",
            tone: "success",
            delay: 280,
          },
        ]);
        return;
      }

      if (normalized === CLOSE_DEVELOPER_COMMAND) {
        if (!developerModeArmed) {
          pushSystemEvent(normalized, promptPath, "system layer already sealed", "error");
          return;
        }
        onDeveloperModeClose();
        pushSystemSequence([
          {
            command: normalized,
            promptPath,
            response: "closing privileged context",
            tone: "accent",
            delay: 0,
          },
          {
            command: null,
            promptPath: ":~$",
            response: "capability shell restored",
            tone: "success",
            delay: 160,
          },
        ]);
        return;
      }

      pushSystemEvent(normalized, promptPath, "command unavailable in guided mode", "error");
    },
    [
      developerModeArmed,
      executeCapabilityCommand,
      onDeveloperModeArm,
      onDeveloperModeClose,
      promptPath,
      pushSystemEvent,
      pushSystemSequence,
    ],
  );

  const handleToggle = useCallback(
    (id: CapabilityId) => {
      setExpandedIds((current) => {
        const open = current.includes(id);
        if (open) {
          return current.filter((value) => value !== id);
        }
        onCapabilityFocus(id);
        return [...current, id];
      });
    },
    [onCapabilityFocus],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!pillsReady) {
        return;
      }
      executeTerminalCommand(commandInput, "input");
      setCommandInput("");
    },
    [commandInput, executeTerminalCommand, pillsReady],
  );

  return (
    <motion.div
      ref={terminalRef}
      data-skills="terminal"
      data-cursor-interactive
      className="w-full overflow-hidden rounded-[24px] border"
      style={{
        background:
          "linear-gradient(180deg, rgba(6,12,26,0.90) 0%, rgba(4,9,20,0.82) 100%)",
        borderColor:
          systemMode === "standby"
            ? "rgba(255,255,255,0.08)"
            : displayCapability.theme.surface,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px ${displayCapability.theme.surface}, 0 18px ${40 + motionEnergy * 26}px rgba(2,6,23,0.18)`,
        backdropFilter: "blur(12px)",
      }}
      initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
      animate={isVisible ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 1, delay: 0.12, ease: EXPO }}
    >
      <div
        className="flex items-center justify-between gap-4 border-b px-4 py-3"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          background: developerModeArmed ? "rgba(5,10,20,0.72)" : "rgba(6,12,26,0.58)",
        }}
      >
        <div className="flex items-center gap-[7px]">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="rounded-full"
              style={{
                width: 10,
                height: 10,
                background: index === 0 ? displayCapability.theme.accent : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
          <span
            className="ml-2"
            style={{
              ...MONO,
              fontSize: "0.62rem",
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.30)",
            }}
          >
            {shellLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {developerModeArmed && (
            <span
              className="rounded-full border px-2.5 py-1"
              style={{
                ...MONO,
                fontSize: "0.50rem",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                borderColor: "rgba(186,230,253,0.12)",
                color: "rgba(186,230,253,0.78)",
                background: "rgba(125,211,252,0.06)",
              }}
            >
              privileged
            </span>
          )}
          <div
            style={{
              ...MONO,
              fontSize: "0.56rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: displayCapability.theme.accent,
            }}
          >
            {developerModeArmed
              ? activeId === "performance"
                ? `health / ${performanceState.healthLabel}`
                : `topology / ${motionFeel}`
              : activeId === "animate"
                ? `${motionProfileLabel} / ${motionCadence}`
                : activeId === "performance"
                  ? `${performanceState.healthLabel} / ${performanceState.diagnostics}`
                : displayCapability.status}
          </div>
        </div>
      </div>

      <div
        className="px-5 py-5 sm:px-6 sm:py-6"
        style={{
          ...MONO,
          fontSize: "clamp(0.70rem, 1vw, 0.78rem)",
          color: "rgba(255,255,255,0.64)",
        }}
      >
        <div className="flex items-center gap-x-[0.38em]">
          <span style={{ color: C.user }}>matteo@portfolio</span>
          <span style={{ color: C.path }}>{promptPath}</span>
          {bootPhase !== "idle" && <span style={{ color: C.cmd }}>{bootTyped}</span>}
          {(bootPhase === "idle" || bootPhase === "typing") && (
            <span
              className="terminal-cursor"
              style={{ color: C.cursor, animationDuration: `${cursorDuration}s` }}
            >
              |
            </span>
          )}
        </div>

        <AnimatePresence>
          {outputStep >= 1 && (
            <motion.p
              key="output-1"
              className="mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.22 }}
              style={{ color: C.comment }}
            >
              {">"} capability engine online
            </motion.p>
          )}

          {outputStep >= 2 && (
            <motion.p
              key="output-2"
              className="mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.22 }}
              style={{ color: C.comment }}
            >
              {">"} primary tactile path: animate
            </motion.p>
          )}

          {outputStep >= 3 && (
            <motion.p
              key="output-3"
              className="mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.22 }}
              style={{ color: C.comment }}
            >
              {">"} activate a subsystem to wake the entire shell
            </motion.p>
          )}
        </AnimatePresence>

        {bootPhase === "ready" && (
          <div className="mt-4">
            <form onSubmit={handleSubmit}>
              <motion.div
                className="flex items-center gap-3 rounded-[18px] border px-4 py-3"
                animate={{
                  y: activeId === "animate" ? -1.5 : 0,
                  boxShadow:
                    activeId === "animate" || developerModeArmed || activeId === "performance"
                      ? `0 ${
                          8 +
                          motionEnergy * 6 -
                          performanceState.calmness * 1.5
                        }px ${
                          18 +
                          motionEnergy * 16 -
                          performanceState.stability * 10
                        }px rgba(2,6,23,0.14)`
                      : "none",
                }}
                transition={{ duration: getMotionPulseDuration(motionProfile), ease: EXPO }}
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  background:
                    activeId === "animate" || developerModeArmed
                      ? "rgba(125,211,252,0.04)"
                      : activeId === "performance"
                        ? `rgba(199,210,254,${0.035 + performanceState.calmness * 0.04})`
                      : "rgba(255,255,255,0.02)",
                }}
              >
                <span
                  style={{
                    ...MONO,
                    fontSize: "0.54rem",
                    color: "rgba(186,230,253,0.62)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  run
                </span>
                <input
                  ref={inputRef}
                  value={commandInput}
                  onChange={(event) => setCommandInput(event.target.value)}
                  placeholder="animate | build | architecture | performance | engineer | open system | close system"
                  disabled={!pillsReady}
                  className="w-full bg-transparent outline-none placeholder:text-white/20"
                  style={{
                    ...MONO,
                    fontSize: "0.62rem",
                    color: "rgba(255,255,255,0.84)",
                  }}
                />
                <button
                  type="submit"
                  disabled={!pillsReady || commandInput.trim().length === 0}
                  style={{
                    ...MONO,
                    fontSize: "0.54rem",
                    borderRadius: 999,
                    padding: "5px 10px",
                    border: "1px solid rgba(125,211,252,0.16)",
                    background: "rgba(125,211,252,0.06)",
                    color: pillsReady ? "rgba(186,230,253,0.80)" : "rgba(255,255,255,0.26)",
                    letterSpacing: "0.06em",
                  }}
                >
                  enter
                </button>
              </motion.div>
            </form>

            <div
              className="mt-3"
              style={{
                ...MONO,
                fontSize: "0.52rem",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.24)",
              }}
            >
              guided commands
            </div>

            <div
              className="mt-2 flex flex-wrap gap-x-4 gap-y-1"
              style={{
                ...MONO,
                fontSize: "0.52rem",
                color: "rgba(255,255,255,0.28)",
              }}
            >
              {guidedSignals.map((signal) => (
                <span key={signal}>{signal}</span>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {CAPABILITIES.map((capability) => {
                const completed = completedIds.includes(capability.id);
                const active = activeId === capability.id;
                const primed = primedId === capability.id && !activeId;
                const isTyping = executingId === capability.id;

                return (
                  <button
                    key={capability.id}
                    type="button"
                    onMouseEnter={() => pillsReady && onCapabilityPrime(capability.id)}
                    onMouseLeave={() => pillsReady && onCapabilityLeave()}
                    onFocus={() => pillsReady && onCapabilityPrime(capability.id)}
                    onBlur={() => pillsReady && onCapabilityLeave()}
                    onClick={() => executeTerminalCommand(capability.command, "shortcut")}
                    disabled={!pillsReady && !completed}
                    style={{
                      ...MONO,
                      fontSize: "0.56rem",
                      borderRadius: 999,
                      padding: "6px 12px",
                      letterSpacing: "0.06em",
                      border: `1px solid ${
                        active
                          ? capability.theme.surface
                          : primed
                            ? "rgba(255,255,255,0.12)"
                            : "rgba(255,255,255,0.08)"
                      }`,
                      background: active
                        ? capability.theme.surface
                        : capability.recommended
                          ? "rgba(125,211,252,0.06)"
                          : "rgba(255,255,255,0.02)",
                      color: completed
                        ? "rgba(134,239,172,0.74)"
                        : isTyping
                          ? "rgba(255,255,255,0.42)"
                          : active
                            ? capability.theme.accentStrong
                            : capability.recommended
                              ? capability.theme.accent
                              : "rgba(255,255,255,0.48)",
                      cursor: pillsReady || completed ? "pointer" : "default",
                      transition: "all 0.24s ease",
                      boxShadow: active ? `0 0 18px ${capability.theme.glow}` : "none",
                    }}
                  >
                    {capability.command}
                    {capability.recommended ? " / first" : ""}
                    {completed ? " *" : ""}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => executeTerminalCommand(DEVELOPER_COMMAND, "shortcut")}
                disabled={!pillsReady}
                style={{
                  ...MONO,
                  fontSize: "0.56rem",
                  borderRadius: 999,
                  padding: "6px 12px",
                  letterSpacing: "0.06em",
                  border: "1px solid rgba(186,230,253,0.10)",
                  background: "rgba(125,211,252,0.03)",
                  color: developerModeArmed
                    ? "rgba(186,230,253,0.82)"
                    : "rgba(255,255,255,0.42)",
                }}
              >
                {DEVELOPER_COMMAND}
              </button>
              {developerModeArmed && (
                <button
                  type="button"
                  onClick={() => executeTerminalCommand(CLOSE_DEVELOPER_COMMAND, "shortcut")}
                  disabled={!pillsReady}
                  style={{
                    ...MONO,
                    fontSize: "0.56rem",
                    borderRadius: 999,
                    padding: "6px 12px",
                    letterSpacing: "0.06em",
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.50)",
                  }}
                >
                  {CLOSE_DEVELOPER_COMMAND}
                </button>
              )}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {developerHintVisible && !developerModeArmed && (
            <motion.div
              key="developer-hint"
              className="mt-4 rounded-[16px] border px-4 py-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: EXPO }}
              style={{
                borderColor: "rgba(186,230,253,0.10)",
                background: "rgba(125,211,252,0.04)",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div style={{ fontSize: "0.60rem", color: "rgba(255,255,255,0.40)" }}>
                    {">"} privileged route detected
                  </div>
                  <div style={{ fontSize: "0.56rem", color: "rgba(255,255,255,0.24)" }}>
                    guided access only
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => executeTerminalCommand(DEVELOPER_COMMAND, "shortcut")}
                  style={{
                    ...MONO,
                    fontSize: "0.56rem",
                    borderRadius: 999,
                    padding: "6px 12px",
                    border: "1px solid rgba(186,230,253,0.14)",
                    background: "rgba(125,211,252,0.06)",
                    color: "rgba(186,230,253,0.82)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {DEVELOPER_COMMAND}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {systemEvents.map((event) => (
          <div key={event.id} className="mt-4">
            {event.command && (
              <div className="flex items-center gap-x-[0.38em]">
                <span style={{ color: C.user }}>matteo@portfolio</span>
                <span style={{ color: C.path }}>{event.promptPath}</span>
                <span style={{ color: C.cmd }}>{event.command}</span>
              </div>
            )}
            <p
              className={event.command ? "mt-1" : "mt-0"}
              style={{
                fontSize: "0.58rem",
                color:
                  event.tone === "success"
                    ? "rgba(134,239,172,0.62)"
                    : event.tone === "error"
                      ? "rgba(248,113,113,0.62)"
                      : "rgba(186,230,253,0.58)",
              }}
            >
              {">"} {event.response}
            </p>
          </div>
        ))}

        {renderedCapabilities.map((capability) => (
          <CommandEntry
            key={capability.id}
            capability={capability}
            isTyping={executingId === capability.id}
            isOpen={expandedIds.includes(capability.id)}
            isActive={activeId === capability.id}
            promptPath={promptPath}
            motionProfile={motionProfile}
            onDone={handleCommandDone}
            onToggle={handleToggle}
          />
        ))}

        {bootPhase === "ready" && executingId === null && !allCompleted && (
          <div className="mt-4 flex items-center gap-x-[0.38em]">
            <span style={{ color: C.user }}>matteo@portfolio</span>
            <span style={{ color: C.path }}>{promptPath}</span>
            <span
              className="terminal-cursor"
              style={{ color: C.cursor, animationDuration: `${cursorDuration}s` }}
            >
              |
            </span>
          </div>
        )}

        {allCompleted && executingId === null && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-x-[0.38em]">
              <span style={{ color: C.user }}>matteo@portfolio</span>
              <span style={{ color: C.path }}>:~$</span>
              <span style={{ color: C.path }}>exit</span>
            </div>
            <p
              className="mt-1"
              style={{
                fontSize: "0.58rem",
                color: "rgba(134,239,172,0.48)",
                letterSpacing: "0.06em",
              }}
            >
              Session complete. All capabilities explored.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function Skills() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const eyebrowRef = useRef<HTMLDivElement | null>(null);
  const manifestoRef = useRef<HTMLParagraphElement | null>(null);
  const ghostNumRef = useRef<HTMLDivElement | null>(null);

  const [activeCapabilityId, setActiveCapabilityId] = useState<CapabilityId | null>(null);
  const [primedCapabilityId, setPrimedCapabilityId] = useState<CapabilityId | null>(null);
  const [activatedCapabilityIds, setActivatedCapabilityIds] = useState<CapabilityId[]>([]);
  const [developerModeArmed, setDeveloperModeArmed] = useState(false);
  const [developerOriginCapabilityId, setDeveloperOriginCapabilityId] =
    useState<CapabilityId | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);
  const [orchestrationCue, setOrchestrationCue] = useState<OrchestrationCue | null>(null);
  const [animateProfile, setAnimateProfile] = useState<MotionProfile>(DEFAULT_MOTION_PROFILE);
  const [performanceProfile, setPerformanceProfile] = useState<PerformanceProfile>(
    DEFAULT_PERFORMANCE_PROFILE,
  );
  const animateProfileBootRef = useRef(false);
  const performanceProfileBootRef = useRef(false);
  const orchestrationCueRef = useRef(0);
  const orchestrationTimeoutRef = useRef<number | null>(null);

  const isInView = useInView(sectionRef, { once: true, margin: "-120px" });

  // ── GSAP pinned entrance — terminal boot materializes on scroll ──────────
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      if (!isDesktop) return;

      const shell = shellRef.current;
      if (!shell) return;

      // Set initial state for the shell
      gsap.set(shell, { scale: 0.93, opacity: 0, filter: "blur(10px)" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=30%",
          pin: true,
          scrub: 1.0,
          anticipatePin: 1,
          refreshPriority: -1,
          onLeave:     () => refreshScrollTriggers(),
          onEnterBack: () => refreshScrollTriggers(),
        },
      });

      // 0.05→0.85: Shell materializes from blur (fills most of the pin)
      tl.to(shell, {
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        ease: "power4.out",
        duration: 0.80,
      }, 0.05);
    },
    [],
    sectionRef,
  );

  // ── GSAP scroll parallax — ghost "03" drift + section exit ──────────────
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      if (ghostNumRef.current) {
        gsap.to(ghostNumRef.current, {
          y: -80,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      }

      if (eyebrowRef.current) {
        gsap.to(eyebrowRef.current, {
          y: -40,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "60% top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    },
    [],
    sectionRef,
  );

  useEffect(() => {
    const id = "skills-engine-styles";
    if (document.getElementById(id)) {
      return;
    }

    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes terminal-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      .terminal-cursor { animation: terminal-blink 1s step-end infinite; display: inline-block; }
      @keyframes perf-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(220%); } }
      .perf-shimmer { animation: perf-shimmer 1.3s ease-in-out infinite; }
    `;

    document.head.appendChild(style);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  const activeCapability = getCapabilityById(activeCapabilityId);
  const primedCapability = activeCapability ? null : getCapabilityById(primedCapabilityId);
  const displayCapability = activeCapability ?? primedCapability ?? DEFAULT_CAPABILITY;
  const onlineSubsystemIds = useMemo(
    () => getOnlineSubsystemIds(activatedCapabilityIds),
    [activatedCapabilityIds],
  );
  const systemMemory = useMemo(
    () => getSystemMemory(activatedCapabilityIds),
    [activatedCapabilityIds],
  );
  const performanceState = useMemo(
    () => getPerformanceState(performanceProfile),
    [performanceProfile],
  );
  const motionEnergy = getMotionIntensity(animateProfile);

  const systemMode: SystemMode = developerModeArmed
    ? "developer"
    : activeCapability
      ? "active"
      : primedCapability
        ? "primed"
        : "standby";

  const developerHintVisible = activatedCapabilityIds.length >= 3;

  const pushOrchestrationCue = useCallback(
    (nextCue: Omit<OrchestrationCue, "key">) => {
      orchestrationCueRef.current += 1;
      if (orchestrationTimeoutRef.current !== null) {
        window.clearTimeout(orchestrationTimeoutRef.current);
      }

      setOrchestrationCue({
        key: orchestrationCueRef.current,
        ...nextCue,
      });

      orchestrationTimeoutRef.current = window.setTimeout(() => {
        setOrchestrationCue(null);
        orchestrationTimeoutRef.current = null;
      }, 1160);
    },
    [],
  );

  useEffect(() => {
    if (!animateProfileBootRef.current) {
      animateProfileBootRef.current = true;
      return;
    }

    setPulseKey((value) => value + 1);
  }, [
    animateProfile.damping,
    animateProfile.hoverEnabled,
    animateProfile.staggerEnabled,
    animateProfile.stiffness,
  ]);

  useEffect(() => {
    if (!performanceProfileBootRef.current) {
      performanceProfileBootRef.current = true;
      return;
    }

    setPulseKey((value) => value + 1);
  }, [
    performanceProfile.codeSplitting,
    performanceProfile.lazyLoading,
    performanceProfile.priorityImage,
  ]);

  useEffect(
    () => () => {
      if (orchestrationTimeoutRef.current !== null) {
        window.clearTimeout(orchestrationTimeoutRef.current);
      }
    },
    [],
  );

  const handleCapabilityPrime = useCallback(
    (id: CapabilityId) => {
      if (activeCapabilityId) {
        return;
      }
      setPrimedCapabilityId(id);
    },
    [activeCapabilityId],
  );

  const handleCapabilityLeave = useCallback(() => {
    if (activeCapabilityId) {
      return;
    }
    setPrimedCapabilityId(null);
  }, [activeCapabilityId]);

  const handleCapabilityFocus = useCallback((id: CapabilityId) => {
    const capability = getCapabilityById(id);
    setActiveCapabilityId(id);
    setPrimedCapabilityId(null);
    setActivatedCapabilityIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
    setPulseKey((value) => value + 1);
    if (capability) {
      pushOrchestrationCue({
        eyebrow: capability.status,
        title: capability.title,
        detail: capability.statement,
        accent: capability.theme.accentStrong,
      });
    }
  }, [pushOrchestrationCue]);

  const handleReplay = useCallback(() => {
    setReplayKey((value) => value + 1);
    setPulseKey((value) => value + 1);
  }, []);

  const handleDeveloperModeArm = useCallback(() => {
    const originCapabilityId =
      activeCapabilityId ?? primedCapabilityId ?? RECOMMENDED_CAPABILITY;
    const originCapability = getCapabilityById(originCapabilityId);

    setDeveloperOriginCapabilityId(originCapabilityId);
    setDeveloperModeArmed(true);
    setActiveCapabilityId(originCapabilityId);
    setPrimedCapabilityId(null);
    setActivatedCapabilityIds((current) =>
      current.includes(originCapabilityId) ? current : [...current, originCapabilityId],
    );
    setPulseKey((value) => value + 1);
    pushOrchestrationCue({
      eyebrow: "privileged mode",
      title: "System Layer",
      detail: originCapability
        ? `The shell yields to internal topology. ${originCapability.title} remains the active driver.`
        : "The shell yields to internal topology.",
      accent: "rgba(186,230,253,0.90)",
    });
  }, [activeCapabilityId, primedCapabilityId, pushOrchestrationCue]);

  const handleDeveloperModeClose = useCallback(() => {
    setDeveloperModeArmed(false);
    setActiveCapabilityId((current) => current ?? developerOriginCapabilityId);
    setPrimedCapabilityId(null);
    setPulseKey((value) => value + 1);
    pushOrchestrationCue({
      eyebrow: "capability shell",
      title: "Viewport Restored",
      detail: "Privileged access folds away and the live subsystem returns to the foreground.",
      accent: displayCapability.theme.accentStrong,
    });
  }, [developerOriginCapabilityId, displayCapability.theme.accentStrong, pushOrchestrationCue]);

  const handleSessionComplete = useCallback(() => {
    setSessionComplete(true);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#060c1a] px-6 py-[clamp(5rem,12vw,10rem)] md:px-12 lg:px-20"
    >
      <SystemBackdrop
        capability={displayCapability}
        activeCapabilityId={activeCapabilityId}
        systemMode={systemMode}
        onlineCount={activatedCapabilityIds.length}
        onlineSubsystemCount={onlineSubsystemIds.length}
        onlineSubsystemIds={onlineSubsystemIds}
        systemMemory={systemMemory}
        motionProfile={animateProfile}
        performanceState={performanceState}
        pulseKey={pulseKey}
      />

      <motion.div
        ref={ghostNumRef}
        aria-hidden="true"
        data-skills="ghost-num"
        className="pointer-events-none absolute bottom-[-0.18em] right-[-0.04em] z-0 select-none leading-none"
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(14rem, 28vw, 38rem)",
          color: developerModeArmed
            ? `rgba(186,230,253,${0.08 + systemMemory.readiness * 0.05})`
            : `rgba(96,165,250,${0.052 + systemMemory.readiness * 0.028})`,
          textShadow:
            systemMode !== "standby" ? `0 0 80px ${displayCapability.theme.glow}` : "none",
          letterSpacing: "-0.04em",
        }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 2.2, delay: 0.55, ease: "easeOut" }}
      >
        03
      </motion.div>

      <div className="relative z-10 mx-auto w-full max-w-[1600px]">
        <motion.div
          ref={eyebrowRef}
          data-skills="eyebrow"
          className="mb-10 flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: EXPO }}
        >
          <div
            className="h-px w-6"
            style={{ background: displayCapability.theme.accent }}
          />
          <span
            className="text-[10px] uppercase tracking-[0.42em]"
            style={{ ...MONO, color: "rgba(191,219,254,0.62)" }}
          >
            Capability Engine - 03
          </span>
        </motion.div>

        <motion.p
          ref={manifestoRef}
          data-skills="manifesto"
          className="mb-16 max-w-[42rem] leading-relaxed"
          style={{
            ...MONO,
            fontSize: "clamp(0.80rem,1.2vw,0.92rem)",
            color: "rgba(255,255,255,0.38)",
            letterSpacing: "0.01em",
          }}
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.18, ease: EXPO }}
        >
          {MANIFESTO}
        </motion.p>

        <motion.div
          aria-hidden="true"
          data-skills="sep-top"
          className="mb-[clamp(2.5rem,5vw,4rem)] h-px origin-left"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05), transparent)",
          }}
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.1, delay: 0.22, ease: EXPO }}
        />

        <StatusRail
          capability={displayCapability}
          activeCapability={activeCapability}
          activeCapabilityId={activeCapabilityId}
          systemMode={systemMode}
          onlineCount={activatedCapabilityIds.length}
          onlineSubsystemCount={onlineSubsystemIds.length}
          systemMemory={systemMemory}
          motionProfile={animateProfile}
          performanceState={performanceState}
          developerRouteAvailable={developerHintVisible}
          developerModeArmed={developerModeArmed}
        />

        <SystemMemoryRail
          capability={displayCapability}
          systemMemory={systemMemory}
          developerModeArmed={developerModeArmed}
        />

        <motion.div
          ref={shellRef}
          data-skills="shell"
          className="relative overflow-hidden rounded-[34px] border"
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  y:
                    activeCapabilityId === "animate"
                      ? -2.2
                      : activeCapabilityId === "performance"
                        ? -1.1
                        : orchestrationCue
                          ? -0.8
                          : 0,
                  scale:
                    activeCapabilityId === "animate"
                      ? 1.003
                      : activeCapabilityId === "performance"
                        ? 1.001 + performanceState.calmness * 0.0015
                        : orchestrationCue
                          ? 1.0015
                          : 1,
                  filter: "blur(0px)",
                }
              : {}
          }
          transition={{
            duration:
              activeCapabilityId === "animate"
                ? getMotionPulseDuration(animateProfile)
                : activeCapabilityId === "performance"
                  ? 0.82 - performanceState.calmness * 0.14
                  : orchestrationCue
                    ? 0.76
                    : 1,
            delay: 0.15,
            ease: EXPO,
          }}
          style={{
            borderColor:
              systemMode === "standby"
                ? "rgba(255,255,255,0.08)"
                : displayCapability.theme.surface,
            background:
              developerModeArmed
                ? `linear-gradient(180deg, rgba(4,8,16,${0.95 + motionEnergy * 0.02}) 0%, rgba(3,7,14,0.88) 58%, rgba(2,5,12,0.92) 100%)`
                : activeCapabilityId === "animate"
                  ? `linear-gradient(180deg, rgba(8,14,30,${0.86 + motionEnergy * 0.03}) 0%, rgba(5,10,22,0.76) 100%)`
                  : activeCapabilityId === "performance"
                    ? `linear-gradient(180deg, rgba(8,13,28,${0.84 - performanceState.calmness * 0.08}) 0%, rgba(5,10,22,${0.72 - performanceState.calmness * 0.06}) 100%)`
                    : orchestrationCue
                      ? `linear-gradient(180deg, rgba(8,13,28,${0.88 + systemMemory.readiness * 0.03}) 0%, rgba(5,10,22,0.78) 100%)`
                  : `linear-gradient(180deg, rgba(8,13,28,${0.86 + systemMemory.readiness * 0.03}) 0%, rgba(5,10,22,${0.72 + systemMemory.readiness * 0.04}) 100%)`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 28px ${
              100 +
              motionEnergy * 24 +
              systemMemory.topologyRichness * 16 +
              (activeCapabilityId === "animate" ? 10 : 0) -
              performanceState.calmness * 10 +
              (orchestrationCue ? 10 : 0)
            }px rgba(2,6,23,0.42), 0 0 0 1px ${displayCapability.theme.surface}`,
            backdropFilter: "blur(16px)",
          }}
          >
          <ShellMotionLayer
            capability={displayCapability}
            activeCapabilityId={activeCapabilityId}
            motionProfile={animateProfile}
            developerModeArmed={developerModeArmed}
            pulseKey={pulseKey}
          />
          <DeveloperThresholdLayer
            active={developerModeArmed}
            capability={displayCapability}
          />
          <ShellCueLayer cue={orchestrationCue} />

          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: developerModeArmed
                ? "linear-gradient(90deg, rgba(186,230,253,0.16), transparent 72%)"
                : `linear-gradient(90deg, ${displayCapability.theme.accentSoft}, transparent 72%)`,
            }}
          />

          <div className="relative z-10 flex flex-col-reverse gap-8 p-5 sm:p-6 lg:flex-row lg:gap-10 lg:p-8">
            <div
              className={
                developerModeArmed
                  ? "w-full lg:w-[30%] lg:flex-shrink-0"
                  : "w-full lg:w-[42%] lg:flex-shrink-0"
              }
            >
              <Terminal
                terminalRef={terminalRef}
                isVisible={isInView}
                activeId={activeCapabilityId}
                primedId={primedCapabilityId}
                displayCapability={displayCapability}
                systemMode={systemMode}
                motionProfile={animateProfile}
                performanceState={performanceState}
                developerHintVisible={developerHintVisible}
                developerModeArmed={developerModeArmed}
                onCapabilityPrime={handleCapabilityPrime}
                onCapabilityLeave={handleCapabilityLeave}
                onCapabilityFocus={handleCapabilityFocus}
                onDeveloperModeArm={handleDeveloperModeArm}
                onDeveloperModeClose={handleDeveloperModeClose}
                onSessionComplete={handleSessionComplete}
              />
            </div>

            <div
              ref={stageRef}
              className={
                developerModeArmed
                  ? "w-full lg:min-w-0 lg:flex-[1.32]"
                  : "w-full lg:min-w-0 lg:flex-1"
              }
            >
              <DemoPanel
                activeId={activeCapabilityId}
                primedId={primedCapabilityId}
                displayCapability={displayCapability}
                replayKey={replayKey}
                pulseKey={pulseKey}
                activeCount={activatedCapabilityIds.length}
                exploredIds={activatedCapabilityIds}
                systemMemory={systemMemory}
                motionProfile={animateProfile}
                performanceProfile={performanceProfile}
                performanceState={performanceState}
                onAnimateProfileChange={setAnimateProfile}
                onPerformanceProfileChange={setPerformanceProfile}
                developerModeArmed={developerModeArmed}
                onReplay={handleReplay}
                onCloseDeveloperMode={handleDeveloperModeClose}
              />
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {sessionComplete && (
            <ProjectsBridge allExplored={activatedCapabilityIds.length === CAPABILITY_COUNT} />
          )}
        </AnimatePresence>

        <motion.div
          aria-hidden="true"
          data-skills="sep-bottom"
          className="mt-[clamp(3rem,6vw,6rem)] h-px origin-left"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04), transparent)",
          }}
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.1, delay: 0.45, ease: EXPO }}
        />
      </div>
    </section>
  );
}
