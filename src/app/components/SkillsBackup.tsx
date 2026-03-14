"use client";

import { motion, AnimatePresence, useInView } from "motion/react";
import { useRef, useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Skills — Developer Terminal
//
// Narrative: Hero → identity · Philosophy → principles · Skills → how I work
//
// Boot sequence (auto on scroll enter):
//   terminal fades in → typewriter "skills --list" → staggered output →
//   capability names become clickable
//
// Command execution (click-driven):
//   click capability → typewriter "skills --open [name]" →
//   module expands inline (AnimatePresence height animation)
//
// Toggle:
//   click prompt line after typing → collapse/expand module
//   click [−] collapse row inside module → same effect
//   [+]/[−] indicator appears on prompt line after typing completes
//
// Modules include:
//   — title + tools
//   — positioning statement
//   — two detail lines
//   — [show code] / [hide code] toggle → inline syntax-highlighted snippet
//   — AnimateDemo (animate only): click-triggered spring / scale / pulse
//
// CapabilityDisplay (above terminal):
//   shows active capability name at Syne display scale + statement
//   crossfades on capability change via AnimatePresence mode="wait"
//
// ProjectsBridge (below terminal, after session complete):
//   synthesis line + scroll link to #projects
//
// GSAP-ready:
//   sectionRef  → gsap.context() scope
//   terminalRef → replace Framer entrance with ScrollTrigger
//   eyebrowRef, manifestoRef, ghostNumRef → scroll targets
//   data-skills attributes → gsap.utils.toArray()
// ─────────────────────────────────────────────────────────────────────────────

type BootPhase = "idle" | "typing" | "output" | "ready";

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const MANIFESTO = "A session with my stack.";
const MONO: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };

// Terminal color tokens
const C = {
  user:    "rgba(96,165,250,0.80)",
  path:    "rgba(255,255,255,0.32)",
  cmd:     "rgba(255,255,255,0.88)",
  output:  "rgba(255,255,255,0.42)",
  accent:  "rgba(147,197,253,0.75)",
  comment: "rgba(255,255,255,0.22)",
  success: "rgba(110,231,183,0.65)",
  cursor:  "rgba(96,165,250,0.80)",
  kw:      "rgba(147,197,253,0.85)",   // keyword — blue-300
  str:     "rgba(110,231,183,0.75)",   // string literal — green
} as const;

// ── Capability data ───────────────────────────────────────────────────────────
interface Capability {
  id:        string;
  command:   string;
  title:     string;
  tools:     string[];
  statement: string;
  details:   string[];
  code:      string[];   // real short snippet — shown via CodeSnippet toggle
  demo?:     boolean;
}

