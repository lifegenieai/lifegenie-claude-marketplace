/**
 * _format.ts - Output formatting for search-hub results
 */

import type { SearchResult, MultiSearchResult, OutputFormat } from "./_types";

export function formatOutput(
  result: SearchResult,
  format: OutputFormat,
): string {
  if (format === "json") {
    return JSON.stringify(result, null, 2);
  }
  return formatText(result);
}

function formatText(result: SearchResult): string {
  const lines: string[] = [];

  lines.push(`Provider: ${result.provider}`);
  lines.push(`Query: ${result.query}`);
  lines.push(
    `Results: ${result.metadata.result_count} (${result.metadata.duration_ms}ms)`,
  );
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
      if (item.published_date)
        lines.push(`  Published: ${item.published_date}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}

export function formatMultiOutput(
  result: MultiSearchResult,
  format: OutputFormat,
): string {
  if (format === "json") {
    return JSON.stringify(result, null, 2);
  }
  if (format === "digest") {
    return formatDigest(result);
  }
  return formatMultiText(result);
}

const DIGEST_SNIPPET_MAX = 200;
const DIGEST_RESULTS_MAX = 5;

/**
 * Dense multi-mode digest: verbatim answers, compact result lines, mechanical
 * consensus table, run-file footer. Answers are reproduced verbatim, never
 * summarized — the SKILL.md evidence rule holds at the tool layer.
 */
export function formatDigest(result: MultiSearchResult): string {
  const lines: string[] = [];
  const m = result.metadata;

  lines.push(`# Multi-Source Search: "${result.query}"`);
  const costLabel = m.total_cost_actual ? ` · cost ${m.total_cost_actual}` : "";
  lines.push(
    `${m.providers_succeeded.length}/${m.providers_queried.length} providers · ${(m.total_duration_ms / 1000).toFixed(1)}s · ${m.total_results} results${costLabel}`,
  );
  lines.push("");

  for (const pr of result.provider_results) {
    const name = pr.provider.charAt(0).toUpperCase() + pr.provider.slice(1);
    const model = pr.metadata.model ? ` ${pr.metadata.model}` : "";
    lines.push(
      `## ${name}${model} (${(pr.metadata.duration_ms / 1000).toFixed(1)}s, ${pr.metadata.result_count} results)`,
    );

    if (pr.answer) {
      lines.push(pr.answer.trim());
    }

    const items = pr.results.slice(0, DIGEST_RESULTS_MAX);
    if (items.length > 0) {
      if (pr.answer) lines.push("Sources:");
      for (const item of items) {
        let line = `- ${item.title || "(untitled)"} — ${item.url}`;
        if (item.snippet) {
          const snip =
            item.snippet.length > DIGEST_SNIPPET_MAX
              ? item.snippet.slice(0, DIGEST_SNIPPET_MAX) + "…"
              : item.snippet;
          line += ` — ${snip.replace(/\s+/g, " ")}`;
        }
        lines.push(line);
      }
    }
    lines.push("");
  }

  lines.push("## Consensus (URLs found by 2+ providers)");
  const consensus = m.consensus ?? [];
  if (consensus.length === 0) {
    lines.push("No URL was surfaced by more than one provider.");
  } else {
    for (const c of consensus) {
      lines.push(
        `- ${c.url} — ${c.title || "(untitled)"} [${c.providers.join(", ")}]`,
      );
    }
  }
  lines.push("");

  if (m.providers_failed.length > 0) {
    lines.push("## Failed Providers");
    for (const err of m.provider_errors ?? []) {
      lines.push(`- ${err.provider}: ${err.message}`);
    }
    lines.push("");
  }

  if (m.run_file) {
    lines.push(`Full payload: ${m.run_file}`);
  }

  return lines.join("\n");
}

function formatMultiText(result: MultiSearchResult): string {
  const lines: string[] = [];

  lines.push(`Multi-Source Search: "${result.query}"`);
  lines.push(
    `Providers: ${result.metadata.providers_succeeded.join(", ")} (${result.metadata.total_duration_ms}ms)`,
  );
  if (result.metadata.providers_failed.length > 0) {
    lines.push(`Failed: ${result.metadata.providers_failed.join(", ")}`);
    for (const err of result.metadata.provider_errors ?? []) {
      lines.push(`  ${err.provider}: ${err.message}`);
    }
  }
  lines.push("");

  for (const pr of result.provider_results) {
    const providerName =
      pr.provider.charAt(0).toUpperCase() + pr.provider.slice(1);
    lines.push(`════════════════════════════════════════`);
    lines.push(
      `  ${providerName}  (${pr.metadata.duration_ms}ms, ${pr.metadata.result_count} results)`,
    );
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
