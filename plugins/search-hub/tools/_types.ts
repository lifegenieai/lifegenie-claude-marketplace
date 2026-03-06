/**
 * _types.ts - Shared types for search-hub providers
 */

export interface SearchResult {
  provider: string;
  query: string;
  results: ResultItem[];
  citations?: string[];
  answer?: string;
  metadata: {
    provider: string;
    model?: string;
    cost_estimate?: string;
    duration_ms: number;
    result_count: number;
  };
}

export interface ResultItem {
  title: string;
  url: string;
  snippet?: string;
  content?: string;
  score?: number;
  published_date?: string;
}

export interface MultiSearchResult {
  query: string;
  provider_results: SearchResult[];
  metadata: {
    providers_queried: Provider[];
    providers_succeeded: Provider[];
    providers_failed: Provider[];
    total_duration_ms: number;
    total_results: number;
  };
}

export type Provider = "tavily" | "perplexity" | "gemini" | "exa";
export type OutputFormat = "json" | "text";
