---
name: z-index-map
description: Maps and protects the z-index stacking order across the portfolio. Triggers when any change involves z-index, position fixed/absolute/sticky, or new overlay components. Prevents collisions and ensures correct layer ordering for Navigation, overlays, cursor, and decorative elements.
---

# Z-Index Map Skill

The portfolio has a complex stacking context with fixed overlays, canvas layers, cursor system, and content layers. Z-index values are currently scattered across components with no central source of truth. This skill maintains the map and prevents collisions.

## When to trigger

- Any change that adds or modifies `z-index`, `z-[]`, or Tailwind `z-` classes
- Any change involving `position: fixed`, `position: absolute`, `position: sticky`
- Adding new overlay components (modals, dropdowns, tooltips, cursors)
- When debugging click-through or visual layering issues
- When the user asks about stacking, layers, or "why is X behind/above Y"

## Current z-index map (ground truth)

Ordered bottom-to-top. **Update this map when changes are made.**

```
LAYER 0 — BACKGROUND / AMBIENT
┌─────────────────────────────────────────────────┐
│ z-0     FloatingElements     canvas particles    │  pointer-events: none
│ z-[1]   SectionBleed         gradient overlays   │  pointer-events: none
│ z-[2]   LightThread          fixed accent line   │  pointer-events: none
│ z-[3]   VelocityEffects      motion blur overlay │  pointer-events: none
└─────────────────────────────────────────────────┘

LAYER 1 — CONTENT
┌─────────────────────────────────────────────────┐
│ z-10    Section content      relative z-10       │  pointer-events: auto
│         (Process, Skills, etc. inner content)    │
└─────────────────────────────────────────────────┘

LAYER 2 — NAVIGATION
┌─────────────────────────────────────────────────┐
│ z-40    Navigation           fixed top nav       │  pointer-events: auto
│         (VERIFY: may not have explicit z-index)  │
└─────────────────────────────────────────────────┘

LAYER 3 — UI OVERLAYS
┌─────────────────────────────────────────────────┐
│ z-50    Radix UI overlays    Dialog, Select,     │  pointer-events: auto
│         (Radix manages its own portal stacking)  │
└─────────────────────────────────────────────────┘

LAYER 4 — CURSOR (topmost interactive)
┌─────────────────────────────────────────────────┐
│ z-[9997] CustomCursor trail  trail dots          │  pointer-events: none
│ z-[9998] CustomCursor ring   outer ring          │  pointer-events: none
│ z-[9999] CustomCursor dot    inner dot           │  pointer-events: none
└─────────────────────────────────────────────────┘
```

### Reserved ranges

| Range | Purpose | Available slots |
|-------|---------|-----------------|
| 0–9 | Background/ambient layers | 0, 1, 2, 3 used; 4–9 free |
| 10–19 | Section content | 10 used; 11–19 free |
| 20–39 | Reserved for future content overlays | free |
| 40–49 | Navigation and persistent UI | 40 for nav; 41–49 free |
| 50–99 | UI overlays (Radix, modals, tooltips) | 50 used by Radix; 51–99 free |
| 100–999 | Reserved (do not use without justification) | — |
| 9990–9999 | Cursor system (do not touch) | 9997–9999 used |

## Pre-change checklist

Before adding or modifying any z-index:

- [ ] Check the map above — is the target z-value already taken?
- [ ] Does the new element need to be above or below Navigation (z-40)?
- [ ] Does the new element need `pointer-events: none`? (All decorative/ambient layers MUST have it)
- [ ] Is the element using `position: fixed`? If yes, it creates a new stacking context — verify its children don't escape
- [ ] Will this change affect click targets? Test that buttons, links, and interactive elements remain clickable
- [ ] Does the component portal to document.body? (Radix does this — z-index is relative to body, not parent)

## Critical stacking rules

