---
name: component-audit
description: Audit a component before modifying it. Use this skill EVERY TIME the user asks to improve, refine, fix, or modify any component in the portfolio. This includes requests like "migliora", "sistema", "refina", "lavora su", "tocca", "aggiorna" followed by a component name. The skill enforces the project's editing rules and priority order before any code change happens. Always trigger this before writing code.
---

# Component Audit Skill

Before modifying ANY component in this portfolio project, you MUST complete this audit process. Do NOT skip steps. Do NOT jump to code.

## Step 1 — Read the CLAUDE.md

Read `CLAUDE.md` in the project root. Pay attention to:
- Current phase (FINALIZATION — no redesign, no architectural reset)
- Priority order (section cohesion → motion orchestration → transitions → micro-interactions → visual refinement → code cleanup)
- Component-specific guidelines for the target component
- The "Definition of better" criteria

## Step 2 — Analyze the component

Read the full source file of the target component. Identify:

1. **What exists**: List the main features, animations, interactions
2. **What works well**: What should NOT be touched
3. **Dependencies**: What other components/systems does it interact with (ScrollContext, ScrollVelocity, GSAP, motion/react, CSS vars)
4. **Motion system used**: Is it motion/react, GSAP, or both? Is the separation correct per project rules?
5. **Performance patterns**: Does it use refs, direct DOM, CSS vars, or React state for frame-level updates?

## Step 3 — Identify the single weakest point

Based on the priority order, find the ONE thing that would most improve the component. Not three things. Not five. ONE.

Rate each dimension:
- Section cohesion: How well does it connect to adjacent sections? (1-5)
- Motion consistency: Does motion feel intentional and aligned with the system? (1-5)
- System readability: Can a user understand the interface behavior? (1-5)
- Perceived quality: Does it feel premium? (1-5)
- Performance: Is it smooth? (1-5)

The lowest score is your target.

## Step 4 — Propose improvement

Present to the user in this EXACT format:

```
### Audit: [ComponentName]

**What works:** [2-3 bullet points]

**Weakest point:** [single issue, tied to priority order]

**Strategy:** [approach description, 2-3 sentences]

**Scope:** [list of files that will be modified]

**Risk:** [what could break, what to test]
```

## Step 5 — Wait for approval

Do NOT write code until the user confirms the strategy. They may redirect or adjust scope.

## Step 6 — Implement

Only after approval:
- Make the minimum change needed
- Follow the motion system rules (motion/react for local, GSAP for scroll/cross-section)
- Use existing patterns (useGSAP hook, useSyncExternalStore, CSS vars bridge)
- Test that TypeScript compiles with `npx tsc --noEmit`

## Rules

- NEVER rewrite an entire component
- NEVER change design direction without explicit approval
- NEVER add complexity without a clear cohesion or quality benefit
- If the component is already strong in all dimensions, say so and suggest moving to a different area
