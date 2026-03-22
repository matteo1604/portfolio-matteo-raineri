---
name: deploy-check
description: Pre-deploy checklist for the portfolio. Triggers on "deploy", "pubblica", "metti online", "ship it", "build production", "pronto per deploy?". Runs build, TypeScript check, code cleanup scan, asset verification, performance budget, accessibility basics, SEO (delegates to seo-check), and git status. Outputs a GO/NO-GO report with blockers.
---

# Deploy Check Skill

Final gate before pushing to production. Runs 20 checks across 6 categories. Any BLOCKER item results in a NO-GO verdict.

## When to trigger

- "deploy", "pubblica", "metti online", "ship it", "build production"
- "pronto per deploy?", "posso deployare?", "ready to ship?"
- Before any `npm run build` intended for production
- Before any push to production branch or hosting platform

## Check sequence

Run checks in this exact order. Stop-on-first-blocker is NOT required — run all checks and report everything.

Each check is rated:
- **BLOCKER** — must fix before deploy
- **WARNING** — should fix, won't break production
- **OK** — passing

---

### Category 1: BUILD

#### [B1] Production build

```bash
npm run build
```

- Exit code 0 = OK
- Any error = **BLOCKER**
- Note any warnings in output

#### [B2] TypeScript check

```bash
npx tsc --noEmit
```

- Exit code 0 = OK
- Any error = **BLOCKER**
- `strict: true` must be active in tsconfig

#### [B3] Critical TypeScript warnings

- Check tsc output for `any` type usage in non-vendor code
- Check for `@ts-ignore` or `@ts-expect-error` without explanation
- If found: **WARNING**

---

### Category 2: CODE CLEANUP

#### [C1] console.log statements

Search `src/` for `console.log`, `console.warn`, `console.error`, `console.debug`, `console.info` in `.ts` and `.tsx` files.

- Intentional error boundaries with console.error = OK
- Any console.log = **BLOCKER**
- console.warn/debug = **WARNING**

#### [C2] TODO / FIXME comments

Search `src/` for `// TODO`, `// FIXME`, `// XXX`, `// HACK` in `.ts` and `.tsx` files.

- Any found = **WARNING** (list them with file:line)

#### [C3] Dead "use client" directives

Search `src/` for `"use client"` or `'use client'` in `.ts` and `.tsx` files.

- This is a Vite project, NOT Next.js — these directives are dead code
- Any found = **WARNING** (list files for cleanup)

#### [C4] debugger statements

Search `src/` for `debugger` keyword in `.ts` and `.tsx` files.

- Any found = **BLOCKER**

#### [C5] Temporary comments

Search `src/` for patterns: `// test`, `// temp`, `// hack`, `// fix later`, `// remove`, `// delete`, `// wip` (case-insensitive) in `.ts` and `.tsx` files.

- Any found = **WARNING** (list them with file:line)

---

### Category 3: ASSETS

#### [A1] Favicon

Check `/public` for:
- `favicon.ico` or `favicon.svg` — minimum requirement
- Bonus: `favicon-32x32.png`, `apple-touch-icon.png`

- No favicon at all = **BLOCKER**
- Only .ico without other sizes = **WARNING**

#### [A2] OG image

Check:
- `index.html` has `<meta property="og:image">`
- The referenced image file exists in `/public`
- Image is at least 1200x630px (check filename convention or actual file)

- No og:image meta tag = **WARNING**
- Meta tag present but file missing = **BLOCKER**

#### [A3] Font preload

Check `index.html` for:
- `<link rel="preconnect" href="https://fonts.googleapis.com">`
- `<link rel="preload"` or `<link rel="stylesheet"` for Google Fonts
- Fonts: Inter, Syne, DM Mono

Check `src/` for JS-based font loading (`createElement('link')` with fonts):
- Fonts loaded via JS instead of index.html = **WARNING**
- No font loading at all = **BLOCKER**

---

### Category 4: PERFORMANCE

#### [B4] Bundle size

After `npm run build`, check `dist/assets/`:

```bash
# List JS files with sizes
ls -la dist/assets/*.js
```

- Main JS chunk gzipped < 500KB = OK
- 500KB-750KB = **WARNING**
- \> 750KB = **BLOCKER**

To check gzipped size:
```bash
gzip -c dist/assets/index-*.js | wc -c
```

#### [P2] Large unoptimized assets

Check `dist/` and `public/` for files > 1MB:

```bash
find dist/ public/ -type f -size +1M
```

- Any > 1MB non-font asset = **WARNING**
- Any > 5MB asset = **BLOCKER**

#### [P3] Image formats

Check `public/` and `src/` for image files:
- `.png`, `.jpg`, `.jpeg` where WebP/AVIF alternatives exist = **WARNING**
- Large `.png`/`.jpg` (> 200KB) without modern format = **WARNING**
- `.svg` for icons/logos is fine

