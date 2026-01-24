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

CRITICAL REQUIREMENTS:
1. You MUST use web search to find current information
2. Every claim MUST have a full clickable URL citation
3. Every finding MUST have a confidence level
4. If you cannot search the web, state this explicitly

Format your response EXACTLY as follows:

## Grounding Status
[STATE ONE: \"Web Search Active\" if you performed live searches, OR \"Training Data Only\" if you could not search]

## Summary
[2-3 sentence overview]

## Key Findings

### Finding 1
- **Claim**: [Specific factual claim]
- **Source**: [FULL URL - e.g., https://example.com/article/123]
- **Confidence**: [High/Medium/Low]
- **Why**: [1 sentence explaining confidence level]

### Finding 2
- **Claim**: [Specific factual claim]
- **Source**: [FULL URL]
- **Confidence**: [High/Medium/Low]
- **Why**: [1 sentence explaining confidence level]

[Continue for each finding - aim for 5-10 findings]

## Details
[Detailed analysis organized by subtopic, with inline citations like [1], [2]]

## Sources Table

| # | URL | Title | Accessed | Confidence |
|---|-----|-------|----------|------------|
| 1 | [Full URL] | [Page title] | [Today's date] | [High/Medium/Low] |
| 2 | [Full URL] | [Page title] | [Today's date] | [High/Medium/Low] |

## Quality Metadata
- **Total sources cited**: [N]
- **High confidence claims**: [N]
- **Medium confidence claims**: [N]
- **Low confidence claims**: [N]
- **Grounding method**: [Web Search / Training Data / Mixed]

CONFIDENCE LEVELS:
- High: Direct quote or data from authoritative source, URL verified
- Medium: Paraphrased from reliable source, or multiple sources agree
- Low: Single source, older information, or inference from related data

Be thorough and cite EVERY claim with a full URL."

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
