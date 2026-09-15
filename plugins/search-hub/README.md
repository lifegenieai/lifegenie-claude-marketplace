# search-hub

Multi-source search dispatcher that fans out queries to 4 providers in parallel
for cross-provider verification. Token-lean digest output by default; full
payload spilled to a run file on disk.

## Providers and cost

Each provider needs its own API key. Any provider without a key is skipped, so
you can start with the free ones.

| Provider   | Strength                       | Pricing                          | Get a key                                   |
| ---------- | ------------------------------ | -------------------------------- | ------------------------------------------- |
| Tavily     | Fast web results               | Free tier, 1000 credits/mo       | https://app.tavily.com/                     |
| Gemini     | Google's live index, grounded  | Free tier grounding allowance    | https://aistudio.google.com/apikey          |
| Exa        | Neural/semantic matching       | Free tier, then ~$0.007/query    | https://dashboard.exa.ai/                   |
| Perplexity | Cited synthesis, deep research | Paid only, ~$0.006/query lean    | https://www.perplexity.ai/settings/api      |

## Prerequisites

- [Bun](https://bun.sh/) runtime (`curl -fsSL https://bun.sh/install | bash`, or
  `powershell -c "irm bun.sh/install.ps1 | iex"` on Windows). No `npm install`
  step; the tools use only builtins.

## Setup

```bash
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts --setup
```

This creates `~/.search-hub/.env` from `.env.example`. Edit it and paste in the
keys you have, then confirm with:

```bash
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts --status
```

Keys in `process.env` override the file, so CI or a secrets manager can inject
them without touching `.env`. Keys never live inside the skill folder.

Gemini uses the generateContent API directly with Google Search grounding. The
Gemini CLI is not used or required.

## Usage

The plugin provides:

- **Skill**: Auto-triggers on search/research queries
- **Command**: `/search <query>` for explicit invocation
- **Tools**: `search.ts` dispatcher + 4 provider scripts

### Direct tool usage

```bash
# Multi-source (default): lean fan-out, digest output
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts "latest TypeScript features"

# Deep research mode: heavyweight presets
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts "solid state battery breakthroughs" --deep

# Full machine-readable payload
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts "latest TypeScript features" --format json

# Subset of providers
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts "compare React vs Svelte" --providers tavily,perplexity

# Single provider
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts perplexity "quantum computing" --model sonar-pro

# Check provider status
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts --status
```

### Digest output (multi-mode default)

Per-provider sections with verbatim answers and compact result lines, a
consensus table of URLs surfaced by 2+ providers, actual per-request cost, and
a footer pointing at the run file. The complete untruncated payload is written
to `~/.search-hub/runs/<timestamp>-<slug>.json` (pruned after 30 days); pass
`--no-spill` to skip it.

## Modes

| Mode           | Presets                                                                                | Cost / latency      |
| -------------- | -------------------------------------------------------------------------------------- | ------------------- |
| Lean (default) | Tavily fast, Perplexity sonar low-context capped, Gemini capped, Exa fast highlights   | ~$0.015/query, ~5-7s |
| `--deep`       | Tavily advanced+answer, sonar-pro high context, Gemini low thinking, Exa deep+summary  | ~$0.06/query        |

Explicit provider flags always override mode presets.

## Provider-Specific Options

- **Perplexity**:
  `--model sonar|sonar-pro|sonar-reasoning-pro|sonar-deep-research`,
  `--max-tokens N`, `--context-size low|medium|high`,
  `--recency day|week|month|year`, `--domains d1,d2`
- **Tavily**: `--depth ultra-fast|fast|basic|advanced`, `--max-results N`,
  `--chunks-per-source 1-3`, `--answer`, `--min-score N`
- **Exa**: `--type instant|fast|auto|deep-lite|deep|deep-reasoning`,
  `--category news|"research paper"|company|...`, `--content text|highlights`,
  `--max-chars N`, `--summary`, `--answer`
- **Gemini**: `--model <id>`, `--max-tokens N`, `--thinking minimal|low|high`,
  `--max-results N`
