#!/usr/bin/env bun
/**
 * perplexity.ts - Perplexity AI search provider for search-hub
 *
 * Usage: bun perplexity.ts "<query>" [options]
 *
 * Options:
 *   --model <model>        sonar | sonar-pro | sonar-reasoning-pro | sonar-deep-research (default: sonar)
 *   --max-tokens N         Cap output tokens (<=500 also enables a concise system prompt)
 *   --context-size <size>  low | medium | high — web_search_options.search_context_size (default: medium)
 *   --recency <window>     day | week | month | year — search recency filter
 *   --domains d1,d2        Restrict search to these domains
 *   --format <fmt>         json | text (default: json)
 *   --help                 Show this help message
 */

import { getKey, missingKeyMessage } from "./_env";
import { formatOutput, formatError } from "./_format";
import type { SearchResult, ResultItem, OutputFormat } from "./_types";

const VALID_MODELS = [
  "sonar",
  "sonar-pro",
  "sonar-reasoning-pro",
  "sonar-deep-research",
] as const;
type PerplexityModel = (typeof VALID_MODELS)[number];

const COST_ESTIMATES: Record<PerplexityModel, string> = {
  sonar: "$0.01",
  "sonar-pro": "$0.02",
  "sonar-reasoning-pro": "$0.03",
  "sonar-deep-research": "$0.05-0.15",
};

const VALID_CONTEXT_SIZES = ["low", "medium", "high"] as const;
type ContextSize = (typeof VALID_CONTEXT_SIZES)[number];

const HELP = `Perplexity Search Provider

Usage: bun perplexity.ts "<query>" [options]

Options:
  --model <model>        Model to use (default: sonar)
                         sonar | sonar-pro | sonar-reasoning-pro | sonar-deep-research
  --max-tokens N         Cap output tokens (<=500 also enables a concise system prompt)
  --context-size <size>  low | medium | high (default: medium)
  --recency <window>     day | week | month | year
  --domains d1,d2        Restrict search to these domains
  --format <fmt>         Output format: json | text (default: json)
  --help                 Show this help message

Examples:
  bun perplexity.ts "latest AI news"
  bun perplexity.ts "quantum computing breakthroughs" --model sonar-pro
  bun perplexity.ts "quick fact" --max-tokens 500 --context-size low
  bun perplexity.ts "React vs Vue comparison" --format text`;

function parseArgs(): {
  query: string;
  model: PerplexityModel;
  maxTokens?: number;
  contextSize: ContextSize;
  recency?: string;
  domains?: string[];
  format: OutputFormat;
} {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.length === 0) {
    console.log(HELP);
    process.exit(0);
  }

  let model: PerplexityModel = "sonar";
  let maxTokens: number | undefined;
  let contextSize: ContextSize = "medium";
  let recency: string | undefined;
  let domains: string[] | undefined;
  let format: OutputFormat = "json";
  let query = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--model" && i + 1 < args.length) {
      const m = args[++i];
      if (!VALID_MODELS.includes(m as PerplexityModel)) {
        console.error(
          formatError(
            "perplexity",
            `Invalid model: ${m}. Valid: ${VALID_MODELS.join(", ")}`,
          ),
        );
        process.exit(1);
      }
      model = m as PerplexityModel;
    } else if (args[i] === "--max-tokens" && i + 1 < args.length) {
      maxTokens = parseInt(args[++i], 10);
      if (isNaN(maxTokens) || maxTokens < 1) {
        console.error(
          formatError(
            "perplexity",
            "Invalid max-tokens: must be a positive integer.",
          ),
        );
        process.exit(1);
      }
    } else if (args[i] === "--context-size" && i + 1 < args.length) {
      const c = args[++i];
      if (!VALID_CONTEXT_SIZES.includes(c as ContextSize)) {
        console.error(
          formatError(
            "perplexity",
            `Invalid context-size: ${c}. Valid: ${VALID_CONTEXT_SIZES.join(", ")}`,
          ),
        );
        process.exit(1);
      }
      contextSize = c as ContextSize;
    } else if (args[i] === "--recency" && i + 1 < args.length) {
      recency = args[++i];
    } else if (args[i] === "--domains" && i + 1 < args.length) {
      domains = args[++i]
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);
    } else if (args[i] === "--format" && i + 1 < args.length) {
      const f = args[++i];
      if (f !== "json" && f !== "text") {
        console.error(
          formatError("perplexity", `Invalid format: ${f}. Valid: json, text`),
        );
        process.exit(1);
      }
      format = f;
    } else if (!args[i].startsWith("--")) {
      query = args[i];
    }
  }

  if (!query) {
    console.error(
      formatError(
        "perplexity",
        'No query provided. Usage: bun perplexity.ts "<query>"',
      ),
    );
    process.exit(1);
  }

  return { query, model, maxTokens, contextSize, recency, domains, format };
}

interface SearchOpts {
  query: string;
  model: PerplexityModel;
  maxTokens?: number;
  contextSize: ContextSize;
  recency?: string;
  domains?: string[];
}

async function search(opts: SearchOpts): Promise<SearchResult> {
  const { query, model } = opts;
  const apiKey = getKey("perplexity");
  if (!apiKey) {
    throw new Error(missingKeyMessage("perplexity"));
  }

  const startTime = Date.now();

  // System message is generation-side only (retrieval sees only the user message).
  // Never prepend instructions to the user message — it pollutes retrieval.
  const messages: { role: string; content: string }[] = [];
  if (opts.maxTokens !== undefined && opts.maxTokens <= 500) {
    messages.push({
      role: "system",
      content:
        "Answer concisely in under 150 words. Cite sources inline by domain, e.g. (reuters.com). No preamble.",
    });
  }
  messages.push({ role: "user", content: query });

  const body: Record<string, any> = {
    model,
    messages,
    // Always explicit: the API default is undocumented
    web_search_options: { search_context_size: opts.contextSize },
  };
  if (opts.maxTokens !== undefined) body.max_tokens = opts.maxTokens;
  if (opts.recency) body.search_recency_filter = opts.recency;
  if (opts.domains?.length) body.search_domain_filter = opts.domains;

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Perplexity API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const durationMs = Date.now() - startTime;

  const answer: string = data.choices?.[0]?.message?.content ?? "";
  const citations: string[] = data.citations ?? [];
  const searchResults: any[] = data.search_results ?? [];

  // Primary source: search_results carries real titles, snippets, and dates.
  // citations (deprecated May 2025) kept only as a fallback for older responses.
  let results: ResultItem[];
  if (searchResults.length > 0) {
    results = searchResults.map((r: any) => ({
      title: r.title || "",
      url: r.url || "",
      snippet: r.snippet || undefined,
      published_date: r.date || r.last_updated || undefined,
    }));
  } else {
    results = citations.map((url: string) => {
      let title = url;
      try {
        title = new URL(url).hostname.replace(/^www\./, "");
      } catch {}
      return { title, url };
    });
  }

  const totalCost = data.usage?.cost?.total_cost;

  return {
    provider: "perplexity",
    query,
    results,
    citations,
    answer,
    metadata: {
      provider: "perplexity",
      model,
      cost_estimate: COST_ESTIMATES[model],
      cost_actual: typeof totalCost === "number" ? `$${totalCost}` : undefined,
      duration_ms: durationMs,
      result_count: results.length,
    },
  };
}

async function main() {
  const { format, ...searchOpts } = parseArgs();

  try {
    const result = await search(searchOpts);
    console.log(formatOutput(result, format));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(formatError("perplexity", message));
    process.exit(1);
  }
}

main();
