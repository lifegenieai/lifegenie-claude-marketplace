# Research Coordinator Plugin

Comprehensive web research with verified citations using direct API integration
(Tavily + Gemini). No MCP servers - all search is code-wrapped for reliability.

## Overview

This plugin provides a skill-based research workflow that:

1. Clarifies research requirements through targeted questions
2. Executes parallel searches via direct API calls (Tavily, Gemini)
3. Synthesizes findings with inline citations
4. Verifies URLs for accuracy
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

## Architecture

```
User: /research "topic"
        ↓
┌─────────────────────────────────────────────────┐
│  SKILL (runs in main conversation)              │
│                                                 │
│  1. Ask clarifying questions (depth/focus)      │
│  2. Define 4 research angles                    │
│                                                 │
│  3. PARALLEL SEARCHES (Bash calls):             │
│     ├── search-api.sh tavily "angle 1"          │
│     ├── search-api.sh tavily "angle 2"          │
│     ├── gemini-research.sh "angle 3"            │
│     └── gemini-research.sh "angle 4"            │
│                                                 │
│  4. Read results and synthesize                 │
│  5. Verify citations with fetch-url.sh          │
│  6. Write final report                          │
└─────────────────────────────────────────────────┘
        ↓
Final Report with verified sources
```

## Why This Architecture?

**Previous approach (broken):**

- Subagents spawning subagents (not supported)
- WebSearch requiring manual approval
- WebSearch "0 searches performed" bugs (#11369, #10141)

**New approach (reliable):**

- Skills run in main conversation with full tool access
- Direct API calls via Bash scripts (deterministic, debuggable)
- Gemini CLI as fallback (built-in Google grounding works)
- No approval friction

## Components

| Component            | Type    | Purpose                     |
| -------------------- | ------- | --------------------------- |
| `/research`          | Command | Entry point                 |
| `skills/research.md` | Skill   | 6-phase workflow            |
| `search-api.sh`      | Script  | Tavily/SerpAPI/Brave/Google |
| `fetch-url.sh`       | Script  | URL verification            |
| `gemini-research.sh` | Script  | Gemini CLI wrapper          |

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

## Citation Verification

All key citations are verified by `fetch-url.sh`:

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
│   └── plugin.json
├── README.md
├── commands/
│   └── research.md          # Entry point
├── skills/
│   └── research.md          # Main research workflow
├── agents/
│   ├── .deprecated/         # Old multi-agent files
│   ├── citation-verifier.md # Optional subagent
│   └── report-synthesizer.md# Optional subagent
├── scripts/
│   ├── search-api.sh        # Direct API wrapper
│   ├── fetch-url.sh         # URL verification
│   └── gemini-research.sh   # Gemini CLI wrapper
└── templates/
    ├── research-brief.md
    └── research-report.md
```

## Author

Erik B

## Version

2.0.0
