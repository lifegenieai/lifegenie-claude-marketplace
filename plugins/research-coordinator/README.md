# Research Coordinator Plugin

Comprehensive web research with verified citations using direct API integration
(Tavily + Gemini). Full 7-phase workflow inline - no indirection.

## Overview

This plugin provides a complete research workflow that:

1. Clarifies research requirements through targeted questions
2. Creates a research brief as a standalone document
3. Decomposes into parallel research tasks
4. Executes searches via direct API calls (Tavily, Gemini)
5. Synthesizes findings per-task before final report
6. Produces publication-ready markdown reports
7. Verifies citations using Haiku sub-agents

## Usage

```
/research [topic or question]
```

If no topic is provided, the command will prompt you for one.

### Example

```
/research What are the current best practices for building AI agent architectures?
```

## Architecture

```
User: /research "topic"
        ↓
┌─────────────────────────────────────────────────┐
│  COMMAND (runs in main conversation)            │
│                                                 │
│  Phase 1: Clarify scope (dynamic questions)     │
│  Phase 2: Write research brief                  │
│  Phase 3: Create research tasks                 │
│  Phase 4: Execute tasks (Tavily + Gemini)       │
│  Phase 5: Per-task synthesis                    │
│  Phase 6: Write final report                    │
│  Phase 7: Verify citations (Haiku agents)       │
└─────────────────────────────────────────────────┘
        ↓
Final Report with verified sources
```

## Why This Architecture?

**Previous approach (broken):**

- Thin command wrapper invoking skills (indirection failed)
- Subagents spawning subagents (not supported)
- WebSearch requiring manual approval
- WebSearch "0 searches performed" bugs (#11369, #10141)

**Current approach (reliable):**

- Full workflow inline in command (no indirection)
- Runs in main conversation with full tool access
- Direct API calls via Bash scripts (deterministic, debuggable)
- Gemini CLI as fallback (built-in Google grounding works)
- No approval friction

## Components

| Component            | Type    | Purpose                     |
| -------------------- | ------- | --------------------------- |
| `/research`          | Command | Full 7-phase workflow       |
| `citation-verifier`  | Agent   | Haiku verification agents   |
| `search-api.sh`      | Script  | Tavily/SerpAPI/Brave/Google |
| `gemini-research.sh` | Script  | Gemini CLI wrapper          |
| `fetch-url.sh`       | Script  | URL verification            |

## Search APIs

| API           | Cost              | Best For        |
| ------------- | ----------------- | --------------- |
| Tavily        | $10/1000 searches | LLM-optimized   |
| SerpAPI       | $50/5000 searches | Raw SERP data   |
| Brave Search  | Free 2000/month   | Privacy-focused |
| Google Custom | Free 100/day      | Domain-specific |
| Gemini CLI    | Free (fallback)   | Always works    |

## Output

Reports are saved to:

```
/mnt/c/Obsidian/MainVault/MainVault/CrystalBall/research-inbox/YYYY-MM-DD-topic-slug/
├── research-brief.md      # Scope and parameters
└── research-report.md     # Full findings with citations
```

### Report Structure

- **Executive Summary** - Key findings overview
- **Detailed Findings** - Organized by theme with inline citations
- **Contradictions & Open Questions** - Where sources disagree
- **Sources** - Verified citation table with status
- **Research Metadata** - Task counts, search stats, verification results

## Citation Verification

All key citations are verified by Haiku sub-agents using `fetch-url.sh`:

| Status       | Meaning                         |
| ------------ | ------------------------------- |
| ✓ Verified   | URL accessible, content matches |
| ⚠ Unverified | URL inaccessible (404, timeout) |
| ⚡ Disputed  | Content doesn't match citation  |

Unverified citations are **kept** in the report but flagged clearly.

## Setup

### API Keys (Optional)

Add to `~/.claude/.env`:

```bash
TAVILY_API_KEY=tvly-xxxxx      # Recommended
SERPAPI_KEY=xxxxx              # Optional
BRAVE_API_KEY=xxxxx            # Optional
GOOGLE_API_KEY=xxxxx           # Optional
GOOGLE_CX=xxxxx                # Required with GOOGLE_API_KEY
```

### Check Configuration

```bash
./scripts/search-api.sh check
```

### Fallback

If no API keys are configured, research uses Gemini CLI only (still works, but
limited source diversity).

### Gemini CLI

```bash
npm install -g @google/generative-ai-cli
```

## File Structure

```
research-coordinator/
├── .claude-plugin/
│   └── plugin.json            # v3.0.0
├── README.md
├── commands/
│   └── research.md            # Full 7-phase workflow
├── agents/
│   └── citation-verifier.md   # Haiku verification agents
└── scripts/
    ├── search-api.sh          # Tavily/SerpAPI/Brave/Google
    ├── gemini-research.sh     # Gemini CLI wrapper
    └── fetch-url.sh           # URL verification
```

## Author

Erik B

## Version

3.0.0
