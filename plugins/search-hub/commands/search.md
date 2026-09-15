---
name: search
description: Multi-source search across Tavily, Perplexity, Gemini, and Exa
allowed-tools:
  - Bash
  - Read
argument-hint: "<query> [provider] [--deep] [--model m] [--providers p1,p2] [--format json]"
---

# /search command

Run a multi-source search using the search-hub tool.

## Instructions

1. Run the search tool with the provided query:

```bash
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts {{query}}
```

For research or comparison questions, add `--deep` for the heavyweight presets:

```bash
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts {{query}} --deep
```

If a specific provider was requested:

```bash
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts {{provider}} {{query}}
```

If a model was specified (e.g., for Perplexity):

```bash
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts {{provider}} {{query}} --model {{model}}
```

2. Present results following the search-hub skill's Provider-Attributed Brief
   format — each provider's answer reproduced faithfully in its own section,
   with a Cross-Provider Signal section for your synthesis.

3. If no providers are available, fall back to the built-in WebSearch tool and
   say so at the top of the answer, per the skill's "API Keys & Authentication"
   section. Point the user at first-run setup:

```bash
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts --setup
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts --status
```
