---
name: dead-code
description: Identifies and reports dead or unused code in the portfolio. Scans for unused UI components in /ui, unused package.json dependencies, "use client" directives (dead in Vite), unused imports, and orphan files. Never auto-removes — reports with confidence levels for manual review.
---

# Dead Code Skill

The portfolio has accumulated unused code from shadcn/ui scaffolding, unused dependencies, and Next.js-isms in a Vite project. This skill finds dead code and reports it for cleanup.

## When to trigger

- When the user asks about cleanup, dead code, unused imports, bundle size
- Before deploy (coordinate with deploy-check for code cleanup category)
- After removing a feature or component
- When investigating bundle size issues
- Periodically during refactoring sessions

## Scan categories

Run each scan and classify every finding:

- **[SAFE TO REMOVE]** — Zero references found, no possible dynamic usage, high confidence it's dead
- **[VERIFY FIRST]** — Low reference count or indirect usage possible, needs manual check
- **[KEEP]** — Referenced and active, or required by build/tooling even if not directly imported

---

### 1. "use client" directives

**What:** `"use client"` or `'use client'` at the top of `.ts`/`.tsx` files.

**Why dead:** This project uses Vite + React, NOT Next.js. The `"use client"` directive is a Next.js App Router concept. In Vite it's parsed as a plain string expression and does nothing.

**How to scan:**
```
Grep: "use client" across src/ in .ts and .tsx files
Grep: 'use client' across src/ in .ts and .tsx files
```

**Classification:** ALL instances are **[SAFE TO REMOVE]** — they have zero runtime effect in Vite.

**Fix:** Remove the directive line from each file. This is a bulk find-and-replace operation.

---

### 2. Unused UI components (/ui directory)

**What:** shadcn/ui components in `src/app/components/ui/` that are never imported by any file outside `/ui`.

**Why dead:** shadcn/ui scaffolds many components on install. The portfolio likely only uses a fraction.

**How to scan:**

Step 1 — List all component files in `/ui`:
```
Glob: src/app/components/ui/*.tsx
```

Step 2 — For each file, extract the component/export name and search for imports:
```
For each ui/[component].tsx:
  Grep: from.*["/]ui/[component] across src/ EXCLUDING files in ui/
  Grep: from.*@/.*ui/[component] across src/ EXCLUDING files in ui/
```

Step 3 — Also check for re-exports (some ui components import others):
```
If a ui component is only imported by other ui components,
and THOSE ui components are also unused externally → both are dead
```

**Classification:**
- 0 external imports → **[SAFE TO REMOVE]**
- Imported only by other unused ui components → **[SAFE TO REMOVE]**
- 1 external import → **[VERIFY FIRST]** (might be easy to confirm)
- 2+ external imports → **[KEEP]**

