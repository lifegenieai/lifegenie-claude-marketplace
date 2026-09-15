#!/usr/bin/env bun
/**
 * search.ts - Unified search dispatcher for search-hub
 *
 * Default mode: multi-source fan-out to ALL available providers in parallel
 * with token-lean per-provider defaults and a dense digest output. The full
 * payload is spilled to ~/.search-hub/runs/ for on-demand reading.
 *
 * Usage:
 *   bun search.ts "<query>" [options]              # multi-source (default)
 *   bun search.ts multi "<query>" [options]         # explicit multi-source
 *   bun search.ts <provider> "<query>" [options]    # single provider
 *
 * Options:
 *   --providers p1,p2         Subset of providers for multi mode (default: all available)
 *   --deep                    Heavyweight research presets (advanced/sonar-pro/deep/summary)
 *   --format digest|json|text Output format (multi default: digest; single default: json)
 *   --no-spill                Skip writing the run file (CI/testing)
 *   --model <model>           Provider-specific model (e.g., sonar-pro)
 *   --max-results N           Number of results
 *   --depth <depth>           Tavily search depth (ultra-fast|fast|basic|advanced)
 *   --type <type>             Exa search type
 *   --category <cat>          Exa category filter
 *   --content text|highlights Exa content type
 *   --setup                   Create ~/.search-hub/.env from .env.example, then print status
 *   --status                  Print provider availability and exit
 *   --help                    Show help and exit
 */

import { join } from "path";
import {
  getProviderStatus,
  getAvailableProviders,
  isProviderAvailable,
  setupEnv,
  ENV_PATH,
} from "./_env";
import { formatMultiOutput } from "./_format";
import { computeConsensus, totalCostActual, writeRunFile } from "./_digest";
import type {
  Provider,
  MultiSearchResult,
  ProviderError,
  SearchResult,
  OutputFormat,
} from "./_types";

const TOOLS_DIR = import.meta.dir;

const PROVIDER_SCRIPTS: Record<Provider, string> = {
  tavily: join(TOOLS_DIR, "tavily.ts"),
  perplexity: join(TOOLS_DIR, "perplexity.ts"),
  gemini: join(TOOLS_DIR, "gemini-search.ts"),
  exa: join(TOOLS_DIR, "exa.ts"),
};

const ALL_PROVIDERS: Provider[] = ["tavily", "perplexity", "gemini", "exa"];
const SINGLE_PROVIDERS = ["tavily", "perplexity", "gemini", "exa"];

type ProviderOutcome =
  | { ok: true; result: SearchResult }
  | { ok: false; message: string };

/**
 * Lean per-provider defaults for multi-mode fan-out. Compression is
 * provider-side and extractive, so attribution fidelity is preserved.
 * Explicit user flags always win. Single-provider mode is unaffected.
 */
const LEAN_DEFAULTS: Record<Provider, string[]> = {
  tavily: ["--depth", "fast", "--max-results", "5"],
  perplexity: ["--max-tokens", "500", "--context-size", "low"],
  // One grounded generateContent call, but open-ended queries produce 5k+ char
  // answers at 14s+ without a cap (measured live) — so cap and instruct concise
  gemini: ["--max-tokens", "800"],
  exa: ["--type", "fast", "--content", "highlights", "--max-chars", "1200"],
};

/**
 * Heavyweight research presets for --deep mode. sonar-deep-research is NOT
 * included — its cost class ($0.10-0.50+/query) stays a single-provider call.
 */
const DEEP_DEFAULTS: Record<Provider, string[]> = {
  tavily: [
    "--depth", "advanced",
    "--chunks-per-source", "2",
    "--max-results", "8",
    "--answer",
  ],
  perplexity: ["--model", "sonar-pro", "--context-size", "high"],
  gemini: ["--thinking", "low"],
  exa: [
    "--type", "deep",
    "--content", "highlights",
    "--max-chars", "2000",
    "--summary",
  ],
};

