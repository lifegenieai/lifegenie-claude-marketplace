#!/bin/bash
# claude-research.sh - Wrapper for Claude CLI research invocation with web search verification
#
# Usage: claude-research.sh "<research prompt>" "<output file path>"
#
# This script invokes Claude CLI for web research and verifies that
# actual web searches were performed (not just training data).

set -euo pipefail

# Arguments
PROMPT="${1:-}"
OUTPUT_FILE="${2:-}"

# Validation
if [[ -z "$PROMPT" ]]; then
    echo "Error: Research prompt is required"
    echo "Usage: $0 \"<research prompt>\" \"<output file path>\""
    exit 1
fi

if [[ -z "$OUTPUT_FILE" ]]; then
    echo "Error: Output file path is required"
    echo "Usage: $0 \"<research prompt>\" \"<output file path>\""
    exit 1
fi

# Ensure output directory exists
OUTPUT_DIR=$(dirname "$OUTPUT_FILE")
mkdir -p "$OUTPUT_DIR"

# Build the research prompt with explicit web search instructions
FULL_PROMPT="You are a research assistant conducting web research.

CRITICAL INSTRUCTIONS:
1. You MUST use WebSearch to find current, authoritative sources
2. Do NOT rely on training data alone - actively search the web
3. Perform at least 3-5 web searches to gather comprehensive information
4. Use WebFetch to extract details from the most relevant sources
5. Every claim must have a source URL

Research Topic: $PROMPT

Required Output Format:

## Summary
[2-3 sentence overview based on web research]

## Key Findings
For each finding:
- Finding description
- Source: [actual URL from your web search]
- Date accessed: $(date +%Y-%m-%d)

## Details
[Detailed information organized by subtopic, with inline citations]

## Sources
| # | URL | Title | Type | Accessed |
|---|-----|-------|------|----------|
| 1 | [URL] | [Title] | [Doc/Blog/Paper] | $(date +%Y-%m-%d) |

IMPORTANT: If you cannot perform web searches, state this clearly rather than making up information."

# Temporary file for JSON response
TEMP_JSON=$(mktemp)
trap "rm -f $TEMP_JSON" EXIT

echo "Starting Claude research..."
echo "Prompt: ${PROMPT:0:100}..."
echo "Output: $OUTPUT_FILE"

# Execute Claude CLI with JSON output for verification
TIMEOUT_SECONDS=180

if command -v claude &> /dev/null; then
    # Run Claude with JSON output
    timeout "$TIMEOUT_SECONDS" claude -p "$FULL_PROMPT" --output-format json > "$TEMP_JSON" 2>&1 || {
        EXIT_CODE=$?
        if [[ $EXIT_CODE -eq 124 ]]; then
            echo "Error: Claude CLI timed out after ${TIMEOUT_SECONDS}s" > "$OUTPUT_FILE"
        else
            echo "Error: Claude CLI failed with exit code $EXIT_CODE" > "$OUTPUT_FILE"
            cat "$TEMP_JSON" >> "$OUTPUT_FILE"
        fi
        exit $EXIT_CODE
    }

    # Extract the result text
    RESULT=$(jq -r '.result // empty' "$TEMP_JSON")

    # Check if web searches were actually performed
    WEB_SEARCHES=$(jq -r '.usage.server_tool_use.web_search_requests // 0' "$TEMP_JSON")
    WEB_FETCHES=$(jq -r '.usage.server_tool_use.web_fetch_requests // 0' "$TEMP_JSON")

    echo "Web searches performed: $WEB_SEARCHES"
    echo "Web fetches performed: $WEB_FETCHES"

    # Write results to output file
    {
        echo "$RESULT"
        echo ""
        echo "---"
        echo "## Research Metadata"
        echo "- Web searches performed: $WEB_SEARCHES"
        echo "- Web fetches performed: $WEB_FETCHES"
        echo "- Generated: $(date -Iseconds)"

        if [[ "$WEB_SEARCHES" -eq 0 ]]; then
            echo ""
            echo "⚠️ **WARNING**: No web searches were performed. Results may be from training data only."
        fi
    } > "$OUTPUT_FILE"

    # Warn if no web searches (but don't fail - still useful output)
    if [[ "$WEB_SEARCHES" -eq 0 ]]; then
        echo "WARNING: No web searches performed - results may be from training data"
    fi

else
    # Claude CLI not found
    cat > "$OUTPUT_FILE" << 'FALLBACK'
## Claude Research - CLI Not Available

The Claude CLI (`claude`) was not found in PATH.

### To install Claude Code:
See: https://docs.anthropic.com/en/docs/claude-code

### Placeholder findings:
[No findings - Claude CLI not available]

### Sources:
[None - research not executed]
FALLBACK
    echo "Warning: Claude CLI not found, wrote placeholder to $OUTPUT_FILE"
    exit 0
fi

echo "Claude research complete: $OUTPUT_FILE"
