---
name: a11y-motion
description: Validate and enforce prefers-reduced-motion support across all animated components. Triggers on any animation modification or accessibility audit. Checks that every animation has a dignified static fallback following the Hero.tsx pattern (matchMedia + useState + conditional rendering).
---

# A11y Motion Skill

This portfolio has extensive animation across 12+ components but only 2 currently respect `prefers-reduced-motion`. This skill ensures every animation change includes a proper reduced-motion fallback.

## Current reduced-motion support map

### SUPPORTED (have fallback)

| Component | Implementation | Notes |
|-----------|---------------|-------|
| `VelocityEffects.tsx` | Checks `(prefers-reduced-motion: no-preference)`, does not render if reduced | Full opt-out, component not mounted |
| `Hero.tsx` | `useState` + `matchMedia` listener, falls back to static opacity | Reference pattern for all other components |

### NOT SUPPORTED (no fallback)

| Component | Animation type | Risk level | Recommended fallback |
|-----------|---------------|------------|---------------------|
| `FloatingElements.tsx` | Canvas2D: 1000 particles, oscillation, mouse repulsion, constellation connections | **High** — constant motion, high GPU | Reduce to ~50 particles, disable constellation connections, disable oscillation, keep static positioned dots |
| `LightThread.tsx` | GSAP ScrollTrigger scrub, color morph | **Low** — subtle, follows scroll | Show static line at base color, no scrub animation |
| `SectionTransition.tsx` | GSAP scrub fade + connector line + glow orb | **Medium** — decorative but visible | Show static gradient, hide glow orb, keep connector line static |
| `SectionBleed.tsx` | GSAP opacity scrub on gradient overlays | **Low** — atmospheric | Show gradient at fixed 0.5 opacity, no scrub |
| `Philosophy.tsx` | GSAP pinned word-slam (desktop) | **High** — pin hijacks scroll | Remove pin, show all words visible statically, preserve layout |
| `Process.tsx` | GSAP pin + wheel interception | **High** — pin hijacks scroll | Remove pin, show all phases visible statically, no wheel interception |
| `CustomCursor.tsx` | GSAP dot + ring + trail + magnetic pull | **Medium** — desktop only | Do not mount component if reduced-motion, use system cursor |
| `Skills.tsx` | motion/react entrance fades, typing animation, pulse, terminal boot sequence | **Medium** — complex multi-part | Show content immediately without typing delay, disable pulse, keep layout intact |
| `Navigation.tsx` | Glassmorphism transition on scroll | **Low** | Apply scrolled state immediately, no transition |
| `PageLoader.tsx` | Entry fade + timing gate | **Low** — one-time | Reduce timing delays, simpler fade or instant show |

## Reference pattern (from Hero.tsx)

Every component that animates MUST follow this detection pattern:

```tsx
const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
});

useEffect(() => {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
  mql.addEventListener('change', handler);
  return () => mql.removeEventListener('change', handler);
}, []);
```

Then use `prefersReducedMotion` to conditionally modify behavior.

## Fallback rules by animation type

### Canvas animations (FloatingElements)

```
IF prefersReducedMotion:
  - Reduce particle count from 1000 to ~50
  - Disable oscillation (no sin/cos movement)
  - Disable constellation connection lines
  - Disable mouse repulsion
  - Keep particles as static ambient dots at their initial positions
  - Keep section-aware color (no wave transition, instant switch)
```

### GSAP pinned sections (Philosophy, Process)

```
IF prefersReducedMotion:
  - Do NOT create ScrollTrigger with pin: true
  - Do NOT intercept wheel events
  - Show all content statically visible (no scroll-gated reveal)
  - Preserve full layout and visual hierarchy
  - All text/elements at opacity: 1
```

### GSAP scrub animations (SectionTransition, SectionBleed, LightThread)

```
IF prefersReducedMotion:
  - Do NOT create ScrollTrigger scrub timelines
  - Set elements to their midpoint or final visual state
  - Keep structural elements (lines, gradients) visible but static
  - Hide purely decorative animated elements (glow orbs, particle effects)
```

### motion/react animations (Skills, Navigation)

```
IF prefersReducedMotion:
  - Set animate={} to match initial={} (no transition)
  - Or use duration: 0 for instant state changes
  - Disable typing animations — show text immediately
  - Disable pulse/breathing effects
  - Keep hover states functional but without motion (opacity/color only)
```

### Custom cursor (CustomCursor)

```
IF prefersReducedMotion:
  - Do not mount the component at all
  - Let the browser's native cursor handle everything
  - Check in App.tsx before rendering: {!prefersReducedMotion && <CustomCursor />}
```

### Page loader (PageLoader)

```
IF prefersReducedMotion:
  - Reduce boot timing (mount hero faster)
  - Use simple opacity fade (0.3s max) or instant show
  - No staggered text reveals
```

## Pre-change checklist

Before modifying ANY animation in the project, verify:

- [ ] Does the component already have `prefersReducedMotion` detection?
- [ ] If not, is this change adding it? (It should be)
- [ ] Does the fallback preserve the content and layout?
- [ ] Does the fallback avoid ALL motion (no subtle animations "just because")?
- [ ] For GSAP pins: is scroll behavior restored to normal?
- [ ] For canvas: is GPU usage meaningfully reduced?

## Post-change checklist

After modifying any animation:

- [ ] Test with `prefers-reduced-motion: reduce` enabled (browser DevTools > Rendering > Emulate CSS media feature)
- [ ] Verify no content is hidden or inaccessible
- [ ] Verify no scroll hijacking remains active
- [ ] Verify no layout shift compared to animated version
- [ ] Verify the page still feels intentional (not broken — dignified)

## Critical rule

**Never remove an animation completely without providing a static alternative.**

The reduced-motion experience must feel like a deliberate design choice, not a broken page. Every section must remain fully readable, navigable, and visually coherent without any animation.

## When this skill triggers

- Any modification to files containing GSAP, motion/react, or canvas animation code
- Any request mentioning "accessibility", "a11y", "reduced motion", "prefers-reduced-motion"
- Any audit request on animated components
- When `motion-check` skill runs (a11y-motion should run as a companion check)
