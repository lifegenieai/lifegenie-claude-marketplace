#!/bin/bash
# search-api.sh - Direct API wrapper for web search
#
# Usage: search-api.sh <service> "<query>" [output-file]
# Services: tavily, serpapi, brave, google
#
# Examples:
#   search-api.sh tavily "best practices for AI agents 2026" results.json
#   search-api.sh brave "claude code plugins" /tmp/brave-results.json
#
# Environment Variables (load from ~/.claude/.env):
#   TAVILY_API_KEY  - Tavily API key (recommended, LLM-optimized)
#   SERPAPI_KEY     - SerpAPI key (raw Google/Bing results)
#   BRAVE_API_KEY   - Brave Search API key (2000 free/month)
#   GOOGLE_API_KEY  - Google Custom Search API key
#   GOOGLE_CX       - Google Custom Search Engine ID

set -euo pipefail

# Load API keys from secure location
if [[ -f "${HOME}/.claude/.env" ]]; then
    set -a
    source "${HOME}/.claude/.env"
    set +a
fi

SERVICE="${1:-tavily}"
QUERY="${2:-}"
OUTPUT_FILE="${3:-/dev/stdout}"

# Handle check command before validation (no query needed)
if [[ "$SERVICE" == "check" ]]; then
    echo "{"
    echo "  \"configured\": {"
    [[ -n "${TAVILY_API_KEY:-}" ]] && echo "    \"tavily\": true," || echo "    \"tavily\": false,"
    [[ -n "${SERPAPI_KEY:-}" ]] && echo "    \"serpapi\": true," || echo "    \"serpapi\": false,"
    [[ -n "${BRAVE_API_KEY:-}" ]] && echo "    \"brave\": true," || echo "    \"brave\": false,"
    [[ -n "${GOOGLE_API_KEY:-}" && -n "${GOOGLE_CX:-}" ]] && echo "    \"google\": true" || echo "    \"google\": false"
    echo "  },"
    echo "  \"recommended\": \"tavily\","
    echo "  \"fallback\": \"gemini CLI (OAuth authenticated)\""
    echo "}"
    exit 0
fi

# Validation
if [[ -z "$QUERY" ]]; then
    echo '{"error": "Query is required", "usage": "search-api.sh <service> \"<query>\" [output-file]"}' >&2
    exit 1
fi

# URL-encode the query for GET requests
urlencode() {
    local string="${1}"
    local strlen=${#string}
    local encoded=""
    local pos c o

    for (( pos=0 ; pos<strlen ; pos++ )); do
        c=${string:$pos:1}
        case "$c" in
            [-_.~a-zA-Z0-9] ) o="${c}" ;;
            * ) printf -v o '%%%02x' "'$c" ;;
        esac
        encoded+="${o}"
    done
    echo "${encoded}"
}

ENCODED_QUERY=$(urlencode "$QUERY")

# Ensure output directory exists if writing to file
if [[ "$OUTPUT_FILE" != "/dev/stdout" ]]; then
    OUTPUT_DIR=$(dirname "$OUTPUT_FILE")
    mkdir -p "$OUTPUT_DIR"
fi

case "$SERVICE" in
    tavily)
        if [[ -z "${TAVILY_API_KEY:-}" ]]; then
            echo '{"error": "TAVILY_API_KEY not set", "service": "tavily", "fallback": "Set TAVILY_API_KEY in ~/.claude/.env or use gemini-research.sh"}' > "$OUTPUT_FILE"
            exit 1
        fi

        # Tavily API - LLM-optimized search results
        # Docs: https://docs.tavily.com/documentation/api-reference/introduction
        # Auth: Bearer token in header (not in JSON body)

        # Construct JSON safely with jq (escapes newlines, quotes, special chars)
        JSON_BODY=$(jq -n \
            --arg query "$QUERY" \
            '{
                query: $query,
                max_results: 10,
                include_answer: true,
                include_raw_content: false,
                search_depth: "advanced"
            }')

        curl -s --max-time 30 -X POST "https://api.tavily.com/search" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${TAVILY_API_KEY}" \
            -d "$JSON_BODY" | jq '.' > "$OUTPUT_FILE" 2>/dev/null || {
                echo "{\"error\": \"Tavily API request failed\", \"service\": \"tavily\"}" > "$OUTPUT_FILE"
                exit 1
            }
        ;;

    serpapi)
        if [[ -z "${SERPAPI_KEY:-}" ]]; then
            echo '{"error": "SERPAPI_KEY not set", "service": "serpapi", "fallback": "Set SERPAPI_KEY in ~/.claude/.env"}' > "$OUTPUT_FILE"
            exit 1
        fi

        # SerpAPI - Raw Google search results
        curl -s --max-time 30 \
            "https://serpapi.com/search.json?q=${ENCODED_QUERY}&api_key=${SERPAPI_KEY}&num=10" \
            | jq '.' > "$OUTPUT_FILE" 2>/dev/null || {
                echo "{\"error\": \"SerpAPI request failed\", \"service\": \"serpapi\", \"query\": \"${QUERY}\"}" > "$OUTPUT_FILE"
                exit 1
            }
        ;;

    brave)
        if [[ -z "${BRAVE_API_KEY:-}" ]]; then
            echo '{"error": "BRAVE_API_KEY not set", "service": "brave", "fallback": "Set BRAVE_API_KEY in ~/.claude/.env"}' > "$OUTPUT_FILE"
            exit 1
        fi

        # Brave Search API - Clean JSON, privacy-focused
        curl -s --max-time 30 \
            "https://api.search.brave.com/res/v1/web/search?q=${ENCODED_QUERY}&count=10" \
            -H "Accept: application/json" \
            -H "X-Subscription-Token: ${BRAVE_API_KEY}" \
            | jq '.' > "$OUTPUT_FILE" 2>/dev/null || {
                echo "{\"error\": \"Brave API request failed\", \"service\": \"brave\", \"query\": \"${QUERY}\"}" > "$OUTPUT_FILE"
                exit 1
            }
        ;;

    google)
        if [[ -z "${GOOGLE_API_KEY:-}" ]] || [[ -z "${GOOGLE_CX:-}" ]]; then
            echo '{"error": "GOOGLE_API_KEY and GOOGLE_CX required", "service": "google", "fallback": "Set both in ~/.claude/.env"}' > "$OUTPUT_FILE"
            exit 1
        fi

        # Google Custom Search API - 100 free/day
        curl -s --max-time 30 \
            "https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${ENCODED_QUERY}&num=10" \
            | jq '.' > "$OUTPUT_FILE" 2>/dev/null || {
                echo "{\"error\": \"Google API request failed\", \"service\": \"google\", \"query\": \"${QUERY}\"}" > "$OUTPUT_FILE"
                exit 1
            }
        ;;

    *)
        echo "{\"error\": \"Unknown service: $SERVICE\", \"available\": [\"tavily\", \"serpapi\", \"brave\", \"google\", \"check\"]}" >&2
        exit 1
        ;;
esac
