/**
 * _digest.ts - URL normalization, cross-provider consensus, run-file spillover
 *
 * Consensus is computed mechanically (no LLM): normalize URLs, count which
 * providers independently surfaced the same page.
 */

import {
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { homedir } from "os";
import type { MultiSearchResult, SearchResult, ConsensusEntry } from "./_types";

const RUNS_DIR = join(homedir(), ".search-hub", "runs");
const RUN_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

/** Strip protocol, www., trailing slash, query, fragment; keep host+path */
export function normalizeUrl(u: string): string {
  let s = u.trim().replace(/^https?:\/\//, "").replace(/^www\./, "");
  const cut = (ch: string) => {
    const idx = s.indexOf(ch);
    if (idx !== -1) s = s.slice(0, idx);
  };
  cut("#");
  cut("?");
  return s.replace(/\/+$/, "").toLowerCase();
}

/** Map normalized URL → providers that surfaced it, sorted by provider count desc */
export function computeConsensus(results: SearchResult[]): ConsensusEntry[] {
  const map = new Map<string, { title: string; providers: string[] }>();

  for (const pr of results) {
    for (const item of pr.results) {
      if (!item.url) continue;
      const key = normalizeUrl(item.url);
      if (!key) continue;
      let entry = map.get(key);
      if (!entry) {
        entry = { title: "", providers: [] };
        map.set(key, entry);
      }
      if (!entry.title && item.title) entry.title = item.title;
      if (!entry.providers.includes(pr.provider)) {
        entry.providers.push(pr.provider);
      }
    }
  }

  return [...map.entries()]
    .map(([url, e]) => ({ url, title: e.title, providers: e.providers }))
    .sort((a, b) => b.providers.length - a.providers.length);
}

/** Sum per-provider cost_actual strings ("$0.007", "1 credit") into one label */
export function totalCostActual(results: SearchResult[]): string | undefined {
  let dollars = 0;
  let credits = 0;
  let any = false;

  for (const pr of results) {
    const c = pr.metadata.cost_actual;
    if (!c) continue;
    const dollarMatch = c.match(/^\$([\d.]+)$/);
    const creditMatch = c.match(/^([\d.]+) credits?$/);
    if (dollarMatch) {
      dollars += parseFloat(dollarMatch[1]);
      any = true;
    } else if (creditMatch) {
      credits += parseFloat(creditMatch[1]);
      any = true;
    }
  }

  if (!any) return undefined;
  const parts: string[] = [];
  if (dollars > 0) parts.push(`$${dollars.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}`);
  if (credits > 0) parts.push(`${credits} Tavily credit${credits === 1 ? "" : "s"}`);
  return parts.join(" + ");
}

/** Write the full payload to ~/.search-hub/runs/<ISO-timestamp>-<slug>.json */
export function writeRunFile(result: MultiSearchResult): string {
  mkdirSync(RUNS_DIR, { recursive: true });
  pruneOldRuns();

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const slug =
    result.query
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "query";
  const path = join(RUNS_DIR, `${ts}-${slug}.json`);
  writeFileSync(path, JSON.stringify(result, null, 2));
  return path;
}

/** Opportunistic cleanup: drop run files older than 30 days */
function pruneOldRuns(): void {
  try {
    const cutoff = Date.now() - RUN_RETENTION_MS;
    for (const f of readdirSync(RUNS_DIR)) {
      if (!f.endsWith(".json")) continue;
      const p = join(RUNS_DIR, f);
      try {
        if (statSync(p).mtimeMs < cutoff) unlinkSync(p);
      } catch {
        // file vanished or locked — skip
      }
    }
  } catch {
    // runs dir unreadable — nothing to prune
  }
}
