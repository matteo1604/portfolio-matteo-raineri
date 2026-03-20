import { motion } from "motion/react";

import { ModuleVisual } from "./ModuleVisual";
import type { BuildArchiveModule } from "./archive.types";

interface ArchivePanelProps {
  module: BuildArchiveModule;
}

export function ArchivePanel({ module }: ArchivePanelProps) {
  return (
    <section
      data-archive="panel"
      data-build-panel=""
      data-build-active=""
      data-cursor-interactive
      data-module-id={module.id}
      className="relative overflow-hidden border-b border-white/8 px-5 py-5 sm:px-6 lg:px-8 lg:py-8"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${module.accent.surface} 0%, rgba(255,255,255,0.012) 34%, transparent 100%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[10rem]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-[8%] hidden w-px xl:block"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02), transparent)",
        }}
      />

      <motion.div
        key={module.id}
        className="relative z-10 grid min-h-[34rem] gap-8 xl:grid-cols-[minmax(0,1.18fr)_minmax(22rem,32rem)] xl:items-stretch"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.34, ease: "easeOut" }}
      >
        <div className="flex min-w-0 flex-col">
          <div
            className="flex flex-wrap items-start justify-between gap-4 border-b border-white/8 pb-4"
            data-build-panel-meta=""
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="text-[10px] uppercase tracking-[0.34em]"
                style={{ fontFamily: "'DM Mono', monospace", color: module.accent.text }}
              >
                module {module.index}
              </span>

              <span
                className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em]"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  borderColor: module.accent.line,
                  background: module.accent.surface,
                  color: module.accent.text,
                }}
              >
                {module.status}
              </span>

              <span
                className="text-[10px] uppercase tracking-[0.22em] text-white/30"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {module.year} / {module.type}
              </span>
            </div>

            <span
              className="text-[10px] uppercase tracking-[0.26em] text-white/24"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              primary preview lane
            </span>
          </div>

          <div className="relative mt-6 overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.028)_0%,rgba(255,255,255,0.012)_100%)] px-5 py-6 sm:px-6 lg:px-7 lg:py-7">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background: `linear-gradient(90deg, ${module.accent.line}, transparent 72%)`,
              }}
            />
            <div
              aria-hidden="true"
              className="absolute right-5 top-5 hidden select-none xl:block"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(4rem, 7vw, 7rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.08em",
                color: "rgba(191,219,254,0.08)",
              }}
            >
              {module.index}
            </div>

            <div className="relative z-10 min-w-0">
              <p
                className="text-[10px] uppercase tracking-[0.32em]"
                style={{ fontFamily: "'DM Mono', monospace", color: module.accent.text }}
              >
                frontend system module
              </p>

              <h3
                data-archive="panel-title"
                data-build-panel-title=""
                data-build-active=""
                className="mt-4 max-w-[12ch] text-[clamp(3.1rem,5.9vw,6.15rem)] font-extrabold leading-[0.9] tracking-[-0.055em] text-white"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {module.title}
              </h3>

              <p
                data-archive="panel-summary"
                className="mt-6 max-w-[44rem] text-[clamp(1rem,1.42vw,1.2rem)] leading-relaxed text-white/72"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {module.summary}
              </p>

              <p
                data-archive="panel-description"
                className="mt-5 max-w-[45rem] text-[0.94rem] leading-relaxed text-white/46"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {module.description}
              </p>
            </div>
          </div>

          <div
            className="mt-8 grid gap-3 sm:grid-cols-3"
            data-build-panel-register=""
          >
            <div className="overflow-hidden rounded-[20px] border border-white/[0.07] bg-white/[0.014] px-4 py-3.5">
              <span
                className="block text-[10px] uppercase tracking-[0.28em] text-white/30"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                registry id
              </span>
              <span
                className="mt-2 block text-[0.96rem] text-white/84"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {module.id}
              </span>
            </div>
            <div className="overflow-hidden rounded-[20px] border border-white/[0.07] bg-white/[0.014] px-4 py-3.5">
              <span
                className="block text-[10px] uppercase tracking-[0.28em] text-white/30"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                visual mode
              </span>
              <span
                className="mt-2 block text-[0.96rem] text-white/84"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {module.visualType}
              </span>
            </div>
            <div className="overflow-hidden rounded-[20px] border border-white/[0.07] bg-white/[0.014] px-4 py-3.5">
              <span
                className="block text-[10px] uppercase tracking-[0.28em] text-white/30"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                system state
              </span>
              <span
                className="mt-2 block text-[0.96rem] text-white/84"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {module.status}
              </span>
            </div>
          </div>

          <div
            data-build-panel-cta=""
            data-build-cta=""
            className="mt-auto border-t border-white/8 pt-6"
          >
            <div className="mb-3 flex items-center gap-3">
              <span
                className="text-[10px] uppercase tracking-[0.28em] text-white/28"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                interaction lane
              </span>
              <span
                aria-hidden="true"
                className="h-px w-10"
                style={{ background: "rgba(255,255,255,0.1)" }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.22 }}
                className="inline-flex items-center gap-2 border px-4 py-2.5 text-[10px] uppercase tracking-[0.3em]"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  borderColor: module.accent.line,
                  background: module.accent.surface,
                  color: module.accent.text,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px ${module.accent.glow}`,
                }}
              >
                inspect build
                <span aria-hidden="true">+</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.22 }}
                className="inline-flex items-center gap-2 border border-white/10 px-4 py-2.5 text-[10px] uppercase tracking-[0.3em] text-white/62"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  background: "rgba(255,255,255,0.012)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                system view
                <span aria-hidden="true">-&gt;</span>
              </motion.button>

              <span
                className="text-[10px] uppercase tracking-[0.26em] text-white/28"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                preview synced with rail selection
              </span>
            </div>
          </div>
        </div>

        <div className="xl:pl-1" data-build-visual="">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <span
              className="text-[10px] uppercase tracking-[0.28em] text-white/22"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              system blueprint
            </span>
            <span
              className="text-[10px] uppercase tracking-[0.28em]"
              style={{
                fontFamily: "'DM Mono', monospace",
                color: module.accent.text,
              }}
            >
              {module.visualType}
            </span>
          </div>
          <ModuleVisual module={module} />
        </div>
      </motion.div>
    </section>
  );
}
