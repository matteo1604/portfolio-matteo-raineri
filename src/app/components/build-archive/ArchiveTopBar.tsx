import type { BuildArchiveModule } from "./archive.types";

interface ArchiveTopBarProps {
  activeModule: BuildArchiveModule;
  moduleCount: number;
}

export function ArchiveTopBar({
  activeModule,
  moduleCount,
}: ArchiveTopBarProps) {
  return (
    <div
      data-archive="topbar"
      data-build-topbar=""
      data-build-active=""
      data-module-id={activeModule.id}
      className="relative overflow-hidden border-b border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.025)_0%,rgba(255,255,255,0.008)_100%)] px-5 py-4 sm:px-6 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 18% 0%, ${activeModule.accent.surface} 0%, transparent 38%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, ${activeModule.accent.line}, transparent 78%)`,
        }}
      />

      <div className="relative z-10 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/8 bg-black/20 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-300/65" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/65" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/65" />
          </div>

          <div className="min-w-0">
            <p
              className="text-[9px] uppercase tracking-[0.3em] text-white/28"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              live archive shell
            </p>
            <span
              className="mt-1 block truncate text-[10px] uppercase tracking-[0.34em] text-white/40"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              archive://builds/{activeModule.id}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
          <span
            className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/40"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            module {activeModule.index}
          </span>

          <span
            className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.24em]"
            style={{
              fontFamily: "'DM Mono', monospace",
              borderColor: activeModule.accent.surface,
              color: activeModule.accent.text,
              background: activeModule.accent.surface,
            }}
          >
            {activeModule.status}
          </span>

          <span
            className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/38"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {activeModule.type}
          </span>

          <span
            className="text-[10px] uppercase tracking-[0.24em] text-white/34"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {String(moduleCount).padStart(2, "0")} modules indexed
          </span>
        </div>
      </div>
    </div>
  );
}
