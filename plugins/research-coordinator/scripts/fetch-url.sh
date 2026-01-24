#!/bin/bash
# fetch-url.sh - Fetch and extract content from URL for citation verification
#
# Usage: fetch-url.sh <url> [output-file]
#
# Examples:
#   fetch-url.sh "https://docs.anthropic.com/en/docs" verify.json
#   fetch-url.sh "https://example.com/article" /tmp/content.json
#
# Output JSON:
#   {"status": "success", "url": "...", "title": "...", "content": "...", "word_count": N}
#   {"status": "failed", "url": "...", "error": "..."}

set -euo pipefail

URL="${1:-}"
OUTPUT_FILE="${2:-/dev/stdout}"

# Validation
if [[ -z "$URL" ]]; then
    echo '{"status": "error", "error": "URL required", "usage": "fetch-url.sh <url> [output-file]"}' >&2
    exit 1
fi

# Ensure output directory exists if writing to file
if [[ "$OUTPUT_FILE" != "/dev/stdout" ]]; then
    OUTPUT_DIR=$(dirname "$OUTPUT_FILE")
    mkdir -p "$OUTPUT_DIR"
fi

# Temporary file for content
TEMP_FILE=$(mktemp)
trap "rm -f $TEMP_FILE" EXIT

# Fetch with timeout, follow redirects, and proper user agent
HTTP_CODE=$(curl -sL \
    --max-time 30 \
    --max-redirs 5 \
    -w "%{http_code}" \
    -H "User-Agent: Mozilla/5.0 (compatible; ResearchBot/1.0; +https://github.com/anthropics/claude-code)" \
    -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" \
    -o "$TEMP_FILE" \
    "$URL" 2>/dev/null) || HTTP_CODE="000"

# Check if fetch succeeded
if [[ "$HTTP_CODE" == "000" ]]; then
    cat > "$OUTPUT_FILE" << EOF
{
  "status": "failed",
  "url": "$URL",
  "error": "Connection failed or timed out",
  "http_code": null
}
EOF
    exit 0
fi

if [[ "$HTTP_CODE" -ge 400 ]]; then
    cat > "$OUTPUT_FILE" << EOF
{
  "status": "failed",
  "url": "$URL",
  "error": "HTTP error",
  "http_code": $HTTP_CODE
}
EOF
    exit 0
fi

# Extract title from HTML
TITLE=$(grep -oP '(?<=<title>)[^<]*' "$TEMP_FILE" 2>/dev/null | head -1 | tr -d '\n' | sed 's/"/\\"/g' || echo "")

# Strip HTML tags and clean up content
# - Remove script and style blocks
# - Remove HTML tags
# - Collapse whitespace
# - Limit to ~10000 characters for context efficiency
CONTENT=$(cat "$TEMP_FILE" \
    | sed 's/<script[^>]*>.*<\/script>//gi' \
    | sed 's/<style[^>]*>.*<\/style>//gi' \
    | sed 's/<[^>]*>//g' \
    | tr -s '[:space:]' ' ' \
    | sed 's/^ *//' \
    | head -c 10000 \
    | sed 's/"/\\"/g' \
    | tr -d '\n\r')

# Count words
WORD_COUNT=$(echo "$CONTENT" | wc -w | tr -d ' ')

# Output JSON result
cat > "$OUTPUT_FILE" << EOF
{
  "status": "success",
  "url": "$URL",
  "http_code": $HTTP_CODE,
  "title": "$TITLE",
  "word_count": $WORD_COUNT,
  "content": "$CONTENT"
}
EOF
