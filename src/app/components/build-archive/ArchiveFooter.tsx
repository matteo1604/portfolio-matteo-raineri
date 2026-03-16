import { motion } from "motion/react";

import type { BuildArchiveModule, BuildLogLevel } from "./archive.types";

interface ArchiveFooterProps {
  module: BuildArchiveModule;
}

function getLogColor(level: BuildLogLevel) {
  switch (level) {
    case "success":
      return "rgba(110,231,183,0.86)";
    case "warning":
      return "rgba(253,224,71,0.86)";
    case "error":
      return "rgba(248,113,113,0.86)";
    default:
      return "rgba(125,211,252,0.82)";
  }
}

export function ArchiveFooter({ module }: ArchiveFooterProps) {
  return (
    <section
      data-archive="footer"
      data-build-footer=""
      data-build-active=""
      data-module-id={module.id}
      className="relative overflow-hidden px-5 py-4 sm:px-6 lg:px-8 lg:py-5"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, ${module.accent.line}, transparent 78%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${module.accent.surface} 0%, transparent 28%)`,
        }}
      />

      <motion.div
        key={module.id}
        className="relative z-10 overflow-hidden rounded-[24px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.016)_0%,rgba(255,255,255,0.008)_100%)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3 sm:px-5">
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.32em] text-white/30"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              archive output layer
            </p>
            <p
              className="mt-1 text-[10px] uppercase tracking-[0.24em] text-white/22"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              metrics, logs, and stack bound to active module state
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: module.accent.line }}
            />
            <span
              className="text-[10px] uppercase tracking-[0.26em] text-white/34"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {module.id}
            </span>
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[minmax(0,17rem)_minmax(0,1.22fr)_minmax(0,18rem)]">
          <div
            data-build-metrics=""
            data-build-footer-column=""
            className="border-b border-white/[0.07] px-4 py-4 sm:px-5 xl:border-b-0 xl:border-r"
          >
            <p
              className="text-[10px] uppercase tracking-[0.32em] text-white/32"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              system metrics
            </p>

            <div className="mt-4">
              {module.metrics.map((metric, index) => (
                <div
                  key={metric.id}
                  data-archive="metric"
                  className={
                    index === 0
                      ? "py-0 pb-4"
                      : "border-t border-white/[0.07] py-4"
                  }
                >
                  <span
                    className="block text-[1.06rem] font-semibold text-white/88"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {metric.value}
                  </span>
                  <span
                    className="mt-1 block text-[10px] uppercase tracking-[0.24em]"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      color: module.accent.text,
                    }}
                  >
                    {metric.label}
                  </span>
                  <p
                    className="mt-2 text-[0.82rem] leading-relaxed text-white/38"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {metric.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            data-build-logs=""
            data-build-footer-column=""
            className="border-b border-white/[0.07] px-4 py-4 sm:px-5 xl:border-b-0 xl:border-r"
          >
            <p
              className="text-[10px] uppercase tracking-[0.32em] text-white/32"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              module logs
            </p>

            <div className="mt-4">
              {module.logs.map((entry, index) => (
                <div
                  key={entry.id}
                  data-archive="log-entry"
                  className={
                    index === 0
                      ? "py-0 pb-4"
                      : "border-t border-white/[0.07] py-4"
                  }
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: getLogColor(entry.level) }}
                      />
                      <span
                        className="text-[10px] uppercase tracking-[0.28em]"
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          color: getLogColor(entry.level),
                        }}
                      >
                        {entry.timestamp}
                      </span>
                    </div>
                    <span
                      className="text-[10px] uppercase tracking-[0.24em] text-white/28"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {entry.level}
                    </span>
                  </div>

                  <p
                    className="mt-3 text-[0.98rem] font-medium text-white/82"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {entry.title}
                  </p>

                  <p
                    className="mt-2 max-w-[46rem] text-[0.86rem] leading-relaxed text-white/42"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {entry.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            data-build-stack=""
            data-build-footer-column=""
            className="px-4 py-4 sm:px-5"
          >
            <p
              className="text-[10px] uppercase tracking-[0.32em] text-white/32"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              stack registry
            </p>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2.5">
                {module.stack.map((item) => (
                  <span
                    key={item}
                    data-archive="stack-item"
                    className="border px-3 py-2 text-[10px] uppercase tracking-[0.2em]"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      borderColor: "rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.012)",
                      color: module.accent.text,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-5 border-t border-white/[0.07] pt-4">
                <span
                  className="block text-[10px] uppercase tracking-[0.24em] text-white/30"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  output lane
                </span>
                <p
                  className="mt-2 text-[0.82rem] leading-relaxed text-white/38"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Metrics, logs, and stack remain attached to the active module
                  so the lower band behaves like archive output, not supporting
                  cards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
