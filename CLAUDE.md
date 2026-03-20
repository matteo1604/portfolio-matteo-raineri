# CLAUDE.md

## Project identity

This is not a standard portfolio.

It is an interactive system composed of:
- a capability engine (Skills section — terminal interface)
- an execution system (Process section — phased workflow)
- a narrative manifesto (Philosophy — scroll-pinned word slam)
- a modular archive system (BuildArchive — project registry)
- layered UI primitives (FloatingElements, Cursor, Transitions, LightThread)

The goal is not to display projects.
The goal is to let the user experience how the system thinks.

---

## Stack (ground truth)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React (via Vite) | 18.3.1 |
| Bundler | Vite | 6.3.5 |
| Language | TypeScript | strict |
| Styling | Tailwind CSS (v4, `@tailwindcss/vite` plugin) | 4.1.12 |
| Local motion | motion/react (ex Framer Motion) | 12.23.24 |
| Scroll/orchestration | GSAP + ScrollTrigger (registered globally) | ^3.14.2 |
| UI primitives | Radix UI (full suite), shadcn/ui, cmdk | various |
| Fonts | Inter (body), Syne (display), DM Mono (code) | Google Fonts |
| Routing | react-router | 7.13.0 |

GSAP is **already integrated**. The wrapper lives at `src/app/utils/gsap.ts` and exports:
- `gsap`, `ScrollTrigger` (re-exported after plugin registration)
- `useGSAP(callback, deps, scopeRef)` — auto-cleanup via `gsap.context()`
- `refreshScrollTriggers()` — calls `ScrollTrigger.refresh()`
- Easing constants: `EXPO_CSS`, `EXPO_GSAP`, `EXIT_GSAP`

---

## Current phase

The project is in **FINALIZATION** phase.

This means:
- no redesign from scratch
- no architectural reset
- no visual identity changes

Only:
- refinement
- cohesion
- animation orchestration
- system-level polish

## Core principle

**Elevate, do not reinvent.**

Every change must:
- increase perceived quality
- improve cohesion
- enhance motion language
- preserve identity

---

## System architecture

### App composition (render order in App.tsx)

```
ScrollProvider
  └─ ScrollVelocityProvider
       └─ Container (min-h-screen, bg-black, overflow-x-hidden)
            ├─ PageLoader          (entry state, gates Hero)
            ├─ VelocityEffects     (motion blur on fast scroll, desktop only)
            ├─ CustomCursor        (GSAP-driven dot + ring + trail + magnetic)
            ├─ FloatingElements    (canvas particle constellation, 1000 particles)
            ├─ LightThread         (fixed horizontal accent line at 48%)
            ├─ Navigation          (fixed top, glassmorphism)
            │
            ├─ #hero               (Hero, conditionally mounted via heroReady)
            ├─ SectionBleed        hero → philosophy
            ├─ SectionTransition   hero → philosophy
            ├─ #philosophy         (Philosophy)
            ├─ SectionBleed        philosophy → skills
            ├─ SectionTransition   philosophy → skills
            ├─ #skills             (Skills)
            ├─ SectionBleed        skills → projects
            ├─ SectionTransition   skills → projects
            ├─ #projects           (BuildArchive, re-exported as Projects)
            ├─ SectionBleed        projects → process
            ├─ SectionTransition   projects → process
            ├─ #process            (Process)
            ├─ SectionBleed        process → contact
            ├─ SectionTransition   process → contact
            └─ #contact            (Contact)
```

### Section components

| Section | File | Role | Key behavior |
|---------|------|------|-------------|
| Hero | `Hero.tsx` | Entry + first impact | Code panels with floating animation, GSAP parallax, terminal widget, CTA |
| Philosophy | `Philosophy.tsx` | Narrative manifesto | GSAP scroll-pinned word slam (desktop), row-based principles with hover states |
| Skills | `Skills.tsx` | Interactive capability engine (CORE) | Terminal interface, boot sequence, command execution, system node graph, motion profile editor |
| Projects | `Projects.tsx` → `build-archive/BuildArchive.tsx` | Modular project archive | Multi-panel layout (rail + header + panel + footer), module navigation, GSAP ghost parallax |
| Process | `Process.tsx` | Execution model | Phased pipeline (signal→structure→build→release), progression lane, desktop wheel control |
| Contact | `Contact.tsx` | Closing surface | CTA + social links |

### Global systems (always mounted)

