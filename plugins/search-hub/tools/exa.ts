#!/usr/bin/env bun
/**
 * exa.ts - Exa Semantic Search API provider for search-hub
 *
 * Usage: bun exa.ts "<query>" [options]
 *
 * Options:
 *   --type fast|auto|deep|deep-reasoning  Search type (default: auto)
 *   --max-results N                       Number of results (default: 5)
 *   --category news|people|company|"research paper"|tweet  Category filter (optional)
 *   --content text|highlights             Content type (default: text, max 20000 chars)
 *   --domain-include d1,d2               Include only these domains (comma-separated)
 *   --domain-exclude d1,d2               Exclude these domains (comma-separated)
 *   --answer                              Use /answer endpoint instead of /search
 *   --format json|text                    Output format (default: json)
 *   --help                                Show this help message
 *
 * Cost: ~$0.005 per query
 */

import { getKey } from "./_env";
import { formatOutput, formatError } from "./_format";
import type { SearchResult, ResultItem, OutputFormat } from "./_types";

const PROVIDER = "exa";
const SEARCH_URL = "https://api.exa.ai/search";
const ANSWER_URL = "https://api.exa.ai/answer";

type SearchType = "fast" | "auto" | "deep" | "deep-reasoning";
type ContentType = "text" | "highlights";
type Category = "news" | "people" | "company" | "research paper" | "tweet";

interface ParsedArgs {
  query: string;
  type: SearchType;
  maxResults: number;
  category?: Category;
  content: ContentType;
  domainInclude?: string[];
  domainExclude?: string[];
  answer: boolean;
  format: OutputFormat;
}

function showHelp(): void {
  console.log(`Exa Semantic Search Provider

Usage: bun exa.ts "<query>" [options]

Options:
  --type fast|auto|deep|deep-reasoning  Search type (default: auto)
  --max-results N                       Number of results (default: 5)
  --category <cat>                      Category filter (optional)
           news|people|company|"research paper"|tweet
  --content text|highlights             Content type (default: text)
  --domain-include d1,d2               Include only these domains
  --domain-exclude d1,d2               Exclude these domains
  --answer                              Use /answer endpoint (Q&A with citations)
  --format json|text                    Output format (default: json)
  --help                                Show this help message

Examples:
  bun exa.ts "latest developments in AI safety"
  bun exa.ts "transformer architecture" --category "research paper" --type deep
  bun exa.ts "what is WebGPU?" --answer
  bun exa.ts "AI startups" --category company --max-results 10
  bun exa.ts "arxiv papers on RLHF" --domain-include arxiv.org
  bun exa.ts "tech news" --content highlights --format text

Search Types:
  fast            Fastest, basic depth
  auto            Balanced relevance & speed (default)
  deep            Thorough research results
  deep-reasoning  Complex multi-step reasoning

Cost: ~$0.005 per query`);
}

const VALID_TYPES = new Set(["fast", "auto", "deep", "deep-reasoning"]);
const VALID_CATEGORIES = new Set(["news", "people", "company", "research paper", "tweet"]);

