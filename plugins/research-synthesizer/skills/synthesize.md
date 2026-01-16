---
name: research-synthesizer
description:
  Synthesize multiple research reports into a single coherent document. USE WHEN
  user mentions mindmeld, synthesize research, combine reports, merge research
  findings, consolidate multiple sources OR has multiple research files to
  combine.
allowed-tools:
  - Read
  - Write
  - Glob
  - Task
argument-hint: <source-path> <destination-folder>
metadata:
  author: erikb
  version: 1.0.0
  category: research
---

# Research Synthesizer Command

Orchestrates multi-report synthesis by spawning specialized agents as sub-agents
to protect the context window.

## Examples

**Example 1: Mindmeld research reports**

```
User: "/mindmeld Research/ai-agents Output/"
-> Validates paths, finds 3 .md files
-> Spawns research-mindmelder agent (heavy synthesis work)
-> Spawns markdown-optimizer agent (token compression)
-> Returns: "Output/ai-agents-mindmeld-2026-01-15.md"
```

**Example 2: Synthesize specific files**

```
User: "Combine claude-api.md, openai-api.md, gemini-api.md into one doc"
-> Spawns research-mindmelder with file list
-> Spawns markdown-optimizer on result
-> Returns synthesized comparison
```

## Input Parameters

- **Source path**: $1 (folder path or glob pattern like `path/*.md`)
- **Destination folder**: $2 (where to write the synthesized output)

## Workflow

### 1. Validate Input

- Check if source path exists and contains markdown files
- If source is a folder, look for all `.md` files in it
- If source is a glob pattern (contains `*`), use it directly
- Verify destination folder exists or can be created
- If no markdown files found, return error: "No markdown files found at $1"

### 2. Find Files

Use the Glob tool to find all markdown files:

- If $1 is a folder path: search for `$1/*.md`
- If $1 contains `*`: use pattern as-is
- Display to user: "Found [N] reports to synthesize"

### 3. Extract Topic Name

Determine topic name for output file from:

- Folder name (if source is a folder)
- Common prefix in filenames
- Or default to "research" if unable to determine

### 4. Spawn Mind Melder Agent

Use the Task tool to spawn the `research-mindmelder` agent with this prompt:

```
Synthesize the following research reports into a single coherent document.

**Source files**: [list all file paths found]
**Output destination**: $2/[topic]-mindmeld-[TODAY's date in YYYY-MM-DD].md
**Topic**: [extracted topic name]

Read all source files, synthesize them following the research synthesis template, and write the output file. Return a summary with:
- Number of files processed
- Total token count from source files
- Any contradictions found
- Key topics covered
- Confidence level
- Final output file path
```

### 5. Spawn Markdown Optimizer Agent

After the mindmelder completes, extract from its response:

- Output file path
- Topic name
- Source files list (from step 2)
- Contradictions count/description
- Key topics
- Confidence level

Use the Task tool to spawn the `markdown-optimizer` agent with this prompt:

```
Optimize the following markdown file for LLM consumption.

**File to optimize**: [output file path from mindmelder]
**Topic**: [topic name]
**Source files**: [list of source files]
**Source count**: [N]
**Contradictions found**: [from mindmelder response]
**Key topics**: [from mindmelder response]
**Confidence level**: [from mindmelder response]
**Synthesis date**: [TODAY's date]
**Max token limit**: 10000

Read the file, apply all LLM optimization best practices using the provided context for enhanced YAML front matter, and overwrite the file with the optimized version. Ensure the final output does not exceed the max token limit by using intelligent content prioritization if needed. Return a summary of enhancements applied including token metrics.
```

### 6. Display Final Completion

After optimizer returns, show user:

```
✅ Mind meld complete and optimized! Synthesized [N] reports ([TOKENS] tokens) → [OUTPUT_FILE]
```

## Error Handling

- If source path doesn't exist: "Error: Source path not found: $1"
- If no markdown files found: "Error: No markdown files found at $1"
- If destination folder invalid: "Error: Invalid destination folder: $2"
- If agent fails: Display agent error message to user

## Architecture Note

This command spawns two agents sequentially:

1. **research-mindmelder** (opus) - Heavy synthesis work in isolated context
2. **markdown-optimizer** (opus) - Token compression in isolated context

This protects the main conversation's context window from the large source
files.