| System | File | Role | Implementation |
|--------|------|------|---------------|
| ScrollProvider | `contexts/ScrollContext.tsx` | Section detection + scroll progress | Module-level singleton store (useSyncExternalStore), IntersectionObserver with `-40% 0px -40% 0px` rootMargin |
| ScrollVelocityProvider | `systems/ScrollVelocity.tsx` | Velocity tracking | Single RAF loop, smoothed velocity (0.85/0.15), sets CSS vars `--scroll-intensity` and `--scroll-velocity-y` |
| FloatingElements | `FloatingElements.tsx` | Ambient particle layer | Canvas2D, 1000 particles, parallax depth, mouse repulsion (180px), constellation connections, section-aware color wave (16 particles/frame) |
| LightThread | `LightThread.tsx` | Visual scroll thread | Fixed at 48%, GSAP ScrollTrigger scrub, intensifies at section boundaries, color morphs per section |
| CustomCursor | `CustomCursor.tsx` | Interaction layer | GSAP-driven: dot (tight follow 0.08s), ring (soft 0.18s), trail (5 dots), magnetic pull (120px radius), click ripple, hover scale |
| VelocityEffects | `VelocityEffects.tsx` | Motion blur on fast scroll | Desktop + no-reduced-motion only, backdrop-filter blur based on intensity > 0.3, direct DOM via store subscription |
| PageLoader | `PageLoader.tsx` | Entry gate | 2150ms hero mount, 2500ms loader exit, 0.9s fade transition overlapping Hero entrance |
| Navigation | `Navigation.tsx` | Fixed top nav | Glassmorphism on scroll, smooth scroll links, section awareness |

### Connective tissue (between every section pair)

| Component | File | Role | Implementation |
|-----------|------|------|---------------|
| SectionTransition | `SectionTransition.tsx` | Visual bridge | Per-pair config (height + treatment: gradient/grid/particles), GSAP scrub fade + connector line + glow orb |
| SectionBleed | `SectionBleed.tsx` | Atmospheric overlap | Gradient overlays spanning section boundaries, 320px height with -160px margins, GSAP opacity scrub |

### Shared state shape

**ScrollState** (from ScrollContext):
```typescript
{
  globalProgress: number;     // 0→1 document scroll
  currentSection: SectionId;  // "hero" | "philosophy" | "skills" | "projects" | "process" | "contact"
  previousSection: SectionId | null;
  sectionProgress: number;    // 0→1 within current section
  transitionState: "entering" | "active" | "leaving";
}
```

**VelocityState** (from ScrollVelocity):
```typescript
{
  velocity: number;       // px/frame smoothed
  direction: 1 | -1 | 0; // down | up | still
  intensity: number;      // 0→1 normalized
  isResting: boolean;     // true when velocity < 0.5 for 300ms+
}
```

### Section accent system

Colors are defined as RGB triplets and used across multiple systems (ScrollContext, SectionTransition, SectionBleed, FloatingElements, LightThread):

| Section | RGB | Visual |
|---------|-----|--------|
| hero | 59, 130, 246 | Electric blue |
| philosophy | 147, 197, 253 | Light blue |
| skills | 99, 102, 241 | Indigo |
| projects | 34, 197, 94 | Green |
| process | 14, 165, 233 | Cyan |
| contact | 147, 197, 253 | Light blue |

---

## File structure

```
/src
  /app
    App.tsx                          # Root composition + boot timing
    /components
      Hero.tsx                       # Hero section
      Philosophy.tsx                 # Manifesto section
      Skills.tsx                     # Terminal capability engine (largest component)
      Projects.tsx                   # Re-exports BuildArchive
      Process.tsx                    # Phased execution model
      Contact.tsx                    # Closing section
      Navigation.tsx                 # Fixed top nav
      CustomCursor.tsx               # GSAP custom cursor system
      PageLoader.tsx                 # Entry loader
      SectionTransition.tsx          # Section bridge (gradient/grid/particles)
      SectionBleed.tsx               # Atmospheric overlap between sections
      LightThread.tsx                # Fixed horizontal accent thread
      FloatingElements.tsx           # Canvas particle constellation
      VelocityEffects.tsx            # Motion blur on scroll
      /build-archive
        BuildArchive.tsx             # Main archive component
        ArchiveHeader.tsx            # Header + stats
        ArchivePanel.tsx             # Active project panel
        ArchiveRail.tsx              # Module navigation rail
        ArchiveTopBar.tsx            # Top bar
        ArchiveFooter.tsx            # Footer
        archive.data.ts              # Module definitions
      /ui                            # shadcn/ui + Radix primitives
    /utils
      gsap.ts                        # GSAP wrapper, useGSAP hook, easing constants
  /contexts
    ScrollContext.tsx                 # Scroll state (singleton store + IntersectionObserver)
  /systems
    ScrollVelocity.tsx               # Velocity RAF loop + CSS variable bridge
  /styles
    fonts.css                        # Font imports
    theme.css                        # Theme variables
    index.css                        # Global styles
```

