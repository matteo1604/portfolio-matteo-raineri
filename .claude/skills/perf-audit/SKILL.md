---
name: perf-audit
description: Performance audit for the portfolio. Triggers before deploy or on explicit performance check requests. Scans for canvas overhead, excessive ScrollTriggers, RAF duplication, layout thrashing, will-change abuse, font loading issues, dead code ("use client"), backdrop-filter costs, and bundle size. Outputs a severity-rated report (critical/warning/info) with suggested fixes.
---

# Performance Audit Skill

This portfolio runs a heavy simultaneous stack: canvas particles, multiple GSAP ScrollTriggers, RAF loops, backdrop-filter blur, custom cursor tracking, and pinned sections. This skill audits runtime performance and flags regressions.

## When to trigger

- Before any deploy or build
- When the user asks to check performance ("performance", "perf", "audit performance", "è lento", "controlla performance", "lighthouse", "ottimizza")
- After adding new animations or ScrollTriggers
- After modifying FloatingElements, ScrollVelocity, or any GSAP-heavy component

## Existing performance patterns (PRESERVE THESE)

These patterns are already in place and must NOT be removed or refactored away:

| Pattern | Where | Why |
|---------|-------|-----|
| `useSyncExternalStore` | ScrollContext, ScrollVelocity | Avoids context re-renders for high-frequency state |
| CSS variables bridge | `--scroll-intensity`, `--scroll-velocity-y` | Cross-system communication without React overhead |
| Canvas2D | FloatingElements | 1000 particles would destroy DOM rendering |
| Module-level state | ScrollVelocity, FloatingElements | Frame-level updates without React state/re-renders |
| `gsap.set()` | Various scroll-driven updates | Instant property sets, no tween overhead |
| Media query gating | VelocityEffects | `(prefers-reduced-motion: no-preference)` check before mount |
| `requestAnimationFrame` singleton | ScrollVelocity | Reference-counted, single loop |

## Audit checklist

Run each check in order. For each finding, assign a severity:
- **CRITICAL**: Causes visible jank, dropped frames, or blocks main thread >50ms
- **WARNING**: Performance cost is real but not immediately visible; will degrade on lower-end devices
- **INFO**: Cleanup opportunity, no runtime impact

---

### 1. Canvas particle budget

**Files:** `src/app/components/FloatingElements.tsx`

Check:
- [ ] What is the particle count? (Currently 1000 desktop)
- [ ] Is there a mobile breakpoint reducing count? Target: 200-300 on `< 768px`
- [ ] Are constellation connections (O(n²) on large particles ~300) disabled on mobile?
- [ ] Is `devicePixelRatio` capped? (Retina canvases are 4x the pixels)
- [ ] Is the animation loop using a single `requestAnimationFrame`?

Expected mobile config:
```
particles: 200-300
connections: disabled
mouse repulsion: disabled (no hover on touch)
color wave: reduce batch size
```

Severity if missing mobile reduction: **CRITICAL**

---

### 2. backdrop-filter audit

**Files:** `src/app/components/VelocityEffects.tsx`, grep for `backdrop-filter` across all files

Check:
- [ ] VelocityEffects: already gated behind desktop + no-reduced-motion — OK
- [ ] Search for OTHER `backdrop-filter` or `backdrop-blur` usage (Navigation glassmorphism, modals, etc.)
- [ ] Each `backdrop-filter` creates a compositing layer — count total active layers
- [ ] Are any backdrop-filters applied to large-area elements? (Full-width = expensive)

Severity: **WARNING** per additional unaudited backdrop-filter

---

### 3. GSAP ScrollTrigger count

**Files:** Grep for `ScrollTrigger.create` and `scrollTrigger:` across entire `src/`

Check:
- [ ] Count total ScrollTrigger instances at peak (all sections visible)
- [ ] Current expected count: ~15+ (5 SectionTransition + 5 SectionBleed + LightThread + Philosophy pin + Process pin + Hero parallax + misc)
- [ ] Are any ScrollTriggers created inside loops or `.map()` without cleanup?
- [ ] Are all ScrollTriggers killed on unmount? (Check `useGSAP` usage — auto-cleanup via context)
- [ ] Is `ScrollTrigger.refresh()` called excessively? (Should only fire on layout changes)

Threshold: >20 simultaneous triggers = **WARNING**, >30 = **CRITICAL**

---

### 4. RAF loop duplication

**Files:** `src/systems/ScrollVelocity.tsx`, grep for `requestAnimationFrame` across `src/`

