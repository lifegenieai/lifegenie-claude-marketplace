---
name: search-hub
description:
  Multi-provider web search that fans out to Tavily, Perplexity, Gemini, and
  Exa in parallel with provider-attributed results. Use when research benefits
  from cross-provider coverage or citations.
---

# search-hub

Tools live at `${CLAUDE_PLUGIN_ROOT}/tools/`. Requires the
[Bun](https://bun.sh/) runtime; no npm install step.

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
# Default: token-lean multi-source across all available providers (digest output)
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts "<query>"

# Deep research mode: heavyweight presets (advanced depth, sonar-pro, Exa deep+summary)
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts "<query>" --deep

# Subset of providers
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts "<query>" --providers tavily,perplexity

# Single provider (only when explicitly needed)
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts perplexity "<query>" --model sonar-pro

# Full machine-readable payload instead of digest
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts "<query>" --format json
```

## Two Modes: Lean (default) vs Deep

| Mode               | When                                        | Behavior                                                                                              |
| ------------------ | ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Lean (default)** | Lookups, fact checks, verification          | Fast depths, capped answers, extractive highlights. Digest ≤ ~3k tokens. ~$0.015/query, ~7s           |
| **Deep (--deep)**  | Research, comparisons, multi-angle analysis | Tavily advanced+answer, sonar-pro high context, Gemini low thinking, Exa deep+summary. ~$0.06/query   |

Explicit provider flags always override mode presets. `sonar-deep-research`
stays a single-provider explicit call (its own cost class), not part of
`--deep`.

## Run Files (full payload on disk)

Every multi-search writes the complete untruncated payload to
`~/.search-hub/runs/<timestamp>-<slug>.json` (pruned after 30 days). The digest
footer shows the path. If you need more detail than the digest carries — full
snippets, all results, per-provider metadata — Read that file on demand instead
of re-running the search. Pass `--no-spill` to skip writing it (CI/testing).

## Presenting Results: Provider-Attributed Brief

The default digest output is already provider-attributed: per-provider sections
with verbatim answers, a mechanically computed consensus table (URLs found by
2+ providers), actual cost, and the run-file path. Your job is to relay the
provider sections faithfully and add interpretation ONLY in your own
Cross-Provider Signal section — the consensus table gives you the agreement
data; you add what it means.

Present results organized BY PROVIDER so the user can see what each source
independently found. This is the required output format:

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

- What multiple providers agreed on (the digest's consensus table lists the
  URL-level agreement; interpret it, don't recompute it)
- What only one provider surfaced (flag as potentially unique or unverified)
- Any contradictions between providers
- Which provider gave the most detailed/useful answer for this specific query

### Deep-Mode Digestion (subagent recommended)

For `--deep` runs the full payload is 15-25k tokens — that's where delegating
pays off. Spawn a cheap subagent (Haiku-class) to run the search and return the
provider-attributed brief, with this contract in its prompt: reproduce each
provider's answer verbatim, never merge across providers, keep source URLs
inline, synthesis only in a Cross-Provider Signal section. Your context then
receives only the brief; the run file on disk is the fidelity escape hatch if
you need to verify anything the brief summarized away. Lean-mode digests are
already small; read them directly, no subagent needed.

## When to Use Single vs Multi

| Situation                        | Mode             | Why                                     |
| -------------------------------- | ---------------- | --------------------------------------- |
| Quick factual lookup             | multi (default)  | Still benefits from verification        |
| User says "search for X"         | multi (default)  | Always multi unless told otherwise      |
| Research / comparison question   | multi `--deep`   | Heavier retrieval, richer evidence      |
| User explicitly names a provider | single           | "ask Perplexity about..."               |
| Deep research with Perplexity    | single           | sonar-deep-research is its own workflow |
| Semantic similarity search       | single exa       | Exa's neural search is specialized      |

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

Available in single-provider mode, or passed through in multi mode to override
the lean/deep presets:

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

## API Keys & Authentication

API keys are resolved automatically. Do not fetch, set, export, or look up keys
yourself. Just run the search command — `_env.ts` handles all key resolution
internally via `process.env` or the `~/.search-hub/.env` file. All four
providers are key-gated, including Gemini (`GEMINI_API_KEY`, direct
generateContent API — the Gemini CLI is no longer used or required).

If `--status` reports no providers (or the search command exits with "No search
providers available"), the user has not configured keys yet. Fall back to the
built-in WebSearch tool for the query, and tell the user explicitly that you did
so. The notice must appear at the top of the answer, before any results, in this
form:

> **Fallback:** search-hub has no provider keys configured, so this answer comes
> from the built-in WebSearch tool instead. To enable multi-provider search, run
> `bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts --setup` and add keys to `~/.search-hub/.env`.

Never silently substitute WebSearch. If some providers are configured but not
all, run search-hub with what is available and do not fall back.

## Check Provider Status

```bash
bun ${CLAUDE_PLUGIN_ROOT}/tools/search.ts --status
```

Reports which providers are configured and available before running queries.
