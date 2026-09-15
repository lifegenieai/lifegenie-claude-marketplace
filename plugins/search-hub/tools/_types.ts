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
    cost_actual?: string;
    duration_ms: number;
    result_count: number;
    web_search_queries?: string[];
  };
}

export interface ResultItem {
  title: string;
  url: string;
  snippet?: string;
  content?: string;
  summary?: string;
  score?: number;
  published_date?: string;
}

export interface ProviderError {
  provider: Provider;
  message: string;
}

export interface ConsensusEntry {
  url: string;
  title: string;
  providers: string[];
}

export interface MultiSearchResult {
  query: string;
  provider_results: SearchResult[];
  metadata: {
    providers_queried: Provider[];
    providers_succeeded: Provider[];
    providers_failed: Provider[];
    provider_errors: ProviderError[];
    total_duration_ms: number;
    total_results: number;
    consensus?: ConsensusEntry[];
    run_file?: string;
    total_cost_actual?: string;
  };
}

export type Provider = "tavily" | "perplexity" | "gemini" | "exa";
export type OutputFormat = "json" | "text" | "digest";
