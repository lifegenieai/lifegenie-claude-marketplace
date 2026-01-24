---
description:
  Launch a coordinated multi-agent research session with Gemini CLI and Claude
  agents
allowed-tools:
  - Task
  - AskUserQuestion
  - Read
  - Write
  - Bash
  - Glob
argument-hint: "[topic or question to research]"
---

# Research Command

Orchestrates a comprehensive multi-agent research workflow that:

1. Clarifies research requirements through targeted questions
2. Creates a structured research brief
3. Spawns parallel research agents (Gemini CLI + Claude)
4. Synthesizes findings into a unified report
5. Verifies all citations for accuracy

## Input Parameters

- **Topic**: $ARGUMENTS (optional - will prompt if not provided)

## Workflow

### 1. Check for Topic

If no topic provided in $ARGUMENTS:

- Use AskUserQuestion to get the research topic
- Ask: "What topic would you like me to research?"

### 2. Spawn Research Coordinator

Use the Task tool to spawn the `research-coordinator` agent with:

```
Research topic: [topic from arguments or user response]

Orchestrate a comprehensive research session:
1. Ask clarifying questions to understand scope
2. Create a research brief
3. Spawn parallel research agents
4. Synthesize all findings
5. Verify citations
6. Produce final report

Output all files to: /mnt/c/Obsidian/MainVault/MainVault/CrystalBall/research-inbox/
```

### 3. Report Completion

After the coordinator finishes, display:

- Location of the research brief
- Location of the final report
- Summary statistics (agents used, citations verified)

## Output Location

All research outputs go to:
`/mnt/c/Obsidian/MainVault/MainVault/CrystalBall/research-inbox/YYYY-MM-DD-topic-slug/`

- `research-brief.md` - The clarified research requirements
- `research-report.md` - Final synthesized report with verified citations

## Error Handling

- If coordinator agent fails: Display error and partial results if available
- If output directory inaccessible: Fall back to scratchpad and notify user
