---
name: mobile-experience
description: Verifies mobile experience quality across the portfolio. Triggers when modifying layout, responsive behavior, touch interactions, or any component that behaves differently on mobile. Maintains a component-by-component mobile status map and flags issues with canvas performance, GSAP pins, viewport overflow, and touch targets.
---

# Mobile Experience Skill

The portfolio is built desktop-first with heavy canvas rendering, GSAP pins, and complex layouts. Mobile is where it's most likely to break. This skill ensures every change considers the mobile experience.

## When to trigger

- Any change to responsive breakpoints, layout, or viewport-dependent logic
- Any change to components listed as "broken" or "degraded" in the status map below
- When the user asks about mobile, responsive, touch, or viewport behavior
- When modifying FloatingElements, GSAP pins, or multi-panel layouts
- Before deploy (coordinate with deploy-check)

## Breakpoint definitions

| Name | Range | Tailwind | Usage |
|------|-------|----------|-------|
| Mobile | < 768px | default / `sm:` | Phone portrait + landscape |
| Tablet | 768px–1023px | `md:` | iPad, small laptops |
| Desktop | >= 1024px | `lg:` / `xl:` | Full experience |

The project primarily gates features at `lg:` (1024px). Some components use `(min-width: 1024px)` via `matchMedia`.

## Component mobile status map

**Update this map when changes are made.**

| Component | Mobile status | Issue | What should happen |
|-----------|--------------|-------|-------------------|
| FloatingElements | **BROKEN** | 1000 particles + connections on all viewports, no breakpoint check | Max 200 particles, no connections, no mouse repulsion on mobile |
| CustomCursor | **DEGRADED** | Hidden via `lg:` CSS but component mounts, event listeners attach | Do not mount on < 1024px (check in App.tsx or component) |
| Philosophy | **DEGRADED** | Pin gated on desktop via matchMedia, but non-pin animations still run on mobile | Verify mobile fallback shows all content statically, no heavy animations |
| Process | **DEGRADED** | Wheel interception gated on desktop, but scroll scrub may conflict with GSAP pins | Test mobile scroll behavior, ensure no stuck states |
| Skills | **DEGRADED** | Terminal + stage panel side-by-side layout doesn't fit small screens | Should stack vertically on mobile, verify touch usability |
| LightThread | **WARNING** | Fixed at 48% viewport height — may overlap content on short screens | Consider hiding or repositioning on mobile |
| VelocityEffects | **OK** | Gated on desktop + no-reduced-motion | No action needed |
| SectionTransition | **WARNING** | Fixed heights (128–192px) are excessive whitespace on mobile | Reduce to 64–96px on mobile |
| SectionBleed | **WARNING** | 320px height with -160px margins — proportionally large on mobile | Consider reducing to 200px / -100px on mobile |
| Hero | **OK** | Code panels hidden under `lg:`, typography responsive via `clamp()` | Verify parallax animations not running on hidden elements |
| BuildArchive | **DEGRADED** | Multi-panel layout (rail + header + panel + footer) | Must collapse to single-column stack on mobile |
| Navigation | **OK** | Assumed responsive | Verify touch targets >= 44px, hamburger if needed |
| PageLoader | **OK** | Simple overlay | No mobile-specific issues expected |
| Contact | **OK** | Simple layout | Verify touch targets on social links |

### Status definitions

- **OK**: Works correctly on mobile, properly gated or responsive
- **WARNING**: Works but suboptimal (excess whitespace, subtle perf issue)
- **DEGRADED**: Partially works but has UX or performance issues
- **BROKEN**: Actively harmful to mobile experience (perf, layout, or usability)

## Critical mobile risks

### Risk 1: Canvas particle budget (FloatingElements)

The canvas renders 1000 particles with O(n²) constellation connections on ALL viewports.

**Required mobile behavior:**
```
< 768px:
  - particles: 150–200
  - connections: disabled
  - mouse repulsion: disabled (no hover on touch)
  - color wave batch: reduce to 8 particles/frame
  - devicePixelRatio: cap at 2 (prevent 3x on high-DPI phones)

768px–1023px:
  - particles: 400–500
  - connections: reduced (only particles with depth > 0.7)
  - mouse repulsion: disabled
```

**Detection pattern:**
```typescript
const isMobile = window.innerWidth < 768;
const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

const PARTICLE_COUNT = isMobile ? 200 : isTablet ? 400 : 1000;
const ENABLE_CONNECTIONS = !isMobile;
```

