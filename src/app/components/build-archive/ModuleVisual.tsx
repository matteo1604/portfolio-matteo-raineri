import { motion } from "motion/react";

import type { BuildArchiveModule } from "./archive.types";

interface ModuleVisualProps {
  module: BuildArchiveModule;
}

type NodeMarkerProps = ModuleVisualProps & {
  left: string;
  top: string;
  active?: boolean;
  size?: "sm" | "md";
};

type PlateProps = ModuleVisualProps & {
  className: string;
  label: string;
  active?: boolean;
};

const GRID_STYLE = {
  backgroundImage: [
    "linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px)",
    "linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)",
    "linear-gradient(180deg, rgba(255,255,255,0.03), transparent 18%)",
  ].join(", "),
  backgroundSize: "40px 40px, 40px 40px, 100% 100%",
};

function NodeMarker({
  module,
  left,
  top,
  active = false,
  size = "sm",
}: NodeMarkerProps) {
  const sizeClass = size === "md" ? "h-3.5 w-3.5" : "h-2.5 w-2.5";

  return (
    <div
      aria-hidden="true"
      data-build-blueprint-node=""
      data-build-active={active ? "" : undefined}
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border ${sizeClass}`}
      style={{
        left,
        top,
        borderColor: active ? module.accent.line : "rgba(255,255,255,0.18)",
        background: active ? module.accent.surface : "rgba(255,255,255,0.03)",
        boxShadow: active ? `0 0 14px ${module.accent.glow}` : "none",
      }}
    />
  );
}

function Plate({ module, className, label, active = false }: PlateProps) {
  return (
    <div
      aria-hidden="true"
      className={`absolute overflow-hidden rounded-[14px] border ${className}`}
      style={{
        borderColor: active ? module.accent.line : "rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.012)",
      }}
    >
      <div
        className="h-px w-full"
        style={{
          background: active ? module.accent.line : "rgba(255,255,255,0.1)",
        }}
      />
      <div className="px-3 py-2.5">
        <span
          className="block text-[9px] uppercase tracking-[0.24em]"
          style={{
            fontFamily: "'DM Mono', monospace",
            color: active ? module.accent.text : "rgba(255,255,255,0.34)",
          }}
        >
          {label}
        </span>
        <div className="mt-2 space-y-1.5">
          <div className="h-1 rounded-full bg-white/[0.07]" />
          <div
            className="h-1 rounded-full"
            style={{
              background: active ? module.accent.surface : "rgba(255,255,255,0.05)",
            }}
          />
          <div className="h-1 rounded-full bg-white/[0.05]" />
        </div>
      </div>
    </div>
  );
}

function VisualChrome({ module }: ModuleVisualProps) {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.14]"
        data-build-blueprint-grid=""
        style={GRID_STYLE}
      />
      <div
        aria-hidden="true"
        className="absolute inset-[14px] rounded-[24px] border border-white/[0.08]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-[32px] rounded-[18px] border border-white/[0.05]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        data-build-blueprint-signal=""
        style={{
          background: `linear-gradient(90deg, ${module.accent.line}, transparent 72%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute left-[14%] right-[14%] top-1/2 h-px bg-white/[0.05]"
        data-build-blueprint-signal=""
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[16%] top-[16%] left-1/2 w-px bg-white/[0.05]"
        data-build-blueprint-signal=""
      />
      <div
        aria-hidden="true"
        className="absolute left-5 top-5 h-4 w-4 border-l border-t border-white/[0.12]"
      />
      <div
        aria-hidden="true"
        className="absolute right-5 top-5 h-4 w-4 border-r border-t border-white/[0.12]"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-5 left-5 h-4 w-4 border-b border-l border-white/[0.12]"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-5 right-5 h-4 w-4 border-b border-r border-white/[0.12]"
      />
      <div
        aria-hidden="true"
        className="absolute left-6 top-6 text-[10px] uppercase tracking-[0.32em]"
        style={{ fontFamily: "'DM Mono', monospace", color: module.accent.muted }}
      >
        blueprint surface
      </div>
      <div
        aria-hidden="true"
        className="absolute right-6 top-6 text-[10px] uppercase tracking-[0.26em]"
        style={{ fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.28)" }}
      >
        module registry
      </div>
      <div
        aria-hidden="true"
        className="absolute bottom-6 left-6 text-[10px] uppercase tracking-[0.24em]"
        style={{ fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.24)" }}
      >
        routing mesh
      </div>
      <div
        aria-hidden="true"
        className="absolute bottom-6 right-6 text-[10px] uppercase tracking-[0.32em]"
        style={{ fontFamily: "'DM Mono', monospace", color: module.accent.muted }}
      >
        {module.visualType}
      </div>
      <NodeMarker module={module} left="14%" top="50%" />
      <NodeMarker module={module} left="50%" top="16%" />
      <NodeMarker module={module} left="86%" top="50%" />
      <NodeMarker module={module} left="50%" top="84%" />
    </>
  );
}

function EngineVisual({ module }: ModuleVisualProps) {
  return (
    <>
      <Plate
        module={module}
        label="input core"
        className="left-[14%] top-[20%] h-[5.8rem] w-[8.6rem]"
        active
      />
      <Plate
        module={module}
        label="state mesh"
        className="right-[14%] top-[22%] h-[5.6rem] w-[8rem]"
      />
      <Plate
        module={module}
        label="event bus"
        className="left-[16%] bottom-[20%] h-[5.4rem] w-[7.8rem]"
      />
      <Plate
        module={module}
        label="output lane"
        className="right-[15%] bottom-[18%] h-[5.8rem] w-[8.4rem]"
        active
      />

      <div
        className="absolute left-1/2 top-[47%] h-[12.5rem] w-[12.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{ borderColor: "rgba(255,255,255,0.14)" }}
      />
      <div
        className="absolute left-1/2 top-[47%] h-[8.8rem] w-[8.8rem] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{ borderColor: module.accent.line }}
      />
      <div
        className="absolute left-1/2 top-[47%] h-[4.2rem] w-[4.2rem] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{ borderColor: "rgba(255,255,255,0.16)", background: module.accent.surface }}
      />
      <NodeMarker module={module} left="50%" top="47%" active size="md" />

      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        data-build-blueprint-signal=""
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path d="M29 31 L43 41" stroke={module.accent.line} strokeWidth="0.3" fill="none" />
        <path d="M71 32 L57 41" stroke={module.accent.line} strokeWidth="0.3" fill="none" />
        <path d="M31 70 L43 55" stroke={module.accent.line} strokeWidth="0.3" fill="none" />
        <path d="M69 69 L57 55" stroke={module.accent.line} strokeWidth="0.3" fill="none" />
        <path
          d="M20 47 H33 M67 47 H80"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="0.28"
          fill="none"
        />
      </svg>

      <NodeMarker module={module} left="29%" top="31%" />
      <NodeMarker module={module} left="71%" top="32%" />
      <NodeMarker module={module} left="31%" top="70%" />
      <NodeMarker module={module} left="69%" top="69%" />
    </>
  );
}

function MotionVisual({ module }: ModuleVisualProps) {
  return (
    <>
      {[18, 31, 44, 57, 70].map((top) => (
        <div
          key={top}
          className="absolute left-[12%] right-[12%] h-px bg-white/[0.1]"
          data-build-blueprint-signal=""
          style={{ top: `${top}%` }}
        />
      ))}
      {[22, 40, 58, 76].map((left) => (
        <div
          key={left}
          className="absolute top-[18%] bottom-[18%] w-px bg-white/[0.05]"
          data-build-blueprint-signal=""
          style={{ left: `${left}%` }}
        />
      ))}

      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        data-build-blueprint-signal=""
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M12 67 C24 67, 28 28, 38 28 S52 74, 62 74 S76 36, 88 36"
          stroke={module.accent.line}
          strokeWidth="0.45"
          fill="none"
        />
        <path
          d="M12 58 L26 58 L26 43 L46 43 L46 67 L68 67 L68 33 L88 33"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.3"
          fill="none"
        />
      </svg>

      <NodeMarker module={module} left="18%" top="58%" active />
      <NodeMarker module={module} left="38%" top="28%" />
      <NodeMarker module={module} left="62%" top="74%" active />
      <NodeMarker module={module} left="80%" top="36%" />

      <Plate
        module={module}
        label="intro"
        className="left-[14%] bottom-[17%] h-[4.4rem] w-[4.8rem]"
      />
      <Plate
        module={module}
        label="phase"
        className="left-[34%] bottom-[17%] h-[4.4rem] w-[4.8rem]"
      />
      <Plate
        module={module}
        label="velocity"
        className="left-[54%] bottom-[17%] h-[4.4rem] w-[5.4rem]"
        active
      />
      <Plate
        module={module}
        label="settle"
        className="right-[14%] bottom-[17%] h-[4.4rem] w-[4.8rem]"
      />
    </>
  );
}

function TokensVisual({ module }: ModuleVisualProps) {
  const columns = [
    { label: "space", left: "14%" },
    { label: "color", left: "33%" },
    { label: "type", left: "52%" },
    { label: "motion", left: "71%" },
  ];

  return (
    <>
      {columns.map((column, index) => (
        <div
          key={column.label}
          className="absolute top-[18%] h-[8.6rem] w-[4.6rem] overflow-hidden rounded-[14px] border"
          style={{
            left: column.left,
            borderColor: index === 1 ? module.accent.line : "rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.015)",
          }}
        >
          <div
            className="h-px w-full"
            style={{
              background: index === 1 ? module.accent.line : "rgba(255,255,255,0.12)",
            }}
          />
          <div className="px-2.5 py-2">
            <span
              className="block text-[8px] uppercase tracking-[0.24em]"
              style={{
                fontFamily: "'DM Mono', monospace",
                color: index === 1 ? module.accent.text : "rgba(255,255,255,0.34)",
              }}
            >
              {column.label}
            </span>
            <div className="mt-2 space-y-1.5">
              {Array.from({ length: 5 }).map((_, lineIndex) => (
                <div
                  key={lineIndex}
                  className="h-1 rounded-full"
                  style={{
                    background:
                      lineIndex === 2 && index === 1
                        ? module.accent.line
                        : "rgba(255,255,255,0.07)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ))}

      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        data-build-blueprint-signal=""
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path d="M18 52 H82" stroke="rgba(255,255,255,0.12)" strokeWidth="0.28" fill="none" />
        <path d="M24 52 V67" stroke={module.accent.line} strokeWidth="0.26" fill="none" />
        <path d="M43 52 V67" stroke={module.accent.line} strokeWidth="0.26" fill="none" />
        <path d="M62 52 V67" stroke={module.accent.line} strokeWidth="0.26" fill="none" />
        <path d="M81 52 V67" stroke={module.accent.line} strokeWidth="0.26" fill="none" />
      </svg>

      <NodeMarker module={module} left="24%" top="52%" />
      <NodeMarker module={module} left="43%" top="52%" active />
      <NodeMarker module={module} left="62%" top="52%" />
      <NodeMarker module={module} left="81%" top="52%" />

      <div className="absolute bottom-[16%] left-[14%] right-[14%] grid grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-8 rounded-[10px] border"
            style={{
              borderColor: index === 2 ? module.accent.line : "rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.015)",
            }}
          />
        ))}
      </div>
    </>
  );
}

function CommerceVisual({ module }: ModuleVisualProps) {
  const steps = [
    { label: "entry", left: "18%" },
    { label: "catalog", left: "38%" },
    { label: "cart", left: "58%" },
    { label: "checkout", left: "78%" },
  ];

  return (
    <>
      <div
        className="absolute left-[18%] right-[18%] top-[29%] h-px bg-white/[0.12]"
        data-build-blueprint-signal=""
      />
      {steps.map((step, index) => (
        <div
          key={step.label}
          className="absolute -translate-x-1/2"
          style={{ left: step.left, top: "23%" }}
        >
          <div className="relative h-4 w-4">
            <NodeMarker
              module={module}
              left="50%"
              top="50%"
              active={index === 3}
              size="md"
            />
          </div>
          <div
            className="mt-4 text-center text-[8px] uppercase tracking-[0.24em]"
            style={{ fontFamily: "'DM Mono', monospace", color: module.accent.muted }}
          >
            {step.label}
          </div>
        </div>
      ))}

      <div
        className="absolute left-[18%] right-[18%] top-[40%] h-[6.8rem] overflow-hidden rounded-[18px] border"
        style={{
          borderColor: "rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.015)",
        }}
      >
        <div
          className="h-px w-full"
          data-build-blueprint-signal=""
          style={{ background: `linear-gradient(90deg, ${module.accent.line}, transparent 74%)` }}
        />
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <span
              className="text-[9px] uppercase tracking-[0.24em]"
              style={{ fontFamily: "'DM Mono', monospace", color: module.accent.text }}
            >
              checkout routing
            </span>
            <span
              className="text-[9px] uppercase tracking-[0.24em] text-white/28"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              status lane
            </span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-white/[0.07]" />
          <div
            className="mt-2 h-1.5 w-[38%] rounded-full"
            style={{ background: module.accent.line }}
          />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {["trust", "recovery", "confirm"].map((label, index) => (
              <div
                key={label}
                className="rounded-[10px] border px-2 py-2"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  background: index === 1 ? module.accent.surface : "rgba(255,255,255,0.02)",
                }}
              >
                <div
                  className="text-[8px] uppercase tracking-[0.22em]"
                  style={{ fontFamily: "'DM Mono', monospace", color: module.accent.muted }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Plate
        module={module}
        label="payment"
        className="left-[18%] bottom-[17%] h-[4.4rem] w-[6rem]"
      />
      <Plate
        module={module}
        label="state"
        className="left-[42%] bottom-[17%] h-[4.4rem] w-[6rem]"
        active
      />
      <Plate
        module={module}
        label="confirm"
        className="right-[18%] bottom-[17%] h-[4.4rem] w-[6rem]"
      />
    </>
  );
}

function NeuralVisual({ module }: ModuleVisualProps) {
  return (
    <>
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        data-build-blueprint-signal=""
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M16 30 C28 24, 34 60, 46 36 S62 28, 72 34 S82 56, 84 62"
          stroke={module.accent.line}
          strokeWidth="0.42"
          fill="none"
        />
        <path
          d="M22 64 C34 58, 44 72, 54 70 S68 54, 82 62"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="0.3"
          fill="none"
        />
        <path
          d="M20 28 C34 18, 48 22, 70 34"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.26"
          fill="none"
        />
      </svg>

      <NodeMarker module={module} left="18%" top="30%" />
      <NodeMarker module={module} left="30%" top="60%" />
      <NodeMarker module={module} left="46%" top="36%" active />
      <NodeMarker module={module} left="54%" top="70%" />
      <NodeMarker module={module} left="72%" top="34%" active />
      <NodeMarker module={module} left="84%" top="62%" />

      <div
        className="absolute left-[17%] top-[18%] h-[62%] w-[62%] rounded-full border"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      />
      <Plate
        module={module}
        label="signal grouping"
        className="left-[14%] bottom-[17%] h-[4.8rem] w-[8.4rem]"
      />
      <Plate
        module={module}
        label="adaptive response"
        className="right-[14%] bottom-[17%] h-[4.8rem] w-[9rem]"
        active
      />
    </>
  );
}

function LockedVisual({ module }: ModuleVisualProps) {
  return (
    <>
      <div
        className="absolute inset-[16%] rounded-[22px] border"
        style={{ borderColor: module.accent.line }}
      />
      <div
        className="absolute inset-[24%] rounded-[18px] border"
        style={{ borderColor: "rgba(255,255,255,0.1)" }}
      />
      <div
        className="absolute inset-[32%] rounded-[14px] border"
        style={{ borderColor: module.accent.line }}
      />
      <div
        className="absolute inset-[16%] rounded-[22px] opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.08) 1px, transparent 1px, transparent 10px)",
        }}
      />

      <NodeMarker module={module} left="50%" top="50%" active size="md" />
      <NodeMarker module={module} left="50%" top="26%" />
      <NodeMarker module={module} left="50%" top="74%" />
      <NodeMarker module={module} left="32%" top="50%" />
      <NodeMarker module={module} left="68%" top="50%" />

      <div
        className="absolute left-1/2 top-[26%] h-[48%] w-px -translate-x-1/2"
        data-build-blueprint-signal=""
        style={{ background: module.accent.line }}
      />
      <div
        className="absolute left-1/2 top-[50%] h-[5rem] w-[5rem] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{ borderColor: module.accent.line, background: module.accent.surface }}
      />

      <Plate
        module={module}
        label="sealed"
        className="left-[18%] bottom-[17%] h-[4.2rem] w-[5.6rem]"
      />
      <Plate
        module={module}
        label="restricted"
        className="left-[41%] bottom-[17%] h-[4.2rem] w-[6.4rem]"
        active
      />
      <Plate
        module={module}
        label="pending"
        className="right-[18%] bottom-[17%] h-[4.2rem] w-[5.8rem]"
      />
    </>
  );
}

export function ModuleVisual({ module }: ModuleVisualProps) {
  return (
    <motion.div
      key={module.id}
      data-archive="module-visual"
      data-build-visual=""
      data-build-active=""
      data-module-id={module.id}
      data-visual-type={module.visualType}
      className="relative min-h-[24rem] overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#06101e] xl:min-h-[34rem]"
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      style={{
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 22px 70px rgba(2,6,23,0.34), 0 0 0 1px ${module.accent.surface}`,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 24% 18%, ${module.accent.surface} 0%, transparent 22%), radial-gradient(circle at 76% 70%, ${module.accent.glow} 0%, transparent 24%), linear-gradient(180deg, rgba(8,13,28,0.86) 0%, rgba(3,7,18,0.98) 100%)`,
        }}
      />

      <VisualChrome module={module} />

      {module.visualType === "engine" && <EngineVisual module={module} />}
      {module.visualType === "motion" && <MotionVisual module={module} />}
      {module.visualType === "tokens" && <TokensVisual module={module} />}
      {module.visualType === "commerce" && <CommerceVisual module={module} />}
      {module.visualType === "neural" && <NeuralVisual module={module} />}
      {module.visualType === "locked" && <LockedVisual module={module} />}
    </motion.div>
  );
}
