---
name: review-claudemd
description: Review and update the CLAUDE.md file for accuracy and drift. Use this skill when the user says "controlla il CLAUDE.md", "aggiorna la documentazione", "il CLAUDE.md è aggiornato?", "review claudemd", "check documentation", or at the START of every new session to verify alignment between documentation and codebase. Also triggers when structural changes are detected (new files, renamed components, changed dependencies).
---

# Review CLAUDE.md Skill

Ensures the CLAUDE.md stays aligned with the actual codebase. Run this at session start or when requested.

## Step 1 — Read current CLAUDE.md

Read `CLAUDE.md` from the project root. Parse the key sections:
- Stack table (versions)
- File structure tree
- System architecture (component list)
- Section accent table
- Component-specific guidelines

## Step 2 — Scan the codebase

Run these checks:

### File structure drift
```bash
# Get actual component files
find src/app/components -name "*.tsx" -not -path "*/ui/*" | sort

# Get actual context/system files
find src/contexts src/systems -name "*.tsx" 2>/dev/null | sort

# Get actual utils
find src/app/utils -name "*.ts" | sort
```

Compare with the file structure section in CLAUDE.md. Flag:
- Files in CLAUDE.md that no longer exist
- New files not documented in CLAUDE.md

### Dependency drift
```bash
# Check current versions of key dependencies
node -e "
const pkg = require('./package.json');
const deps = {...pkg.dependencies, ...pkg.devDependencies};
const keys = ['motion', 'gsap', 'tailwindcss', 'react', 'react-dom', 'react-router'];
keys.forEach(k => console.log(k + ': ' + (deps[k] || 'NOT FOUND')));
"
```

Compare with the Stack table in CLAUDE.md.

### Import analysis for new systems
```bash
# Find any new context providers or systems
grep -r "createContext\|useSyncExternalStore\|Provider" src/ --include="*.tsx" -l | sort
```

Compare with the documented global systems.

## Step 3 — Report findings

Present findings in this format:

```
### CLAUDE.md Review — [date]

**Status:** [aligned / minor drift / needs update]

**File structure:**
- ✅ Aligned  OR
- ⚠️ New files: [list]
- ⚠️ Missing files: [list]

**Stack versions:**
- ✅ Aligned  OR
- ⚠️ Changed: [package] was [old] → now [new]

**Systems:**
- ✅ Aligned  OR
- ⚠️ New system detected: [file]

**Recommendation:** [what to update, or "No changes needed"]
```

## Step 4 — Apply fixes (with permission)

For each category of drift:

| Category | Auto-fix? |
|----------|-----------|
| File structure | ✅ Yes, update silently |
| Stack versions | ✅ Yes, update silently |
| New component discovered | ⚠️ Ask before adding guidelines |
| Component guideline change | ❌ Never auto-update, ask first |
| Architecture section | ⚠️ Ask before modifying |
| Priority order, philosophy, rules | ❌ NEVER touch |

## Rules

- This skill reads and validates. It does NOT make design decisions.
- When in doubt, flag and ask rather than auto-fixing.
- Keep the CLAUDE.md readable — don't bloat sections with excessive detail.
- If the codebase has grown significantly, suggest reorganizing sections rather than adding endlessly.
