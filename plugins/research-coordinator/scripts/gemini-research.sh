#!/bin/bash
# gemini-research.sh - Wrapper for Gemini CLI research invocation
#
# Usage: gemini-research.sh "<research prompt>" "<output file path>"
#
# This script invokes the Gemini CLI for web research and captures
# the output to a file for the research coordinator to read.

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

# Build the research prompt with instructions
FULL_PROMPT="You are a research assistant. Investigate the following topic thoroughly using web search.

Research Topic: $PROMPT

Instructions:
1. Search for authoritative and recent sources
2. Gather key facts, insights, and examples
3. Note any important caveats or limitations
4. Include URLs for all sources you reference

Format your response as:

## Summary
[2-3 sentence overview]

## Key Findings
- Finding 1 with source URL
- Finding 2 with source URL
- Finding 3 with source URL
[Continue as needed]

## Details
[More detailed information organized by subtopic]

## Sources
- [URL 1]: Brief description
- [URL 2]: Brief description
[List all URLs referenced]

Be thorough, accurate, and cite your sources."

# Execute Gemini CLI with timeout
# Using --no-sandbox for headless environments if needed
TIMEOUT_SECONDS=120

echo "Starting Gemini research..."
echo "Prompt: ${PROMPT:0:100}..."
echo "Output: $OUTPUT_FILE"

# Try to run gemini CLI
if command -v gemini &> /dev/null; then
    # Gemini CLI is available
    timeout "$TIMEOUT_SECONDS" gemini -p "$FULL_PROMPT" > "$OUTPUT_FILE" 2>&1 || {
        EXIT_CODE=$?
        if [[ $EXIT_CODE -eq 124 ]]; then
            echo "Error: Gemini CLI timed out after ${TIMEOUT_SECONDS}s" >> "$OUTPUT_FILE"
        else
            echo "Error: Gemini CLI failed with exit code $EXIT_CODE" >> "$OUTPUT_FILE"
        fi
        exit $EXIT_CODE
    }
else
    # Gemini CLI not found - write placeholder
    cat > "$OUTPUT_FILE" << 'FALLBACK'
## Gemini Research - CLI Not Available

The Gemini CLI (`gemini`) was not found in PATH.

### To install Gemini CLI:

```bash
npm install -g @anthropic-ai/gemini-cli
# or
pip install google-generativeai
```

### Alternative:
This research angle should be handled by a Claude researcher agent instead.

### Placeholder findings:
[No findings - Gemini CLI not available]

### Sources:
[None - research not executed]
FALLBACK
    echo "Warning: Gemini CLI not found, wrote placeholder to $OUTPUT_FILE"
    exit 0  # Don't fail the overall workflow
fi

echo "Gemini research complete: $OUTPUT_FILE"
