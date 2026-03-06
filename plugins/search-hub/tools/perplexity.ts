#!/usr/bin/env bun
/**
 * perplexity.ts - Perplexity AI search provider for search-hub
 *
 * Usage: bun perplexity.ts "<query>" [options]
 *
 * Options:
 *   --model <model>   sonar | sonar-pro | sonar-reasoning-pro | sonar-deep-research (default: sonar)
 *   --format <fmt>    json | text (default: json)
 *   --help            Show this help message
 */

import { getKey } from "./_env";
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

const HELP = `Perplexity Search Provider

Usage: bun perplexity.ts "<query>" [options]

Options:
  --model <model>   Model to use (default: sonar)
                    sonar | sonar-pro | sonar-reasoning-pro | sonar-deep-research
  --format <fmt>    Output format: json | text (default: json)
  --help            Show this help message

Examples:
  bun perplexity.ts "latest AI news"
  bun perplexity.ts "quantum computing breakthroughs" --model sonar-pro
  bun perplexity.ts "React vs Vue comparison" --format text`;

function parseArgs(): { query: string; model: PerplexityModel; format: OutputFormat } {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.length === 0) {
    console.log(HELP);
    process.exit(0);
  }

  let model: PerplexityModel = "sonar";
  let format: OutputFormat = "json";
  let query = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--model" && i + 1 < args.length) {
      const m = args[++i];
      if (!VALID_MODELS.includes(m as PerplexityModel)) {
        console.error(formatError("perplexity", `Invalid model: ${m}. Valid: ${VALID_MODELS.join(", ")}`));
        process.exit(1);
      }
      model = m as PerplexityModel;
    } else if (args[i] === "--format" && i + 1 < args.length) {
      const f = args[++i];
      if (f !== "json" && f !== "text") {
        console.error(formatError("perplexity", `Invalid format: ${f}. Valid: json, text`));
        process.exit(1);
      }
      format = f;
    } else if (!args[i].startsWith("--")) {
      query = args[i];
    }
  }

  if (!query) {
    console.error(formatError("perplexity", "No query provided. Usage: bun perplexity.ts \"<query>\""));
    process.exit(1);
  }

  return { query, model, format };
}

async function search(query: string, model: PerplexityModel): Promise<SearchResult> {
  const apiKey = getKey("perplexity");
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY not set. Add it to ~/.claude/.env");
  }

  const startTime = Date.now();

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: query }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Perplexity API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const durationMs = Date.now() - startTime;

  const answer: string = data.choices?.[0]?.message?.content ?? "";
  const citations: string[] = data.citations ?? [];

  // Build result items from citations
  const results: ResultItem[] = citations.map((url: string, i: number) => ({
    title: `Citation ${i + 1}`,
    url,
  }));

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
      duration_ms: durationMs,
      result_count: results.length,
    },
  };
}

async function main() {
  const { query, model, format } = parseArgs();

  try {
    const result = await search(query, model);
    console.log(formatOutput(result, format));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(formatError("perplexity", message));
    process.exit(1);
  }
}

main();