Check:
- [ ] ScrollVelocity should be the ONLY persistent RAF loop
- [ ] FloatingElements has its own canvas render loop — this is expected and OK (canvas needs its own)
- [ ] Any OTHER `requestAnimationFrame` calls? Flag unexpected ones
- [ ] Are RAF loops reference-counted? (Start on first subscriber, stop on last unsubscribe)
- [ ] Are RAF loops cancelled on unmount?

Severity: **WARNING** per unexpected RAF loop

---

### 5. Layout thrashing

**Files:** All animation-related files

Check:
- [ ] Search for `getBoundingClientRect`, `offsetHeight`, `offsetWidth`, `offsetTop`, `clientHeight`, `scrollHeight` inside:
  - `requestAnimationFrame` callbacks
  - GSAP `onUpdate` callbacks
  - `mousemove` / `scroll` event handlers
- [ ] These reads force synchronous layout recalculation when preceded by writes
- [ ] Acceptable: reads in `useEffect` setup, `ScrollTrigger.create()` config, resize handlers
- [ ] Not acceptable: reads inside per-frame loops interleaved with style writes

Severity: **CRITICAL** if found inside animation loops, **INFO** if in setup code

---

### 6. will-change audit

**Files:** Grep for `will-change` across `src/` (CSS and inline styles)

Check:
- [ ] `will-change` should only be on elements that actually animate frequently
- [ ] Valid uses: canvas container, cursor elements, pinned sections during pin
- [ ] Invalid uses: static elements, elements that animate once on entrance then stop
- [ ] `will-change: transform` on too many elements = memory bloat (each creates a compositor layer)

Severity: **WARNING** if applied to >5 elements simultaneously

---

### 7. Font loading strategy

**Files:** `src/app/components/Hero.tsx`, `index.html`, `src/styles/fonts.css`

Check:
- [ ] Are fonts loaded via JS (`document.createElement('link')`) in Hero.tsx?
- [ ] This causes FOIT/FOUT — fonts should be in `index.html` with `<link rel="preload">`
- [ ] Check for `font-display: swap` in font CSS
- [ ] Verify fonts: Inter (body), Syne (display), DM Mono (code)

Recommended fix:
```html
<!-- index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" />
```

Severity: **WARNING** if fonts are loaded via JS instead of preload

---

### 8. Dead "use client" directives

**Files:** Grep for `"use client"` or `'use client'` across `src/`

Check:
- [ ] This is a Vite + React project, NOT Next.js
- [ ] `"use client"` directives are completely dead code here — they do nothing
- [ ] List all files containing them
- [ ] These can be safely removed as cleanup

Severity: **INFO** (no runtime impact, just dead code)

---

### 9. Bundle size analysis

Check:
- [ ] Is `rollup-plugin-visualizer` or `vite-plugin-visualizer` in devDependencies?
- [ ] If not, suggest adding it for analysis:
  ```bash
  npm install -D rollup-plugin-visualizer
  ```
- [ ] Check `vite.config.ts` for code splitting configuration
- [ ] Verify GSAP is not being bundled multiple times (check for duplicate imports)
- [ ] Check if tree-shaking is working (are unused Radix UI components being pruned?)
- [ ] Look for large dependencies that could be lazy-loaded

Severity: **INFO** (no runtime impact, build optimization)

---

## Output format

Generate a report following this structure:

```
## Performance Audit Report — [date]

### Summary
- Critical: [count]
- Warning: [count]
- Info: [count]

### CRITICAL

#### [C1] [Title]
**File:** [path]
**Issue:** [description]
**Impact:** [what happens]
**Fix:** [suggested fix]

### WARNING

#### [W1] [Title]
...

### INFO

#### [I1] [Title]
...

### Already optimized (no action needed)
- [list of patterns that are correctly implemented]

### Recommended next steps
1. [prioritized action items]
```

## Performance budget targets

| Metric | Target | Tool |
|--------|--------|------|
| LCP | < 2.5s | Lighthouse |
| FID / INP | < 200ms | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| JS bundle (gzipped) | < 200KB | vite-plugin-visualizer |
| Simultaneous ScrollTriggers | < 20 | Manual count |
| Canvas particles (mobile) | < 300 | Code check |
| RAF loops | 1 persistent + 1 canvas | Code check |
| backdrop-filter elements | < 3 simultaneous | Code check |

## Rules

- Never suggest removing animations entirely — suggest budget reduction or conditional loading
- Mobile-first: every check should have a mobile-specific threshold
- Preserve the existing performance patterns listed above
- If a metric is already within budget, say so explicitly — don't create work where none is needed
- Prioritize fixes that affect mobile devices first (most constrained environment)
