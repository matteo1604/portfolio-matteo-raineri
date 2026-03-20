"use client";

import { useRef, useEffect } from "react";
import { useScrollState, SECTION_ACCENTS, type SectionId } from "../../contexts/ScrollContext";
import { getVelocitySnapshot } from "../../systems/ScrollVelocity";

interface RGB { r: number; g: number; b: number }

interface Particle {
  baseX: number; baseY: number;
  x: number; y: number;
  radius: number; opacity: number;
  fromRGB: RGB; toRGB: RGB;
  transProgress: number;
  transDelay: number;
  parallaxRate: number;
  phase: number;
  isLarge: boolean;
}

const CONNECTION_RADIUS = 120;
const CONNECTION_RADIUS_SQ = CONNECTION_RADIUS * CONNECTION_RADIUS;
const REPEL_RADIUS = 150;
const TRANS_FRAMES = 90;

let mouseX = -500;
let mouseY = -500;
let mouseActive = false;
let mouseTimeout: ReturnType<typeof setTimeout> | null = null;

function parseRGB(s: string): RGB {
  const parts = s.split(",").map(n => parseInt(n.trim(), 10));
  return { r: parts[0], g: parts[1], b: parts[2] };
}

function lerpColor(from: RGB, to: RGB, t: number): string {
  return `${Math.round(from.r + (to.r - from.r) * t)}, ${Math.round(from.g + (to.g - from.g) * t)}, ${Math.round(from.b + (to.b - from.b) * t)}`;
}

function createParticles(w: number, h: number, rgb: RGB, isMobile: boolean): Particle[] {
  const out: Particle[] = [];

  if (!isMobile) {
    // Jitter-grid base: 20×15 = 300 cells
    const cols = 20, rows = 15;
    const cellW = w / cols;
    const cellH = h / rows;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const radius = 0.5 + Math.pow(Math.random(), 2.5) * 2;
        const baseX = (col + Math.random()) * cellW;
        const baseY = (row + Math.random()) * cellH;
        out.push({
          baseX, baseY, x: baseX, y: baseY,
          radius,
          opacity: 0.015 + (radius / 2.5) * 0.045,
          fromRGB: { ...rgb }, toRGB: { ...rgb },
          transProgress: 1, transDelay: 0,
          parallaxRate: 0.2 + Math.random() * 0.8,
          phase: Math.random() * Math.PI * 2,
          isLarge: radius > 1.5,
        });
      }
    }
    // Additional 300 purely random particles — 600 total
    for (let i = 0; i < 300; i++) {
      const radius = 0.5 + Math.pow(Math.random(), 2.5) * 2;
      const baseX = Math.random() * w;
      const baseY = Math.random() * h;
      out.push({
        baseX, baseY, x: baseX, y: baseY,
        radius,
        opacity: 0.015 + (radius / 2.5) * 0.045,
        fromRGB: { ...rgb }, toRGB: { ...rgb },
        transProgress: 1, transDelay: 0,
        parallaxRate: 0.2 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        isLarge: radius > 1.5,
      });
    }
  } else {
    for (let i = 0; i < 300; i++) {
      const radius = 0.5 + Math.pow(Math.random(), 2.5) * 2;
      const baseX = Math.random() * w;
      const baseY = Math.random() * h;
      out.push({
        baseX, baseY, x: baseX, y: baseY,
        radius,
        opacity: 0.015 + (radius / 2.5) * 0.045,
        fromRGB: { ...rgb }, toRGB: { ...rgb },
        transProgress: 1, transDelay: 0,
        parallaxRate: 0.2 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        isLarge: radius > 1.5,
      });
    }
  }

  return out;
}

