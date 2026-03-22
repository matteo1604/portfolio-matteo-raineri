"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { ArrowRight, Github, Linkedin, Twitter } from "lucide-react";

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const DISPLAY_FONT = "'Syne', sans-serif";
const MONO_FONT = "'DM Mono', monospace";

const socials = [
  { name: "GitHub", icon: Github, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
];

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-35%" });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#050b18] px-6 md:px-12 lg:px-20 py-[clamp(5rem,12vw,10rem)]"
    >
      {/* ── Ambient gradients — mirror Hero's left-heavy with a centered glow ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: [
            "radial-gradient(ellipse 72% 56% at 50% 38%, rgba(29,78,216,0.20) 0%, transparent 58%)",
            "radial-gradient(ellipse 48% 42% at 18% 68%, rgba(6,182,212,0.06) 0%, transparent 55%)",
            "radial-gradient(ellipse 44% 38% at 82% 24%, rgba(37,99,235,0.10) 0%, transparent 52%)",
          ].join(", "),
        }}
      />

      {/* Blurred orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-6%] top-[22%] h-[22rem] w-[30rem] rounded-full bg-blue-500/[0.07] blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-10%] right-[6%] h-[18rem] w-[24rem] rounded-full bg-sky-400/[0.05] blur-[120px]"
      />

      {/* Grid overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Ghost "06" */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-0.18em] right-[-0.04em] z-0 select-none leading-none"
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 800,
          fontSize: "clamp(14rem, 28vw, 38rem)",
          letterSpacing: "-0.04em",
          color: "rgba(96,165,250,0.04)",
        }}
      >
        06
      </div>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-[1600px]">
        {/* Eyebrow */}
        <motion.div
          className="mb-10 flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: EXPO }}
        >
          <div className="w-6 h-px bg-blue-400/60" />
          <span
            className="text-blue-300/65 text-[10px] tracking-[0.42em] uppercase"
            style={{ fontFamily: MONO_FONT }}
          >
            Contact — 06
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
          animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 1.1, delay: 0.2, ease: EXPO }}
        >
          <h2
            className="max-w-[14ch] text-[clamp(3rem,7.2vw,7.5rem)] font-extrabold leading-[0.9] tracking-[-0.05em] text-white"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            Let's build
            <br />
            something{" "}
            <span style={{ color: "rgba(147,197,253,0.95)" }}>remarkable</span>
          </h2>
        </motion.div>

        {/* Separator */}
        <motion.div
          aria-hidden="true"
          className="mt-10 h-px origin-left"
          style={{
            background:
              "linear-gradient(90deg, rgba(147,197,253,0.28) 0%, rgba(96,165,250,0.10) 40%, transparent 100%)",
          }}
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.35, ease: EXPO }}
        />

        {/* Body + CTA */}
        <div data-cursor-interactive className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:items-end lg:gap-16">
          <motion.div
            className="max-w-[38rem] space-y-8"
            initial={{ opacity: 0, y: 22 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.95, delay: 0.4, ease: EXPO }}
          >
            <p
              className="text-[clamp(1rem,1.8vw,1.34rem)] leading-relaxed text-white/50"
              style={{ fontFamily: MONO_FONT }}
            >
              I'm always open to discussing new projects, creative ideas,
              or opportunities to be part of your vision.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <motion.a
                href="mailto:hello@matteoraineri.dev"
                aria-label="Get in touch"
                data-magnetic=""
                className="group inline-flex items-center gap-2 rounded-full border border-blue-200/14 bg-blue-600/90 px-6 py-3.5 text-[13px] font-medium text-white shadow-[0_16px_46px_rgba(29,78,216,0.24)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_18px_54px_rgba(29,78,216,0.34)]"
                style={{ fontFamily: MONO_FONT }}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get in touch
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Social panel */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.95, delay: 0.55, ease: EXPO }}
            className="rounded-[22px] border border-white/[0.07] bg-white/[0.016] p-4 backdrop-blur-xl"
          >
            <p
              className="mb-4 text-[10px] uppercase tracking-[0.3em] text-white/28"
              style={{ fontFamily: MONO_FONT }}
            >
              connect
            </p>

            <div className="space-y-3">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  data-magnetic=""
                  className="group flex items-center gap-3 rounded-[16px] border border-white/[0.07] bg-white/[0.012] px-4 py-3 transition-all duration-300 hover:border-blue-400/20 hover:bg-blue-500/[0.06]"
                >
                  <social.icon className="h-4 w-4 text-blue-300/50 transition-colors duration-300 group-hover:text-blue-300/90" />
                  <span
                    className="text-[0.82rem] text-white/50 transition-colors duration-300 group-hover:text-white/80"
                    style={{ fontFamily: MONO_FONT }}
                  >
                    {social.name}
                  </span>
                  <ArrowRight className="ml-auto h-3 w-3 text-white/16 transition-all duration-300 group-hover:text-white/40 group-hover:translate-x-0.5" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.7, ease: EXPO }}
          className="mt-[clamp(6rem,10vw,10rem)] space-y-6"
        >
          <div
            className="h-px"
            style={{
              background:
                "linear-gradient(90deg, rgba(147,197,253,0.14) 0%, rgba(96,165,250,0.06) 40%, transparent 100%)",
            }}
          />
          <div
            className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/28"
            style={{ fontFamily: MONO_FONT, fontSize: "0.72rem", letterSpacing: "0.02em" }}
          >
            <p>&copy; 2026 Matteo Raineri. All rights reserved.</p>
            <p>Designed &amp; developed with precision</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
