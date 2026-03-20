---
name: session-closer
description: Close a working session and update the CLAUDE.md session log. Use this skill when the user says "chiudi sessione", "abbiamo finito", "fine sessione", "stop", "wrap up", "done for today", "session complete", or any variation indicating the end of a working session. Also use when the user explicitly asks to update the session log or the CLAUDE.md.
---

# Session Closer Skill

When the user ends a working session, perform these steps IN ORDER.

## Step 1 — Gather changes

Run the following commands to understand what was modified:

```bash
# Files changed since last commit or in working tree
git diff --name-only HEAD 2>/dev/null || echo "No git changes detected"

# Recent commits in this session (last 2 hours)
git log --oneline --since="2 hours ago" 2>/dev/null || echo "No recent commits"
```

Also review the conversation history to identify:
- Which components were discussed or modified
- What decisions were made
- What issues were discovered but not fixed

## Step 2 — Determine session number

Read the Session Log section of `CLAUDE.md`. Find the last session number and increment by 1.

## Step 3 — Generate session log entry

Create a log entry in this EXACT format:

```markdown
### Session [N] — [YYYY-MM-DD]
**Focus area:** [component or system name]
**Changes made:**
- [file path]: [what changed and why]
- [file path]: [what changed and why]
**Status:** [what's done, what's next]
**Decisions:** [any design/architecture decisions made during session]
**Known issues:** [anything discovered but not fixed]
```

## Step 4 — Update CLAUDE.md

Append the session log entry to the `## Session log` section in `CLAUDE.md`.

## Step 5 — Check for drift

Verify these sections of CLAUDE.md are still accurate:

1. **File structure** — Does it match the actual `/src` directory? If a new file was added, update it.
2. **Component guidelines** — If a component's behavior changed significantly, flag it.
3. **Stack** — If a new dependency was added (check package.json), update the stack table.

If drift is detected, ask the user:
> "Ho notato che [section] nel CLAUDE.md non è più allineata al codice. Aggiorno?"

Only update after confirmation for guideline changes. Auto-update file structure and stack silently.

## Step 6 — Confirm

Tell the user:
- Summary of what was logged
- Any drift detected and fixed
- Suggested focus area for next session (based on priority order)

## Rules

- Never modify sections marked as "Never auto-update" in the self-maintenance rules
- Keep log entries concise — max 8 lines per entry
- Use Italian for the conversation, English for the log entries (to keep CLAUDE.md consistent)
