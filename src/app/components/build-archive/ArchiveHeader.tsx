import type { BuildArchiveModule } from "./archive.types";

interface ArchiveHeaderProps {
  modules: BuildArchiveModule[];
  activeModule: BuildArchiveModule;
}

export function ArchiveHeader({ modules, activeModule }: ArchiveHeaderProps) {
  const yearLabels = modules
    .map((module) => module.year)
    .filter((year) => year !== "TBD");
  const yearRange =
    yearLabels.length > 0
      ? `${Math.min(...yearLabels.map(Number))}-${Math.max(...yearLabels.map(Number))}`
      : "future";

  return (
    <header
      data-archive="header"
      data-build-header=""
      data-module-id={activeModule.id}
      className="relative z-10 mb-2.5 lg:mb-3.5"
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="h-px w-7 bg-gradient-to-r from-blue-300/70 to-transparent" />
        <span
          className="text-[10px] uppercase tracking-[0.4em] text-blue-200/56"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Build Archive - 04
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,19rem)] lg:items-end lg:gap-8">
        <div>
          <h2
            data-archive="header-title"
            data-build-title=""
            data-build-active=""
            className="max-w-[8.5ch] text-[clamp(2.9rem,6.6vw,6.55rem)] font-extrabold leading-[0.9] tracking-[-0.052em] text-white"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Build
            <br />
            <span style={{ color: activeModule.accent.text }}>Archive</span>
          </h2>

          <p
            data-archive="header-copy"
            data-build-description=""
            className="mt-3.5 max-w-[39rem] text-[clamp(0.9rem,1.22vw,1.02rem)] leading-relaxed text-white/48"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            A live archive of frontend systems, experiments, and reserved slots.
            The rail behaves like a module navigator, the center panel acts as the
            active preview surface, and the lower band reads like archive output
            from a controlled build environment.
          </p>
        </div>

        <div
          data-archive="header-stats"
          data-build-stats=""
          className="relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-white/[0.016] p-2.5 backdrop-blur-xl"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, ${activeModule.accent.line}, transparent 78%)`,
            }}
          />

          <div className="mb-2.5 flex items-center justify-between gap-3 px-1">
            <span
              className="text-[10px] uppercase tracking-[0.28em] text-white/28"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              active registry
            </span>
            <span
              className="text-[10px] uppercase tracking-[0.28em]"
              style={{
                fontFamily: "'DM Mono', monospace",
                color: activeModule.accent.text,
              }}
            >
              {activeModule.index} / {activeModule.status}
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.012] px-4 py-3">
              <span
                className="block text-[0.98rem] font-semibold text-white/86"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {String(modules.length).padStart(2, "0")}
              </span>
              <span
                className="mt-1 block text-[10px] uppercase tracking-[0.28em] text-blue-200/34"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                archive modules
              </span>
            </div>

            <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.012] px-4 py-3">
              <span
                className="block text-[0.98rem] font-semibold text-white/86"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {yearRange}
              </span>
              <span
                className="mt-1 block text-[10px] uppercase tracking-[0.28em] text-blue-200/34"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                archive window
              </span>
            </div>

            <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.012] px-4 py-3">
              <span
                className="block text-[0.98rem] font-semibold text-white/86"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {activeModule.index}
              </span>
              <span
                className="mt-1 block text-[10px] uppercase tracking-[0.28em] text-blue-200/34"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                active module
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="mt-3.5 h-px bg-gradient-to-r from-white/10 via-white/[0.05] to-transparent"
      />
    </header>
  );
}
