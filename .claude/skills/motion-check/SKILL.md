---
name: motion-check
description: Validate motion system consistency before and after animation changes. Use this skill EVERY TIME the user asks to modify, add, or refine any animation, transition, motion, or scroll-based effect in the portfolio. This includes requests mentioning "animazione", "transizione", "motion", "scroll", "parallax", "GSAP", "framer motion", "motion/react", "easing", "timing". Ensures the dual motion system (motion/react + GSAP) stays coherent.
---

# Motion Check Skill

This portfolio uses a dual motion system with strict separation rules. This skill validates that any animation change respects the system boundaries.

## Motion System Rules (from CLAUDE.md)

| System | Use for | Hook/API |
|--------|---------|----------|
| motion/react | Local component animations (entrance, hover, layout, stagger) | `motion.div`, `AnimatePresence`, `useInView` |
| GSAP + ScrollTrigger | Scroll orchestration, cross-section effects, parallax, pins | `useGSAP()` hook from `src/app/utils/gsap.ts` |

### Shared easing constants (from gsap.ts)
- `EXPO_CSS`: `[0.16, 1, 0.3, 1]` — for motion/react and CSS transitions
- `EXPO_GSAP`: `"power4.out"` — for GSAP timelines
- `EXIT_GSAP`: `"power2.inOut"` — for GSAP exit animations

### Performance patterns already in use
- `useSyncExternalStore` for scroll/velocity state (no context re-renders)
- Canvas2D for particles (FloatingElements)
- CSS variables bridge (`--scroll-intensity`, `--scroll-velocity-y`) for cross-system communication
- Direct DOM via `gsap.set()` for scroll-driven updates
- Module-level state (not React state) for frame-level updates

## Pre-change checklist

Before writing any animation code, answer these questions:

### 1. Which system should this use?

| If the animation is... | Use |
|------------------------|-----|
| Triggered by component mount/unmount | motion/react |
| Triggered by hover or focus | motion/react |
| Driven by scroll position | GSAP ScrollTrigger |
| Cross-section (affects multiple sections) | GSAP ScrollTrigger |
| Parallax or pin-based | GSAP ScrollTrigger |
| A layout animation (reflow) | motion/react `layout` prop |
| Staggered entrance of child elements | motion/react with `delay` |

### 2. Is the easing consistent?

- motion/react animations should use `EXPO_CSS` or `[0.16, 1, 0.3, 1]`
- GSAP animations should use `EXPO_GSAP` ("power4.out") or `EXIT_GSAP` ("power2.inOut")
- NEVER use different easing curves for the same type of motion within a section
- Check adjacent components — does the new easing match their feel?

### 3. Will this cause performance issues?

Red flags:
- [ ] Using React state (`useState`) for values that update every frame
- [ ] Using `backdrop-filter: blur()` on large areas without gating behind reduced-motion
- [ ] Adding DOM elements that animate (should be canvas for >10 animated elements)
- [ ] Triggering layout recalc (reading offsetHeight/getBoundingClientRect in animation loop)
- [ ] Not using `will-change` or `transform` for GPU-accelerated properties

Green patterns:
- [x] Using refs and direct DOM manipulation for frame-level updates
- [x] Using CSS variables for cross-system communication
- [x] Using `useGSAP` hook (auto-cleanup via gsap.context)
- [x] Using `gsap.set()` instead of `gsap.to()` for instant scroll-driven updates
- [x] Gating expensive effects behind `prefers-reduced-motion` and viewport size

### 4. Is GSAP cleanup handled?

- All GSAP code MUST use the `useGSAP(callback, deps, scopeRef)` hook
- NEVER use raw `useEffect` + `gsap.to()` without cleanup
- ScrollTrigger instances inside `useGSAP` are auto-cleaned
- If you need `ScrollTrigger.refresh()`, call `refreshScrollTriggers()` from gsap.ts

## Post-change validation

After implementing the change:

1. **System boundary check**: grep the modified file for mixed patterns
   - motion/react file should NOT import from `../utils/gsap` (unless it's a hybrid like Philosophy.tsx which uses both correctly)
   - GSAP file should NOT use `motion.div` for scroll-driven effects

2. **Easing audit**: search for hardcoded easing values
   - No magic numbers like `0.16, 1, 0.3, 1` — use `EXPO_CSS` constant
   - No string easings like `"power4.out"` — use `EXPO_GSAP` constant

3. **TypeScript check**: `npx tsc --noEmit`

4. **Duration consistency**: animations within the same section should have related durations
   - Entrance: 0.6–1.0s
   - Hover: 0.2–0.4s
   - Scroll scrub: use `scrub: 0.8` to `scrub: 1.5`
   - Stagger: 0.04–0.08s between items

## Animation philosophy reminder

Animations must feel: controlled, intentional, structural, premium.
NOT: flashy, random, excessive, decorative only.

If the proposed animation doesn't pass all four words, reconsider it.
