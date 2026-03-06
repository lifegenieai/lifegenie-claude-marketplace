#!/usr/bin/env bun
/**
 * search.ts - Unified search dispatcher for search-hub
 *
 * Default mode: multi-source fan-out to ALL available providers in parallel.
 * Can also target a single provider explicitly.
 *
 * Usage:
 *   bun search.ts "<query>" [options]              # multi-source (default)
 *   bun search.ts multi "<query>" [options]         # explicit multi-source
 *   bun search.ts <provider> "<query>" [options]    # single provider
 *
 * Options:
 *   --providers p1,p2       Subset of providers for multi mode (default: all available)
 *   --model <model>         Provider-specific model (e.g., sonar-pro)
 *   --format json|text      Output format (default: json)
 *   --max-results N         Number of results (default: 5)
 *   --depth basic|advanced  Tavily search depth
 *   --type <type>           Exa search type
 *   --category <cat>        Exa category filter
 *   --content text|highlights Exa content type
 *   --status                Print provider availability and exit
 *   --help                  Show help and exit
 */

import { join } from "path";
import { getProviderStatus, getAvailableProviders, isProviderAvailable } from "./_env";
import { formatMultiOutput } from "./_format";
import type { Provider, MultiSearchResult, SearchResult, OutputFormat } from "./_types";

const TOOLS_DIR = import.meta.dir;

const PROVIDER_SCRIPTS: Record<Provider, string> = {
  tavily: join(TOOLS_DIR, "tavily.ts"),
  perplexity: join(TOOLS_DIR, "perplexity.ts"),
  gemini: join(TOOLS_DIR, "gemini-search.ts"),
  exa: join(TOOLS_DIR, "exa.ts"),
};

const ALL_PROVIDERS: Provider[] = ["tavily", "perplexity", "gemini", "exa"];
const SINGLE_PROVIDERS = ["tavily", "perplexity", "gemini", "exa"];

async function runProvider(provider: Provider, query: string, passArgs: string[]): Promise<SearchResult | null> {
  const script = PROVIDER_SCRIPTS[provider];

  // Build args: query + pass-through options, always JSON output for multi-mode parsing
  const cmd = ["bun", script, query, "--format", "json", ...passArgs];

  try {
    const proc = Bun.spawn(cmd, {
      stdout: "pipe",
      stderr: "pipe",
    });

    const stdout = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;

    if (exitCode !== 0 || !stdout.trim()) {
      return null;
    }

    const parsed = JSON.parse(stdout.trim());
    if (parsed.error) return null;
    return parsed as SearchResult;
  } catch {
    return null;
  }
}

async function multiSearch(
  query: string,
  providers: Provider[],
  passArgs: string[],
  format: OutputFormat
): Promise<void> {
  const startTime = Date.now();

  // Fan out to all providers in parallel
  const promises = providers.map(async (p) => ({
    provider: p,
    result: await runProvider(p, query, passArgs),
  }));

  const outcomes = await Promise.all(promises);
  const totalDuration = Date.now() - startTime;

  const succeeded: Provider[] = [];
  const failed: Provider[] = [];
  const providerResults: SearchResult[] = [];

  for (const { provider, result } of outcomes) {
    if (result) {
      succeeded.push(provider);
      providerResults.push(result);
    } else {
      failed.push(provider);
    }
  }

  const multiResult: MultiSearchResult = {
    query,
    provider_results: providerResults,
    metadata: {
      providers_queried: providers,
      providers_succeeded: succeeded,
      providers_failed: failed,
      total_duration_ms: totalDuration,
      total_results: providerResults.reduce((sum, r) => sum + r.metadata.result_count, 0),
    },
  };

  console.log(formatMultiOutput(multiResult, format));
}

function printStatus(): void {
  const status = getProviderStatus();
  const costTable: Record<Provider, string> = {
    tavily: "Free tier (1000/mo), advanced ~$0.016/query",
    perplexity: "$0.01-$0.15/query depending on model",
    gemini: "Free (OAuth subscription)",
    exa: "~$0.005/query",
  };

  console.log("Search Hub - Provider Status\n");
  console.log("Provider      Available  Reason                    Cost");
  console.log("────────────  ─────────  ────────────────────────  ──────────────────────────────────");

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
  gemini       Gemini CLI with Google Search grounding
  exa          Exa semantic search

Multi-source options:
  --providers p1,p2       Subset of providers (default: all available)

Provider options (passed through):
  --model <model>           Provider-specific model (e.g., sonar-pro)
  --format json|text        Output format (default: json)
  --max-results N           Number of results (default: 5)
  --depth basic|advanced    Tavily search depth
  --type <type>             Exa search type
  --category <cat>          Exa category filter

Special flags:
  --status                  Print provider availability and exit
  --help                    Show this help and exit

Examples:
  bun search.ts "what are the latest Next.js features"
  bun search.ts "compare React vs Svelte" --providers tavily,perplexity
  bun search.ts perplexity "quantum computing" --model sonar-pro
  bun search.ts --status`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.length === 0) {
    printHelp();
    process.exit(args.length === 0 ? 1 : 0);
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
  let format: OutputFormat = "json";
  let providerSubset: Provider[] | undefined;

  for (let i = 0; i < restArgs.length; i++) {
    const arg = restArgs[i];
    if (arg === "--format" && i + 1 < restArgs.length) {
      format = restArgs[++i] as OutputFormat;
    } else if (arg === "--providers" && i + 1 < restArgs.length) {
      providerSubset = restArgs[++i].split(",").map((p) => p.trim()) as Provider[];
    } else if (arg.startsWith("--") && i + 1 < restArgs.length && !restArgs[i + 1].startsWith("--")) {
      passArgs.push(arg, restArgs[++i]);
    } else if (arg.startsWith("--")) {
      passArgs.push(arg);
    } else if (!query) {
      query = arg;
    }
  }

  if (!query) {
    console.error(JSON.stringify({
      error: true,
      message: 'No query provided. Usage: bun search.ts "<query>" [options]',
    }, null, 2));
    process.exit(1);
  }

  if (mode === "multi") {
    // Multi-source: fan out to all available (or subset)
    const available = getAvailableProviders();
    const targets = providerSubset
      ? providerSubset.filter((p) => available.includes(p))
      : available;

    if (targets.length === 0) {
      console.error(JSON.stringify({
        error: true,
        message: "No search providers available. Check API keys in ~/.claude/.env",
      }, null, 2));
      process.exit(1);
    }

    console.error(`[search-hub] Multi-source search across: ${targets.join(", ")}`);
    await multiSearch(query, targets, passArgs, format);
  } else {
    // Single provider mode
    if (!isProviderAvailable(mode)) {
      console.error(JSON.stringify({
        error: true,
        provider: mode,
        message: `Provider "${mode}" is not available. Run --status to check configuration.`,
      }, null, 2));
      process.exit(1);
    }

    const script = PROVIDER_SCRIPTS[mode];
    const cmd = ["bun", script, query, "--format", format, ...passArgs];
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
