#!/usr/bin/env bun
/**
 * gemini-search.ts - Gemini CLI grounded search wrapper
 *
 * Uses the `gemini` CLI with Google Search grounding (automatic via google_web_search tool).
 * Auth: OAuth personal auth (no API key needed).
 */

import type { SearchResult, OutputFormat, ResultItem } from "./_types";
import { formatOutput, formatError } from "./_format";

const HELP = `
gemini-search - Grounded web search via Gemini CLI

Usage:
  bun gemini-search.ts "<query>" [options]

Options:
  --format json|text    Output format (default: json)
  --max-results N       Noted but not directly supported by Gemini CLI
  --help                Show this help message

Examples:
  bun gemini-search.ts "latest news about TypeScript"
  bun gemini-search.ts "current Bitcoin price" --format text
`.trim();

function parseArgs(): { query: string; format: OutputFormat; maxResults: number } {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    console.log(HELP);
    process.exit(0);
  }

  let format: OutputFormat = "json";
  let maxResults = 10;
  let query = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--format" && args[i + 1]) {
      format = args[++i] as OutputFormat;
    } else if (args[i] === "--max-results" && args[i + 1]) {
      maxResults = parseInt(args[++i], 10);
    } else if (!args[i].startsWith("--")) {
      query = args[i];
    }
  }

  if (!query) {
    console.error(formatError("gemini", "No query provided. Use --help for usage."));
    process.exit(1);
  }

  return { query, format, maxResults };
}

/** Extract markdown links [title](url) and bare URLs from text */
function extractSources(text: string): { title: string; url: string }[] {
  const sources: { title: string; url: string }[] = [];
  const seen = new Set<string>();

  // First: extract markdown-style links [title](url)
  const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let match;
  while ((match = mdLinkRegex.exec(text)) !== null) {
    const [, title, url] = match;
    if (!seen.has(url)) {
      seen.add(url);
      sources.push({ title, url });
    }
  }

  // Then: extract any bare URLs not already captured
  const bareUrlRegex = /https?:\/\/[^\s)>\]"']+/g;
  while ((match = bareUrlRegex.exec(text)) !== null) {
    const url = match[0];
    if (!seen.has(url)) {
      seen.add(url);
      // Derive a title from the hostname
      try {
        const hostname = new URL(url).hostname.replace(/^www\./, "");
        sources.push({ title: hostname, url });
      } catch {
        sources.push({ title: url, url });
      }
    }
  }

  return sources;
}

async function search(query: string): Promise<{ response: string; durationMs: number; model?: string; grounded: boolean }> {
  const startTime = Date.now();

  const proc = Bun.spawn(
    ["gemini", "--yolo", "-m", "gemini-3-flash-preview", "--allowed-tools", "google_web_search", "-o", "json", `You MUST use the google_web_search tool to search the web before answering. Do NOT answer from memory or training data. ALWAYS include your sources as a list of URLs at the end of your response. Search the web for: ${query}`],
    {
      stdin: "ignore",
      stdout: "pipe",
      stderr: "pipe",
    }
  );

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();

  const exitCode = await proc.exited;
  const durationMs = Date.now() - startTime;

  if (exitCode !== 0) {
    throw new Error(`gemini CLI exited with code ${exitCode}: ${stderr || stdout}`);
  }

  // Parse JSON output (skip any non-JSON preamble like "Loaded cached credentials.")
  let parsed: any;
  const jsonStart = stdout.indexOf("{");
  if (jsonStart === -1) {
    // Fallback: treat entire output as plain text response
    return { response: stdout.trim(), durationMs, grounded: false };
  }

  try {
    parsed = JSON.parse(stdout.slice(jsonStart));
  } catch {
    // If JSON parsing fails, use raw text
    return { response: stdout.trim(), durationMs, grounded: false };
  }

  // Extract model info from stats
  const models = parsed.stats?.models ? Object.keys(parsed.stats.models) : [];
  const primaryModel = models.find((m: string) => m.includes("pro") || m.includes("flash")) || models[0];

  // Verify web search was actually performed
  const webSearchCalls = parsed.stats?.tools?.byName?.google_web_search?.count ?? 0;
  if (webSearchCalls === 0) {
    console.error("[search-hub:gemini] WARNING: google_web_search was NOT called. Response may be from training data only.");
  }

  return {
    response: parsed.response || stdout.trim(),
    durationMs,
    model: primaryModel,
    grounded: webSearchCalls > 0,
  };
}

async function main() {
  const { query, format, maxResults } = parseArgs();

  try {
    const { response, durationMs, model, grounded } = await search(query);

    // Extract sources from the response (markdown links and bare URLs)
    const sources = extractSources(response);

    const citations = sources.map((s) => s.url);
    const results: ResultItem[] = sources.map((s) => ({
      title: s.title,
      url: s.url,
    }));

    const searchResult: SearchResult = {
      provider: "gemini",
      query,
      results: results.slice(0, maxResults),
      citations,
      answer: grounded ? response : `[WARNING: Response may be from training data, not web search]\n\n${response}`,
      metadata: {
        provider: "gemini",
        model: model || "unknown",
        cost_estimate: "$0.00 (OAuth subscription)",
        duration_ms: durationMs,
        result_count: results.length,
      },
    };

    console.log(formatOutput(searchResult, format));
  } catch (err: any) {
    console.error(formatError("gemini", err.message || String(err)));
    process.exit(1);
  }
}

main();
