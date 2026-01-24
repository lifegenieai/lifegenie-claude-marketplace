# Research Coordinator Plugin

Multi-agent research orchestration with Gemini CLI and Claude agents, citation
verification, and report synthesis.

## Overview

This plugin provides a comprehensive research workflow that:

1. Clarifies research requirements through targeted questions
2. Spawns parallel research agents (Gemini CLI + Claude Opus)
3. Synthesizes findings into a unified report
4. Verifies all citations for accuracy
5. Produces publication-ready markdown reports

## Usage

```
/research [topic or question]
```

If no topic is provided, the command will prompt you for one.

### Example

```
/research What are the current best practices for building AI agent architectures?
```

## Workflow

```
User: /research "topic"
         │
         ▼
┌─────────────────────────┐
│  research-coordinator   │  ← Asks clarifying questions
│       (Opus)            │  ← Creates research-brief.md
└───────────┬─────────────┘
            │
            ▼ Spawns in parallel:
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌─────────┐   ┌─────────────┐
│ Gemini  │   │   Claude    │
│ CLI x2  │   │ Researcher  │
│ (Bash)  │   │  (Opus) x2  │
└────┬────┘   └──────┬──────┘
     │               │
     └───────┬───────┘
             ▼
    ┌─────────────────┐
    │ report-synthesizer │  ← Combines all findings
    │      (Opus)        │
    └────────┬───────────┘
             │
             ▼ Spawns in parallel:
    ┌────────┴────────┐
    │  citation-verifier  │  ← Haiku agents verify each URL
    │    (Haiku) x N      │
    └────────┬────────────┘
             │
             ▼
    ┌─────────────────┐
    │  Final Report   │
    └─────────────────┘
```

## Components

| Component              | Type    | Model | Purpose                       |
| ---------------------- | ------- | ----- | ----------------------------- |
| `/research`            | Command | -     | Entry point                   |
| `research-coordinator` | Agent   | Opus  | Orchestrates the workflow     |
| `claude-researcher`    | Agent   | Opus  | Deep research and analysis    |
| `citation-verifier`    | Agent   | Haiku | Fast URL verification         |
| `report-synthesizer`   | Agent   | Opus  | Combines research into report |
| `gemini-research.sh`   | Script  | -     | Invokes Gemini CLI            |

## Output

Reports are saved to:

```
/mnt/c/Obsidian/MainVault/MainVault/CrystalBall/research-inbox/YYYY-MM-DD-topic-slug/
├── research-brief.md      # Clarified requirements
└── research-report.md     # Final synthesized report
```

### Report Structure

- **Executive Summary** - Key findings in bullet points
- **Detailed Findings** - Organized by theme with attribution
- **Implementation Guidance** - Practical steps and code examples
- **Contradictions & Open Questions** - Where sources disagree
- **Sources & Citations** - Verified citation table

## Citation Verification

All citations are verified by Haiku agents:

| Status       | Meaning                         |
| ------------ | ------------------------------- |
| ✓ Verified   | URL accessible, content matches |
| ⚠ Unverified | URL inaccessible (404, timeout) |
| ⚡ Disputed  | Content doesn't match citation  |

Unverified citations are **kept** in the report but flagged clearly.

## Requirements

- **Gemini CLI** (optional): For web research via Google's Gemini
  ```bash
  npm install -g @google/generative-ai-cli
  ```
  If not available, research will be handled by Claude agents only.

## Configuration

Output path can be modified in:

- `commands/research.md`
- `agents/research-coordinator.md`

## File Structure

```
research-coordinator/
├── .claude-plugin/
│   └── plugin.json
├── README.md
├── commands/
│   └── research.md
├── agents/
│   ├── research-coordinator.md
│   ├── claude-researcher.md
│   ├── citation-verifier.md
│   └── report-synthesizer.md
├── scripts/
│   └── gemini-research.sh
└── templates/
    ├── research-brief.md
    └── research-report.md
```

## Author

Erik B

## Version

1.0.0