function parseArgs(args: string[]): ParsedArgs {
  let query = "";
  let type: SearchType = "auto";
  let maxResults = 5;
  let category: Category | undefined;
  let content: ContentType = "text";
  let domainInclude: string[] | undefined;
  let domainExclude: string[] | undefined;
  let answer = false;
  let format: OutputFormat = "json";

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === "--type" && i + 1 < args.length) {
      const val = args[++i];
      if (VALID_TYPES.has(val)) type = val as SearchType;
      else {
        console.error(formatError(PROVIDER, `Invalid type: ${val}. Use fast|auto|deep|deep-reasoning.`));
        process.exit(1);
      }
    } else if (arg === "--max-results" && i + 1 < args.length) {
      maxResults = parseInt(args[++i], 10);
      if (isNaN(maxResults) || maxResults < 1) {
        console.error(formatError(PROVIDER, "Invalid max-results: must be a positive integer."));
        process.exit(1);
      }
    } else if (arg === "--category" && i + 1 < args.length) {
      const val = args[++i];
      if (VALID_CATEGORIES.has(val)) category = val as Category;
      else {
        console.error(formatError(PROVIDER, `Invalid category: ${val}. Use news|people|company|"research paper"|tweet.`));
        process.exit(1);
      }
    } else if (arg === "--content" && i + 1 < args.length) {
      const val = args[++i];
      if (val === "text" || val === "highlights") content = val;
      else {
        console.error(formatError(PROVIDER, `Invalid content: ${val}. Use 'text' or 'highlights'.`));
        process.exit(1);
      }
    } else if (arg === "--domain-include" && i + 1 < args.length) {
      domainInclude = args[++i].split(",").map((d) => d.trim()).filter(Boolean);
    } else if (arg === "--domain-exclude" && i + 1 < args.length) {
      domainExclude = args[++i].split(",").map((d) => d.trim()).filter(Boolean);
    } else if (arg === "--answer") {
      answer = true;
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

  return { query, type, maxResults, category, content, domainInclude, domainExclude, answer, format };
}

async function searchExa(opts: Omit<ParsedArgs, "format">): Promise<SearchResult> {
  const apiKey = getKey("exa");
  if (!apiKey) {
    throw new Error("EXA_API_KEY not set. Add it to ~/.claude/.env");
  }

  const start = performance.now();

  if (opts.answer) {
    return await answerQuery(apiKey, opts.query, start);
  }

  const maxChars = opts.content === "highlights" ? 4000 : 20000;
  const contents: Record<string, any> = {
    [opts.content]: { max_characters: maxChars },
  };

  const body: Record<string, any> = {
    query: opts.query,
    type: opts.type,
    num_results: opts.maxResults,
    contents,
  };

  if (opts.category) body.category = opts.category;
  if (opts.domainInclude?.length) body.includeDomains = opts.domainInclude;
  if (opts.domainExclude?.length) body.excludeDomains = opts.domainExclude;

  const response = await fetch(SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Exa API error (${response.status}): ${text}`);
  }

  const data = await response.json();
  const duration = Math.round(performance.now() - start);

  const results: ResultItem[] = (data.results || []).map((r: any) => ({
    title: r.title || "",
    url: r.url || "",
    snippet: r.highlights?.join(" ") || r.summary || "",
    content: r.text || undefined,
    score: r.score || undefined,
    published_date: r.publishedDate || undefined,
  }));

  return {
    provider: PROVIDER,
    query: opts.query,
    results,
    metadata: {
      provider: PROVIDER,
      cost_estimate: "~$0.005",
      duration_ms: duration,
      result_count: results.length,
    },
  };
}

async function answerQuery(apiKey: string, query: string, start: number): Promise<SearchResult> {
  const response = await fetch(ANSWER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      query,
      text: true,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Exa Answer API error (${response.status}): ${text}`);
  }

  const data = await response.json();
  const duration = Math.round(performance.now() - start);

  const results: ResultItem[] = (data.citations || []).map((c: any) => ({
    title: c.title || "",
    url: c.url || "",
    snippet: c.highlights?.join(" ") || c.summary || "",
    content: c.text || undefined,
    published_date: c.publishedDate || undefined,
  }));

  const citations = results.map((r) => r.url).filter(Boolean);

  return {
    provider: PROVIDER,
    query,
    results,
    answer: data.answer || undefined,
    citations: citations.length > 0 ? citations : undefined,
    metadata: {
      provider: PROVIDER,
      cost_estimate: "~$0.005",
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
    console.error(formatError(PROVIDER, 'No query provided. Usage: bun exa.ts "<query>"'));
    process.exit(1);
  }

  try {
    const result = await searchExa(searchOpts);
    console.log(formatOutput(result, format));
  } catch (err: any) {
    console.error(formatError(PROVIDER, err.message || String(err)));
    process.exit(1);
  }
}

main();
