"use client";

import { motion, AnimatePresence, useInView } from "motion/react";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Skills — Developer Terminal + Live Demo Panel
//
// Layout (desktop): Terminal left 45% · DemoPanel right 55%
// Layout (mobile):  DemoPanel above · Terminal below (flex-col-reverse)
//
// Each capability has:
//   — terminal module: statement + details + code snippet (toggle) + collapse
//   — live demo in DemoPanel: autoplay on open, ↺ replay button
//
// Demos:
//   build        → component tree with dispatch flash
//   animate      → spring card entrance
//   engineer     → role switcher (admin / guest)
//   performance  → before / after loading timeline
//   architecture → token → component → page hover graph
//
// Terminal callback renamed: onCommandComplete → onCapabilityFocus
//   fires on first typewriter completion AND on every re-expand via toggle
//   so DemoPanel always tracks the currently focused capability
//
// GSAP-ready: all refs, data-skills attributes preserved
// ─────────────────────────────────────────────────────────────────────────────

type BootPhase = "idle" | "typing" | "output" | "ready";

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const MANIFESTO = "A session with my stack.";
const MONO: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };

const C = {
  user:    "rgba(96,165,250,0.80)",
  path:    "rgba(255,255,255,0.32)",
  cmd:     "rgba(255,255,255,0.88)",
  output:  "rgba(255,255,255,0.42)",
  accent:  "rgba(147,197,253,0.75)",
  comment: "rgba(255,255,255,0.22)",
  success: "rgba(110,231,183,0.65)",
  cursor:  "rgba(96,165,250,0.80)",
  kw:      "rgba(147,197,253,0.85)",
  str:     "rgba(110,231,183,0.75)",
} as const;

// ── Capability data ───────────────────────────────────────────────────────────

interface Capability {
  id:        string;
  command:   string;
  title:     string;
  tools:     string[];
  statement: string;
  details:   string[];
  code:      string[];
}

const CAPABILITIES: Capability[] = [
  {
    id: "build", command: "build", title: "Build",
    tools: ["React", "Next.js"],
    statement: "Interfaces that think in systems, not components.",
    details: [
      "Component architecture with intentional data flow.",
      "Server-side rendering as a default, not an afterthought.",
    ],
    code: [
      "// colocate state with its shape",
      "const [state, dispatch] = useReducer(reducer, init)",
      "",
      "// server component by default",
      "export default async function Page() {",
      "  const data = await db.query()",
      "  return <Layout data={data} />",
      "}",
    ],
  },
  {
    id: "animate", command: "animate", title: "Animate",
    tools: ["GSAP", "Framer Motion"],
    statement: "The layer most developers treat as optional.",
    details: [
      "Scroll-driven timelines that respond to intention.",
      "Physics-based springs that feel physical.",
    ],
    code: [
      "gsap.to(el, {",
      "  y: -60, ease: 'none',",
      "  scrollTrigger: { scrub: 1.5 },",
      "})",
      "",
      "transition={{ type: 'spring',",
      "  stiffness: 280, damping: 28 }}",
    ],
  },
  {
    id: "engineer", command: "engineer", title: "Engineer",
    tools: ["TypeScript", "CSS Craft"],
    statement: "Precision as a design tool, not just a safety net.",
    details: [
      "Types that make architectural decisions visible.",
      "CSS as an engineering discipline, not decoration.",
    ],
    code: [
      "type Role = 'admin' | 'guest'",
      "",
      "const UI: Record<Role, Config> = {",
      "  admin: { canDelete: true, badge: 'elevated' },",
      "  guest: { canDelete: false, badge: 'read-only' },",
      "}",
    ],
  },
  {
    id: "performance", command: "performance", title: "Performance",
    tools: ["Web Vitals", "Lighthouse"],
    statement: "Speed is felt before it is measured.",
    details: [
      "Core Web Vitals as first-class design constraints.",
      "Bundle analysis and lazy loading as standard practice.",
    ],
    code: [
      "// critical path only on initial load",
      "const Heavy = dynamic(() => import('./Heavy'))",
      "",
      "// prevent layout shift",
      "aspect-ratio: 16 / 9;",
      "",
      "<Image priority fetchpriority='high' />",
    ],
  },
  {
    id: "architecture", command: "architecture", title: "Architecture",
    tools: ["Design Systems", "Monorepo"],
    statement: "Structure that scales without accumulating debt.",
    details: [
      "Design tokens and component hierarchies that hold.",
      "Monorepo tooling that keeps teams and codebases aligned.",
    ],
    code: [
      "// token layer",
      "--color-brand: oklch(65% 0.22 240);",
      "",
      "// variant-based components",
      "const btn = cva('base', {",
      "  variants: { size: { sm: '...', lg: '...' } },",
      "})",
    ],
  },
];

// ── Build demo data ───────────────────────────────────────────────────────────
// Node positions: cx/cy are % of container (used for both CSS + SVG)

const BUILD_NODES = [
  { id: "page",   label: "Page",        cx: 50, cy: 10 },
  { id: "header", label: "Header",      cx: 20, cy: 48 },
  { id: "main",   label: "Main",        cx: 74, cy: 48 },
  { id: "card1",  label: "ProductCard", cx: 58, cy: 86 },
  { id: "card2",  label: "ProductCard", cx: 88, cy: 86 },
] as const;

const BUILD_EDGES = [
  { from: "page", to: "header" },
  { from: "page", to: "main"   },
  { from: "main", to: "card1"  },
  { from: "main", to: "card2"  },
] as const;

const DISPATCH_IDS = new Set(["main", "card1", "card2"]);

// ── Architecture demo data ────────────────────────────────────────────────────
// SVG viewBox="0 0 100 100" preserveAspectRatio="none" over a fixed-height container.
// cx/cy in SVG user-units map to cx% / cy% of container — correct scaling.

const ARCH_TOKENS = [
  { id: "color-brand", label: "--color-brand", cx: 17, cy: 13 },
  { id: "spacing-4",   label: "--spacing-4",   cx: 50, cy: 13 },
  { id: "radius",      label: "--radius",       cx: 83, cy: 13 },
] as const;

const ARCH_COMPONENTS = [
  { id: "Button",  label: "Button",  cx: 12, cy: 50 },
  { id: "Badge",   label: "Badge",   cx: 37, cy: 50 },
  { id: "Card",    label: "Card",    cx: 63, cy: 50 },
  { id: "Header",  label: "Header",  cx: 88, cy: 50 },
] as const;

