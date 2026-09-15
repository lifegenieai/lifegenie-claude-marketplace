# search.ts - Multi-Source Search Dispatcher

Fans out queries to ALL available search providers in parallel with token-lean
per-provider defaults and returns a dense provider-attributed digest. The full
payload is spilled to `~/.search-hub/runs/` for on-demand reading.
Single-provider mode available when explicitly needed.

## Usage

```bash
# Multi-source (default) — lean fan-out, digest output
bun search.ts "<query>" [options]
bun search.ts multi "<query>" [options]

# Deep research presets
bun search.ts "<query>" --deep

# Single provider
bun search.ts <provider> "<query>" [options]
```

## Providers

| Provider     | Engine                             | Best For                       |
| ------------ | ---------------------------------- | ------------------------------ |
| `multi`      | All available (DEFAULT)            | Cross-referenced signal        |
| `tavily`     | Tavily Search API                  | Quick factual searches         |
| `perplexity` | Perplexity AI (sonar)              | Deep research, analysis        |
| `gemini`     | generateContent + Google grounding | Current events, free grounded  |
| `exa`        | Exa Semantic Search                | Similarity, academic, semantic |

## Modes (multi)

| Mode           | Per-provider presets                                                                   |
| -------------- | -------------------------------------------------------------------------------------- |
| Lean (default) | tavily fast/5 results · perplexity 500 tok low context · gemini 800 tok · exa fast highlights 1200 chars |
| `--deep`       | tavily advanced+answer/8 results · sonar-pro high context · gemini low thinking · exa deep+summary 2000 chars |

Explicit user flags always override mode presets.

## Options

| Option                | Values                                        | Applies To          | Default        |
| --------------------- | --------------------------------------------- | ------------------- | -------------- |
| `--providers`         | Comma-separated provider names                | multi mode          | all            |
| `--deep`              | (flag)                                        | multi mode          | off            |
| `--format`            | `digest`, `json`, `text`                      | multi / all         | `digest`/`json`|
| `--no-spill`          | (flag) skip run file                          | multi mode          | off            |
| `--max-results`       | Integer                                       | tavily, gemini, exa | mode preset    |
| `--model`             | Provider model string                         | perplexity, gemini  | mode preset    |
| `--depth`             | `ultra-fast`, `fast`, `basic`, `advanced`     | tavily              | mode preset    |
| `--chunks-per-source` | 1-3 (advanced depth only)                     | tavily              | -              |
| `--answer`            | (flag) synthesized answer                     | tavily, exa         | off            |
| `--min-score`         | 0-1 relevance floor                           | tavily              | 0.4            |
| `--max-tokens`        | Integer output cap                            | perplexity, gemini  | mode preset    |
| `--context-size`      | `low`, `medium`, `high`                       | perplexity          | mode preset    |
| `--recency`           | `day`, `week`, `month`, `year`                | perplexity          | -              |
| `--domains`           | Comma-separated domains                       | perplexity          | -              |
| `--thinking`          | `minimal`, `low`, `high`                      | gemini              | `minimal`      |
| `--type`              | `instant`, `fast`, `auto`, `deep-lite`, `deep`, `deep-reasoning` | exa | mode preset |
| `--category`          | `news`, `company`, `research paper`, etc      | exa                 | -              |
| `--content`           | `text`, `highlights`                          | exa                 | mode preset    |
| `--max-chars`         | Integer content cap per result                | exa                 | mode preset    |
| `--summary`           | (flag) query-aware summary per result         | exa                 | off            |

## Special Flags

| Flag       | Description                                |
| ---------- | ------------------------------------------ |
| `--status` | Print provider availability table and exit |
| `--help`   | Print usage help and exit                  |

## Digest Output (multi-mode default)

```
# Multi-Source Search: "<query>"
4/4 providers · 5.3s · 23 results · cost $0.0122 + 1 Tavily credit

## Tavily (0.7s, 4 results)
- title — url — snippet(≤200 chars)

## Perplexity sonar (2.4s, 9 results)
[verbatim answer]
Sources:
- title — url — snippet

## Gemini gemini-3.5-flash (4.9s, 6 results)
[verbatim answer]
Sources: ...

## Exa (0.6s, 4 results)
- title — url — snippet

## Consensus (URLs found by 2+ providers)
- normalized-url — title [providers]

Full payload: ~/.search-hub/runs/<timestamp>-<slug>.json
```

Answers are reproduced verbatim, never summarized. The run file holds the
complete untruncated JSON payload (30-day retention).

## Examples

```bash
# Default lean multi-source search
bun search.ts "what are the latest Next.js features"

# Deep research
bun search.ts "solid state battery breakthroughs" --deep

# Machine-readable full payload
bun search.ts "nvidia earnings" --format json

# Multi-source with subset
bun search.ts "compare React vs Svelte" --providers tavily,perplexity

# Single provider with options
bun search.ts perplexity "quantum computing" --model sonar-pro
bun search.ts exa "papers on RLHF" --category "research paper" --type deep

# Check provider status
bun search.ts --status
```