/** Prepend default flags (with or without values), skipping any the user passed */
function withDefaults(defaults: string[], passArgs: string[]): string[] {
  const extra: string[] = [];
  for (let i = 0; i < defaults.length; i++) {
    const flag = defaults[i];
    const hasValue =
      i + 1 < defaults.length && !defaults[i + 1].startsWith("--");
    if (!passArgs.includes(flag)) {
      extra.push(flag);
      if (hasValue) extra.push(defaults[i + 1]);
    }
    if (hasValue) i++;
  }
  return [...extra, ...passArgs];
}

/** Pull a human-readable message out of provider output (JSON error blob or raw text) */
function extractErrorMessage(text: string): string {
  const trimmed = text.trim();
  const jsonStart = trimmed.indexOf("{");
  if (jsonStart !== -1) {
    try {
      const parsed = JSON.parse(trimmed.slice(jsonStart));
      if (parsed.message) return String(parsed.message);
    } catch {
      // fall through to raw text
    }
  }
  return trimmed;
}

async function runProvider(
  provider: Provider,
  query: string,
  passArgs: string[],
  deep: boolean,
): Promise<ProviderOutcome> {
  const script = PROVIDER_SCRIPTS[provider];

  // Build args: query + mode defaults + pass-through options,
  // always JSON output for multi-mode parsing
  const defaults = deep ? DEEP_DEFAULTS[provider] : LEAN_DEFAULTS[provider];
  const args = withDefaults(defaults, passArgs);
  const cmd = ["bun", script, query, "--format", "json", ...args];

  try {
    const proc = Bun.spawn(cmd, {
      stdout: "pipe",
      stderr: "pipe",
    });

    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);
    const exitCode = await proc.exited;

    if (exitCode !== 0 || !stdout.trim()) {
      const message =
        extractErrorMessage(stderr || stdout) ||
        `provider exited with code ${exitCode} and no output`;
      return { ok: false, message };
    }

    const parsed = JSON.parse(stdout.trim());
    if (parsed.error) {
      return {
        ok: false,
        message: parsed.message || "provider returned an unspecified error",
      };
    }
    return { ok: true, result: parsed as SearchResult };
  } catch (err: any) {
    return { ok: false, message: err?.message || String(err) };
  }
}

async function multiSearch(
  query: string,
  providers: Provider[],
  passArgs: string[],
  format: OutputFormat,
  spill: boolean,
  deep: boolean,
): Promise<void> {
  const startTime = Date.now();

  // Fan out to all providers in parallel
  const promises = providers.map(async (p) => ({
    provider: p,
    outcome: await runProvider(p, query, passArgs, deep),
  }));

  const outcomes = await Promise.all(promises);
  const totalDuration = Date.now() - startTime;

  const succeeded: Provider[] = [];
  const failed: Provider[] = [];
  const errors: ProviderError[] = [];
  const providerResults: SearchResult[] = [];

  for (const { provider, outcome } of outcomes) {
    if (outcome.ok) {
      succeeded.push(provider);
      providerResults.push(outcome.result);
    } else {
      failed.push(provider);
      errors.push({ provider, message: outcome.message });
    }
  }

  const multiResult: MultiSearchResult = {
    query,
    provider_results: providerResults,
    metadata: {
      providers_queried: providers,
      providers_succeeded: succeeded,
      providers_failed: failed,
      provider_errors: errors,
      total_duration_ms: totalDuration,
      total_results: providerResults.reduce(
        (sum, r) => sum + r.metadata.result_count,
        0,
      ),
      consensus: computeConsensus(providerResults).filter(
        (c) => c.providers.length >= 2,
      ),
      total_cost_actual: totalCostActual(providerResults),
    },
  };

  if (spill) {
    try {
      multiResult.metadata.run_file = writeRunFile(multiResult);
    } catch (err: any) {
      console.error(
        `[search-hub] WARNING: failed to write run file: ${err?.message || err}`,
      );
    }
  }

  console.log(formatMultiOutput(multiResult, format));
}