const ARCH_PAGES = [
  { id: "Dashboard", label: "Dashboard", cx: 30, cy: 87 },
  { id: "Product",   label: "Product",   cx: 70, cy: 87 },
] as const;

const ARCH_CONNECTIONS: Array<{ from: string; to: string }> = [
  { from: "color-brand", to: "Button"    },
  { from: "color-brand", to: "Badge"     },
  { from: "color-brand", to: "Header"   },
  { from: "spacing-4",   to: "Button"   },
  { from: "spacing-4",   to: "Card"     },
  { from: "spacing-4",   to: "Header"   },
  { from: "radius",      to: "Button"   },
  { from: "radius",      to: "Badge"    },
  { from: "radius",      to: "Card"     },
  { from: "Button",      to: "Dashboard"},
  { from: "Button",      to: "Product"  },
  { from: "Badge",       to: "Dashboard"},
  { from: "Badge",       to: "Product"  },
  { from: "Card",        to: "Product"  },
  { from: "Header",      to: "Dashboard"},
  { from: "Header",      to: "Product"  },
];

// ── Performance demo data ─────────────────────────────────────────────────────

type PerfMode = "unoptimized" | "optimized";

const PERF_BLOCKS = [
  { id: "nav",     label: "Nav",     h: 22 },
  { id: "hero",    label: "Hero",    h: 55 },
  { id: "content", label: "Content", h: 40 },
] as const;

const PERF_TIMINGS: Record<PerfMode, Record<string, number>> = {
  unoptimized: { nav: 950, hero: 1150, content: 1400 },
  optimized:   { nav: 80,  hero: 200,  content: 380  },
};

const PERF_LCP: Record<PerfMode, string> = {
  unoptimized: "1.4s",
  optimized:   "0.38s",
};

// ── Engineer demo data ────────────────────────────────────────────────────────

type Role = "admin" | "guest";

const ROLE_CONFIG: Record<Role, {
  badge:      string;
  badgeColor: string;
  tabs:       Array<{ label: string; disabled?: boolean }>;
  canDelete:  boolean;
}> = {
  admin: {
    badge: "elevated access", badgeColor: "rgba(147,197,253,0.65)",
    tabs: [{ label: "Overview" }, { label: "Analytics" }, { label: "Settings" }],
    canDelete: true,
  },
  guest: {
    badge: "read-only", badgeColor: "rgba(255,255,255,0.28)",
    tabs: [{ label: "Overview" }, { label: "Analytics", disabled: true }, { label: "Settings", disabled: true }],
    canDelete: false,
  },
};

// ── Syntax highlighter ────────────────────────────────────────────────────────

const JS_KEYWORDS = new Set([
  "const","let","var","type","interface","export","default","async",
  "function","return","import","from","await","extends","dynamic","true","false","Record",
]);

