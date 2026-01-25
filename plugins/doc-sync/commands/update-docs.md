---
description: Analyze git history and update documentation
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
argument-hint: "[--analyze-only] [--since=<commit>]"
---

# /update-docs Command

Update project documentation based on recent Git commits on the current branch.

## Arguments

- `--analyze-only`: Only analyze and report gaps, don't write updates
- `--since=<sha>`: Analyze from specific commit (default: branch point from
  main)

## Workflow

Execute these steps in order, using sub-agents to protect context:

### Step 0: Check State File

Before starting, check for an existing state file at `docs/tech-docs/.doc-sync-state.json`:

1. If it exists, read it and note the `last_sync.commit_sha`
2. Compare with current HEAD - if they match and branch is same, docs may already be in sync
3. If it doesn't exist, this is fine - we'll create it after updates

The state file tracks when doc-sync last ran successfully, enabling:
- Skip if no new commits since last sync
- Show "last synced at <commit>" in PR descriptions
- Integration with commit-push-pr workflow

### Step 1: Analyze Git Changes

Launch the **git-change-analyzer** agent using the Task tool with:

- `subagent_type`: `"doc-sync:git-change-analyzer"`
- `model`: `"haiku"` (simple parsing task)

The agent will:

- Identify the base branch (main/master)
- Get commits on current branch since divergence
- Parse each commit for files changed and commit message
- Categorize by documentation impact type
- Write structured analysis to `.claude/doc-sync/changes.md`

**Prompt for the agent:**

```
Analyze the git history on the current branch. Find all commits since diverging from the main/master branch.

For each commit, identify the files changed and categorize them by documentation impact:
- feature: src/app/*, src/pages/*, routes/*
- architecture: src/lib/*, migrations/*, major structural changes
- dependency: package.json, *lock*, requirements.txt
- config: *.config.*, .env*, deployment/*
- style: *.css, globals.css, design/*
- docs: docs/*, *.md (already documented)

Write the analysis to .claude/doc-sync/changes.md following the format in your instructions.

If --since flag was provided, use that commit as the starting point instead of the branch divergence point.
```

Wait for the agent to complete before proceeding.

### Step 2: Identify Documentation Gaps

Launch the **doc-gap-analyzer** agent using the Task tool with:

- `subagent_type`: `"doc-sync:doc-gap-analyzer"`
- `model`: `"opus"` (requires judgment)

The agent will:

- Read the change analysis from Step 1
- Discover the project's documentation structure
- Identify which docs need updating and why
- Check `last_updated` dates vs commit dates
- Look for "PLANNED" status that should be "IMPLEMENTED"
- Write gap analysis to `.claude/doc-sync/gaps.md`

**Prompt for the agent:**

```
Read the git change analysis from .claude/doc-sync/changes.md.

Discover this project's documentation structure:
1. Look for docs/tech-docs/README.md or docs/ directory
2. Read CLAUDE.md for doc conventions
3. Identify doc categories (features/, architecture/, reference/)

For each change category, identify affected documentation:
- feature changes → check features/*.md
- architecture changes → check architecture/overview.md, decisions/*.md
- dependency changes → check reference/tech-stack.md
- config changes → check reference/*.md, guides/*.md
- style changes → check design/*.md

For each potential gap, determine:
- Does the doc exist? If yes, is it current?
- Does it cover the new functionality?
- Are there "PLANNED" statuses that should be "IMPLEMENTED"?

Write the gap analysis to .claude/doc-sync/gaps.md with priority, status, and specific changes needed.
```

Wait for the agent to complete before proceeding.

### Step 3: Update Documentation (or Report)

**If `--analyze-only` flag is present:**

1. Read `.claude/doc-sync/gaps.md`
2. Present the gap analysis to the user in a clear summary
3. Stop here - let the user review before any updates are made

**Otherwise (full update mode):**

Launch the **doc-updater** agent using the Task tool with:

- `subagent_type`: `"doc-sync:doc-updater"`
- `model`: `"opus"` (requires quality writing)

The agent will:

- Read the gap analysis
- For each gap (in priority order):
  - Read relevant source code and existing docs
  - Write updated documentation following project conventions
  - Update `last_updated` in frontmatter
- Report what was changed

**Prompt for the agent:**

```
Read the gap analysis from .claude/doc-sync/gaps.md.

For each gap, in priority order:
1. Read the source files mentioned
2. Read the existing doc (if updating) or similar docs (if creating new)
3. Understand the project's documentation style
4. Write the update or new content
5. Update last_updated in frontmatter to today's date
6. Verify cross-references are correct

Follow project conventions:
- Preserve existing structure where possible
- Match tone and style of existing docs
- Use relative markdown links
- ADRs: Follow lightweight template (Problem, Decision, Why, Alternatives, Trade-offs)
- Features: Include routes, API functions, key files sections

Report all changes made when complete.
```

### Step 4: Summary

After all steps complete:

1. Summarize what was analyzed
2. List documentation that was updated (or needs updating if --analyze-only)
3. Show state file status:
   - If updated: "State file updated: docs/tech-docs/.doc-sync-state.json"
   - If analyze-only: "Run without --analyze-only to update docs and state"
4. Suggest running `/update-docs` again after more changes accumulate

**State file location:** `docs/tech-docs/.doc-sync-state.json`

The state file is updated by the doc-updater agent after successful updates.
In analyze-only mode, the state file is NOT updated (no changes were made).

## Error Handling

- If no git repository is found, report the error and stop
- If no commits are found on the branch, report that docs are up to date
- If no documentation structure exists, suggest creating one and stop
- If agents fail, report which step failed and why
