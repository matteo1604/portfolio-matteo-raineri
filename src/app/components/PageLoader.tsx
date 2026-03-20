import { motion, AnimatePresence } from "motion/react";

interface PageLoaderProps {
  isLoading: boolean;
}

// Boot sequence lines — DM Mono, staggered appearance
const BOOT_LINES = [
  "> system.init",
  "> modules.load         [████████] 100%",
  "> context.build",
  "> ready_",
];

const LINE_DELAY = 0.28; // seconds between each line appearing

export function PageLoader({ isLoading }: PageLoaderProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: -20,
            filter: "blur(6px)",
          }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[10000] bg-[#000000] flex items-center justify-center"
        >
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                                 linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
                backgroundSize: "80px 80px",
              }}
            />
          </div>

          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />

          {/* Boot sequence */}
          <div className="relative z-10 flex flex-col gap-2 min-w-[260px]">
            {BOOT_LINES.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.3 + i * LINE_DELAY,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="font-mono text-sm"
                style={{
                  color:
                    i === BOOT_LINES.length - 1
                      ? "rgba(147, 197, 253, 0.9)"
                      : "rgba(147, 197, 253, 0.45)",
                  letterSpacing: "0.02em",
                }}
              >
                {line}
              </motion.div>
            ))}
          </div>

          {/* Bottom progress bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 h-px origin-left"
            style={{
              width: "100%",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.6) 30%, rgba(147, 197, 253, 0.8) 70%, transparent 100%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