const CAPABILITIES: Capability[] = [
  {
    id:        "build",
    command:   "build",
    title:     "Build",
    tools:     ["React", "Next.js"],
    statement: "Interfaces that think in systems, not components.",
    details: [
      "Component architecture with intentional data flow.",
      "Server-side rendering as a default, not an afterthought.",
    ],
    code: [
      "// colocate state with its data shape",
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
    id:        "animate",
    command:   "animate",
    title:     "Animate",
    tools:     ["GSAP", "Framer Motion"],
    statement: "The layer most developers treat as optional.",
    details: [
      "Scroll-driven timelines that respond to intention.",
      "Physics-based springs that feel physical.",
    ],
    code: [
      "// scroll-driven timeline",
      "gsap.to(el, {",
      "  y: -60, ease: 'none',",
      "  scrollTrigger: { scrub: 1.5 },",
      "})",
      "",
      "// spring that feels physical",
      "transition={{ type: 'spring', stiffness: 280 }}",
    ],
    demo: true,
  },
  {
    id:        "engineer",
    command:   "engineer",
    title:     "Engineer",
    tools:     ["TypeScript", "CSS Craft"],
    statement: "Precision as a design tool, not just a safety net.",
    details: [
      "Types that make architectural decisions visible.",
      "CSS as an engineering discipline, not decoration.",
    ],
    code: [
      "// discriminated union",
      "type Result<T> =",
      "  | { ok: true;  data: T }",
      "  | { ok: false; error: string }",
      "",
      "// CSS custom property system",
      "--radius: 0.5rem;",
      "--color: oklch(65% 0.22 240);",
    ],
  },
  {
    id:        "performance",
    command:   "performance",
    title:     "Performance",
    tools:     ["Web Vitals", "Lighthouse"],
    statement: "Speed is felt before it is measured.",
    details: [
      "Core Web Vitals as first-class design constraints.",
      "Bundle analysis and lazy loading as standard practice.",
    ],
    code: [
      "// critical path only on initial load",
      "const Heavy = dynamic(() => import('./Heavy'))",
      "",
      "// avoid layout shift",
      "aspect-ratio: 16 / 9;",
      "",
      "// image with priority hint",
      "<Image src={src} priority fetchpriority='high' />",
    ],
  },
  {
    id:          "architecture",
    command:     "architecture",
    title:       "Architecture",
    tools:       ["Design Systems", "Monorepo"],
    statement:   "Structure that scales without accumulating debt.",
    details: [
      "Design tokens and component hierarchies that hold.",
      "Monorepo tooling that keeps teams and codebases aligned.",
    ],
    code: [
      "// design token layer",
      "--spacing-4: 1rem;",
      "--color-brand: oklch(65% 0.22 240);",
      "",
      "// variant-based components",
      "const btn = cva('base', {",
      "  variants: { size: { sm: '...', lg: '...' } },",
      "})",
    ],
  },
];

// ── highlightLine ─────────────────────────────────────────────────────────────
// Minimal inline syntax highlighter — no deps, no runtime libs.
// Priority: empty → comment → string → keyword segments → plain.
// Used inside CodeSnippet. Returns a single <span> or fragment.
const JS_KEYWORDS = new Set([
  "const","let","var","type","interface","export","default","async",
  "function","return","import","from","await","extends","dynamic","true","false",
]);

function highlightLine(line: string): React.ReactNode {
  if (line === "") return <>&nbsp;</>;

  // Full-line comment
  if (line.trimStart().startsWith("//")) {
    return <span style={{ color: C.comment }}>{line}</span>;
  }

  // CSS property lines (contain : but not =>)
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

  // Tokenize: strings, keywords, rest
  const tokens: React.ReactNode[] = [];
  // Regex: strings (single/double/backtick) | word tokens | non-word chars
  const re = /(['"`])(?:(?!\1)[^\\]|\\.)*?\1|\w+|[^\w\s]/g;
  let match: RegExpExecArray | null;
  let last = 0;
  let idx  = 0;

  while ((match = re.exec(line)) !== null) {
    // Gap text (spaces, indentation)
    if (match.index > last) {
      tokens.push(
        <span key={idx++} style={{ color: C.output }}>
          {line.slice(last, match.index)}
        </span>,
      );
    }
    const tok = match[0];
    if (/^['"`]/.test(tok)) {
      tokens.push(<span key={idx++} style={{ color: C.str }}>{tok}</span>);
    } else if (JS_KEYWORDS.has(tok)) {
      tokens.push(<span key={idx++} style={{ color: C.kw }}>{tok}</span>);
    } else if (/^[<>{}()]$/.test(tok)) {
      tokens.push(<span key={idx++} style={{ color: "rgba(255,255,255,0.28)" }}>{tok}</span>);
    } else {
      tokens.push(<span key={idx++} style={{ color: C.output }}>{tok}</span>);
    }
    last = match.index + tok.length;
  }
  if (last < line.length) {
    tokens.push(
      <span key={idx++} style={{ color: C.output }}>{line.slice(last)}</span>,
    );
  }
  return <>{tokens}</>;
}

// ── CodeSnippet ───────────────────────────────────────────────────────────────
// Inline code block with show/hide toggle and syntax highlighting.
// Toggle affordance: "[show code]" / "[hide code]" in C.comment style.
// Pre block uses slightly darker background than terminal body.
// Local state only — purely presentational.
function CodeSnippet({ lines }: { lines: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          ...MONO,
          fontSize:   "0.66rem",
          color:      open ? C.comment : C.accent,
          background: "none",
          border:     "none",
          padding:    0,
          cursor:     "pointer",
          letterSpacing: "0.04em",
          transition: "color 0.3s ease",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.color = open ? C.comment : C.accent;
        }}
      >
        {open ? "[hide code]" : "[show code]"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: EXPO }}
            style={{ overflow: "hidden" }}
          >
            <pre
              className="mt-2 rounded-lg px-4 py-3 overflow-x-auto"
              style={{
                ...MONO,
                fontSize:   "clamp(0.64rem, 0.9vw, 0.72rem)",
                lineHeight: 1.7,
                background: "rgba(3,7,18,0.6)",
                border:     "1px solid rgba(96,165,250,0.10)",
                margin:     0,
              }}
            >
              {lines.map((line, i) => (
                <div key={i}>{highlightLine(line)}</div>
              ))}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── AnimateDemo ───────────────────────────────────────────────────────────────
// Three click-triggered animation primitives.
// Each button increments a key — remounting the motion element re-runs
// the animation from initial, without needing useAnimation or complex state.
// This mirrors the actual usage pattern: animations are triggered, not looped.
function AnimateDemo() {
  const [springKey, setSpringKey] = useState(0);
  const [scaleKey,  setScaleKey]  = useState(0);
  const [pulseKey,  setPulseKey]  = useState(0);

  return (
    <div className="mt-3">
      <p style={{ ...MONO, fontSize: "0.62rem", color: C.comment, marginBottom: "0.6rem" }}>
        {">"} click to trigger
      </p>
      <div className="flex items-center gap-5 flex-wrap">

        {/* Spring */}
        <button
          onClick={() => setSpringKey(k => k + 1)}
          className="flex items-center gap-2 group"
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
          title="spring"
        >
          <div style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div
              key={springKey}
              className="rounded-full"
              style={{ width: 7, height: 7, background: "rgba(147,197,253,0.72)" }}
              initial={{ y: 0 }}
              animate={springKey > 0 ? { y: [-8, 8, -5, 5, 0] } : {}}
              transition={{ duration: 0.7, ease: [0.45, 0, 0.55, 1] }}
            />
          </div>
          <span style={{ ...MONO, fontSize: "0.62rem", color: C.comment, transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.accent as string)}
                onMouseLeave={e => (e.currentTarget.style.color = C.comment as string)}>
            spring
          </span>
        </button>

        {/* Scale */}
        <button
          onClick={() => setScaleKey(k => k + 1)}
          className="flex items-center gap-2"
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
          title="scale"
        >
          <div style={{ width: 40, height: 18, display: "flex", alignItems: "center" }}>
            <motion.div
              key={scaleKey}
              style={{
                width: 38, height: 1,
                background:      "rgba(147,197,253,0.55)",
                transformOrigin: "left center",
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={scaleKey > 0 ? { scaleX: [0, 1, 0.3], opacity: [0, 0.9, 0.4] } : {}}
              transition={{ duration: 0.8, ease: EXPO }}
            />
          </div>
          <span style={{ ...MONO, fontSize: "0.62rem", color: C.comment, transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.accent as string)}
                onMouseLeave={e => (e.currentTarget.style.color = C.comment as string)}>
            scale
          </span>
        </button>

        {/* Pulse */}
        <button
          onClick={() => setPulseKey(k => k + 1)}
          className="flex items-center gap-2"
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
          title="pulse"
        >
          <div style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div
              key={pulseKey}
              className="rounded-full border"
              style={{ width: 8, height: 8, borderColor: "rgba(147,197,253,0.6)" }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={pulseKey > 0 ? { scale: [0.5, 2, 0.5], opacity: [0, 0.85, 0] } : {}}
              transition={{ duration: 0.75, ease: "easeOut" }}
            />
          </div>
          <span style={{ ...MONO, fontSize: "0.62rem", color: C.comment, transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.accent as string)}
                onMouseLeave={e => (e.currentTarget.style.color = C.comment as string)}>
            pulse
          </span>
        </button>

      </div>
    </div>
  );
}

// ── CapabilityModule ──────────────────────────────────────────────────────────
// The output block for a given capability.
// Height-animated via AnimatePresence in parent (CommandEntry).
// onCollapse: called by the [−] collapse row at the bottom.
function CapabilityModule({
  cap,
  onCollapse,
}: {
  cap:        Capability;
  onCollapse: () => void;
}) {
  return (
    <div
      className="mt-1 ml-2 border-l pl-4 py-2"
      style={{ borderColor: "rgba(96,165,250,0.16)" }}
    >
      {/* Title + tools */}
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 mb-2">
        <span style={{ ...MONO, fontSize: "clamp(0.78rem, 1.1vw, 0.88rem)", color: C.accent, fontWeight: 600 }}>
          {cap.title}
        </span>
        <span style={{
          ...MONO,
          fontSize:      "0.64rem",
          color:         C.comment,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
        }}>
          {cap.tools.join(" · ")}
        </span>
      </div>

      {/* Positioning statement */}
      <p style={{ ...MONO, fontSize: "clamp(0.75rem, 1.05vw, 0.84rem)", color: C.cmd, lineHeight: 1.55, marginBottom: "0.45rem" }}>
        {cap.statement}
      </p>

      {/* Detail lines */}
      {cap.details.map((line, i) => (
        <p key={i} style={{ ...MONO, fontSize: "clamp(0.70rem, 0.98vw, 0.78rem)", color: C.output, lineHeight: 1.55 }}>
          <span style={{ color: C.success, marginRight: "0.55rem" }}>→</span>
          {line}
        </p>
      ))}

      {/* Animate micro-demo — click-triggered */}
      {cap.demo && <AnimateDemo />}

      {/* Code snippet toggle */}
      <CodeSnippet lines={cap.code} />

      {/* ── [−] collapse row ─────────────────────────────────────────────────
          Terminal-native affordance — matches the visual language of the
          prompt line toggle. Placed at the bottom of the module so it reads
          as "end of this output block, collapse it."
      ─────────────────────────────────────────────────────────────────────── */}
      <button
        onClick={onCollapse}
        className="mt-3 block"
        style={{
          ...MONO,
          fontSize:      "0.64rem",
          color:         C.comment,
          background:    "none",
          border:        "none",
          padding:       0,
          cursor:        "pointer",
          letterSpacing: "0.04em",
          transition:    "color 0.25s ease",
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
// Manages its own typewriter sequence.
// Module visibility controlled externally via isOpen prop.
//
// After typing completes:
//   — prompt line becomes clickable (calls onToggle)
//   — [+]/[−] indicator appears inline with the command
//
// GSAP (future): replace useEffect typewriter with gsap.timeline() call:
//   tl.to(countRef, { value: fullCmd.length, onUpdate: () => setTyped(...) })
//   tl.call(() => { setTypingDone(true); onDone(cap.id); })
function CommandEntry({
  cap,
  isOpen,
  onDone,
  onToggle,
}: {
  cap:      Capability;
  isOpen:   boolean;
  onDone:   (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const [typed,       setTyped]       = useState("");
  const [typingDone,  setTypingDone]  = useState(false);
  const firedRef  = useRef(false);
  const fullCmd   = `skills --open ${cap.command}`;

  // Typewriter — runs once on mount (keyed by cap.id in parent)
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

      {/* ── Prompt line ────────────────────────────────────────────────────────
          Clickable after typing completes.
          [+] when module collapsed, [−] when expanded.
          cursor: pointer appears only when interactive.
      ─────────────────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center flex-wrap gap-x-[0.38em]"
        style={{
          ...MONO,
          fontSize:   "clamp(0.72rem, 1.05vw, 0.80rem)",
          cursor:     typingDone ? "pointer" : "default",
        }}
        onClick={() => typingDone && onToggle(cap.id)}
        title={typingDone ? (isOpen ? "Collapse" : "Expand") : undefined}
      >
        <span style={{ color: C.user }}>matteo@portfolio</span>
        <span style={{ color: C.path }}>:~$</span>
        <span style={{ color: C.cmd }}>{typed}</span>

        {/* Cursor during typing */}
        {!typingDone && (
          <span className="terminal-cursor" style={{ color: C.cursor }}>█</span>
        )}

        {/* Toggle indicator after typing — [+] or [−] */}
        {typingDone && (
          <span
            style={{
              color:      isOpen ? C.comment : C.accent,
              marginLeft: "0.4em",
              fontSize:   "0.62rem",
              transition: "color 0.25s ease",
            }}
          >
            {isOpen ? "[−]" : "[+]"}
          </span>
        )}
      </div>

      {/* Module — height-animated via AnimatePresence */}
      <AnimatePresence>
        {typingDone && isOpen && (
          <motion.div
            key={`module-${cap.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EXPO }}
            style={{ overflow: "hidden" }}
          >
            <CapabilityModule
              cap={cap}
              onCollapse={() => onToggle(cap.id)}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ── Terminal ──────────────────────────────────────────────────────────────────
// State model:
//   bootPhase:    idle → typing → output → ready
//   executingCmd: string | null  — currently being typed
//   completedCmds: string[]      — executed (never shrinks)
//   expandedCmds:  string[]      — subset of completedCmds currently open
//
// A command is auto-expanded when its typewriter completes.
// handleToggle flips membership in expandedCmds.
function Terminal({
  terminalRef,
  isVisible,
  onCommandComplete,
  onSessionComplete,
}: {
  terminalRef:       React.RefObject<HTMLDivElement | null>;
  isVisible:         boolean;
  onCommandComplete: (id: string) => void;
  onSessionComplete: () => void;
}) {
  const [bootPhase,    setBootPhase]    = useState<BootPhase>("idle");
  const [bootTyped,    setBootTyped]    = useState("");
  const [outputStep,   setOutputStep]   = useState(0);
  const [executingCmd, setExecutingCmd] = useState<string | null>(null);
  const [completedCmds, setCompletedCmds] = useState<string[]>([]);
  const [expandedCmds,  setExpandedCmds]  = useState<string[]>([]);

  const renderedCmds = executingCmd
    ? [...completedCmds, executingCmd]
    : completedCmds;

  const allCompleted = completedCmds.length === CAPABILITIES.length;
  const pillsActive  = bootPhase === "ready" && executingCmd === null && !allCompleted;

  // ── Boot chain ───────────────────────────────────────────────────────────
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
      i++;
      setBootTyped(cmd.slice(0, i));
      if (i >= cmd.length) {
        clearInterval(timer);
        setTimeout(() => setBootPhase("output"), 260);
      }
    }, 36);
    return () => clearInterval(timer);
  }, [bootPhase]);

  useEffect(() => {
    if (bootPhase !== "output") return;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setOutputStep(step);
      if (step >= 3) {
        clearInterval(timer);
        setTimeout(() => setBootPhase("ready"), 220);
      }
    }, 130);
    return () => clearInterval(timer);
  }, [bootPhase]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCapabilityClick = useCallback((id: string) => {
    if (!pillsActive) return;
    if (completedCmds.includes(id)) return;
    setExecutingCmd(id);
  }, [pillsActive, completedCmds]);

  // Called by CommandEntry when typewriter finishes.
  // Auto-expands the module on first open.
  const handleCommandDone = useCallback((id: string) => {
    setCompletedCmds(prev => {
      const next = [...prev, id];
      if (next.length === CAPABILITIES.length) onSessionComplete();
      return next;
    });
    setExpandedCmds(prev => [...prev, id]); // auto-expand on first reveal
    setExecutingCmd(null);
    onCommandComplete(id);
  }, [onCommandComplete, onSessionComplete]);

  // Toggle a module open/closed.
  const handleToggle = useCallback((id: string) => {
    setExpandedCmds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  }, []);

  return (
    <motion.div
      ref={terminalRef}
      data-skills="terminal"
      className="w-full rounded-xl overflow-hidden"
      style={{
        background:     "rgba(6,12,26,0.88)",
        border:         "1px solid rgba(96,165,250,0.18)",
        backdropFilter: "blur(4px)",
      }}
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      animate={isVisible ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 1.1, delay: 0.1, ease: EXPO }}
    >
      {/* macOS chrome */}
      <div
        className="flex items-center gap-[7px] px-4 py-3 border-b"
        style={{ borderColor: "rgba(96,165,250,0.10)", background: "rgba(6,12,26,0.55)" }}
      >
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-full"
               style={{ width: 11, height: 11, background: "rgba(255,255,255,0.55)" }} />
        ))}
        <span className="ml-2" style={{ ...MONO, fontSize: "0.68rem", color: "rgba(255,255,255,0.30)", letterSpacing: "0.07em" }}>
          matteo@portfolio — skills
        </span>
      </div>

      {/* Terminal body */}
      <div className="px-5 md:px-7 py-5 md:py-6" style={{ ...MONO, fontSize: "clamp(0.72rem, 1.05vw, 0.80rem)" }}>

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
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              {'>'} Available capabilities:
            </motion.p>
          )}

          {outputStep >= 2 && (
            <motion.div key="cmds" className="mt-1 flex flex-wrap gap-x-5 gap-y-1"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              {CAPABILITIES.map(cap => {
                const done     = completedCmds.includes(cap.id);
                const isTyping = executingCmd === cap.id;
                return (
                  <span
                    key={cap.id}
                    onClick={() => handleCapabilityClick(cap.id)}
                    title={pillsActive && !done ? `Run: skills --open ${cap.command}` : undefined}
                    style={{
                      color: done ? "rgba(110,231,183,0.48)"
                           : isTyping ? "rgba(255,255,255,0.50)"
                           : pillsActive ? C.accent
                           : "rgba(147,197,253,0.38)",
                      cursor:         pillsActive && !done ? "pointer" : "default",
                      textDecoration: pillsActive && !done
                        ? "underline dotted rgba(147,197,253,0.35)" : "none",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {cap.command}
                    {done && <span style={{ color: "rgba(110,231,183,0.48)", marginLeft: "0.2em" }}>✓</span>}
                  </span>
                );
              })}
            </motion.div>
          )}

          {outputStep >= 3 && (
            <motion.p key="hint" className="mt-1"
                      style={{ color: C.comment, fontStyle: "italic" }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              {'>'} click a capability name to explore — click prompt line or [−] to collapse ↗
            </motion.p>
          )}
        </AnimatePresence>

        {/* Command history */}
        {renderedCmds.map(id => {
          const cap = CAPABILITIES.find(c => c.id === id)!;
          return (
            <CommandEntry
              key={id}
              cap={cap}
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
            <p className="mt-1" style={{ color: "rgba(110,231,183,0.45)", fontSize: "0.64rem", letterSpacing: "0.06em" }}>
              Session complete. All capabilities explored.
            </p>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}

// ── CapabilityDisplay ─────────────────────────────────────────────────────────
// Active capability name in Syne display scale + statement.
// Lives outside the terminal — uses full section viewport width.
// Crossfades on capability change via AnimatePresence mode="wait".
// min-h prevents layout shift before first command completes.
function CapabilityDisplay({
  activeId,
  displayRef,
}: {
  activeId:   string | null;
  displayRef: React.RefObject<HTMLDivElement | null>;
}) {
  const cap = activeId ? CAPABILITIES.find(c => c.id === activeId) : null;

  return (
    <div
      ref={displayRef}
      data-skills="capability-display"
      className="mb-[clamp(2.5rem,5vw,5rem)] min-h-[clamp(7rem,14vw,12rem)] flex flex-col justify-end"
    >
      <AnimatePresence mode="wait">
        {cap ? (
          <motion.div
            key={cap.id}
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
            exit={{   opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.55, ease: EXPO }}
          >
            <h2
              data-skills={`display-name-${cap.id}`}
              style={{
                fontFamily:    "'Syne', sans-serif",
                fontWeight:    800,
                fontSize:      "clamp(4rem, 8vw, 9rem)",
                lineHeight:    "0.88",
                letterSpacing: "-0.035em",
                color:         "rgba(255,255,255,0.90)",
                marginBottom:  "clamp(0.8rem, 1.4vw, 1.2rem)",
              }}
            >
              {cap.title}
            </h2>
            <p style={{
              ...MONO,
              fontSize:      "clamp(0.78rem, 1.15vw, 0.90rem)",
              color:         "rgba(255,255,255,0.42)",
              letterSpacing: "0.01em",
              lineHeight:    1.55,
            }}>
              {cap.statement}
            </p>
          </motion.div>
        ) : (
          <motion.p
            key="placeholder"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ ...MONO, fontSize: "clamp(0.72rem, 1.0vw, 0.80rem)", color: "rgba(255,255,255,0.18)", letterSpacing: "0.04em" }}
          >
            — select a capability to explore
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ProjectsBridge ────────────────────────────────────────────────────────────
// Appears after session complete. Bridges Skills → Projects.
// "Five capabilities. One coherent output." + "See the work →"
function ProjectsBridge() {
  const handleScrollToProjects = () => {
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
      <p style={{ ...MONO, fontSize: "clamp(0.78rem, 1.1vw, 0.88rem)", color: "rgba(255,255,255,0.32)", letterSpacing: "0.01em", lineHeight: 1.55 }}>
        Five capabilities. One coherent output.
      </p>
      <button
        onClick={handleScrollToProjects}
        style={{
          ...MONO,
          fontSize:      "clamp(0.72rem, 1.05vw, 0.80rem)",
          color:         "rgba(147,197,253,0.65)",
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
          background:    "none",
          border:        "none",
          padding:       0,
          cursor:        "pointer",
          display:       "flex",
          alignItems:    "center",
          gap:           "0.5em",
          transition:    "color 0.35s ease",
          flexShrink:    0,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(147,197,253,1)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(147,197,253,0.65)")}
      >
        See the work
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ display: "inline-block" }}
        >
          →
        </motion.span>
      </button>
    </motion.div>
  );
}

// ── Skills ────────────────────────────────────────────────────────────────────
export function Skills() {
  const sectionRef   = useRef<HTMLElement | null>(null);
  const terminalRef  = useRef<HTMLDivElement | null>(null);
  const eyebrowRef   = useRef<HTMLDivElement | null>(null);
  const manifestoRef = useRef<HTMLParagraphElement | null>(null);
  const ghostNumRef  = useRef<HTMLDivElement | null>(null);
  const displayRef   = useRef<HTMLDivElement | null>(null);

  const [activeCapabilityId, setActiveCapabilityId] = useState<string | null>(null);
  const [sessionComplete,    setSessionComplete]    = useState(false);

  const isInView = useInView(sectionRef, { once: true, margin: "-120px" });

  // Terminal cursor blink — injected once, cleaned up on unmount
  useEffect(() => {
    const id = "skills-terminal-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes terminal-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      .terminal-cursor { animation: terminal-blink 1s step-end infinite; display: inline-block; }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleCommandComplete = useCallback((id: string) => {
    setActiveCapabilityId(id);
  }, []);

  const handleSessionComplete = useCallback(() => {
    setSessionComplete(true);
  }, []);

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
      <motion.div
        ref={ghostNumRef}
        aria-hidden="true"
        data-skills="ghost-num"
        className="absolute bottom-[-0.18em] right-[-0.04em] z-0 leading-none select-none pointer-events-none"
        style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(14rem, 28vw, 38rem)", color: "rgba(96,165,250,0.052)", letterSpacing: "-0.04em" }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 2.5, delay: 0.6, ease: "easeOut" }}
      >
        03
      </motion.div>

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

        <CapabilityDisplay activeId={activeCapabilityId} displayRef={displayRef} />

        <Terminal
          terminalRef={terminalRef}
          isVisible={isInView}
          onCommandComplete={handleCommandComplete}
          onSessionComplete={handleSessionComplete}
        />

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