### Rule 1: Navigation must be visible above ambient layers
```
Navigation (z-40) > VelocityEffects (z-3) > LightThread (z-2) > SectionBleed (z-1) > FloatingElements (z-0)
```
**Verify:** Navigation has an explicit z-index. If it relies on DOM order only, a fixed ambient layer could cover it.

### Rule 2: Cursor is always topmost
```
CustomCursor (z-9997/9998/9999) > everything else
```
**Never** assign z-index > 9996 to any non-cursor element.

### Rule 3: Decorative layers must not capture events
Every element in Layer 0 (z-0 through z-9) MUST have:
```css
pointer-events: none;
```
Without this, the canvas/overlays will intercept clicks on content below/above them.

### Rule 4: Content must be above ambient, below nav
```
Navigation (z-40) > Content (z-10) > Ambient (z-0 to z-9)
```

### Rule 5: Radix portals manage their own stacking
Radix UI components (Dialog, Select, DropdownMenu, etc.) portal to `document.body` and manage their own z-index. Do NOT override Radix z-index unless there's a specific conflict with the cursor layer.

## Audit procedure

When running a z-index audit:

### Step 1: Extract current values

Search for all z-index usage:
```
Grep: z-\[ across src/ (Tailwind arbitrary values)
Grep: z-\d+ across src/ (Tailwind preset values)
Grep: zIndex across src/ (inline styles / GSAP)
Grep: z-index across src/ (CSS files)
```

### Step 2: Build actual map

For each finding:
- File and component name
- z-index value
- position type (fixed/absolute/relative/sticky)
- pointer-events setting
- Whether it creates a stacking context

### Step 3: Verify ordering

Check against the map above. Flag:
- **COLLISION**: Two components at the same z-value that could visually overlap
- **GAP RISK**: A component in an unexpected range (e.g., content at z-30 instead of z-10–19)
- **MISSING pointer-events**: Decorative layer without `pointer-events: none`
- **MISSING z-index**: Fixed/absolute element with no explicit z-index (browser default = auto)
- **Navigation buried**: Navigation z-index lower than any ambient layer

### Step 4: Report

```
## Z-Index Audit — [date]

### Stacking map (actual)
[table of all z-index values found]

### Issues
| Severity | Component | Issue | Fix |
|----------|-----------|-------|-----|
| CRITICAL | [name] | [issue] | [fix] |
| WARNING  | [name] | [issue] | [fix] |

### Recommendations
[any structural changes needed]
```

## Recommended: centralized constants file

Suggest creating `src/app/utils/z-index.ts` when the user is ready:

```typescript
/**
 * Centralized z-index map.
 * See .claude/skills/z-index-map/SKILL.md for the full stacking documentation.
 *
 * Ranges:
 *   0-9:      Background/ambient (pointer-events: none)
 *   10-19:    Section content
 *   20-39:    Reserved
 *   40-49:    Navigation / persistent UI
 *   50-99:    UI overlays (Radix, modals)
 *   9990-9999: Cursor system
 */

export const Z = {
  // Layer 0 — Background
  floatingElements: 0,
  sectionBleed: 1,
  lightThread: 2,
  velocityEffects: 3,

  // Layer 1 — Content
  sectionContent: 10,

  // Layer 2 — Navigation
  navigation: 40,

  // Layer 3 — UI Overlays
  overlay: 50,

  // Layer 4 — Cursor
  cursorTrail: 9997,
  cursorRing: 9998,
  cursorDot: 9999,
} as const;

export type ZLayer = keyof typeof Z;
```

This file should be created when refactoring z-index values, not preemptively. The skill tracks the map regardless of whether the constants file exists.

## Rules

- Never assign z-index values without checking this map first
- Always update the map in this skill file when z-index values change
- Prefer using values within the designated ranges
- Every `position: fixed` element MUST have an explicit z-index
- Every decorative/ambient layer MUST have `pointer-events: none`
- Do not use z-index values between 100 and 9989 without explicit justification
- When in doubt, use the lowest z-value that achieves correct stacking
