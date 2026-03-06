#!/usr/bin/env bun
/**
 * tavily.ts - Tavily Search API provider for search-hub
 *
 * Usage: bun tavily.ts "<query>" [options]
 *
 * Options:
 *   --depth basic|advanced   Search depth (default: basic)
 *   --max-results N          Number of results (default: 5)
 *   --format json|text       Output format (default: json)
 *   --help                   Show this help message
 *
 * Cost:
 *   basic:    $0.00 (1000 free/month)
 *   advanced: ~$0.016 per query
 */

import { getKey } from "./_env";
import { formatOutput, formatError } from "./_format";
import type { SearchResult, ResultItem, OutputFormat } from "./_types";

const PROVIDER = "tavily";
const API_URL = "https://api.tavily.com/search";

function showHelp(): void {
  console.log(`Tavily Search Provider

Usage: bun tavily.ts "<query>" [options]

Options:
  --depth basic|advanced   Search depth (default: basic)
  --max-results N          Number of results (default: 5)
  --format json|text       Output format (default: json)
  --help                   Show this help message

Examples:
  bun tavily.ts "what is bun runtime"
  bun tavily.ts "latest AI news" --depth advanced --max-results 10
  bun tavily.ts "typescript generics" --format text

Cost:
  basic:    $0.00 (included in free tier)
  advanced: ~$0.016 per query`);
}

function parseArgs(args: string[]): {
  query: string;
  depth: "basic" | "advanced";
  maxResults: number;
  format: OutputFormat;
} {
  let query = "";
  let depth: "basic" | "advanced" = "basic";
  let maxResults = 5;
  let format: OutputFormat = "json";

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === "--depth" && i + 1 < args.length) {
      const val = args[++i];
      if (val === "basic" || val === "advanced") depth = val;
      else {
        console.error(formatError(PROVIDER, `Invalid depth: ${val}. Use 'basic' or 'advanced'.`));
        process.exit(1);
      }
    } else if (arg === "--max-results" && i + 1 < args.length) {
      maxResults = parseInt(args[++i], 10);
      if (isNaN(maxResults) || maxResults < 1) {
        console.error(formatError(PROVIDER, "Invalid max-results: must be a positive integer."));
        process.exit(1);
      }
    } else if (arg === "--format" && i + 1 < args.length) {
      const val = args[++i];
      if (val === "json" || val === "text") format = val;
      else {
        console.error(formatError(PROVIDER, `Invalid format: ${val}. Use 'json' or 'text'.`));
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

  return { query, depth, maxResults, format };
}

async function search(
  query: string,
  depth: "basic" | "advanced",
  maxResults: number
): Promise<SearchResult> {
  const apiKey = getKey("tavily");
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY not set. Add it to ~/.claude/.env");
  }

  const start = performance.now();

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: depth,
      max_results: maxResults,
      include_answer: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Tavily API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  const duration = Math.round(performance.now() - start);

  const results: ResultItem[] = (data.results || []).map((r: any) => ({
    title: r.title || "",
    url: r.url || "",
    snippet: r.content || "",
    score: r.score,
    published_date: r.published_date || undefined,
  }));

  return {
    provider: PROVIDER,
    query,
    results,
    answer: data.answer || undefined,
    metadata: {
      provider: PROVIDER,
      cost_estimate: depth === "basic" ? "$0.00" : "~$0.016",
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

  const { query, depth, maxResults, format } = parseArgs(args);

  if (!query) {
    console.error(formatError(PROVIDER, "No query provided. Usage: bun tavily.ts \"<query>\""));
    process.exit(1);
  }

  try {
    const result = await search(query, depth, maxResults);
    console.log(formatOutput(result, format));
  } catch (err: any) {
    console.error(formatError(PROVIDER, err.message || String(err)));
    process.exit(1);
  }
}

main();
