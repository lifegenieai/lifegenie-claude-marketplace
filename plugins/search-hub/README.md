# search-hub

Multi-source search dispatcher that fans out queries to 4 providers in parallel
for cross-provider verification.

## Providers

| Provider   | Strength                       | Auth               |
| ---------- | ------------------------------ | ------------------ |
| Tavily     | Fast web results, free tier    | API key            |
| Perplexity | Cited synthesis, deep research | API key            |
| Gemini     | Google's live index, free      | OAuth (gemini CLI) |
| Exa        | Neural/semantic matching       | API key            |

## Prerequisites

- [Bun](https://bun.sh/) runtime
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) (for Gemini
  provider)
- API keys configured in `~/.claude/.env`

## Configuration

Add API keys to `~/.claude/.env`:

```
TAVILY_API_KEY=tvly-...
PERPLEXITY_API_KEY=pplx-...
EXA_API_KEY=...
```

Gemini uses OAuth via the `gemini` CLI — no API key needed.

## Usage

The plugin provides:

- **Skill**: Auto-triggers on search/research queries
- **Command**: `/search <query>` for explicit invocation
- **Tools**: `search.ts` dispatcher + 4 provider scripts

### Direct tool usage

```bash
# Multi-source (default)
bun tools/search.ts "latest TypeScript features"

# Subset of providers
bun tools/search.ts "compare React vs Svelte" --providers tavily,perplexity

# Single provider
bun tools/search.ts perplexity "quantum computing" --model sonar-pro

# Check provider status
bun tools/search.ts --status
```

## Provider-Specific Options

- **Perplexity**:
  `--model sonar|sonar-pro|sonar-reasoning-pro|sonar-deep-research`
- **Tavily**: `--depth basic|advanced`, `--max-results N`
- **Exa**: `--type fast|auto|deep`, `--category news|"research paper"|company`,
  `--answer`
- **Gemini**: `--max-results N`
