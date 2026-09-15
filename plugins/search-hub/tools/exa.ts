#!/usr/bin/env bun
/**
 * exa.ts - Exa Semantic Search API provider for search-hub
 *
 * Usage: bun exa.ts "<query>" [options]
 *
 * Options:
 *   --type instant|fast|auto|deep-lite|deep|deep-reasoning  Search type (default: auto)
 *   --max-results N                       Number of results (default: 5)
 *   --category news|people|company|"research paper"|"personal site"|"financial report"  Category filter
 *   --content text|highlights             Content type (default: text)
 *   --max-chars N                         Max characters of content per result (default: 4000)
 *   --summary                             Add provider-side query-aware summary per result (+$0.001/page)
 *   --domain-include d1,d2               Include only these domains (comma-separated)
 *   --domain-exclude d1,d2               Exclude these domains (comma-separated)
 *   --answer                              Use /answer endpoint instead of /search
 *   --format json|text                    Output format (default: json)
 *   --help                                Show this help message
 *
 * Cost: ~$0.005-0.007 per query (actual reported in metadata.cost_actual)
 */

import { getKey, missingKeyMessage } from "./_env";
import { formatOutput, formatError } from "./_format";
import type { SearchResult, ResultItem, OutputFormat } from "./_types";

const PROVIDER = "exa";
const SEARCH_URL = "https://api.exa.ai/search";
const ANSWER_URL = "https://api.exa.ai/answer";

type SearchType =
  | "instant"
  | "fast"
  | "auto"
  | "deep-lite"
  | "deep"
  | "deep-reasoning";
type ContentType = "text" | "highlights";
type Category =
  | "news"
  | "people"
  | "company"
  | "research paper"
  | "personal site"
  | "financial report";

interface ParsedArgs {
  query: string;
  type: SearchType;
  maxResults: number;
  category?: Category;
  content: ContentType;
  maxChars?: number;
  summary: boolean;
  domainInclude?: string[];
  domainExclude?: string[];
  answer: boolean;
  format: OutputFormat;
}

function showHelp(): void {
  console.log(`Exa Semantic Search Provider

Usage: bun exa.ts "<query>" [options]

Options:
  --type <type>                         Search type (default: auto)
           instant|fast|auto|deep-lite|deep|deep-reasoning
  --max-results N                       Number of results (default: 5)
  --category <cat>                      Category filter (optional)
           news|people|company|"research paper"|"personal site"|"financial report"
  --content text|highlights             Content type (default: text)
  --max-chars N                         Max content chars per result (default: 4000)
  --summary                             Add query-aware summary per result (+$0.001/page)
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
  instant         Cheapest, lowest latency
  fast            Fast, basic depth
  auto            Balanced relevance & speed (default)
  deep-lite       Lighter research pass
  deep            Thorough research results
  deep-reasoning  Complex multi-step reasoning

Cost: ~$0.005-0.007 per query (actual reported in metadata.cost_actual)`);
}

const VALID_TYPES = new Set([
  "instant",
  "fast",
  "auto",
  "deep-lite",
  "deep",
  "deep-reasoning",
]);
const VALID_CATEGORIES = new Set([
  "news",
  "people",
  "company",
  "research paper",
  "personal site",
  "financial report",
]);

function parseArgs(args: string[]): ParsedArgs {
  let query = "";
  let type: SearchType = "auto";
  let maxResults = 5;
  let category: Category | undefined;
  let content: ContentType = "text";
  let maxChars: number | undefined;
  let summary = false;
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
        console.error(
          formatError(
            PROVIDER,
            `Invalid type: ${val}. Use instant|fast|auto|deep-lite|deep|deep-reasoning.`,
          ),
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
    } else if (arg === "--category" && i + 1 < args.length) {
      const val = args[++i];
      if (VALID_CATEGORIES.has(val)) category = val as Category;
      else {
        console.error(
          formatError(
            PROVIDER,
            `Invalid category: ${val}. Use news|people|company|"research paper"|"personal site"|"financial report".`,
          ),
        );
        process.exit(1);
      }
    } else if (arg === "--content" && i + 1 < args.length) {
      const val = args[++i];
      if (val === "text" || val === "highlights") content = val;
      else {
        console.error(
          formatError(
            PROVIDER,
            `Invalid content: ${val}. Use 'text' or 'highlights'.`,
          ),
        );
        process.exit(1);
      }
    } else if (arg === "--max-chars" && i + 1 < args.length) {
      maxChars = parseInt(args[++i], 10);
      if (isNaN(maxChars) || maxChars < 1) {
        console.error(
          formatError(
            PROVIDER,
            "Invalid max-chars: must be a positive integer.",
          ),
        );
        process.exit(1);
      }
    } else if (arg === "--domain-include" && i + 1 < args.length) {
      domainInclude = args[++i]
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);
    } else if (arg === "--domain-exclude" && i + 1 < args.length) {
      domainExclude = args[++i]
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);
    } else if (arg === "--answer") {
      answer = true;
    } else if (arg === "--summary") {
      summary = true;
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
    type,
    maxResults,
    category,
    content,
    maxChars,
    summary,
    domainInclude,
    domainExclude,
    answer,
    format,
  };
}

async function searchExa(
  opts: Omit<ParsedArgs, "format">,
): Promise<SearchResult> {
  const apiKey = getKey("exa");
  if (!apiKey) {
    throw new Error(missingKeyMessage("exa"));
  }

  const start = performance.now();

  if (opts.answer) {
    return await answerQuery(apiKey, opts.query, start);
  }

  const maxChars = opts.maxChars ?? 4000;
  const contents: Record<string, any> = {};
  if (opts.content === "highlights") {
    // Query-aware extraction: verbatim excerpts most relevant to the query
    contents.highlights = { max_characters: maxChars, query: opts.query };
  } else {
    contents.text = { max_characters: maxChars };
  }
  if (opts.summary) {
    // Provider-side query-aware summary (+$0.001/page); supplements highlights
    contents.summary = { query: opts.query };
  }

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
    summary: r.summary || undefined,
    score: r.score || undefined,
    published_date: r.publishedDate || undefined,
  }));

  const costTotal = data.costDollars?.total;

  return {
    provider: PROVIDER,
    query: opts.query,
    results,
    metadata: {
      provider: PROVIDER,
      cost_estimate: "~$0.005",
      cost_actual: typeof costTotal === "number" ? `$${costTotal}` : undefined,
      duration_ms: duration,
      result_count: results.length,
    },
  };
}

async function answerQuery(
  apiKey: string,
  query: string,
  start: number,
): Promise<SearchResult> {
  const response = await fetch(ANSWER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      query,
      // Citations still carry title+URL; full page text is dead weight
      text: false,
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
  const costTotal = data.costDollars?.total;

  return {
    provider: PROVIDER,
    query,
    results,
    answer: data.answer || undefined,
    citations: citations.length > 0 ? citations : undefined,
    metadata: {
      provider: PROVIDER,
      cost_estimate: "~$0.005",
      cost_actual: typeof costTotal === "number" ? `$${costTotal}` : undefined,
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
      formatError(PROVIDER, 'No query provided. Usage: bun exa.ts "<query>"'),
    );
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
