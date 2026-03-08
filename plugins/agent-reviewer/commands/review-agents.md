---
description: "Review and validate Claude Code agent files for structural correctness"
argument-hint: "[path to agents/ directory or single agent .md file]"
---

# Review Agents

You are running the agent-reviewer plugin. Follow the 3-phase workflow below exactly.

## Setup

1. Determine if `$ARGUMENTS` is a directory or a single `.md` file
2. If directory: glob all `.md` files in it
3. If no path provided: ask the user for one using AskUserQuestion

## Phase 1: Validate & Consolidate

### Load Source of Truth

Before any validation, you MUST:

1. Load the `plugin-dev:agent-development` skill — this contains the **current official spec** for agent files. Never validate from training data.
2. Load the `agent-validation` skill from this plugin — this contains the validation methodology and severity classifications.

### Validate

For each agent file: read it and check against the rules from both skills.

### Consolidate

Merge all findings into a single table grouped by severity:

```
| Severity | File | Field | Issue | Suggested Fix |
|----------|------|-------|-------|---------------|
| CRITICAL | ...  | ...   | ...   | ...           |
| IMPORTANT| ...  | ...   | ...   | ...           |
| NICE     | ...  | ...   | ...   | ...           |
```

Also report: total agents scanned, passing count, failing count.

If all agents pass, report success and skip Phases 2-3.

## Phase 2: Interactive Triage

Group findings by **issue type** to minimize questions. For example, if 12 agents are missing the `color` field, that is ONE decision — not 12 separate questions.

For each issue group:

1. Present the group: what the issue is, how many agents are affected, list the affected files
2. Use **AskUserQuestion** with options:
   - **Fix** — apply the suggested fix to all affected agents
   - **Skip** — leave as-is
   - **Modify** — user wants a different fix (ask follow-up for details)
3. For fixes that need user input (e.g., "which color for each agent?"), ask in a follow-up AskUserQuestion. Suggest reasonable defaults based on the agent's purpose.

Track all decisions for Phase 3.

## Phase 3: Implement Fixes

1. Apply all agreed-upon fixes using the Edit tool
2. If any edit fails, report the error so the user can address it manually
3. Report final status:

```
## Results

- Agents scanned: X
- Issues found: Y
- Issues fixed: Z
- Issues skipped: W (list details)
```

