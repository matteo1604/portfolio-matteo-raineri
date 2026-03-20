"use client";

import { useRef, useEffect } from "react";
import { useScrollState, SECTION_ACCENTS, type SectionId } from "../../contexts/ScrollContext";

// ── Canvas Particle Constellation ─────────────────────────────────────────────
// Replaces DOM-based FloatingElements with a single canvas rendering 1000 particles.
// Canvas2D is significantly faster than 7 blur-filtered DOM elements for this use case.
//
// Features:
// - 1000 particles with layered parallax depth
// - Organic oscillation (desynchronized per-particle phase)
// - Mouse repulsion field (180px radius)
// - Constellation connections for larger particles (~300 eligible)
// - Section-aware color morphing (wave-based, 16 particles/frame over ~60 frames)
// - Scroll velocity boost via CSS variables (from ScrollVelocity system)

interface Particle {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  radius: number;
  opacity: number;
  color: string;     // RGB triplet "r, g, b"
  parallaxRate: number;
  phase: number;
  isLarge: boolean;  // radius > 1.2 — eligible for connection lines
}

const PARTICLE_COUNT = 1000;
const CONNECTION_RADIUS = 100;
const REPEL_RADIUS = 180;
const REPEL_FORCE = 28;

// Module-level mouse state — no React overhead
let mouseX = -500;
let mouseY = -500;
let mouseActive = false;
let mouseTimeout: ReturnType<typeof setTimeout> | null = null;

function createParticles(w: number, h: number, color: string): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const radius = 0.5 + Math.random() * 2;
    const baseX = w * (0.5 + (Math.random() - 0.5) * 1.4);
    const baseY = h * (0.3 + Math.random() * 0.5);
    out.push({
      baseX,
      baseY,
      x: baseX,
      y: baseY,
      radius,
      opacity: 0.02 + Math.random() * 0.08,
      color,
      parallaxRate: 0.2 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      isLarge: radius > 1.2,
    });
  }
  return out;
}

export function FloatingElements() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const largeParticlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  // Color transition state — managed via ref to avoid re-renders
  const colorTransRef = useRef<{ to: string; frameCount: number }>({
    to: SECTION_ACCENTS.hero,
    frameCount: 62, // start "done"
  });

  const { currentSection } = useScrollState();
  const prevSectionRef = useRef<SectionId>(currentSection);

  // React to section changes → start staggered color wave
  useEffect(() => {
    if (currentSection !== prevSectionRef.current) {
      prevSectionRef.current = currentSection;
      colorTransRef.current = {
        to: SECTION_ACCENTS[currentSection],
        frameCount: 0,
      };
    }
  }, [currentSection]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const setSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    };
    setSize();

    // Initialize particles
    const initialColor = SECTION_ACCENTS[prevSectionRef.current];
    particlesRef.current = createParticles(window.innerWidth, window.innerHeight, initialColor);
    largeParticlesRef.current = particlesRef.current.filter((p) => p.isLarge);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;
      if (mouseTimeout !== null) clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        mouseActive = false;
      }, 3000);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Resize — debounced
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setSize();
        particlesRef.current = createParticles(
          window.innerWidth,
          window.innerHeight,
          SECTION_ACCENTS[prevSectionRef.current],
        );
        largeParticlesRef.current = particlesRef.current.filter((p) => p.isLarge);
        colorTransRef.current.frameCount = 62; // reset transition
      }, 200);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // ── Render loop ────────────────────────────────────────────────────────────
    const render = (time: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const scrollY = window.scrollY;

      // Read velocity CSS vars (set by ScrollVelocity RAF — zero overhead)
      const intensity = parseFloat(
        document.documentElement.style.getPropertyValue("--scroll-intensity") || "0",
      );
      const velocityYPx = parseFloat(
        document.documentElement.style.getPropertyValue("--scroll-velocity-y") || "0",
      );
      const scrollDir = velocityYPx >= 0 ? 1 : -1;

      // Stagger color wave — 16 particles per frame (~62 frames to complete)
      const ct = colorTransRef.current;
      if (ct.frameCount < 63) {
        const startIdx = ct.frameCount * 16;
        const endIdx = Math.min(startIdx + 16, particles.length);
        for (let i = startIdx; i < endIdx; i++) {
          particles[i].color = ct.to;
          particles[i].isLarge = particles[i].radius > 1.2; // refresh eligibility
        }
        ct.frameCount++;
        // Refresh large particle cache after wave completes
        if (ct.frameCount === 63) {
          largeParticlesRef.current = particles.filter((p) => p.isLarge);
        }
      }

      // ── Draw particles ────────────────────────────────────────────────────
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const scrollOffset = scrollY * p.parallaxRate * 0.15;
        const oscX = Math.sin(time * 0.0003 + p.phase) * 12 * p.parallaxRate;
        const oscY = Math.cos(time * 0.00025 + p.phase * 1.3) * 8 * p.parallaxRate;

        let repelX = 0;
        let repelY = 0;
        if (mouseActive) {
          const dx = p.baseX - mouseX;
          const dy = p.baseY - mouseY;
          const distSq = dx * dx + dy * dy;
          if (distSq < REPEL_RADIUS * REPEL_RADIUS) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
            repelX = (dx / dist) * force;
            repelY = (dy / dist) * force;
          }
        }

        const velocityBoost = intensity * p.parallaxRate * 4;
        const finalX = p.baseX + oscX + repelX;
        const rawY = p.baseY - scrollOffset + oscY + repelY + velocityBoost * scrollDir;

        p.x = finalX;
        // Vertical wrap: particles off-screen above reappear below (+100px buffer)
        p.y = ((rawY % (h + 100)) + (h + 100)) % (h + 100) - 50;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        ctx.fill();
      }

      // ── Draw constellation connections (large particles only, O(n²/~4)) ───
      const large = largeParticlesRef.current;
      const connRadSq = CONNECTION_RADIUS * CONNECTION_RADIUS;

      for (let i = 0; i < large.length; i++) {
        for (let j = i + 1; j < large.length; j++) {
          const dx = large[i].x - large[j].x;
          const dy = large[i].y - large[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < connRadSq) {
            const dist = Math.sqrt(distSq);
            const lineOpacity = (1 - dist / CONNECTION_RADIUS) * 0.035;
            ctx.beginPath();
            ctx.moveTo(large[i].x, large[i].y); // fixed: was large[j].y (bug in spec)
            ctx.lineTo(large[j].x, large[j].y);
            ctx.strokeStyle = `rgba(${large[i].color}, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ willChange: "transform" }}
    />
  );
}
