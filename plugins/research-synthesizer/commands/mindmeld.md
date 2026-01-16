---
description:
  Synthesize multiple research reports into a single coherent document
allowed-tools:
  - Read
  - Write
  - Glob
  - Task
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

### 4. Spawn Mind Melder Agent

Use the Task tool to spawn the `research-mindmelder` agent with this prompt:

```
Synthesize the following research reports into a single coherent document.

**Source files**: [list all file paths found]
**Output destination**: [destination]/[topic]-mindmeld-[TODAY's date].md
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
