# Changelog

Version lives in `package.json` (and, for the marketplace plugin, `.claude-plugin/plugin.json`). Semver: patch for prose and output fixes, minor for new flags or providers, major for a changed key-resolution or output contract.

## 3.0.0 (2026-09-14)

Portable keys, token-lean output, and a graceful no-keys path.

- **Key resolution.** `_env.ts` reads `process.env` first, then `~/.search-hub/.env`. `--setup` seeds that file from `.env.example`; `--status` shows what resolved. Keys never live inside the skill folder. Replaces the earlier 1Password fallback, which hit `op` rate limits.
- **Gemini via API key.** `GEMINI_API_KEY` against the generateContent API with Google Search grounding. The Gemini CLI and its OAuth flow are no longer used or required.
- **Digest output by default.** New `_digest.ts` renders per-provider verbatim answers, compact result lines, a consensus table of URLs surfaced by two or more providers, and actual per-request cost. `--format json` returns the full payload.
- **Run files.** Every multi-search spills the untruncated payload to `~/.search-hub/runs/<timestamp>-<slug>.json`, pruned after 30 days. `--no-spill` skips it.
- **Lean and deep modes.** Default presets are fast and capped (roughly $0.015 per query). `--deep` switches to Tavily advanced with answer, sonar-pro high context, Gemini low thinking, and Exa deep with summary. Explicit provider flags override either preset.
- **Expanded provider flags.** Perplexity `--context-size`, `--recency`, `--domains`; Tavily `--chunks-per-source`, `--min-score`; Exa `--content`, `--max-chars`, `--summary`; Gemini `--thinking`, `--max-tokens`.
- **WebSearch fallback.** When no provider keys are configured, the skill falls back to the built-in WebSearch tool and must show a visible Fallback notice at the top of the answer. Partial key coverage runs with what is available and does not fall back.
- **Plugin parity.** Marketplace plugin ported to this version with `${CLAUDE_PLUGIN_ROOT}` tool paths; `/search` gains `--deep` and points first-run users at `--setup`.

## 2.1.0 (2026-07-09)

- Per-provider error surfacing: `ProviderError`, `provider_errors` metadata, and `extractErrorMessage` so a failing provider reports why instead of vanishing.
- Gemini `--skip-trust` for headless runs.
- Gemini auth docs corrected from OAuth to `GEMINI_API_KEY` after Google deprecated CLI free-tier OAuth.

## 2.0.x (2026-03-25 to 2026-03-28)

- Migrated from the marketplace plugin to a standalone skill installable at `~/.claude/skills/search-hub/`.
- API keys resolved via 1Password `op` CLI (03-26), then replaced with a local `~/.search-hub/.env` file after rate limits (03-28).
- SKILL.md gained the "do not fetch or export keys yourself" rule.

## 2.0.0 (2026-03-06)

Initial marketplace plugin. Four-provider fan-out (Tavily, Perplexity, Gemini via CLI OAuth, Exa), `/search` command, provider-attributed brief format, keys in `~/.claude/.env`.