export function FloatingElements() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const largeParticlesRef = useRef<Particle[]>([]);
  const connPairsRef = useRef<Array<[Particle, Particle]>>([]);
  const rafRef = useRef<number>(0);
  const isMobileRef = useRef(false);
  const dprRef = useRef(1);
  const waveFrameRef = useRef<number>(TRANS_FRAMES);
  const toRGBRef = useRef<RGB>({ r: 59, g: 130, b: 246 });
  const restMultRef = useRef<number>(1.0);
  const frameCountRef = useRef<number>(0);

  const { currentSection } = useScrollState();
  const prevSectionRef = useRef<SectionId>(currentSection);

  useEffect(() => {
    if (currentSection === prevSectionRef.current) return;
    prevSectionRef.current = currentSection;

    const newRGB = parseRGB(SECTION_ACCENTS[currentSection]);
    const particles = particlesRef.current;
    if (!particles.length) return;

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    const withDist = particles.map((p, idx) => ({
      idx,
      dist: Math.hypot(p.baseX - cx, p.baseY - cy),
    }));
    withDist.sort((a, b) => a.dist - b.dist);

    const maxDelay = 45;
    withDist.forEach(({ idx }, sortedI) => {
      const p = particles[idx];
      const currentColor: RGB = p.transProgress >= 1
        ? { ...p.toRGB }
        : {
            r: Math.round(p.fromRGB.r + (p.toRGB.r - p.fromRGB.r) * p.transProgress),
            g: Math.round(p.fromRGB.g + (p.toRGB.g - p.fromRGB.g) * p.transProgress),
            b: Math.round(p.fromRGB.b + (p.toRGB.b - p.fromRGB.b) * p.transProgress),
          };
      p.fromRGB = currentColor;
      p.toRGB = { ...newRGB };
      p.transProgress = 0;
      p.transDelay = Math.round((sortedI / particles.length) * maxDelay);
    });

    waveFrameRef.current = 0;
    toRGBRef.current = newRGB;
  }, [currentSection]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = !window.matchMedia("(min-width: 1024px)").matches;
    isMobileRef.current = isMobile;
    const dpr = Math.min(isMobile ? 1.5 : 2, window.devicePixelRatio || 1);
    dprRef.current = dpr;

    const setSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dprRef.current;
      canvas.height = h * dprRef.current;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
    };
    setSize();

    const initialRGB = parseRGB(SECTION_ACCENTS[prevSectionRef.current]);
    particlesRef.current = createParticles(window.innerWidth, window.innerHeight, initialRGB, isMobile);
    largeParticlesRef.current = particlesRef.current.filter(p => p.isLarge);

    let mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
    if (!isMobile) {
      mouseMoveHandler = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        mouseActive = true;
        if (mouseTimeout !== null) clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => { mouseActive = false; }, 3000);
      };
      window.addEventListener("mousemove", mouseMoveHandler, { passive: true });
    }

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeTimer = null;
        setSize();
        const mobile = !window.matchMedia("(min-width: 1024px)").matches;
        isMobileRef.current = mobile;
        particlesRef.current = createParticles(
          window.innerWidth,
          window.innerHeight,
          toRGBRef.current,
          mobile,
        );
        largeParticlesRef.current = particlesRef.current.filter(p => p.isLarge);
        connPairsRef.current = [];
        waveFrameRef.current = TRANS_FRAMES;
      }, 200);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    const render = (time: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const scrollY = window.scrollY;
      const frameNum = frameCountRef.current++;
      const mobile = isMobileRef.current;
      const currentDpr = dprRef.current;

      const intensity = parseFloat(
        document.documentElement.style.getPropertyValue("--scroll-intensity") || "0",
      );
      const velocityYPx = parseFloat(
        document.documentElement.style.getPropertyValue("--scroll-velocity-y") || "0",
      );
      const scrollDir = velocityYPx >= 0 ? 1 : -1;

      const { isResting } = getVelocitySnapshot();
      const targetRestMult = isResting ? 0.6 : 1.0;
      restMultRef.current += (targetRestMult - restMultRef.current) * (isResting ? 0.005 : 0.015);
      const restMult = restMultRef.current;

      waveFrameRef.current++;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (p.transProgress < 1) {
          const progressFrames = waveFrameRef.current - p.transDelay;
          if (progressFrames > 0) {
            p.transProgress = Math.min(1, progressFrames / (TRANS_FRAMES * 0.6));
          }
        }

        const scrollOffset = scrollY * p.parallaxRate * 0.15;
        const oscX = Math.sin(time * 0.0003 * restMult + p.phase) * 12 * p.parallaxRate;
        const oscY = Math.cos(time * 0.00025 * restMult + p.phase * 1.3) * 8 * p.parallaxRate;

        if (!mobile && mouseActive) {
          const dx = p.baseX - mouseX;
          const dy = p.baseY - mouseY;
          const distSq = dx * dx + dy * dy;
          if (distSq < REPEL_RADIUS * REPEL_RADIUS) {
            const dist = Math.sqrt(distSq);
            const force = Math.pow(1 - dist / REPEL_RADIUS, 2) * 35;
            const targetX = p.baseX + oscX + (dx / dist) * force;
            const targetY = p.baseY - scrollOffset + oscY + (dy / dist) * force;
            p.x += (targetX - p.x) * 0.08;
            p.y += (targetY - p.y) * 0.08;
          } else {
            p.x += (p.baseX + oscX - p.x) * 0.015;
            p.y += (p.baseY - scrollOffset + oscY - p.y) * 0.015;
          }
        } else {
          p.x += (p.baseX + oscX - p.x) * 0.015;
          p.y += (p.baseY - scrollOffset + oscY - p.y) * 0.015;
        }

        const velocityBoost = intensity * p.parallaxRate * 4;
        const drawY = ((( p.y + velocityBoost * scrollDir) % (h + 100)) + (h + 100)) % (h + 100) - 50;

        const colorStr = p.transProgress >= 1
          ? `${p.toRGB.r}, ${p.toRGB.g}, ${p.toRGB.b}`
          : lerpColor(p.fromRGB, p.toRGB, p.transProgress);

        ctx.beginPath();
        ctx.arc(p.x, drawY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorStr}, ${p.opacity})`;
        ctx.fill();
      }

      if (!mobile) {
        const large = largeParticlesRef.current;

        if (frameNum % 3 === 0) {
          const pairs: Array<[Particle, Particle]> = [];
          for (let i = 0; i < large.length; i++) {
            for (let j = i + 1; j < large.length; j++) {
              const dx = large[i].x - large[j].x;
              const dy = large[i].y - large[j].y;
              if (dx * dx + dy * dy < CONNECTION_RADIUS_SQ) {
                pairs.push([large[i], large[j]]);
              }
            }
          }
          connPairsRef.current = pairs;
        }

        const pairs = connPairsRef.current;
        ctx.lineWidth = 0.4 * currentDpr;
        for (let k = 0; k < pairs.length; k++) {
          const [a, b] = pairs[k];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_RADIUS) {
            const lineOpacity = (1 - dist / CONNECTION_RADIUS) * 0.018;
            const colorStr = a.transProgress >= 1
              ? `${a.toRGB.r}, ${a.toRGB.g}, ${a.toRGB.b}`
              : lerpColor(a.fromRGB, a.toRGB, a.transProgress);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${colorStr}, ${lineOpacity})`;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (mouseMoveHandler) window.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("resize", handleResize);
      if (resizeTimer) clearTimeout(resizeTimer);
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
