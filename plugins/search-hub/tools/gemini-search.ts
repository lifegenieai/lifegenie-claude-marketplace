#!/usr/bin/env bun
/**
 * gemini-search.ts - Gemini grounded search via direct generateContent API
 *
 * One POST to models/<model>:generateContent with the google_search tool.
 * Auth: GEMINI_API_KEY (resolved by _env.ts). No CLI dependency.
 *
 * Sources come from groundingMetadata.groundingChunks; their redirect URIs
 * (vertexaisearch.cloud.google.com) expire within days, so they are resolved
 * to real URLs via parallel HEAD requests at search time.
 */

import { getKey, missingKeyMessage } from "./_env";
import { formatOutput, formatError } from "./_format";
import type { SearchResult, OutputFormat, ResultItem } from "./_types";

const PROVIDER = "gemini";
// Pinned: gemini-flash-latest measured 13.7s and drifts silently;
// gemini-3.5-flash measured 4.3s with 6 grounding chunks (live, 2026-07-09).
const DEFAULT_MODEL = "gemini-3.5-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const HELP = `
gemini-search - Grounded web search via Gemini generateContent API

Usage:
  bun gemini-search.ts "<query>" [options]

Options:
  --model <model>       Gemini model (default: ${DEFAULT_MODEL})
  --max-tokens N        Cap output tokens (<=800 also enables a concise system instruction)
  --thinking <level>    minimal | low | high (default: minimal)
  --format json|text    Output format (default: json)
  --max-results N       Cap on returned sources (default: 10)
  --help                Show this help message

Examples:
  bun gemini-search.ts "latest news about TypeScript"
  bun gemini-search.ts "current Bitcoin price" --format text
`.trim();

const VALID_THINKING = ["minimal", "low", "high"] as const;
type ThinkingLevel = (typeof VALID_THINKING)[number];

function parseArgs(): {
  query: string;
  model: string;
  format: OutputFormat;
  maxResults: number;
  maxTokens?: number;
  thinking: ThinkingLevel;
} {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    console.log(HELP);
    process.exit(0);
  }

  let format: OutputFormat = "json";
  let maxResults = 10;
  let maxTokens: number | undefined;
  let thinking: ThinkingLevel = "minimal";
  let model = DEFAULT_MODEL;
  let query = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--format" && args[i + 1]) {
      format = args[++i] as OutputFormat;
    } else if (args[i] === "--max-results" && args[i + 1]) {
      maxResults = parseInt(args[++i], 10);
    } else if (args[i] === "--max-tokens" && args[i + 1]) {
      maxTokens = parseInt(args[++i], 10);
    } else if (args[i] === "--thinking" && args[i + 1]) {
      const t = args[++i];
      if (!VALID_THINKING.includes(t as ThinkingLevel)) {
        console.error(
          formatError(
            PROVIDER,
            `Invalid thinking level: ${t}. Use ${VALID_THINKING.join("|")}.`,
          ),
        );
        process.exit(1);
      }
      thinking = t as ThinkingLevel;
    } else if (args[i] === "--model" && args[i + 1]) {
      model = args[++i];
    } else if (!args[i].startsWith("--")) {
      query = args[i];
    }
  }

  if (!query) {
    console.error(
      formatError(PROVIDER, "No query provided. Use --help for usage."),
    );
    process.exit(1);
  }

  return { query, model, format, maxResults, maxTokens, thinking };
}

/** Resolve a grounding redirect URI to its real URL via HEAD; fall back to the redirect URI */
async function resolveRedirect(uri: string): Promise<string> {
  try {
    const res = await fetch(uri, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(3000),
    });
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) return location;
  } catch {
    // resolution failure → keep redirect URI
  }
  return uri;
}

async function search(
  query: string,
  model: string,
  maxTokens: number | undefined,
  thinking: ThinkingLevel,
): Promise<{
  answer: string;
  sources: { title: string; url: string }[];
  webSearchQueries: string[];
  grounded: boolean;
  durationMs: number;
}> {
  const apiKey = getKey(PROVIDER);
  if (!apiKey) {
    throw new Error(missingKeyMessage("gemini"));
  }

  const startTime = Date.now();

  const generationConfig: Record<string, any> = {
    thinkingConfig: { thinkingLevel: thinking },
  };
  if (maxTokens !== undefined) generationConfig.maxOutputTokens = maxTokens;

  const body: Record<string, any> = {
    contents: [{ parts: [{ text: query }] }],
    tools: [{ google_search: {} }],
    generationConfig,
  };
  // Small caps signal lean mode: instruct conciseness so the cap never
  // truncates mid-answer. Generation-side only; grounding sees the raw query.
  if (maxTokens !== undefined && maxTokens <= 800) {
    body.systemInstruction = {
      parts: [
        {
          text: "Answer concisely in under 150 words. Lead with the key facts. No preamble.",
        },
      ],
    };
  }

  const res = await fetch(`${API_BASE}/${model}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const answer = (candidate?.content?.parts ?? [])
    .map((p: any) => p.text ?? "")
    .join("");

  const grounding = candidate?.groundingMetadata;
  const chunks: any[] = grounding?.groundingChunks ?? [];
  const webSearchQueries: string[] = grounding?.webSearchQueries ?? [];
  const grounded = chunks.length > 0;

  // Grounding chunk URIs are expiring redirects; resolve them in parallel
  const rawSources = chunks
    .map((c) => c.web)
    .filter((w: any) => w?.uri)
    .map((w: any) => ({ title: w.title || "", uri: w.uri as string }));

  const resolvedUrls = await Promise.all(
    rawSources.map((s) => resolveRedirect(s.uri)),
  );

  const seen = new Set<string>();
  const sources: { title: string; url: string }[] = [];
  for (let i = 0; i < rawSources.length; i++) {
    const url = resolvedUrls[i];
    if (seen.has(url)) continue;
    seen.add(url);
    sources.push({ title: rawSources[i].title, url });
  }

  return {
    answer,
    sources,
    webSearchQueries,
    grounded,
    durationMs: Date.now() - startTime,
  };
}

async function main() {
  const { query, model, format, maxResults, maxTokens, thinking } =
    parseArgs();

  try {
    const { answer, sources, webSearchQueries, grounded, durationMs } =
      await search(query, model, maxTokens, thinking);

    if (!grounded) {
      console.error(
        "[search-hub:gemini] WARNING: no grounding chunks returned. Response may be from training data only.",
      );
    }

    const results: ResultItem[] = sources
      .slice(0, maxResults)
      .map((s) => ({ title: s.title, url: s.url }));
    const citations = results.map((r) => r.url);

    const searchResult: SearchResult = {
      provider: PROVIDER,
      query,
      results,
      citations,
      answer: grounded
        ? answer
        : `[WARNING: Response may be from training data, not web search]\n\n${answer}`,
      metadata: {
        provider: PROVIDER,
        model,
        cost_estimate: "free tier grounding allowance",
        duration_ms: durationMs,
        result_count: results.length,
        web_search_queries:
          webSearchQueries.length > 0 ? webSearchQueries : undefined,
      },
    };

    console.log(formatOutput(searchResult, format));
  } catch (err: any) {
    console.error(formatError(PROVIDER, err.message || String(err)));
    process.exit(1);
  }
}

main();
