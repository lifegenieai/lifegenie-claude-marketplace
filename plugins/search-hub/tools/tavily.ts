#!/usr/bin/env bun
/**
 * tavily.ts - Tavily Search API provider for search-hub
 *
 * Usage: bun tavily.ts "<query>" [options]
 *
 * Options:
 *   --depth ultra-fast|fast|basic|advanced   Search depth (default: basic)
 *   --max-results N          Number of results (default: 5)
 *   --chunks-per-source N    Content chunks per source, 1-3 (advanced depth only)
 *   --answer                 Include Tavily's synthesized answer (default: off)
 *   --min-score N            Relevance floor 0-1, filters weaker results (default: 0.4)
 *   --format json|text       Output format (default: json)
 *   --help                   Show this help message
 *
 * Cost:
 *   ultra-fast/fast/basic: 1 credit (1000 free/month)
 *   advanced:              2 credits
 *   Actual usage reported in metadata.cost_actual (include_usage).
 */

import { getKey, missingKeyMessage } from "./_env";
import { formatOutput, formatError } from "./_format";
import type { SearchResult, ResultItem, OutputFormat } from "./_types";

const PROVIDER = "tavily";
const API_URL = "https://api.tavily.com/search";

const VALID_DEPTHS = ["ultra-fast", "fast", "basic", "advanced"] as const;
type Depth = (typeof VALID_DEPTHS)[number];

function showHelp(): void {
  console.log(`Tavily Search Provider

Usage: bun tavily.ts "<query>" [options]

Options:
  --depth <depth>          Search depth: ultra-fast|fast|basic|advanced (default: basic)
  --max-results N          Number of results (default: 5)
  --chunks-per-source N    Content chunks per source, 1-3 (advanced depth only)
  --answer                 Include Tavily's synthesized answer (default: off)
  --min-score N            Relevance floor 0-1, filters weaker results (default: 0.4)
  --format json|text       Output format (default: json)
  --help                   Show this help message

Examples:
  bun tavily.ts "what is bun runtime"
  bun tavily.ts "latest AI news" --depth advanced --chunks-per-source 2 --max-results 10
  bun tavily.ts "typescript generics" --depth fast --format text

Cost:
  ultra-fast/fast/basic: 1 credit (1000 free/month)
  advanced:              2 credits`);
}

function parseArgs(args: string[]): {
  query: string;
  depth: Depth;
  maxResults: number;
  chunksPerSource?: number;
  includeAnswer: boolean;
  minScore: number;
  format: OutputFormat;
} {
  let query = "";
  let depth: Depth = "basic";
  let maxResults = 5;
  let chunksPerSource: number | undefined;
  let includeAnswer = false;
  let minScore = 0.4;
  let format: OutputFormat = "json";

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === "--depth" && i + 1 < args.length) {
      const val = args[++i];
      if (VALID_DEPTHS.includes(val as Depth)) depth = val as Depth;
      else {
        console.error(
          formatError(
            PROVIDER,
            `Invalid depth: ${val}. Use ${VALID_DEPTHS.join("|")}.`,
          ),
        );
        process.exit(1);
      }
    } else if (arg === "--chunks-per-source" && i + 1 < args.length) {
      chunksPerSource = parseInt(args[++i], 10);
      if (isNaN(chunksPerSource) || chunksPerSource < 1 || chunksPerSource > 3) {
        console.error(
          formatError(
            PROVIDER,
            "Invalid chunks-per-source: must be an integer 1-3.",
          ),
        );
        process.exit(1);
      }
    } else if (arg === "--answer") {
      includeAnswer = true;
    } else if (arg === "--min-score" && i + 1 < args.length) {
      minScore = parseFloat(args[++i]);
      if (isNaN(minScore) || minScore < 0 || minScore > 1) {
        console.error(
          formatError(PROVIDER, "Invalid min-score: must be a number 0-1."),
        );
        process.exit(1);
      }
    } else if (arg === "--max-results" && i + 1 < args.length) {
      maxResults = parseInt(args[++i], 10);
      if (isNaN(maxResults) || maxResults < 1) {
        console.error(
          formatError(
            PROVIDER,
            "Invalid max-results: must be a positive integer.",
          ),
        );
        process.exit(1);
      }
    } else if (arg === "--format" && i + 1 < args.length) {
      const val = args[++i];
      if (val === "json" || val === "text") format = val;
      else {
        console.error(
          formatError(
            PROVIDER,
            `Invalid format: ${val}. Use 'json' or 'text'.`,
          ),
        );
        process.exit(1);
      }
    } else if (arg === "--help") {
      showHelp();
      process.exit(0);
    } else if (!arg.startsWith("--")) {
      query = arg;
    }
    i++;
  }

  return {
    query,
    depth,
    maxResults,
    chunksPerSource,
    includeAnswer,
    minScore,
    format,
  };
}

interface SearchOpts {
  query: string;
  depth: Depth;
  maxResults: number;
  chunksPerSource?: number;
  includeAnswer: boolean;
  minScore: number;
}

// Non-advanced depths have no API-side length control; this cap is the guarantee
const SNIPPET_MAX_CHARS = 600;

async function search(opts: SearchOpts): Promise<SearchResult> {
  const apiKey = getKey("tavily");
  if (!apiKey) {
    throw new Error(missingKeyMessage("tavily"));
  }

  const start = performance.now();

  const body: Record<string, any> = {
    query: opts.query,
    search_depth: opts.depth,
    max_results: opts.maxResults,
    include_answer: opts.includeAnswer,
    include_usage: true,
  };
  if (opts.depth === "advanced" && opts.chunksPerSource) {
    body.chunks_per_source = opts.chunksPerSource;
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const respBody = await response.text();
    throw new Error(`Tavily API error (${response.status}): ${respBody}`);
  }

  const data = await response.json();
  const duration = Math.round(performance.now() - start);

  const truncate = (s: string): string =>
    opts.depth !== "advanced" && s.length > SNIPPET_MAX_CHARS
      ? s.slice(0, SNIPPET_MAX_CHARS) + "…"
      : s;

  const results: ResultItem[] = (data.results || [])
    .filter((r: any) => typeof r.score !== "number" || r.score >= opts.minScore)
    .map((r: any) => ({
      title: r.title || "",
      url: r.url || "",
      snippet: truncate(r.content || ""),
      score: r.score,
      published_date: r.published_date || undefined,
    }));

  const credits = data.usage?.credits;

  return {
    provider: PROVIDER,
    query: opts.query,
    results,
    answer: data.answer || undefined,
    metadata: {
      provider: PROVIDER,
      cost_estimate: opts.depth === "advanced" ? "2 credits" : "1 credit",
      cost_actual:
        typeof credits === "number"
          ? `${credits} credit${credits === 1 ? "" : "s"}`
          : undefined,
      duration_ms: duration,
      result_count: results.length,
    },
  };
}

// --- Main ---
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    showHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const { format, ...searchOpts } = parseArgs(args);

  if (!searchOpts.query) {
    console.error(
      formatError(
        PROVIDER,
        'No query provided. Usage: bun tavily.ts "<query>"',
      ),
    );
    process.exit(1);
  }

  try {
    const result = await search(searchOpts);
    console.log(formatOutput(result, format));
  } catch (err: any) {
    console.error(formatError(PROVIDER, err.message || String(err)));
    process.exit(1);
  }
}

main();