function highlightLine(line: string): React.ReactNode {
  if (line === "") return <>&nbsp;</>;
  if (line.trimStart().startsWith("//")) return <span style={{ color: C.comment }}>{line}</span>;
  if (/^--[\w-]+\s*:/.test(line.trimStart())) {
    const [prop, ...rest] = line.split(":");
    return <><span style={{ color: C.accent }}>{prop}</span><span style={{ color: C.path }}>:</span><span style={{ color: C.str }}>{rest.join(":")}</span></>;
  }
  const tokens: React.ReactNode[] = [];
  const re = /(['"`])(?:(?!\1)[^\\]|\\.)*?\1|\w+|[^\w\s]/g;
  let match: RegExpExecArray | null;
  let last = 0, idx = 0;
  while ((match = re.exec(line)) !== null) {
    if (match.index > last) tokens.push(<span key={idx++} style={{ color: C.output }}>{line.slice(last, match.index)}</span>);
    const tok = match[0];
    if (/^['"`]/.test(tok))            tokens.push(<span key={idx++} style={{ color: C.str }}>{tok}</span>);
    else if (JS_KEYWORDS.has(tok))     tokens.push(<span key={idx++} style={{ color: C.kw }}>{tok}</span>);
    else if (/^[<>{}()]$/.test(tok))   tokens.push(<span key={idx++} style={{ color: "rgba(255,255,255,0.28)" }}>{tok}</span>);
    else                               tokens.push(<span key={idx++} style={{ color: C.output }}>{tok}</span>);
    last = match.index + tok.length;
  }
  if (last < line.length) tokens.push(<span key={idx++} style={{ color: C.output }}>{line.slice(last)}</span>);
  return <>{tokens}</>;
}

// ══════════════════════════════════════════════════════════════════════════════
// DEMO COMPONENTS
// Each demo autoplays on mount (via useEffect or initial → animate).
// All are re-triggered by key change from DemoPanel (replayKey prop).
// ══════════════════════════════════════════════════════════════════════════════

// ── Demo 1: Build ─────────────────────────────────────────────────────────────
// Component tree with SVG connecting lines.
// Dispatching an action flashes the nodes that re-render.
// preserveAspectRatio="none" — SVG x maps to cx% of width, y maps to cy% of height.
function BuildDemo() {
  const [flashing,  setFlashing]  = useState<Set<string>>(new Set());
  const [phase,     setPhase]     = useState<"idle" | "running" | "done">("idle");

  const runDispatch = useCallback(() => {
    if (phase === "running") return;
    setPhase("running");
    setFlashing(new Set(DISPATCH_IDS));
    setTimeout(() => {
      setFlashing(new Set());
      setPhase("done");
    }, 700);
  }, [phase]);

  // Autoplay once on mount
  useEffect(() => {
    const t = setTimeout(runDispatch, 450);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full select-none">
      {/* Tree */}
      <div className="relative w-full" style={{ height: 155 }}>
        {/* SVG connecting lines */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {BUILD_EDGES.map((edge, i) => {
            const f = BUILD_NODES.find(n => n.id === edge.from)!;
            const t = BUILD_NODES.find(n => n.id === edge.to)!;
            const lit = flashing.has(edge.to);
            return (
              <line key={i}
                x1={f.cx} y1={f.cy} x2={t.cx} y2={t.cy}
                stroke={lit ? "rgba(147,197,253,0.55)" : "rgba(255,255,255,0.10)"}
                strokeWidth="0.6"
                style={{ transition: "stroke 0.3s ease" }}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {BUILD_NODES.map(node => {
          const lit     = flashing.has(node.id);
          const updated = phase === "done" && DISPATCH_IDS.has(node.id);
          const stable  = phase === "done" && !DISPATCH_IDS.has(node.id);
          return (
            <div key={node.id} style={{
              position: "absolute",
              left: `${node.cx}%`, top: `${node.cy}%`,
              transform: "translate(-50%, -50%)",
            }}>
              <div style={{
                ...MONO, fontSize: "0.60rem", padding: "3px 8px",
                borderRadius: 4,
                border:  `1px solid ${lit ? "rgba(147,197,253,0.65)" : "rgba(255,255,255,0.12)"}`,
                background: lit ? "rgba(147,197,253,0.10)" : "rgba(255,255,255,0.03)",
                color:   lit     ? "rgba(147,197,253,0.92)"
                       : updated ? "rgba(110,231,183,0.75)"
                       : "rgba(255,255,255,0.55)",
                whiteSpace: "nowrap",
                boxShadow: lit ? "0 0 14px rgba(147,197,253,0.18)" : "none",
                transition: "all 0.3s ease",
              }}>
                {node.label}
              </div>
              {phase === "done" && (
                <div style={{
                  ...MONO, fontSize: "0.48rem", textAlign: "center",
                  marginTop: 2,
                  color: updated ? "rgba(110,231,183,0.55)" : "rgba(255,255,255,0.18)",
                  letterSpacing: "0.06em",
                }}>
                  {updated ? "updated" : "stable"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trigger */}
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={runDispatch}
          disabled={phase === "running"}
          style={{
            ...MONO, fontSize: "0.62rem",
            color:      phase === "running" ? C.comment : C.accent,
            background: "none",
            border:     `1px solid ${phase === "running" ? "rgba(255,255,255,0.08)" : "rgba(147,197,253,0.28)"}`,
            padding:    "3px 10px", borderRadius: 4,
            cursor:     phase === "running" ? "default" : "pointer",
            letterSpacing: "0.04em",
            transition: "all 0.25s ease",
          }}
        >
          {phase === "running" ? "dispatching…" : "[dispatch action]"}
        </button>
        {phase === "done" && (
          <span style={{ ...MONO, fontSize: "0.56rem", color: C.comment }}>
            3 nodes updated
          </span>
        )}
      </div>
    </div>
  );
}

// ── Demo 2: Animate ───────────────────────────────────────────────────────────
// A realistic product card with spring entrance + staggered content.
// Autoplays on mount. Internal replay button re-triggers via key increment.
function AnimateCardDemo() {
  const [k, setK] = useState(1); // start at 1 — animation runs on mount

  return (
    <div className="w-full">
      <div className="flex items-start gap-5">

        {/* Card */}
        <div className="flex-shrink-0" style={{ width: 175 }}>
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 24, scale: 0.93 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            style={{
              borderRadius: 10, overflow: "hidden",
              border:     "1px solid rgba(147,197,253,0.15)",
              background: "rgba(6,12,26,0.70)",
            }}
          >
            {/* Image placeholder */}
            <div style={{
              height: 80,
              background: "linear-gradient(135deg, rgba(29,78,216,0.38) 0%, rgba(6,182,212,0.20) 100%)",
            }} />

            {/* Card content — staggered */}
            <div style={{ padding: "10px 12px" }}>
              <motion.div key={k}
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.13, duration: 0.42, ease: EXPO }}
              >
                <div style={{ ...MONO, fontSize: "0.70rem", color: "rgba(255,255,255,0.85)", marginBottom: 3 }}>
                  Project title
                </div>
                <div style={{ ...MONO, fontSize: "0.58rem", color: C.comment, marginBottom: 9 }}>
                  React · TypeScript
                </div>
              </motion.div>
              <motion.button key={`btn-${k}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.38, ease: EXPO }}
                style={{
                  ...MONO, fontSize: "0.58rem", color: C.accent,
                  background: "rgba(147,197,253,0.08)",
                  border: "1px solid rgba(147,197,253,0.22)",
                  borderRadius: 4, padding: "3px 8px", cursor: "pointer",
                  letterSpacing: "0.04em",
                }}
              >
                View case study →
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Spring params */}
        <div>
          <div style={{ ...MONO, fontSize: "0.58rem", color: C.comment, marginBottom: 8, lineHeight: 1.55 }}>
            spring entrance
          </div>
          {[
            ["stiffness", "280"],
            ["damping",   "28"],
            ["stagger",   "+130ms"],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3 items-baseline mb-1.5">
              <span style={{ ...MONO, fontSize: "0.56rem", color: C.comment, minWidth: 58 }}>{k}</span>
              <span style={{ ...MONO, fontSize: "0.58rem", color: C.accent }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setK(n => n + 1)}
        className="mt-3"
        style={{
          ...MONO, fontSize: "0.60rem", color: C.comment,
          background: "none", border: "none", padding: 0, cursor: "pointer",
          letterSpacing: "0.04em", transition: "color 0.25s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = C.accent as string)}
        onMouseLeave={e => (e.currentTarget.style.color = C.comment as string)}
      >
        ↺ replay
      </button>
    </div>
  );
}

// ── Demo 3: Engineer ──────────────────────────────────────────────────────────
// Role switcher — admin / guest.
// The TypeScript discriminated union shown in the code snippet governs this UI.
function EngineerDemo() {
  const [role, setRole] = useState<Role>("admin");
  const cfg = ROLE_CONFIG[role];

  return (
    <div className="w-full">
      {/* Role toggle */}
      <div className="flex items-center gap-2 mb-4">
        <span style={{ ...MONO, fontSize: "0.58rem", color: C.comment }}>role:</span>
        {(["admin", "guest"] as Role[]).map(r => (
          <button key={r} onClick={() => setRole(r)} style={{
            ...MONO, fontSize: "0.62rem",
            color:      role === r ? C.accent : C.comment,
            background: role === r ? "rgba(147,197,253,0.08)" : "none",
            border:     `1px solid ${role === r ? "rgba(147,197,253,0.30)" : "rgba(255,255,255,0.08)"}`,
            padding: "3px 10px", borderRadius: 4, cursor: "pointer",
            letterSpacing: "0.04em", transition: "all 0.25s ease",
          }}>
            {r}
          </button>
        ))}
      </div>

      {/* Animated UI panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={role}
          initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{   opacity: 0, y: -5, filter: "blur(4px)" }}
          transition={{ duration: 0.28, ease: EXPO }}
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 6, padding: "10px 12px",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span style={{ ...MONO, fontSize: "0.64rem", color: "rgba(255,255,255,0.70)" }}>
              User Dashboard
            </span>
            <span style={{
              ...MONO, fontSize: "0.52rem",
              color: cfg.badgeColor,
              border: `1px solid ${cfg.badgeColor}`,
              borderRadius: 3, padding: "1px 6px", letterSpacing: "0.06em",
            }}>
              {cfg.badge}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-3 flex-wrap">
            {cfg.tabs.map(tab => (
              <div key={tab.label} style={{
                ...MONO, fontSize: "0.58rem", padding: "3px 8px",
                borderRadius: 3,
                color:      tab.disabled ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.62)",
                background: !tab.disabled ? "rgba(255,255,255,0.06)" : "transparent",
                border:     "1px solid rgba(255,255,255,0.06)",
                cursor:     tab.disabled ? "not-allowed" : "default",
                opacity:    tab.disabled ? 0.55 : 1,
                transition: "all 0.25s ease",
              }}>
                {tab.label}
              </div>
            ))}
          </div>

          {/* Delete button — admin only */}
          <AnimatePresence>
            {cfg.canDelete && (
              <motion.button
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{   opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: EXPO }}
                style={{
                  ...MONO, display: "block", overflow: "hidden",
                  fontSize: "0.58rem", color: "rgba(252,165,165,0.72)",
                  background: "none",
                  border: "1px solid rgba(252,165,165,0.22)",
                  borderRadius: 3, padding: "3px 10px", cursor: "pointer",
                  letterSpacing: "0.04em",
                }}
              >
                Delete user
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Demo 4: Performance ───────────────────────────────────────────────────────
// Page skeleton loading simulation.
// Toggle between "unoptimized" (slow parallel load) and "optimized" (fast sequential).
// Autoplays "unoptimized" on mount. Toggle switches mode and replays.
function PerformanceDemo() {
  const [mode,    setMode]    = useState<PerfMode>("unoptimized");
  const [loaded,  setLoaded]  = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const runAnimation = useCallback((m: PerfMode) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setLoaded(new Set());
    setRunning(true);

    const t = PERF_TIMINGS[m];
    PERF_BLOCKS.forEach(block => {
      const id = setTimeout(() => {
        setLoaded(prev => { const n = new Set(prev); n.add(block.id); return n; });
      }, t[block.id]);
      timers.current.push(id);
    });

    const maxT = Math.max(...Object.values(t));
    timers.current.push(setTimeout(() => setRunning(false), maxT + 100));
  }, []);

  // Autoplay unoptimized on mount
  useEffect(() => {
    const t = setTimeout(() => runAnimation("unoptimized"), 400);
    return () => { clearTimeout(t); timers.current.forEach(clearTimeout); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMode = (m: PerfMode) => { setMode(m); runAnimation(m); };

  return (
    <div className="w-full">
      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        {(["unoptimized", "optimized"] as PerfMode[]).map(m => (
          <button key={m} onClick={() => handleMode(m)} style={{
            ...MONO, fontSize: "0.60rem",
            color:      mode === m ? C.accent : C.comment,
            background: mode === m ? "rgba(147,197,253,0.08)" : "none",
            border:     `1px solid ${mode === m ? "rgba(147,197,253,0.30)" : "rgba(255,255,255,0.08)"}`,
            padding: "3px 10px", borderRadius: 4, cursor: "pointer",
            letterSpacing: "0.04em", transition: "all 0.25s ease",
          }}>
            {m}
          </button>
        ))}
      </div>

      <div className="flex gap-4 items-start">
        {/* Page skeleton blocks */}
        <div style={{ flex: 1 }}>
          {PERF_BLOCKS.map((block, i) => {
            const done = loaded.has(block.id);
            return (
              <div key={block.id} style={{ marginBottom: i < PERF_BLOCKS.length - 1 ? 6 : 0 }}>
                <div style={{
                  height: block.h, borderRadius: 4,
                  border:     "1px solid rgba(255,255,255,0.06)",
                  background: done ? "rgba(147,197,253,0.08)" : "rgba(255,255,255,0.03)",
                  position: "relative", overflow: "hidden",
                  transition: `background ${mode === "optimized" ? "0.12s" : "0.35s"} ease`,
                }}>
                  {/* Loading shimmer */}
                  {!done && running && (
                    <div className="perf-shimmer" style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
                    }} />
                  )}
                  {/* Label when loaded */}
                  {done && (
                    <div style={{
                      ...MONO, position: "absolute", left: 10,
                      top: "50%", transform: "translateY(-50%)",
                      fontSize: "0.54rem", color: "rgba(147,197,253,0.55)",
                    }}>
                      {block.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* LCP metric */}
        <div style={{ width: 74, flexShrink: 0, paddingTop: 4 }}>
          <div style={{ ...MONO, fontSize: "0.54rem", color: C.comment, marginBottom: 4, letterSpacing: "0.06em" }}>
            LCP
          </div>
          <div style={{
            ...MONO, fontSize: "1.15rem", fontWeight: 700, lineHeight: 1,
            color:      mode === "optimized" ? "rgba(110,231,183,0.82)" : "rgba(255,255,255,0.55)",
            transition: "color 0.5s ease",
          }}>
            {PERF_LCP[mode]}
          </div>
          <div style={{ ...MONO, fontSize: "0.50rem", color: C.comment, marginTop: 5 }}>
            {mode === "optimized" ? "✓ good" : "⚠ slow"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Demo 5: Architecture ──────────────────────────────────────────────────────
// Three-layer token → component → page graph.
// Hover any node to highlight its connections.
// Nodes stagger in on mount. Lines are always present (low opacity), brighten on hover.
// SVG with preserveAspectRatio="none" — x maps to cx% of width, y to cy% of height.
function ArchitectureDemo() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const allNodes = useMemo(() => [
    ...ARCH_TOKENS,
    ...ARCH_COMPONENTS,
    ...ARCH_PAGES,
  ], []);

  const isNodeLit = (id: string) => {
    if (!hoveredId) return false;
    if (id === hoveredId) return true;
    return ARCH_CONNECTIONS.some(c => (c.from === hoveredId && c.to === id) || (c.to === hoveredId && c.from === id));
  };

  const isEdgeLit = (edge: { from: string; to: string }) =>
    !!hoveredId && (edge.from === hoveredId || edge.to === hoveredId);

  const getNode = (id: string) => allNodes.find(n => n.id === id)!;

  return (
    <div className="w-full select-none">
      <div className="relative w-full" style={{ height: 188 }}>
        {/* SVG lines */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {ARCH_CONNECTIONS.map((edge, i) => {
            const f   = getNode(edge.from);
            const t   = getNode(edge.to);
            const lit = isEdgeLit(edge);
            return (
              <line key={i}
                x1={f.cx} y1={f.cy} x2={t.cx} y2={t.cy}
                stroke={lit ? "rgba(147,197,253,0.55)" : "rgba(255,255,255,0.07)"}
                strokeWidth={lit ? "0.85" : "0.5"}
                style={{ transition: "stroke 0.2s ease, stroke-width 0.2s ease" }}
              />
            );
          })}
        </svg>

        {/* Nodes — stagger entrance on mount */}
        {allNodes.map((node, i) => {
          const lit = isNodeLit(node.id);
          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.045, duration: 0.32, ease: EXPO }}
              style={{
                position: "absolute",
                left: `${node.cx}%`, top: `${node.cy}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 1,
              }}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div style={{
                ...MONO, fontSize: "0.56rem", padding: "2px 7px",
                borderRadius: 3, whiteSpace: "nowrap", cursor: "default",
                border:     `1px solid ${lit ? "rgba(147,197,253,0.55)" : "rgba(255,255,255,0.10)"}`,
                background: lit ? "rgba(147,197,253,0.09)" : "rgba(6,12,26,0.85)",
                color:      lit ? "rgba(147,197,253,0.92)" : "rgba(255,255,255,0.45)",
                boxShadow:  lit ? "0 0 10px rgba(147,197,253,0.12)" : "none",
                transition: "all 0.2s ease",
              }}>
                {node.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Layer labels */}
      <div className="flex gap-4 mt-1">
        {["tokens", "components", "pages"].map(l => (
          <span key={l} style={{ ...MONO, fontSize: "0.50rem", color: C.comment, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {l}
          </span>
        ))}
      </div>
      <p style={{ ...MONO, fontSize: "0.56rem", color: C.comment, marginTop: 4 }}>
        hover any node to trace dependencies
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TERMINAL COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

// ── CodeSnippet ───────────────────────────────────────────────────────────────

function CodeSnippet({ lines }: { lines: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          ...MONO, fontSize: "0.66rem",
          color:      open ? C.comment : C.accent,
          background: "none", border: "none", padding: 0, cursor: "pointer",
          letterSpacing: "0.04em", transition: "color 0.3s ease",
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)")}
        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = open ? C.comment : C.accent as string)}
      >
        {open ? "[hide code]" : "[show code]"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0 }}
            transition={{ duration: 0.32, ease: EXPO }}
            style={{ overflow: "hidden" }}
          >
            <pre className="mt-2 rounded-lg px-4 py-3 overflow-x-auto" style={{
              ...MONO, fontSize: "clamp(0.62rem, 0.88vw, 0.70rem)",
              lineHeight: 1.7, margin: 0,
              background: "rgba(3,7,18,0.65)",
              border: "1px solid rgba(96,165,250,0.10)",
            }}>
              {lines.map((line, i) => <div key={i}>{highlightLine(line)}</div>)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── CapabilityModule ──────────────────────────────────────────────────────────
// Title, statement, detail lines, code snippet, collapse button.
// Demos live in DemoPanel — not here.

function CapabilityModule({ cap, onCollapse }: { cap: Capability; onCollapse: () => void }) {
  return (
    <div className="mt-1 ml-2 border-l pl-4 py-2" style={{ borderColor: "rgba(96,165,250,0.16)" }}>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 mb-2">
        <span style={{ ...MONO, fontSize: "clamp(0.76rem, 1.05vw, 0.86rem)", color: C.accent, fontWeight: 600 }}>
          {cap.title}
        </span>
        <span style={{ ...MONO, fontSize: "0.62rem", color: C.comment, letterSpacing: "0.09em", textTransform: "uppercase" }}>
          {cap.tools.join(" · ")}
        </span>
      </div>

      <p style={{ ...MONO, fontSize: "clamp(0.73rem, 1.02vw, 0.82rem)", color: C.cmd, lineHeight: 1.55, marginBottom: "0.45rem" }}>
        {cap.statement}
      </p>

      {cap.details.map((line, i) => (
        <p key={i} style={{ ...MONO, fontSize: "clamp(0.68rem, 0.96vw, 0.76rem)", color: C.output, lineHeight: 1.55 }}>
          <span style={{ color: C.success, marginRight: "0.5rem" }}>→</span>{line}
        </p>
      ))}

      <CodeSnippet lines={cap.code} />

      <button onClick={onCollapse} className="mt-3 block" style={{
        ...MONO, fontSize: "0.62rem", color: C.comment,
        background: "none", border: "none", padding: 0, cursor: "pointer",
        letterSpacing: "0.04em", transition: "color 0.25s ease",
      }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
        onMouseLeave={e => (e.currentTarget.style.color = C.comment as string)}
      >
        [−] collapse
      </button>
    </div>
  );
}

// ── CommandEntry ──────────────────────────────────────────────────────────────
// Manages typewriter. Module open/close controlled externally via isOpen.
// After typing done: prompt line clickable ([+]/[−]).

function CommandEntry({
  cap, isOpen, onDone, onToggle,
}: {
  cap:      Capability;
  isOpen:   boolean;
  onDone:   (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const [typed,       setTyped]      = useState("");
  const [typingDone,  setTypingDone] = useState(false);
  const firedRef = useRef(false);
  const fullCmd  = `skills --open ${cap.command}`;

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setTyped(fullCmd.slice(0, i));
      if (i >= fullCmd.length) {
        clearInterval(timer);
        setTimeout(() => {
          setTypingDone(true);
          if (!firedRef.current) {
            firedRef.current = true;
            setTimeout(() => onDone(cap.id), 200);
          }
        }, 180);
      }
    }, 28);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mt-3" data-skills={`entry-${cap.id}`}>
      <div
        className="flex items-center flex-wrap gap-x-[0.38em]"
        style={{
          ...MONO, fontSize: "clamp(0.70rem, 1.02vw, 0.78rem)",
          cursor: typingDone ? "pointer" : "default",
        }}
        onClick={() => typingDone && onToggle(cap.id)}
      >
        <span style={{ color: C.user }}>matteo@portfolio</span>
        <span style={{ color: C.path }}>:~$</span>
        <span style={{ color: C.cmd }}>{typed}</span>
        {!typingDone && <span className="terminal-cursor" style={{ color: C.cursor }}>█</span>}
        {typingDone && (
          <span style={{
            color: isOpen ? C.comment : C.accent,
            marginLeft: "0.4em", fontSize: "0.60rem",
            transition: "color 0.25s ease",
          }}>
            {isOpen ? "[−]" : "[+]"}
          </span>
        )}
      </div>

      <AnimatePresence>
        {typingDone && isOpen && (
          <motion.div
            key={`module-${cap.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0 }}
            transition={{ duration: 0.38, ease: EXPO }}
            style={{ overflow: "hidden" }}
          >
            <CapabilityModule cap={cap} onCollapse={() => onToggle(cap.id)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Terminal ──────────────────────────────────────────────────────────────────
// State: bootPhase, executingCmd, completedCmds, expandedCmds
//
// onCapabilityFocus(id) — fires on:
//   1. typewriter completion (first open)
//   2. every subsequent re-expand via toggle
// This keeps DemoPanel always synced to the currently focused capability.

function Terminal({
  terminalRef, isVisible, onCapabilityFocus, onSessionComplete,
}: {
  terminalRef:       React.RefObject<HTMLDivElement | null>;
  isVisible:         boolean;
  onCapabilityFocus: (id: string) => void;
  onSessionComplete: () => void;
}) {
  const [bootPhase,     setBootPhase]     = useState<BootPhase>("idle");
  const [bootTyped,     setBootTyped]     = useState("");
  const [outputStep,    setOutputStep]    = useState(0);
  const [executingCmd,  setExecutingCmd]  = useState<string | null>(null);
  const [completedCmds, setCompletedCmds] = useState<string[]>([]);
  const [expandedCmds,  setExpandedCmds]  = useState<string[]>([]);

  const renderedCmds = executingCmd ? [...completedCmds, executingCmd] : completedCmds;
  const allCompleted = completedCmds.length === CAPABILITIES.length;
  const pillsActive  = bootPhase === "ready" && executingCmd === null && !allCompleted;

  // Boot chain
  useEffect(() => {
    if (!isVisible) return;
    const t = setTimeout(() => setBootPhase("typing"), 500);
    return () => clearTimeout(t);
  }, [isVisible]);

  useEffect(() => {
    if (bootPhase !== "typing") return;
    const cmd = "skills --list";
    let i = 0;
    const timer = setInterval(() => {
      i++; setBootTyped(cmd.slice(0, i));
      if (i >= cmd.length) { clearInterval(timer); setTimeout(() => setBootPhase("output"), 260); }
    }, 36);
    return () => clearInterval(timer);
  }, [bootPhase]);

  useEffect(() => {
    if (bootPhase !== "output") return;
    let step = 0;
    const timer = setInterval(() => {
      step++; setOutputStep(step);
      if (step >= 3) { clearInterval(timer); setTimeout(() => setBootPhase("ready"), 220); }
    }, 130);
    return () => clearInterval(timer);
  }, [bootPhase]);

  // Click capability pill
  const handleCapabilityClick = useCallback((id: string) => {
    if (!pillsActive) return;
    if (completedCmds.includes(id)) return;
    setExecutingCmd(id);
  }, [pillsActive, completedCmds]);

  // Typewriter done — first open
  const handleCommandDone = useCallback((id: string) => {
    setCompletedCmds(prev => {
      const next = [...prev, id];
      if (next.length === CAPABILITIES.length) onSessionComplete();
      return next;
    });
    setExpandedCmds(prev => [...prev, id]);
    setExecutingCmd(null);
    onCapabilityFocus(id); // DemoPanel focuses this capability
  }, [onCapabilityFocus, onSessionComplete]);

  // Toggle collapse/expand
  const handleToggle = useCallback((id: string) => {
    setExpandedCmds(prev => {
      const isOpen = prev.includes(id);
      if (!isOpen) onCapabilityFocus(id); // re-focus on re-expand
      return isOpen ? prev.filter(x => x !== id) : [...prev, id];
    });
  }, [onCapabilityFocus]);

  return (
    <motion.div
      ref={terminalRef}
      data-skills="terminal"
      className="w-full rounded-xl overflow-hidden"
      style={{
        background: "rgba(6,12,26,0.88)",
        border:     "1px solid rgba(96,165,250,0.18)",
        backdropFilter: "blur(4px)",
      }}
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      animate={isVisible ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 1.1, delay: 0.1, ease: EXPO }}
    >
      {/* macOS chrome */}
      <div className="flex items-center gap-[7px] px-4 py-3 border-b"
           style={{ borderColor: "rgba(96,165,250,0.10)", background: "rgba(6,12,26,0.55)" }}>
        {[0,1,2].map(i => (
          <div key={i} className="rounded-full" style={{ width: 11, height: 11, background: "rgba(255,255,255,0.55)" }} />
        ))}
        <span className="ml-2" style={{ ...MONO, fontSize: "0.66rem", color: "rgba(255,255,255,0.28)", letterSpacing: "0.07em" }}>
          matteo@portfolio — skills
        </span>
      </div>

      {/* Body */}
      <div className="px-5 md:px-6 py-5 md:py-6" style={{ ...MONO, fontSize: "clamp(0.70rem, 1.02vw, 0.78rem)" }}>

        {/* Boot typewriter */}
        <div className="flex items-center flex-wrap gap-x-[0.38em]">
          <span style={{ color: C.user }}>matteo@portfolio</span>
          <span style={{ color: C.path }}>:~$</span>
          {bootPhase !== "idle" && <span style={{ color: C.cmd }}>{bootTyped}</span>}
          {(bootPhase === "idle" || bootPhase === "typing") && (
            <span className="terminal-cursor" style={{ color: C.cursor }}>█</span>
          )}
        </div>

        {/* Staggered output */}
        <AnimatePresence>
          {outputStep >= 1 && (
            <motion.p key="label" className="mt-2" style={{ color: C.comment }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22 }}>
              {'>'} Available capabilities:
            </motion.p>
          )}
          {outputStep >= 2 && (
            <motion.div key="cmds" className="mt-1 flex flex-wrap gap-x-4 gap-y-1"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22 }}>
              {CAPABILITIES.map(cap => {
                const done     = completedCmds.includes(cap.id);
                const isTyping = executingCmd === cap.id;
                return (
                  <span key={cap.id}
                    onClick={() => handleCapabilityClick(cap.id)}
                    style={{
                      color: done ? "rgba(110,231,183,0.50)" : isTyping ? "rgba(255,255,255,0.50)" : pillsActive ? C.accent : "rgba(147,197,253,0.38)",
                      cursor:         pillsActive && !done ? "pointer" : "default",
                      textDecoration: pillsActive && !done ? "underline dotted rgba(147,197,253,0.35)" : "none",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {cap.command}
                    {done && <span style={{ color: "rgba(110,231,183,0.50)", marginLeft: "0.2em" }}>✓</span>}
                  </span>
                );
              })}
            </motion.div>
          )}
          {outputStep >= 3 && (
            <motion.p key="hint" className="mt-1"
                      style={{ color: C.comment, fontStyle: "italic" }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22 }}>
              {'>'} click to explore · click prompt or [−] to collapse ↗
            </motion.p>
          )}
        </AnimatePresence>

        {/* Command history */}
        {renderedCmds.map(id => {
          const cap = CAPABILITIES.find(c => c.id === id)!;
          return (
            <CommandEntry key={id} cap={cap}
              isOpen={expandedCmds.includes(id)}
              onDone={handleCommandDone}
              onToggle={handleToggle}
            />
          );
        })}

        {/* Idle cursor */}
        {bootPhase === "ready" && executingCmd === null && !allCompleted && (
          <div className="mt-3 flex items-center flex-wrap gap-x-[0.38em]">
            <span style={{ color: C.user }}>matteo@portfolio</span>
            <span style={{ color: C.path }}>:~$</span>
            <span className="terminal-cursor" style={{ color: C.cursor }}>█</span>
          </div>
        )}

        {/* Session complete */}
        {allCompleted && executingCmd === null && (
          <motion.div className="mt-3"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.35 }}>
            <div className="flex items-center flex-wrap gap-x-[0.38em]">
              <span style={{ color: C.user }}>matteo@portfolio</span>
              <span style={{ color: C.path }}>:~$</span>
              <span style={{ color: C.path }}>exit</span>
            </div>
            <p className="mt-1" style={{ color: "rgba(110,231,183,0.45)", fontSize: "0.62rem", letterSpacing: "0.06em" }}>
              Session complete. All capabilities explored.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DEMO PANEL
// ══════════════════════════════════════════════════════════════════════════════

// ── DemoPanel ─────────────────────────────────────────────────────────────────
// Right column on desktop, above terminal on mobile.
// Shows:
//   — capability title (Syne display, smaller than previous CapabilityDisplay)
//   — positioning statement
//   — live demo area (border-contained, crossfades on capability change)
//   — ↺ replay button (remounts demo via replayKey → autoplay)
//
// replayKey is controlled by parent (Skills).
// Each demo receives key={`${cap.id}-${replayKey}`} — key change = remount = autoplay.

function DemoPanel({
  activeId, replayKey, onReplay,
}: {
  activeId:  string | null;
  replayKey: number;
  onReplay:  () => void;
}) {
  const cap = activeId ? CAPABILITIES.find(c => c.id === activeId) : null;

  return (
    <div className="flex flex-col" data-skills="demo-panel">

      {/* Capability title + statement — crossfade on change */}
      <div className="mb-5" style={{ minHeight: "clamp(4.5rem, 9vw, 7rem)" }}>
        <AnimatePresence mode="wait">
          {cap ? (
            <motion.div key={cap.id}
              initial={{ opacity: 0, y: 14, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
              exit={{   opacity: 0, y: -8,  filter: "blur(4px)" }}
              transition={{ duration: 0.42, ease: EXPO }}
            >
              <h2 style={{
                fontFamily:    "'Syne', sans-serif",
                fontWeight:    800,
                fontSize:      "clamp(2.5rem, 5.5vw, 5rem)",
                lineHeight:    "0.88",
                letterSpacing: "-0.03em",
                color:         "rgba(255,255,255,0.90)",
                marginBottom:  "clamp(0.5rem, 1vw, 0.9rem)",
              }}>
                {cap.title}
              </h2>
              <p style={{
                ...MONO,
                fontSize:  "clamp(0.72rem, 1.05vw, 0.82rem)",
                color:     "rgba(255,255,255,0.38)",
                lineHeight: 1.55,
              }}>
                {cap.statement}
              </p>
            </motion.div>
          ) : (
            <motion.p key="placeholder"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ ...MONO, fontSize: "0.70rem", color: "rgba(255,255,255,0.14)", marginTop: "1.2rem" }}
            >
              ← select a capability from the terminal
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Live demo area */}
      <AnimatePresence mode="wait">
        {cap && (
          <motion.div
            key={cap.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{   opacity: 0 }}
            transition={{ duration: 0.30 }}
            style={{
              border:       "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8,
              padding:      "clamp(1rem, 2vw, 1.5rem)",
              background:   "rgba(255,255,255,0.015)",
              flex:         "1 0 auto",
            }}
          >
            {cap.id === "build"        && <BuildDemo        key={`build-${replayKey}`}        />}
            {cap.id === "animate"      && <AnimateCardDemo  key={`animate-${replayKey}`}      />}
            {cap.id === "engineer"     && <EngineerDemo     key={`engineer-${replayKey}`}     />}
            {cap.id === "performance"  && <PerformanceDemo  key={`perf-${replayKey}`}         />}
            {cap.id === "architecture" && <ArchitectureDemo key={`arch-${replayKey}`}         />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replay button */}
      {cap && (
        <button onClick={onReplay} className="mt-3 self-start" style={{
          ...MONO, fontSize: "0.60rem", color: C.comment,
          background: "none", border: "none", padding: 0, cursor: "pointer",
          letterSpacing: "0.04em", transition: "color 0.25s",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = C.accent as string)}
          onMouseLeave={e => (e.currentTarget.style.color = C.comment as string)}
        >
          ↺ replay demo
        </button>
      )}
    </div>
  );
}

// ── ProjectsBridge ────────────────────────────────────────────────────────────

function ProjectsBridge() {
  const handleScroll = () => {
    const el = document.getElementById("projects");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      data-skills="projects-bridge"
      className="mt-[clamp(3rem,5vw,5rem)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.4, ease: EXPO }}
    >
      <p style={{ ...MONO, fontSize: "clamp(0.76rem, 1.08vw, 0.86rem)", color: "rgba(255,255,255,0.30)", letterSpacing: "0.01em", lineHeight: 1.55 }}>
        Five capabilities. One coherent output.
      </p>
      <button onClick={handleScroll} style={{
        ...MONO, fontSize: "clamp(0.70rem, 1.02vw, 0.78rem)",
        color: "rgba(147,197,253,0.65)", letterSpacing: "0.06em",
        textTransform: "uppercase" as const, background: "none", border: "none",
        padding: 0, cursor: "pointer", display: "flex", alignItems: "center",
        gap: "0.5em", transition: "color 0.35s ease", flexShrink: 0,
      }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(147,197,253,1)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(147,197,253,0.65)")}
      >
        See the work
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ display: "inline-block" }}
        >→</motion.span>
      </button>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SKILLS — main export
// ══════════════════════════════════════════════════════════════════════════════

export function Skills() {
  const sectionRef  = useRef<HTMLElement | null>(null);
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const eyebrowRef  = useRef<HTMLDivElement | null>(null);
  const manifestoRef = useRef<HTMLParagraphElement | null>(null);
  const ghostNumRef = useRef<HTMLDivElement | null>(null);

  const [activeCapabilityId, setActiveCapabilityId] = useState<string | null>(null);
  const [sessionComplete,    setSessionComplete]    = useState(false);
  // replayKey: incremented by "↺ replay demo" button.
  // Resets to 0 when switching capabilities (so new demo autoplays fresh).
  const [replayKey, setReplayKey] = useState(0);

  const isInView = useInView(sectionRef, { once: true, margin: "-120px" });

  // Inject cursor blink + performance shimmer styles
  useEffect(() => {
    const id = "skills-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes terminal-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      .terminal-cursor { animation: terminal-blink 1s step-end infinite; display: inline-block; }
      @keyframes perf-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
      .perf-shimmer { animation: perf-shimmer 1.3s ease-in-out infinite; }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleCapabilityFocus = useCallback((id: string) => {
    setActiveCapabilityId(prev => {
      if (prev !== id) setReplayKey(0); // reset replay when switching
      return id;
    });
  }, []);

  const handleSessionComplete = useCallback(() => setSessionComplete(true), []);

  const handleReplay = useCallback(() => setReplayKey(k => k + 1), []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#060c1a] px-6 md:px-12 lg:px-20 py-[clamp(5rem,12vw,10rem)]"
    >

      {/* Ambient gradient */}
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none" style={{
        background: [
          "radial-gradient(ellipse 60% 55% at 12% 30%, rgba(29,78,216,0.22) 0%, transparent 55%)",
          "radial-gradient(ellipse 50% 50% at 85% 70%, rgba(6,182,212,0.14) 0%, transparent 52%)",
          "radial-gradient(ellipse 40% 45% at 48% 52%, rgba(29,78,216,0.07) 0%, transparent 60%)",
        ].join(", "),
      }} />

      {/* Ghost "03"
          GSAP (future):
            gsap.to(ghostNumRef.current, {
              y: -60, ease: "none",
              scrollTrigger: { trigger: sectionRef.current,
                start: "top bottom", end: "bottom top", scrub: 1.5 },
            });
      */}
      <motion.div ref={ghostNumRef} aria-hidden="true" data-skills="ghost-num"
        className="absolute bottom-[-0.18em] right-[-0.04em] z-0 leading-none select-none pointer-events-none"
        style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(14rem, 28vw, 38rem)", color: "rgba(96,165,250,0.052)", letterSpacing: "-0.04em" }}
        initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 2.5, delay: 0.6, ease: "easeOut" }}
      >03</motion.div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto">

        {/* Eyebrow */}
        <motion.div ref={eyebrowRef} data-skills="eyebrow" className="mb-10 flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: EXPO }}>
          <div className="w-6 h-px bg-blue-400/60" />
          <span className="text-blue-300/65 text-[10px] tracking-[0.42em] uppercase" style={MONO}>
            Stack — 03
          </span>
        </motion.div>

        {/* Manifesto */}
        <motion.p ref={manifestoRef} data-skills="manifesto" className="mb-16 max-w-xl leading-relaxed"
          style={{ ...MONO, fontSize: "clamp(0.80rem, 1.2vw, 0.92rem)", color: "rgba(255,255,255,0.38)", letterSpacing: "0.01em" }}
          initial={{ opacity: 0, y: 14 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.18, ease: EXPO }}>
          {MANIFESTO}
        </motion.p>

        {/* Top separator */}
        <motion.div aria-hidden="true" data-skills="sep-top"
          className="h-px bg-gradient-to-r from-white/12 via-white/5 to-transparent origin-left mb-[clamp(3rem,6vw,6rem)]"
          initial={{ scaleX: 0 }} animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.1, delay: 0.22, ease: EXPO }} />

        {/* ── Split layout ──────────────────────────────────────────────────────
            Mobile:  flex-col-reverse → DemoPanel appears above Terminal visually.
                     User sees the demo update as they interact with the terminal below.
            Desktop: flex-row → Terminal left, DemoPanel right.
        ─────────────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-12 items-start">

          {/* Terminal — full width mobile, 45% desktop */}
          <div className="w-full lg:w-[45%] flex-shrink-0">
            <Terminal
              terminalRef={terminalRef}
              isVisible={isInView}
              onCapabilityFocus={handleCapabilityFocus}
              onSessionComplete={handleSessionComplete}
            />
          </div>

          {/* Demo panel — full width mobile, fills remaining desktop space */}
          <div className="w-full lg:flex-1 lg:min-w-0">
            <DemoPanel
              activeId={activeCapabilityId}
              replayKey={replayKey}
              onReplay={handleReplay}
            />
          </div>
        </div>

        {/* Projects bridge */}
        <AnimatePresence>
          {sessionComplete && <ProjectsBridge key="bridge" />}
        </AnimatePresence>

        {/* Bottom separator */}
        <motion.div aria-hidden="true" data-skills="sep-bottom"
          className="h-px bg-gradient-to-r from-white/10 via-white/4 to-transparent origin-left mt-[clamp(3rem,6vw,6rem)]"
          initial={{ scaleX: 0 }} animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.1, delay: 0.5, ease: EXPO }} />

      </div>
    </section>
  );
}