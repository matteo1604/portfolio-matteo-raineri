"use client";

import { motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { gsap, useGSAP } from "../../utils/gsap";

import { ArchiveFooter } from "./ArchiveFooter";
import { ArchiveHeader } from "./ArchiveHeader";
import { ArchivePanel } from "./ArchivePanel";
import { ArchiveRail } from "./ArchiveRail";
import { ArchiveTopBar } from "./ArchiveTopBar";
import { BUILD_ARCHIVE_MODULES } from "./archive.data";

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function BuildArchive() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const topBarRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const ghostNumRef = useRef<HTMLDivElement | null>(null);

  // ── GSAP scroll parallax — ghost "04" drift ────────────────────────────
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      if (ghostNumRef.current) {
        gsap.to(ghostNumRef.current, {
          y: -80,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      }
    },
    [],
    sectionRef,
  );

  const [activeModuleId, setActiveModuleId] = useState(
    BUILD_ARCHIVE_MODULES[0]?.id ?? "",
  );

  const activeModule = useMemo(
    () =>
      BUILD_ARCHIVE_MODULES.find((module) => module.id === activeModuleId) ??
      BUILD_ARCHIVE_MODULES[0],
    [activeModuleId],
  );

  if (!activeModule) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      data-archive="section"
      data-build-section=""
      data-module-id={activeModule.id}
      className="relative overflow-hidden bg-[#050b18] px-6 py-[clamp(5rem,12vw,10rem)] md:px-12 lg:px-20"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 70% 58% at 14% 18%, rgba(37,99,235,0.18) 0%, transparent 58%)",
            "radial-gradient(ellipse 58% 48% at 86% 20%, rgba(14,165,233,0.14) 0%, transparent 60%)",
            "radial-gradient(ellipse 44% 40% at 48% 82%, rgba(59,130,246,0.12) 0%, transparent 56%)",
            "linear-gradient(180deg, rgba(2,6,23,0.08) 0%, rgba(2,6,23,0.34) 48%, rgba(2,6,23,0.8) 100%)",
          ].join(", "),
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[32rem]"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.18) 0%, rgba(5,11,24,0.08) 52%, transparent 100%)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-8%] top-[18%] h-[28rem] w-[35rem] rounded-full bg-blue-500/[0.08] blur-[150px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-10%] right-[4%] h-[24rem] w-[28rem] rounded-full bg-sky-400/[0.07] blur-[130px]"
      />

      <div
        ref={ghostNumRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-0.14em] right-[-0.04em] z-0 select-none text-[clamp(12rem,24vw,31rem)] font-extrabold leading-none tracking-[-0.05em] text-blue-300/[0.035]"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        04
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1640px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[7%] top-[5.9rem] h-[28rem] rounded-[40px] border border-white/[0.03] bg-white/[0.01]"
        />

        <div
          ref={headerRef}
          data-archive="header-wrap"
          data-build-header=""
          data-build-header-wrap=""
          className="relative -mb-px"
        >
          <ArchiveHeader
            modules={BUILD_ARCHIVE_MODULES}
            activeModule={activeModule}
          />
        </div>

        <motion.div
          ref={shellRef}
          data-archive="shell"
          data-build-shell=""
          className="relative -mt-px overflow-hidden rounded-[34px] border border-white/10 backdrop-blur-2xl"
          initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, ease: EXPO }}
          style={{
            background:
              "linear-gradient(180deg, rgba(8,13,28,0.96) 0%, rgba(5,10,22,0.94) 42%, rgba(3,7,17,0.98) 100%)",
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 44px 130px rgba(2,6,23,0.42), 0 0 0 1px ${activeModule.accent.surface}`,
          }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-[1px] rounded-[33px]"
            style={{
              background: `linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 12%, ${activeModule.accent.surface} 100%)`,
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
              backgroundSize: "74px 74px",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-[10px] rounded-[26px] border border-white/[0.05]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-[28px] rounded-[22px] border border-white/[0.03]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, ${activeModule.accent.line}, rgba(255,255,255,0.14) 42%, transparent 78%)`,
            }}
          />
          <div
            aria-hidden="true"
            className="absolute left-0 top-0 h-full w-[26rem]"
            style={{
              background:
                "linear-gradient(90deg, rgba(3,7,18,0.68) 0%, rgba(3,7,18,0.24) 52%, transparent 100%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute right-[-8%] top-[14%] h-[20rem] w-[24rem] rounded-full blur-[110px]"
            style={{ background: activeModule.accent.glow }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-[16%] bottom-[-10%] h-[12rem] rounded-full blur-[120px]"
            style={{ background: activeModule.accent.glow }}
          />

          <div className="relative z-10">
            <div
              ref={topBarRef}
              data-archive="topbar-wrap"
              data-build-topbar-wrap=""
            >
              <ArchiveTopBar
                activeModule={activeModule}
                moduleCount={BUILD_ARCHIVE_MODULES.length}
              />
            </div>

            <div className="grid lg:grid-cols-[16rem_minmax(0,1fr)]">
              <div
                ref={railRef}
                data-archive="rail-wrap"
                data-build-rail=""
                data-build-rail-wrap=""
                className="relative"
              >
                <div
                  aria-hidden="true"
                  className="absolute bottom-0 right-0 top-0 hidden w-px lg:block"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03), transparent)",
                  }}
                />
                <ArchiveRail
                  modules={BUILD_ARCHIVE_MODULES}
                  activeModuleId={activeModule.id}
                  onSelectModule={setActiveModuleId}
                />
              </div>

              <div
                className="min-w-0"
                data-build-active=""
                data-module-id={activeModule.id}
              >
                <div
                  ref={panelRef}
                  data-archive="panel-wrap"
                  data-build-panel=""
                  data-build-panel-wrap=""
                >
                  <ArchivePanel module={activeModule} />
                </div>

                <div
                  ref={footerRef}
                  data-archive="footer-wrap"
                  data-build-footer=""
                  data-build-footer-wrap=""
                >
                  <ArchiveFooter module={activeModule} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          ref={mapRef}
          data-archive="system-map"
          data-build-map=""
          data-build-map-placeholder=""
          className="relative mt-3 overflow-hidden rounded-[18px] border border-white/[0.04] bg-white/[0.008] px-4 py-3.5 sm:px-5 lg:px-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.14, ease: EXPO }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-25"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)",
            }}
          />

          <div className="relative z-10 flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-[48rem]">
              <p
                className="text-[10px] uppercase tracking-[0.34em] text-white/24"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                system map view
              </p>
              <p
                className="mt-1.5 text-[0.8rem] leading-relaxed text-white/28"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Reserved for the future advanced topology view. Section, shell,
                rail, panel, visual, and footer wrappers are isolated and tagged
                so GSAP can later attach timelines without restructuring the
                archive.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-px w-6"
                style={{ background: "rgba(255,255,255,0.16)" }}
              />
              <span
                className="text-[10px] uppercase tracking-[0.28em]"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  color: "rgba(255,255,255,0.24)",
                }}
              >
                map scaffold pending
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
