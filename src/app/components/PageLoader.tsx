import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface PageLoaderProps {
  isLoading: boolean;
}

interface BootLine {
  label: string;
  dots: string;
  status: string;
  isBlocks?: boolean;
}

const BOOT_LINES: BootLine[] = [
  { label: "signal.init",      dots: ".........." , status: "locked"  },
  { label: "topology.mapped",  dots: ".........." , status: "stable"  },
  { label: "engine.primed",    dots: ".........." , status: "ready"   },
  { label: "system.online",    dots: ".........." , status: "████████", isBlocks: true },
];

const LINE_START_OFFSETS = [0, 400, 800, 1200];
const MS_PER_CHAR  = 25;
const DOT_PAUSE    = 60;
const MS_PER_DOT   = 15;
const DOT_COUNT    = 10;
const STATUS_PAUSE = 60;
const MS_PER_BLOCK = 120;

interface LineState {
  labelChars: number;
  dotsChars:  number;
  statusDone: boolean;
  blocksShown: number;
}

const EMPTY_LINE: LineState = { labelChars: 0, dotsChars: 0, statusDone: false, blocksShown: 0 };

export function PageLoader({ isLoading }: PageLoaderProps) {
  const [lines, setLines] = useState<LineState[]>([
    { ...EMPTY_LINE },
    { ...EMPTY_LINE },
    { ...EMPTY_LINE },
    { ...EMPTY_LINE },
  ]);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current ?? Date.now());

      setLines((prev) => {
        const next = prev.map((ls, li) => ({ ...ls }));

        for (let li = 0; li < BOOT_LINES.length; li++) {
          const line = BOOT_LINES[li];
          const startOffset = LINE_START_OFFSETS[li];
          if (elapsed < startOffset) continue;

          const lineElapsed = elapsed - startOffset;

          // Label phase
          const labelDuration = line.label.length * MS_PER_CHAR;
          next[li].labelChars = Math.min(line.label.length, Math.floor(lineElapsed / MS_PER_CHAR));

          if (lineElapsed < labelDuration + DOT_PAUSE) continue;

          // Dots phase
          const dotsStart = labelDuration + DOT_PAUSE;
          const dotsElapsed = lineElapsed - dotsStart;
          next[li].dotsChars = Math.min(DOT_COUNT, Math.floor(dotsElapsed / MS_PER_DOT));

          const dotsDuration = DOT_COUNT * MS_PER_DOT;
          if (dotsElapsed < dotsDuration + STATUS_PAUSE) continue;

          // Status / blocks phase
          const statusStart = dotsStart + dotsDuration + STATUS_PAUSE;
          const statusElapsed = lineElapsed - statusStart;

          if (line.isBlocks) {
            next[li].blocksShown = Math.min(8, Math.floor(statusElapsed / MS_PER_BLOCK));
          } else {
            if (statusElapsed >= 140) next[li].statusDone = true;
          }
        }

        return next;
      });
    }, 25);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[10000] bg-[#000000] flex items-center justify-center"
        >
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/[0.06] rounded-full blur-[80px]" />

          {/* Boot sequence */}
          <div className="relative z-10 flex flex-col max-w-[320px] w-full" style={{ lineHeight: 1.8 }}>
            {BOOT_LINES.map((line, li) => {
              const ls = lines[li];
              const labelText = line.label.slice(0, ls.labelChars);
              const dotsText  = ".".repeat(ls.dotsChars) + "\u00a0".repeat(DOT_COUNT - ls.dotsChars);
              let statusText = "";
              if (line.isBlocks) {
                statusText = "█".repeat(ls.blocksShown);
              } else if (ls.statusDone) {
                statusText = line.status;
              }

              return (
                <div
                  key={li}
                  className="flex gap-3 items-baseline"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13,
                    letterSpacing: "0.02em",
                    opacity: ls.labelChars > 0 ? 1 : 0,
                  }}
                >
                  <span style={{ color: "rgba(147, 197, 253, 0.84)", minWidth: 160 }}>
                    {labelText}
                  </span>
                  <span style={{ color: "rgba(255, 255, 255, 0.10)", flex: 1, whiteSpace: "pre" }}>
                    {dotsText}
                  </span>
                  <span
                    style={{
                      color: line.isBlocks ? "rgba(110, 231, 183, 0.75)" : "rgba(110, 231, 183, 0.65)",
                      minWidth: 80,
                      transition: line.isBlocks ? "none" : "opacity 0.14s ease",
                      opacity: statusText ? 1 : 0,
                    }}
                  >
                    {statusText}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom progress line — draws from center */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2.0, ease: "easeInOut" }}
            className="absolute bottom-8 h-px"
            style={{
              width: "50%",
              left: "25%",
              transformOrigin: "center",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.5) 30%, rgba(147,197,253,0.7) 50%, rgba(59,130,246,0.5) 70%, transparent 100%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
