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

1. Fetch the current official agent spec from Context7 using library ID `/llmstxt/code_claude_llms_txt` with query `"subagent frontmatter supported fields required optional valid values"`. This is the source of truth for what fields exist and their valid values.
2. Load the `agent-validation` skill from this plugin — this contains the validation methodology and severity classifications.

**Never validate from training data.** If Context7 is unavailable, use WebFetch on `https://code.claude.com/docs/en/sub-agents`.

### Validate

For each agent file: read it and check against the spec violations and recommendations from the agent-validation skill.

### Consolidate

Merge all findings into a single table grouped by severity:

```
| Severity | Source       | File | Field | Issue | Suggested Fix |
|----------|--------------|------|-------|-------|---------------|
| CRITICAL | official docs| ...  | ...   | ...   | ...           |
| IMPORTANT| recommendation| ... | ...   | ...   | ...           |
| NICE     | recommendation| ... | ...   | ...   | ...           |
```

Also report: total agents scanned, passing count, failing count.

If all agents pass, report success and skip Phases 2-3.

## Phase 2: Interactive Triage

Group findings by **issue type** to minimize questions. For example, if 12 agents have overly long descriptions, that is ONE decision — not 12 separate questions.

For each issue group:

1. Present the group: what the issue is, how many agents are affected, list the affected files
2. Use **AskUserQuestion** with options:
   - **Fix** — apply the suggested fix to all affected agents
   - **Skip** — leave as-is
   - **Modify** — user wants a different fix (ask follow-up for details)
3. For fixes that need user input, ask in a follow-up AskUserQuestion. Suggest reasonable defaults based on the agent's purpose.

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
