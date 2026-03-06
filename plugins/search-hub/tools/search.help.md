# search.ts - Multi-Source Search Dispatcher

Fans out queries to ALL available search providers in parallel and returns
provider-attributed results. Single-provider mode available when explicitly
needed.

## Usage

```bash
# Multi-source (default) — hits all available providers
bun search.ts "<query>" [options]
bun search.ts multi "<query>" [options]

# Single provider
bun search.ts <provider> "<query>" [options]
```

## Providers

| Provider     | Engine                     | Best For                       |
| ------------ | -------------------------- | ------------------------------ |
| `multi`      | All available (DEFAULT)    | Cross-referenced signal        |
| `tavily`     | Tavily Search API          | Quick factual searches         |
| `perplexity` | Perplexity AI (sonar)      | Deep research, analysis        |
| `gemini`     | Gemini CLI + Google Search | Current events, free grounded  |
| `exa`        | Exa Semantic Search        | Similarity, academic, semantic |

## Options

| Option          | Values                                   | Applies To          | Default |
| --------------- | ---------------------------------------- | ------------------- | ------- |
| `--providers`   | Comma-separated provider names           | multi mode          | all     |
| `--format`      | `json`, `text`                           | All                 | `json`  |
| `--max-results` | Integer                                  | tavily, gemini, exa | `5`     |
| `--model`       | Provider model string                    | perplexity          | `sonar` |
| `--depth`       | `basic`, `advanced`                      | tavily              | `basic` |
| `--type`        | `fast`, `auto`, `deep`, `deep-reasoning` | exa                 | `auto`  |
| `--category`    | `news`, `company`, `research paper`, etc | exa                 | -       |

## Special Flags

| Flag       | Description                                |
| ---------- | ------------------------------------------ |
| `--status` | Print provider availability table and exit |
| `--help`   | Print usage help and exit                  |

## Multi-Source Output

In multi mode, results are grouped by provider:

```
════════════════════════════════════════
  Gemini  (1200ms, 5 results)
════════════════════════════════════════
[answer and sources]

════════════════════════════════════════
  Tavily  (800ms, 5 results)
════════════════════════════════════════
[results with snippets]

════════════════════════════════════════
  Perplexity  (2100ms, 3 results)
════════════════════════════════════════
[synthesized answer with citations]
```

## Examples

```bash
# Default multi-source search
bun search.ts "what are the latest Next.js features"

# Multi-source with subset
bun search.ts "compare React vs Svelte" --providers tavily,perplexity

# Single provider with options
bun search.ts perplexity "quantum computing" --model sonar-pro
bun search.ts exa "papers on RLHF" --category "research paper" --type deep

# Check provider status
bun search.ts --status
```
