---
name: search-hub
description:
  Multi-source search that fans out to ALL available providers (Tavily,
  Perplexity, Gemini, Exa) in parallel and returns provider-attributed results.
  USE WHEN user asks to search, research, look up, find information, check
  current events, compare topics, get citations, semantic search, or needs
  web-grounded answers. ALWAYS use this skill for any web search — even simple
  lookups benefit from cross-provider verification. The default mode searches
  ALL providers simultaneously. Do not pick just one source when you have four.
allowed-tools:
  - Read
  - Bash
  - Glob
metadata:
  author: erikb
  version: 2.0.0
  category: integration
  created: 2026-03-05
  updated: 2026-03-06
---

# search-hub

Multi-source search that fans out to all available providers in parallel. The
goal is **information density and signal**, not cost optimization. A single
source when you have four available is a failure to check.

## Core Principle

Every search hits ALL available providers simultaneously. Each provider sees the
web differently — Perplexity synthesizes with citations, Tavily returns raw
results with snippets, Gemini uses Google's live index, and Exa does neural
semantic matching. Cross-referencing what multiple providers surface for the
same query reveals what's actually important versus what's noise.

## Usage

```bash
# Default: multi-source across all available providers
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts "<query>"

# Subset of providers
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts "<query>" --providers tavily,perplexity

# Single provider (only when explicitly needed)
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts perplexity "<query>" --model sonar-pro
```

## Presenting Results: Provider-Attributed Brief

After running a multi-source search, present results organized BY PROVIDER so
the user can see what each source independently found. This is the required
output format:

```
### Google (Gemini)
[Gemini's answer reproduced faithfully — see rules below]

### Tavily
[Tavily's answer reproduced faithfully — see rules below]

### Perplexity
[Perplexity's answer reproduced faithfully — see rules below]

### Exa
[Exa's results reproduced faithfully — see rules below]

### Cross-Provider Signal
[YOUR synthesis goes here — this is the ONLY section where you add interpretation]
```

### Provider Section Rules (CRITICAL)

Each provider returns an `answer` field and/or `results` array. Your job in the
per-provider sections is to **faithfully reproduce what the provider actually
said** — not to rewrite, summarize, editorialize, or "improve" it.

- **If the provider returned an `answer` field**: reproduce it verbatim or
  near-verbatim. You may lightly format for readability (add line breaks, bullet
  points) but do NOT change the substance, reorder claims, drop facts, or inject
  your own interpretation. The user needs to see what the provider actually
  said, not your version of it.
- **If the provider returned only `results` (no answer)**: list the top results
  with their titles, snippets, and URLs. Do not blend them into a narrative.
- **Include source URLs** inline where the provider supplied them.
- **Do NOT merge information across providers** within a provider section. Each
  section reflects ONLY what that single provider returned.

The reason this matters: the whole point of multi-source search is to let the
user compare what different providers independently found. If you rewrite their
answers, you destroy the signal — the user can't tell what came from where, and
can't judge source reliability. Provider sections are evidence; your job is to
present the evidence cleanly, not to be the witness.

### Cross-Provider Signal (your synthesis)

This is the ONLY section where you add your own analysis:

- What multiple providers agreed on (high-confidence findings)
- What only one provider surfaced (flag as potentially unique or unverified)
- Any contradictions between providers
- Which provider gave the most detailed/useful answer for this specific query

## When to Use Single vs Multi

| Situation                        | Mode            | Why                                     |
| -------------------------------- | --------------- | --------------------------------------- |
| Any research question            | multi (default) | Cross-reference for signal              |
| Quick factual lookup             | multi (default) | Still benefits from verification        |
| User says "search for X"         | multi (default) | Always multi unless told otherwise      |
| User explicitly names a provider | single          | "ask Perplexity about..."               |
| Deep research with Perplexity    | single          | sonar-deep-research is its own workflow |
| Semantic similarity search       | single exa      | Exa's neural search is specialized      |

The bias is always toward multi. Only go single-provider when the user
explicitly requests it or the task is inherently single-provider (like Exa
similarity search).

## Provider Capabilities

Each provider brings something different to the table:

| Provider   | Strength                       | Returns                       |
| ---------- | ------------------------------ | ----------------------------- |
| Gemini     | Google's live index, free      | Grounded answer + source URLs |
| Tavily     | Fast web results, free tier    | Ranked results with snippets  |
| Perplexity | Cited synthesis, deep research | Answer with inline citations  |
| Exa        | Neural/semantic matching       | Semantically relevant results |

## Provider-Specific Options

When targeting a single provider, these options are available:

- **Perplexity**:
  `--model sonar|sonar-pro|sonar-reasoning-pro|sonar-deep-research`
- **Tavily**: `--depth basic|advanced`, `--max-results N`
- **Exa**: `--type fast|auto|deep`, `--category news|"research paper"|company`,
  `--answer`
- **Gemini**: `--max-results N`

## Check Provider Status

```bash
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts --status
```

Reports which providers are configured and available before running queries.
