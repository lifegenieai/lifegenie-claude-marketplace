/**
 * _format.ts - Output formatting for search-hub results
 */

import type { SearchResult, MultiSearchResult, OutputFormat } from "./_types";

export function formatOutput(result: SearchResult, format: OutputFormat): string {
  if (format === "json") {
    return JSON.stringify(result, null, 2);
  }
  return formatText(result);
}

function formatText(result: SearchResult): string {
  const lines: string[] = [];

  lines.push(`Provider: ${result.provider}`);
  lines.push(`Query: ${result.query}`);
  lines.push(`Results: ${result.metadata.result_count} (${result.metadata.duration_ms}ms)`);
  if (result.metadata.cost_estimate) {
    lines.push(`Cost: ~${result.metadata.cost_estimate}`);
  }
  lines.push("");

  if (result.answer) {
    lines.push("--- Answer ---");
    lines.push(result.answer);
    lines.push("");
  }

  if (result.citations && result.citations.length > 0) {
    lines.push("--- Citations ---");
    result.citations.forEach((c, i) => lines.push(`[${i + 1}] ${c}`));
    lines.push("");
  }

  if (result.results.length > 0) {
    lines.push("--- Results ---");
    for (const item of result.results) {
      lines.push(`# ${item.title}`);
      lines.push(`  ${item.url}`);
      if (item.snippet) lines.push(`  ${item.snippet}`);
      if (item.published_date) lines.push(`  Published: ${item.published_date}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}

export function formatMultiOutput(result: MultiSearchResult, format: OutputFormat): string {
  if (format === "json") {
    return JSON.stringify(result, null, 2);
  }
  return formatMultiText(result);
}

function formatMultiText(result: MultiSearchResult): string {
  const lines: string[] = [];

  lines.push(`Multi-Source Search: "${result.query}"`);
  lines.push(`Providers: ${result.metadata.providers_succeeded.join(", ")} (${result.metadata.total_duration_ms}ms)`);
  if (result.metadata.providers_failed.length > 0) {
    lines.push(`Failed: ${result.metadata.providers_failed.join(", ")}`);
  }
  lines.push("");

  for (const pr of result.provider_results) {
    const providerName = pr.provider.charAt(0).toUpperCase() + pr.provider.slice(1);
    lines.push(`════════════════════════════════════════`);
    lines.push(`  ${providerName}  (${pr.metadata.duration_ms}ms, ${pr.metadata.result_count} results)`);
    lines.push(`════════════════════════════════════════`);
    lines.push("");

    if (pr.answer) {
      lines.push(pr.answer);
      lines.push("");
    }

    if (pr.citations && pr.citations.length > 0) {
      lines.push("Sources:");
      pr.citations.forEach((c, i) => lines.push(`  [${i + 1}] ${c}`));
      lines.push("");
    }

    if (pr.results.length > 0 && !pr.answer) {
      for (const item of pr.results) {
        lines.push(`  • ${item.title}`);
        lines.push(`    ${item.url}`);
        if (item.snippet) lines.push(`    ${item.snippet}`);
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}

export function formatError(provider: string, error: string): string {
  return JSON.stringify({ error: true, provider, message: error }, null, 2);
}
