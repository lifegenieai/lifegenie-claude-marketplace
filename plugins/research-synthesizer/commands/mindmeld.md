---
description:
  Synthesize multiple research reports into a single coherent document
allowed-tools:
  - Read
  - Write
  - Glob
  - Task
  - Bash
argument-hint: <source-path> <destination-folder>
---

# Research Synthesizer Command

Orchestrate multi-report synthesis by spawning specialized agents as sub-agents
to protect the context window.

## Input Parameters

- **Source path**: $1 (folder path or glob pattern like `path/*.md`)
- **Destination folder**: $2 (where to write the synthesized output)

## Workflow

### 1. Validate Input

- Check if source path exists and contains markdown files
- If source is a folder, look for all `.md` files in it
- If source is a glob pattern (contains `*`), use it directly
- Verify destination folder exists or can be created
- If no markdown files found, return error

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

### 3.5. Extract Citations (Deterministic)

Run the citation extractor on all source files using Bash:

```bash
bun run ${CLAUDE_PLUGIN_ROOT}/lib/citation-extractor.ts <file1> <file2> ...
```

Pass all the file paths found in Step 2 as arguments.

The script outputs JSON with:

- `citations`: Array of normalized citations with id, authors, title, year,
  venue, url, sourceFiles
- `totalFound`: Total unique citations
- `bySourceFile`: Count per source file

Capture the JSON output to pass to the mindmelder agent.

### 4. Spawn Mind Melder Agent

Use the Task tool to spawn the `research-mindmelder` agent with this prompt:

````
Synthesize the following research reports into a single coherent document.

**Source files**: [list all file paths found]
**Output destination**: [destination]/[topic]-mindmeld-[YYYY-MM-DD].md
**Topic**: [extracted topic name]

**PRE-EXTRACTED CITATIONS (use these directly):**

```json
[paste the JSON output from citation-extractor.ts]
```

IMPORTANT: Do NOT re-extract citations from the source files. Use the
pre-extracted citations above. For each finding/claim in your synthesis, add the
appropriate citation marker [N] that corresponds to the citation ID in the JSON.

Include a ## References section at the end with all citations formatted as:
[N] Authors. "Title" Venue Year. [url] [From: source-files]

Read all source files for content synthesis, but use the provided citation JSON
for all citation markers and the References section.

Return a summary with:
- Number of files processed
- Total token count from source files
- Any contradictions found
- Key topics covered
- Confidence level
- Final output file path
- Number of citations preserved
````

### 5. Spawn Markdown Optimizer Agent

After the mindmelder completes, spawn the `markdown-optimizer` agent with:

```
Optimize the following markdown file for LLM consumption.

**File to optimize**: [output file path from mindmelder]
**Topic**: [topic name]
**Max token limit**: 10000

Read the file, apply optimization best practices, and overwrite with optimized version.
```

### 6. Display Completion

Show user:

```
Mind meld complete! Synthesized [N] reports -> [OUTPUT_FILE]
```

## Error Handling

- If source path doesn't exist: Report error
- If no markdown files found: Report error
- If destination folder invalid: Report error
- If agent fails: Display agent error message

## Architecture Note

This command spawns two agents sequentially:

1. **research-mindmelder** (opus) - Heavy synthesis work in isolated context
2. **markdown-optimizer** (opus) - Token compression in isolated context

This protects the main conversation's context window from large source files.