### Risk 2: GSAP pins on mobile (Philosophy, Process)

GSAP `pin: true` hijacks scroll and can cause:
- Stuck scroll states on iOS Safari
- Janky scroll on low-end Android
- Unexpected behavior with mobile browser chrome (URL bar hide/show)

**Required mobile behavior:**
- Do NOT pin on < 1024px
- Show all content statically visible
- Use simple scroll-triggered opacity/translate instead of pin sequences
- Test on iOS Safari specifically (different scroll behavior from Chrome)

### Risk 3: Event listeners on hidden components (CustomCursor)

Even if visually hidden via CSS (`lg:block`), the component still:
- Mounts in React
- Attaches `mousemove`, `mouseenter`, `mouseleave` listeners
- Runs GSAP `.to()` on every mouse event
- Wastes memory and CPU on mobile

**Required fix:** Conditional mounting, not CSS hiding:
```tsx
// In App.tsx or component
const isDesktop = useMediaQuery('(min-width: 1024px)');
// ...
{isDesktop && <CustomCursor />}
```

### Risk 4: Touch targets

Minimum touch target: **44x44px** (Apple HIG) / **48x48px** (Material Design).

Check:
- Navigation links
- Social links in Contact
- Module navigation in BuildArchive rail
- Terminal commands in Skills
- Any button or interactive element

## Pre-change checklist

Before modifying any component:

- [ ] How does this component currently behave on mobile? (Check status map)
- [ ] Does the change add new animations? If yes, are they gated on desktop?
- [ ] Does the change add fixed/absolute positioning? If yes, test on mobile viewport
- [ ] Does the change add event listeners? If yes, are they cleaned up and gated?
- [ ] Does the change affect layout? If yes, verify at 375px (iPhone SE) and 768px (iPad)
- [ ] Are touch targets >= 44px?

## Post-change checklist

After modifying any component:

- [ ] Test at 375px width (iPhone SE — smallest common viewport)
- [ ] Test at 390px width (iPhone 14)
- [ ] Test at 768px width (iPad portrait)
- [ ] Test at 1024px width (iPad landscape / breakpoint boundary)
- [ ] Verify no horizontal overflow (check for `overflow-x-hidden` on container)
- [ ] Verify no content is cut off or unreachable
- [ ] Verify scroll works smoothly (no stuck states from GSAP pins)
- [ ] Check Chrome DevTools > Performance panel at 4x CPU throttle

## Testing instructions

### Chrome DevTools device simulation

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test these devices:
   - iPhone SE (375x667) — smallest common
   - iPhone 14 (390x844) — most common
   - iPad (768x1024) — tablet breakpoint
   - iPad Pro (1024x1366) — desktop breakpoint boundary
4. Enable CPU throttle: Performance tab > CPU > 4x slowdown
5. Check for:
   - Layout breaks
   - Scroll jank
   - Tap targets too small
   - Content overflow
   - Excessive whitespace from desktop-sized spacing

### iOS Safari specific checks

iOS Safari has unique behavior:
- URL bar hide/show changes viewport height (use `dvh` not `vh` for full-height elements)
- `-webkit-overflow-scrolling: touch` affects scroll containers
- `position: fixed` elements can jump during URL bar animation
- GSAP pins can conflict with native scroll momentum

## Mobile spacing adjustments

Desktop spacing that's excessive on mobile:

| Element | Desktop | Mobile target |
|---------|---------|---------------|
| Section padding | `py-32` (128px) | `py-16` (64px) or `py-20` (80px) |
| SectionTransition height | 128–192px | 64–96px |
| SectionBleed height | 320px | 200px |
| SectionBleed margins | -160px | -100px |
| Hero typography | `clamp(4rem, 12vw, 14rem)` | Already responsive via clamp ✅ |
| Section titles | `clamp(3rem, 8vw, 8rem)` | Already responsive via clamp ✅ |

## Rules

- Mobile is not an afterthought — every change must be verified on mobile
- Performance on mobile matters more than visual fidelity — degrade gracefully
- Never hide content on mobile — only simplify presentation
- Prefer conditional mounting over CSS hiding for heavy components
- GSAP pins are desktop-only unless proven safe on mobile
- Canvas particle count must scale with viewport size
- Touch targets must be at least 44x44px
- Test at 375px minimum — if it works on iPhone SE, it works everywhere
- When in doubt, simplify for mobile rather than adding complexity