function printStatus(): void {
  const status = getProviderStatus();
  const costTable: Record<Provider, string> = {
    tavily: "1 credit fast/basic, 2 advanced (1000 free/mo)",
    perplexity: "~$0.006 lean, ~$0.02+ sonar-pro",
    gemini: "free tier grounding allowance (GEMINI_API_KEY)",
    exa: "~$0.007 fast+highlights, ~$0.02+ deep",
  };

  console.log("Search Hub - Provider Status\n");
  console.log("Provider      Available  Reason                    Cost");
  console.log(
    "────────────  ─────────  ────────────────────────  ──────────────────────────────────",
  );

  for (const [provider, info] of Object.entries(status)) {
    const avail = info.available ? "  YES  " : "  NO   ";
    const name = provider.padEnd(12);
    const reason = (info.reason || "").padEnd(24);
    const cost = costTable[provider as Provider] || "";
    console.log(`${name}  ${avail}  ${reason}  ${cost}`);
  }
}

function printHelp(): void {
  console.log(`Search Hub - Multi-Source Search Dispatcher

Usage:
  bun search.ts "<query>" [options]              Multi-source search (default)
  bun search.ts multi "<query>" [options]        Explicit multi-source
  bun search.ts <provider> "<query>" [options]   Single provider

Providers:
  multi        Fan out to all available providers (DEFAULT)
  tavily       Tavily Search API
  perplexity   Perplexity AI (sonar models)
  gemini       Gemini generateContent with Google Search grounding
  exa          Exa semantic search

Modes (multi):
  default      Token-lean fan-out: fast depths, capped answers, extractive
               highlights. Digest output + full payload in ~/.search-hub/runs/
  --deep       Research presets: Tavily advanced+answer, sonar-pro high
               context, Gemini low thinking, Exa deep+summary

Multi-source options:
  --providers p1,p2         Subset of providers (default: all available)
  --deep                    Use deep research presets
  --format digest|json|text Output format (default: digest)
  --no-spill                Skip writing the run file

Provider options (passed through; explicit flags override mode presets):
  --model <model>           perplexity: sonar|sonar-pro|... · gemini: model id
  --max-results N           Number of results
  --depth <depth>           Tavily: ultra-fast|fast|basic|advanced
  --chunks-per-source N     Tavily: 1-3 (advanced only)
  --answer                  Tavily: include synthesized answer
  --min-score N             Tavily: relevance floor (default 0.4)
  --max-tokens N            perplexity/gemini: cap output tokens
  --context-size <size>     Perplexity: low|medium|high
  --recency <window>        Perplexity: day|week|month|year
  --domains d1,d2           Perplexity: domain filter
  --thinking <level>        Gemini: minimal|low|high
  --type <type>             Exa: instant|fast|auto|deep-lite|deep|deep-reasoning
  --category <cat>          Exa: news|company|"research paper"|...
  --content text|highlights Exa content type
  --max-chars N             Exa: max content chars per result
  --summary                 Exa: query-aware summary per result

Special flags:
  --setup                   First run: create ~/.search-hub/.env from .env.example, then print status
  --status                  Print provider availability and exit
  --help                    Show this help and exit

Examples:
  bun search.ts "what are the latest Next.js features"
  bun search.ts "solid state battery breakthroughs" --deep
  bun search.ts "compare React vs Svelte" --providers tavily,perplexity
  bun search.ts perplexity "quantum computing" --model sonar-pro
  bun search.ts "query" --format json          # full machine-readable payload
  bun search.ts --status`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.length === 0) {
    printHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  if (args.includes("--setup")) {
    const created = setupEnv();
    console.log(
      created
        ? `Created ${ENV_PATH}. Add your API keys there, then re-run --status.\n`
        : `${ENV_PATH} already exists.\n`,
    );
    printStatus();
    process.exit(0);
  }

  if (args.includes("--status")) {
    printStatus();
    process.exit(0);
  }

  // Determine mode: is the first arg a known provider/multi, or is it the query?
  const firstArg = args[0];
  let mode: "multi" | Provider;
  let restArgs: string[];

  if (firstArg === "multi" || SINGLE_PROVIDERS.includes(firstArg)) {
    mode = firstArg as "multi" | Provider;
    restArgs = args.slice(1);
  } else {
    // First arg is the query itself — default to multi mode
    mode = "multi";
    restArgs = args;
  }

  // Extract query (first non-flag arg)
  let query = "";
  const passArgs: string[] = [];
  let format: OutputFormat | undefined;
  let spill = true;
  let deep = false;
  let providerSubset: Provider[] | undefined;

  for (let i = 0; i < restArgs.length; i++) {
    const arg = restArgs[i];
    if (arg === "--format" && i + 1 < restArgs.length) {
      format = restArgs[++i] as OutputFormat;
    } else if (arg === "--no-spill") {
      spill = false;
    } else if (arg === "--deep") {
      deep = true;
    } else if (arg === "--providers" && i + 1 < restArgs.length) {
      const requested = restArgs[++i].split(",").map((p) => p.trim());
      const unknown = requested.filter(
        (p) => !ALL_PROVIDERS.includes(p as Provider),
      );
      if (unknown.length > 0) {
        console.error(
          JSON.stringify(
            {
              error: true,
              message: `Unknown provider(s): ${unknown.join(", ")}. Valid providers: ${ALL_PROVIDERS.join(", ")}`,
            },
            null,
            2,
          ),
        );
        process.exit(1);
      }
      providerSubset = requested as Provider[];
    } else if (
      arg.startsWith("--") &&
      i + 1 < restArgs.length &&
      !restArgs[i + 1].startsWith("--")
    ) {
      passArgs.push(arg, restArgs[++i]);
    } else if (arg.startsWith("--")) {
      passArgs.push(arg);
    } else if (!query) {
      query = arg;
    }
  }

  if (!query) {
    console.error(
      JSON.stringify(
        {
          error: true,
          message:
            'No query provided. Usage: bun search.ts "<query>" [options]',
        },
        null,
        2,
      ),
    );
    process.exit(1);
  }

  if (mode === "multi") {
    // Multi-source: fan out to all available (or subset)
    const available = getAvailableProviders();
    const targets = providerSubset
      ? providerSubset.filter((p) => available.includes(p))
      : available;

    if (providerSubset) {
      const unavailable = providerSubset.filter(
        (p) => !available.includes(p),
      );
      if (unavailable.length > 0) {
        console.error(
          `[search-hub] Skipping unavailable provider(s): ${unavailable.join(", ")}. Run --status to check configuration.`,
        );
      }
    }

    if (targets.length === 0) {
      console.error(
        JSON.stringify(
          {
            error: true,
            message:
              `No search providers available. Run --setup, then add API keys to ${ENV_PATH}`,
          },
          null,
          2,
        ),
      );
      process.exit(1);
    }

    console.error(
      `[search-hub] Multi-source search across: ${targets.join(", ")}`,
    );
    // Digest is the multi-mode default; json/text remain available
    await multiSearch(query, targets, passArgs, format ?? "digest", spill, deep);
  } else {
    // Single provider mode
    if (!isProviderAvailable(mode)) {
      console.error(
        JSON.stringify(
          {
            error: true,
            provider: mode,
            message: `Provider "${mode}" is not available. Run --status to check configuration.`,
          },
          null,
          2,
        ),
      );
      process.exit(1);
    }

    const script = PROVIDER_SCRIPTS[mode];
    const cmd = ["bun", script, query, "--format", format ?? "json", ...passArgs];
    const proc = Bun.spawn(cmd, { stdout: "pipe", stderr: "pipe" });
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    process.exit(exitCode);
  }
}

main();
