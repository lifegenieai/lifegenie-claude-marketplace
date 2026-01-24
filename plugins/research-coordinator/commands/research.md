---
description: |
  Launch comprehensive web research with verified citations using direct API integration.
  No subagents - runs in main conversation with full tool access.
allowed-tools:
  - Skill
  - AskUserQuestion
argument-hint: "[topic or question to research]"
---

# Research Command

Invokes the research skill for comprehensive web research.

## Usage

```
/research <topic>
/research  # prompts for topic
```

## Workflow

### 1. Get Topic

If `$ARGUMENTS` is empty:

- Use AskUserQuestion: "What topic would you like me to research?"

### 2. Invoke Research Skill

Use the Skill tool to invoke the `research-workflow` skill:

```
skill: "research-coordinator:research-workflow"
args: "[topic from arguments or user response]"
```

The skill will:

1. Clarify scope (dynamic questions until ambiguity resolved)
2. Write research brief (standalone document)
3. Create research tasks (independent, parallelizable)
4. Execute tasks (same briefing → Tavily + Gemini per task)
5. Per-task synthesis (combine findings, flag contradictions)
6. Write final report (from brief + all syntheses)
7. Verify report (Haiku agents fact-check citations)

## Output

Reports are saved to:
`/mnt/c/Obsidian/MainVault/MainVault/CrystalBall/research-inbox/YYYY-MM-DD-topic-slug/`

- `research-brief.md` - Scope and parameters
- `research-report.md` - Full findings with verified citations

## Architecture Note

This command uses a skill-based approach instead of agent spawning:

- **Why**: Skills run in main conversation context with full tool access
- **Benefit**: No subagent limitations (subagents can't spawn subagents)
- **Benefit**: Direct Bash calls to APIs avoid WebSearch approval friction
- **Benefit**: Deterministic scripts are easier to debug and verify
