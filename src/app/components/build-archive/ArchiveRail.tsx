import { motion } from "motion/react";

import type { BuildArchiveModule } from "./archive.types";

interface ArchiveRailProps {
  modules: BuildArchiveModule[];
  activeModuleId: string;
  onSelectModule: (moduleId: string) => void;
}

export function ArchiveRail({
  modules,
  activeModuleId,
  onSelectModule,
}: ArchiveRailProps) {
  return (
    <nav
      data-archive="rail"
      data-build-rail=""
      aria-label="Build archive modules"
      className="relative border-b border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.016)_0%,rgba(255,255,255,0.008)_100%)] px-3 py-3 lg:min-h-[48rem] lg:border-b-0 lg:px-3 lg:py-4"
    >
      <div
        aria-hidden="true"
        className="absolute bottom-4 left-[1.42rem] top-16 hidden w-px lg:block"
        data-build-rail-spine=""
        style={{
          background:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 40px)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent"
      />

      <div className="mb-4 flex items-center justify-between gap-3 px-3">
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.34em] text-white/32"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            module navigator
          </p>
          <p
            className="mt-1 text-[10px] uppercase tracking-[0.26em] text-white/20"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            indexed build entries
          </p>
        </div>

        <span
          className="text-[10px] uppercase tracking-[0.26em] text-white/26"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {String(modules.length).padStart(2, "0")}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1.5 lg:overflow-visible">
        {modules.map((module) => {
          const isActive = module.id === activeModuleId;

          return (
            <div
              key={module.id}
              className="relative min-w-[15rem] lg:ml-5 lg:min-w-0"
            >
              <div
                aria-hidden="true"
                className="absolute left-[-0.62rem] top-1/2 hidden -translate-y-1/2 lg:block"
                data-build-active={isActive ? "" : undefined}
              >
                <span
                  className="block h-2.5 w-2.5 rounded-full border"
                  style={{
                    borderColor: isActive ? module.accent.line : "rgba(255,255,255,0.18)",
                    background: isActive ? module.accent.line : "rgba(255,255,255,0.04)",
                    boxShadow: isActive ? `0 0 16px ${module.accent.glow}` : "none",
                  }}
                />
                <span
                  className="absolute left-[0.6rem] top-1/2 h-px w-3 -translate-y-1/2"
                  style={{
                    background: isActive ? module.accent.line : "rgba(255,255,255,0.08)",
                  }}
                />
              </div>

              <motion.button
                type="button"
                data-archive="rail-item"
                data-build-item=""
                data-build-active={isActive ? "" : undefined}
                data-module-id={module.id}
                aria-pressed={isActive}
                onClick={() => onSelectModule(module.id)}
                className="group relative w-full overflow-hidden rounded-[18px] border px-4 py-4 text-left transition-colors duration-300 lg:px-4 lg:py-4"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.995 }}
                transition={{ duration: 0.24 }}
                style={{
                  borderColor: isActive ? module.accent.surface : "rgba(255,255,255,0.08)",
                  background: isActive
                    ? `linear-gradient(180deg, ${module.accent.surface} 0%, rgba(255,255,255,0.018) 100%)`
                    : "linear-gradient(180deg, rgba(255,255,255,0.014) 0%, rgba(255,255,255,0.008) 100%)",
                  boxShadow: isActive
                    ? `inset 3px 0 0 ${module.accent.line}, 0 0 0 1px ${module.accent.surface}, 0 18px 32px rgba(2,6,23,0.2)`
                    : "inset 0 1px 0 rgba(255,255,255,0.02)",
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 0% 50%, ${module.accent.glow} 0%, transparent 52%)`,
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-[1px] rounded-[17px] border border-white/[0.04]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-y-4 left-0 w-[2px]"
                  style={{
                    background: isActive ? module.accent.line : "rgba(255,255,255,0.06)",
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute right-0 top-0 h-px w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(90deg, ${module.accent.line}, transparent 65%)`,
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute right-3 top-3 h-3.5 w-3.5 border-r border-t transition-colors duration-300"
                  style={{
                    borderColor: isActive ? module.accent.line : "rgba(255,255,255,0.08)",
                  }}
                />

                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span
                      className="block text-[10px] uppercase tracking-[0.32em]"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        color: isActive ? module.accent.text : "rgba(191,219,254,0.42)",
                      }}
                    >
                      {module.index}
                    </span>

                    <span
                      className="mt-2 block max-w-[12rem] text-[1rem] font-semibold leading-tight text-white"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {module.title}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className="text-[9px] uppercase tracking-[0.24em]"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        color: isActive ? module.accent.text : module.accent.muted,
                      }}
                    >
                      {module.year}
                    </span>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        background: isActive ? module.accent.line : "rgba(255,255,255,0.18)",
                        boxShadow: isActive ? `0 0 18px ${module.accent.glow}` : "none",
                      }}
                    />
                  </div>
                </div>

                <p
                  className="relative z-10 mt-3 text-[10px] uppercase tracking-[0.22em]"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    color: isActive ? module.accent.text : "rgba(148,163,184,0.54)",
                  }}
                >
                  {module.type}
                </p>

                <div className="relative z-10 mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background: isActive ? module.accent.line : "rgba(255,255,255,0.18)",
                        boxShadow: isActive ? `0 0 14px ${module.accent.glow}` : "none",
                      }}
                    />
                    <span
                      className="text-[9px] uppercase tracking-[0.22em]"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        color: isActive ? module.accent.text : "rgba(191,219,254,0.42)",
                      }}
                    >
                      {module.status}
                    </span>
                  </div>

                  <span
                    className="text-[9px] uppercase tracking-[0.24em]"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      color: isActive ? "rgba(255,255,255,0.46)" : "rgba(255,255,255,0.22)",
                    }}
                  >
                    {isActive ? "active" : "inspect"}
                  </span>
                </div>
              </motion.button>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