**Expected dead components** (verify, don't assume):
accordion, calendar, carousel, chart, drawer, input-otp, resizable, sidebar, slider, sonner, table, tooltip — and any others not actively used in the 6 section components.

---

### 3. Unused package.json dependencies

**What:** Dependencies listed in `package.json` that are never imported in `src/`.

**How to scan:**

Step 1 — Read `package.json`, extract all `dependencies` (not `devDependencies`).

Step 2 — For each dependency, search for imports:
```
For each dependency [pkg]:
  Grep: from ['"][pkg] across src/
  Grep: import ['"][pkg] across src/
  Grep: require\(['"][pkg] across src/
```

Note: Some packages are imported via subpaths (e.g., `@radix-ui/react-dialog` not just `@radix-ui`). Search for the exact package name as it appears in package.json.

Step 3 — Also check for:
- CSS imports (`import '[pkg]/styles.css'`)
- Vite plugin usage in `vite.config.ts`
- PostCSS/Tailwind plugin usage in config files

**Known suspects** (verify each):

| Package | Likely status | Notes |
|---------|--------------|-------|
| `react-dnd` | Suspect unused | Was it for drag-and-drop in BuildArchive? |
| `react-slick` | Suspect unused | Carousel library, portfolio uses custom navigation |
| `embla-carousel-react` | Verify | Another carousel lib, might be used by shadcn carousel component |
| `react-resizable-panels` | Verify | Used in Skills terminal? Or unused |
| `cmdk` | Verify | Command palette library — may be used in Skills |
| `vaul` | Verify | Drawer component — may be used via shadcn drawer |
| `sonner` | Verify | Toast library — any toasts in the portfolio? |
| `recharts` | Verify | Charting — used in Skills node graph? |
| `react-day-picker` | Suspect unused | Date picker in a portfolio? |
| `input-otp` | Suspect unused | OTP input in a portfolio? |
| `react-hook-form` | Verify | Used in Contact form? |
| `date-fns` | Verify | Often a dependency of react-day-picker |

**Classification:**
- 0 imports in src/ AND not used in config files → **[SAFE TO REMOVE]**
- Only imported by unused ui components → **[SAFE TO REMOVE]** (remove together)
- Imported in active code → **[KEEP]**
- Unclear (dynamic import, re-export chain) → **[VERIFY FIRST]**

---

### 4. Orphan files and directories

**What:** Files or directories in `src/` that are never imported or referenced.

**How to scan:**

Check these specific areas:

```
Glob: src/app/components/figma/**/* — is this directory active?
Glob: src/**/*.test.* — any test files? Are they run?
Glob: src/**/*.stories.* — any Storybook files? Is Storybook configured?
```

For any suspicious file:
```
Extract the default export or named exports
Grep for those export names across src/
```

**Classification:**
- Directory with no imports from outside it → **[VERIFY FIRST]** (might be a planned feature)
- Single file with 0 imports → **[SAFE TO REMOVE]**
- Config files (vite, tailwind, tsconfig) → **[KEEP]** even if not directly imported

---

### 5. Unused imports within files

**What:** Import statements at the top of files where the imported name is never used in the file body.

**How to scan:**

This is best detected by TypeScript itself:
```bash
npx tsc --noEmit --noUnusedLocals --noUnusedParameters 2>&1 | grep "is declared but"
```

Or check `tsconfig.json` for:
- `"noUnusedLocals": true`
- `"noUnusedParameters": true`

If these aren't enabled, suggest enabling them.

**Classification:**
- Unused type imports → **[SAFE TO REMOVE]** (no runtime effect)
- Unused value imports → **[SAFE TO REMOVE]** (dead code + bundle bloat)
- Imports used only in comments or disabled code → **[SAFE TO REMOVE]**

---

## Output format

```
## Dead Code Report — [date]

### Summary
- Safe to remove: [count] items
- Verify first: [count] items
- Keep: [count] items
- Estimated bundle savings: ~[X]KB (if dependencies removed)

---

### 1. "use client" directives
| Status | Count |
|--------|-------|
| [SAFE TO REMOVE] | [N] files |

Files:
- src/app/components/Hero.tsx
- src/app/components/Philosophy.tsx
- ...

### 2. Unused UI components
| Component | External imports | Status |
|-----------|-----------------|--------|
| accordion.tsx | 0 | [SAFE TO REMOVE] |
| button.tsx | 5 | [KEEP] |
| calendar.tsx | 0 | [SAFE TO REMOVE] |
| ... | | |

### 3. Unused dependencies
| Package | Imports found | Status | Est. size |
|---------|--------------|--------|-----------|
| react-dnd | 0 | [SAFE TO REMOVE] | ~45KB |
| react-slick | 0 | [SAFE TO REMOVE] | ~30KB |
| cmdk | 2 | [KEEP] | — |
| ... | | | |

### 4. Orphan files/directories
| Path | References | Status |
|------|-----------|--------|
| src/app/components/figma/ | 0 | [VERIFY FIRST] |
| ... | | |

### 5. Unused imports
[List from tsc output, if any]

---

### Cleanup plan (ordered by impact)
1. Remove unused dependencies → saves ~[X]KB from bundle
2. Remove unused ui/ components → reduces file count, simplifies codebase
3. Remove "use client" directives → eliminates dead code noise
4. Remove orphan files → reduces cognitive overhead

### Commands to execute
[Ready-to-run commands for each cleanup step]
```

## Rules

- **NEVER auto-remove anything** — only report findings for the user to review
- When a dependency is used only by an unused ui component, flag both together
- devDependencies are NOT dead code — they're build/dev tools
- Peer dependencies may not be directly imported but required by other packages
- Some packages are Vite plugins or Tailwind plugins — check config files, not just src/
- `@types/*` packages are devDependencies and never directly imported — this is normal
- A component with 0 current imports might be planned for future use — classify as **[VERIFY FIRST]** if it has recent git history
- Run `npm ls [package]` to check if a dependency is a transitive requirement of another package before flagging
- Coordinate with perf-audit skill for bundle size impact estimates