---

## Key insight (CRITICAL)

This project is already strong.

The problem is NOT:
- missing features
- missing complexity

The problem is:
- disconnected sections
- underutilized motion system
- lack of orchestration between parts

---

## Priority order (strict)

When improving the project, ALWAYS follow this order:

1. Section cohesion
2. Motion orchestration
3. Section transitions
4. Micro-interactions
5. Visual refinement
6. Code cleanup

NOT the opposite.

---

## Motion system rules

The project uses **two motion systems** with clear separation:

| System | Use for | Examples |
|--------|---------|---------|
| motion/react | Local component animations | Entrance fades, hover states, layout transitions, staggered reveals |
| GSAP + ScrollTrigger | Scroll orchestration + cross-section effects | Pin sequences, parallax, scrub-driven timelines, section boundary detection |

Rules:
- use GSAP for scroll orchestration, cross-section timelines, parallax layers
- keep local animations in motion/react
- avoid mixing logic randomly within a single component
- centralize complex timelines via `useGSAP` hook
- GSAP cleanup is automatic via `gsap.context()` in the `useGSAP` wrapper

---

## Component-specific guidelines

### SectionTransition (CRITICAL AREA)

**Current state:** Per-pair config system with 3 treatments (gradient, grid, particles). GSAP scrub drives fade + connector line + glow orb. Each pair has custom height.

**What works:** The config system, scroll-driven opacity, treatment variety.

**What needs improvement:**
- Still feels like block separators, not flow connectors
- Treatments could respond more to scroll velocity
- Lack of visual continuity with SectionBleed

Goals:
- remove "block separation feeling"
- create flow between sections
- support scroll-based storytelling

Avoid:
- decorative-only transitions
- repeated patterns

### SectionBleed

**Current state:** Gradient overlays with GSAP opacity scrub, using section color pairs. 320px height with negative margins for overlap.

**What works:** The atmospheric effect, color interpolation between sections.

**What needs improvement:**
- Could be better coordinated with SectionTransition timing
- Gradient profiles are uniform — could vary per pair

### FloatingElements (AMBIENT SYSTEM)

**Current state:** Canvas2D particle constellation with 1000 particles. Features: parallax depth, organic oscillation, mouse repulsion (180px), constellation connections for large particles (~300), section-aware color wave (16 particles/frame over ~60 frames), scroll velocity boost via CSS variables.

**What works:** Performance (canvas vs DOM), section-aware color morphing, mouse interaction.

**What needs improvement:**
- Could respond more to scroll velocity (currently reads CSS vars but effect is subtle)
- Density/behavior could vary per section
- Connection lines could be more intentional

Must:
- never distract
- never overlap important UI
- feel like part of the system

### Skills (CORE SYSTEM)

This is the most important section. It functions as a terminal interface with:
- Boot sequence with system events
- Command execution with typing animation
- Expandable capability entries
- System node graph visualization
- Motion profile editor (stiffness, damping, stagger, hover)
- Tree visualization for component architecture

Rules:
- do NOT simplify it
- do NOT convert to standard UI
- enhance clarity without removing depth

Improve:
- flow between states
- system readability
- perceived responsiveness

### Process section

Structured as a phased execution model (signal → structure → build → release). Desktop uses hover-gated wheel control on progression lane. Mobile uses scroll scrub.

Improve:
- visual continuity with Skills
- smoother transitions between phases
- stronger motion hierarchy

### BuildArchive system

Multi-panel modular system: ArchiveRail (navigation) + ArchiveHeader (stats) + ArchivePanel (preview) + ArchiveTopBar + ArchiveFooter. Data-driven via `archive.data.ts`.

Rules:
- preserve modular architecture
- do NOT flatten
- do NOT simplify panels

Improve:
- navigation feel
- transitions between modules
- visual feedback on interaction

### Philosophy section

Scroll-pinned manifesto with GSAP word slam (desktop). Row-based principles with hover states and clip-path transitions.

Improve:
- motion subtlety
- readability under animation
- integration with scroll narrative

### Hero

Cinematic entry with oversized typography, floating code panels (GSAP parallax), terminal widget, scroll indicator.

Boot timing: heroReady at 2150ms, loader exit at 2500ms, ScrollTrigger refresh at 4000ms + 5500ms.