---

### Category 5: ACCESSIBILITY

#### [AC1] prefers-reduced-motion

Check these components for `prefers-reduced-motion` or `prefersReducedMotion`:
- `FloatingElements.tsx` — should reduce particles
- `CustomCursor.tsx` — should not mount
- `Philosophy.tsx` — should remove pin
- `Process.tsx` — should remove pin
- `SectionTransition.tsx` — should simplify
- `VelocityEffects.tsx` — already handled ✅
- `Hero.tsx` — already handled ✅

- 0-2 additional components covered = **WARNING**
- None beyond current 2 = **WARNING** (not blocker, but flag it)

#### [AC2] Decorative aria-hidden

Check these components have `aria-hidden="true"`:
- `FloatingElements.tsx` (canvas)
- `LightThread.tsx`
- `SectionTransition.tsx`
- `SectionBleed.tsx`
- `CustomCursor.tsx`
- `VelocityEffects.tsx`

- Missing on any = **WARNING**

#### [AC3] Heading hierarchy

Grep all heading tags across `src/`:
- Count `<h1` — must be exactly 1 (in Hero.tsx)
- Check for level skips (h1 → h3 without h2)

- Multiple h1 = **WARNING**
- Heading skip = **WARNING**

---

### Category 6: SEO

#### [S1] Full SEO audit

Delegate to `seo-check` skill for comprehensive check. Summarize results:
- Any ❌ from seo-check = **WARNING** in deploy report
- Specifically flag missing: title, meta description, og tags, canonical

---

### Category 7: GIT

#### [G1] Clean working tree

```bash
git status
```

- Clean (nothing to commit) = OK
- Uncommitted changes = **BLOCKER**
- Untracked files in src/ = **WARNING**

#### [G2] Branch status

```bash
git log origin/main..HEAD
git log HEAD..origin/main
```

- Up to date with remote = OK
- Unpushed commits = **WARNING** (might be intentional)
- Behind remote = **BLOCKER** (pull first)

---

## Output format

```
## Deploy Check Report — [date]

### Verdict: 🟢 GO / 🔴 NO-GO

### Summary
- BLOCKER: [count]
- WARNING: [count]
- OK: [count]

---

### BUILD
| # | Check | Status | Details |
|---|-------|--------|---------|
| B1 | Production build | ✅/❌ | |
| B2 | TypeScript check | ✅/❌ | |
| B3 | TS warnings | ✅/⚠️ | |

### CODE CLEANUP
| # | Check | Status | Details |
|---|-------|--------|---------|
| C1 | console.log | ✅/❌ | |
| C2 | TODO/FIXME | ✅/⚠️ | [count] found |
| C3 | "use client" | ✅/⚠️ | [count] files |
| C4 | debugger | ✅/❌ | |
| C5 | Temp comments | ✅/⚠️ | |

### ASSETS
| # | Check | Status | Details |
|---|-------|--------|---------|
| A1 | Favicon | ✅/❌/⚠️ | |
| A2 | OG image | ✅/❌/⚠️ | |
| A3 | Font preload | ✅/⚠️ | |

### PERFORMANCE
| # | Check | Status | Details |
|---|-------|--------|---------|
| P1 | Bundle size | ✅/⚠️/❌ | [size]KB gzipped |
| P2 | Large assets | ✅/⚠️/❌ | |
| P3 | Image formats | ✅/⚠️ | |

### ACCESSIBILITY
| # | Check | Status | Details |
|---|-------|--------|---------|
| AC1 | Reduced motion | ✅/⚠️ | [n]/8 components |
| AC2 | aria-hidden | ✅/⚠️ | |
| AC3 | Heading hierarchy | ✅/⚠️ | |

### SEO
| # | Check | Status | Details |
|---|-------|--------|---------|
| S1 | SEO audit | ✅/⚠️ | see seo-check |

### GIT
| # | Check | Status | Details |
|---|-------|--------|---------|
| G1 | Clean tree | ✅/❌ | |
| G2 | Branch status | ✅/⚠️/❌ | |

---

### Blockers (must fix)
1. [blocker details + fix]

### Warnings (should fix)
1. [warning details + fix]
```

## Verdict logic

- **GO**: 0 blockers, 0-5 warnings
- **GO with caution**: 0 blockers, 6+ warnings
- **NO-GO**: 1+ blockers

## Rules

- Run ALL checks even if early ones fail — give the full picture
- For build/tsc: actually run the commands, don't just check config
- For grep checks: use the Grep tool, not bash grep
- Bundle size check requires a successful build first — if B1 fails, mark P1 as "skipped (build failed)"
- Delegate SEO to seo-check skill — don't duplicate that work
- Cross-reference with perf-audit and a11y-motion skills for deeper checks if requested
- Never auto-fix blockers without user confirmation — report them and ask