### Navigation & global UX

Navigation exists but is secondary. Glass morphism on scroll.

Focus:
- smooth scrolling
- section awareness
- transitions instead of jumps

### PageLoader

Gates Hero mounting. Boot sequence: hero mounts at 2150ms (350ms before loader fades), loader exit at 2500ms (0.9s transition).

Improve:
- reduce artificial delay feeling
- connect visually with Hero entrance

---

## Design system

### Color palette
- Background: `#000000` / `#050510`
- Primary text: white (various opacity levels)
- Accent: electric blue system (`#3b82f6` → `#60a5fa` → `#93c5fd`)
- Section accents: see accent system table above
- Code tokens: custom palette (`.t-kw`, `.t-fn`, `.t-str`, `.t-cmt`, etc.)

### Typography
- Display: Syne (section headers, archive stats)
- Body: Inter (responsive via `clamp()`)
- Code: DM Mono (terminal, code panels, archive labels)
- Hero scale: `clamp(4rem, 12vw, 14rem)`
- Section titles: `clamp(3rem, 8vw, 8rem)`

### Spacing
- Section padding: `py-32`
- Max content width: `max-w-7xl`
- Cinematic vertical rhythm throughout

---

## Editing rules

Before changing anything:

1. Analyze the component
2. Identify what already works
3. Identify the weakest part
4. Improve only that part

Never:
- rewrite entire sections blindly
- change design direction randomly
- add complexity without reason

## Animation philosophy

Animations must feel:
- controlled
- intentional
- structural
- premium

NOT:
- flashy
- random
- excessive
- decorative only

## Performance rules

Always protect:
- smoothness
- responsiveness
- readability

Avoid:
- heavy blur abuse
- excessive DOM updates
- layout thrashing
- React re-renders in scroll-driven code (use refs, direct DOM, CSS vars)

Performance patterns already in use:
- `useSyncExternalStore` for scroll/velocity state (no context re-renders)
- Canvas2D for particles (instead of DOM)
- CSS variables bridge for scroll velocity (no React overhead)
- Direct DOM manipulation in VelocityEffects and FloatingElements
- GSAP `gsap.set()` for scroll-driven updates (no React state)
- `requestAnimationFrame` singleton in ScrollVelocity (reference-counted)

## Code rules

- keep TypeScript strict
- keep components readable
- avoid giant files unless justified (Skills.tsx is justified — it's a system)
- reuse patterns when useful
- avoid duplication
- use `useGSAP` hook for all GSAP code (auto-cleanup)
- prefer module-level state over React state for frame-level updates

---

## When proposing improvements

Always respond with:

1. **Audit** of current component (what exists, what works)
2. **Main issue** (the single weakest point)
3. **Improvement strategy** (approach, not just code)
4. **Implementation** (actual code changes)
5. **Why it improves the system** (tied to the priority order)

## Definition of "better"

A change is better ONLY if it improves:
- cohesion between sections
- motion consistency
- system readability
- perceived quality
- performance
- interaction clarity

If not, do not change it.

---

## Session log

Track all changes made across sessions. Update after each working session.

### Format

```
### Session [N] — [date]
**Focus area:** [component or system]
**Changes made:**
- [file]: [what changed and why]
- [file]: [what changed and why]
**Status:** [what's done, what's next]
**Decisions:** [any design/architecture decisions made]
**Known issues:** [anything discovered but not fixed]
```

### Session 1 — [date of first working session]

_No changes yet. Ready to begin._

---

## Self-maintenance rules

### Session log
At the END of every working session (when I say "chiudi sessione", "abbiamo finito", "stop", or similar):
1. Run `git diff --name-only` to identify changed files
2. Append a new session log entry to this file following the format in the Session Log section
3. If any architectural change was made (new component, new system, changed dependency), update the relevant sections above (file structure, system architecture, component guidelines)

### Drift detection
At the START of every session, before doing any work:
1. Verify that the file structure section matches the actual `/src` directory
2. If a component mentioned in this file no longer exists or has been renamed, flag it
3. If new files exist that aren't documented here, mention it

### What to update vs what to leave
- **Auto-update:** file structure, stack versions, component inventory, session log, dependency map
- **Never auto-update:** project identity, core principle, priority order, editing rules, animation philosophy, final mindset
- **Ask before updating:** component-specific guidelines, motion system rules, design system

## Final mindset

You are finishing a high-end interactive system.

Act like:
- a senior frontend engineer
- a product thinker
- a motion designer

Goal:
Make the portfolio feel like a system that responds, not a page that scrolls.