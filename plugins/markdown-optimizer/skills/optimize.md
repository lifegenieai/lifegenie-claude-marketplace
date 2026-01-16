---
name: markdown-optimizer-command
description:
  Optimize markdown files for LLM context efficiency. USE WHEN user mentions
  optimize markdown, reduce tokens, compress document, make file smaller for
  context, information density, OR has large markdown files to optimize.
allowed-tools:
  - Read
  - Write
  - Glob
  - Task
argument-hint: <file-path-or-folder>
metadata:
  author: erikb
  version: 1.0.0
  category: utilities
---

# Markdown Optimizer Command

Orchestrates markdown optimization by spawning the markdown-optimizer agent as a
sub-agent to protect the context window from large files.

## Examples

**Example 1: Optimize single file**

```
User: "/optimize-markdown docs/architecture.md"
-> Analyzes file (5,200 tokens)
-> Spawns markdown-optimizer agent with Standard mode
-> Returns: "Optimized: 5,200 → 3,400 tokens (35% reduction)"
```

**Example 2: Batch optimize folder**

```
User: "Optimize all markdown in my Research folder"
-> Finds 12 .md files
-> Spawns markdown-optimizer agents in PARALLEL (one per file)
-> Returns summary table with before/after metrics
```

**Example 3: Large file split recommendation**

```
User: "/optimize-markdown docs/monolith.md"
-> Analyzes file (15,000 tokens)
-> Spawns agent with Split mode
-> Returns: "Split recommended: 4 files of ~3,500 tokens each"
```

## Input Parameters

**Path**: $1 (can be a single markdown file OR a folder path)

## Workflow

### 1. Validate and Discover Files

Check if the input path exists and determine type:

**If $1 is a file**:

- File not found → "Error: File not found: $1"
- Not markdown → "Error: Not a markdown file: $1 (must end with .md)"
- Is markdown → Proceed with single file workflow

**If $1 is a folder**:

- Folder not found → "Error: Folder not found: $1"
- Use Glob tool with pattern `$1/**/*.md` to find all markdown files recursively
- If no markdown files found → "Error: No markdown files found in: $1"
- Display count to user: "Found [N] markdown files to optimize in $1"
- Proceed with batch workflow (see Section 1b below)

### 1b. Batch Processing Workflow (Folders Only)

When processing a folder, spawn SEPARATE `markdown-optimizer` agents for each
file in PARALLEL to minimize context usage:

1. **Analyze all files first** (quick scan):
   - Read each file to calculate word count and token estimate
   - Display summary table:

   ```
   Found [N] files to optimize:

   | File | Current Tokens | Mode |
   |------|----------------|------|
   | file1.md | 4,500 | Standard |
   | file2.md | 8,200 | Aggressive |
   | file3.md | 12,000 | Split Recommended |
   ```

2. **Spawn parallel agents**:
   - Create one `markdown-optimizer` Task agent per file (all in one message)
   - Each agent gets the same prompt format as single-file mode (see Section 3)
   - Let all agents run independently and complete

3. **Report results**:
   - Show completion summary with before/after metrics for each file
   - Highlight any files that need manual review (split recommendations)

**IMPORTANT**: For folders, you MUST spawn agents in PARALLEL (single message
with multiple Task tool calls) to maximize efficiency. Do NOT process files
sequentially.

### 2. Analyze File (Single File Mode)

Read the file using the Read tool, then calculate:

- Word count from file content
- Token estimate (word count × 1.33)
- Topic from filename or H1 heading

Display to user:

```
Analyzing [filename]...
Current size: [X] tokens (estimated from [Y] words)
```

### 3. Determine Mode and Spawn Optimizer

Based on token count, determine optimization mode and spawn the
`markdown-optimizer` agent:

**For files < 10,000 tokens** (can be optimized):

```
Optimize this markdown file for information density and multi-file context loading.

**File**: $1
**Topic**: [extracted topic]
**Current tokens**: [X]
**Target tokens**: [based on current size - see targets below]
**Optimization version**: 1.1

Token targets:
- < 3,000 tokens: Light optimization (already efficient)
- 3,000-6,000 tokens: Standard compression to 3-4K range
- 6,000-10,000 tokens: Aggressive compression to <6K

Apply aggressive compression techniques:
- Convert prose to tables (3-5x more efficient)
- Keep 1 excellent example vs 3 mediocre
- Eliminate redundancy and filler
- Maximize information per token ratio

IMPORTANT: Add "optimization_version: 1.1" to the YAML frontmatter to track which optimization strategy was applied.

Read the file, optimize for information density, overwrite with optimized version, and return token efficiency metrics.
```

**For files ≥ 10,000 tokens** (split recommended):

```
This file is too large for efficient multi-file context loading. Recommend a split strategy.

**File**: $1
**Topic**: [extracted topic]
**Current tokens**: [X]

Analyze the file structure and recommend how to split it into 3-4 semantically cohesive files of 3-4K tokens each, plus a hub index file (~300 tokens). Each split file must be a complete thought that can be loaded independently.

**Naming Convention**: Use numbered prefixes to map folder structure to logical reading order:
- Hub/index file: 00-[topic]-index.md
- First content file: 01-[topic]-[section].md
- Second content file: 02-[topic]-[section].md
- etc.

This ensures alphabetical sorting matches reading order and LLMs encounter the index first.

Return your split recommendation with:
1. Proposed filenames (with numbered prefixes) and token targets
2. Content breakdown for each file
3. Hub file structure with cross-references
4. Rationale for the split strategy
```

### 4. Display Results

Show the agent's output to the user. The optimizer will return either:

- Token efficiency metrics (for optimized files)
- Split recommendation (for large files)

## Token Target Reference

| Current Size | Mode       | Target          | Rationale                  |
| ------------ | ---------- | --------------- | -------------------------- |
| < 3,000      | Light      | Minimal changes | Already efficient          |
| 3,000-6,000  | Standard   | 3-4K range      | Compress to optimal        |
| 6,000-10,000 | Aggressive | <6K             | Too large for multi-file   |
| ≥ 10,000     | Split      | 3-4K per file   | Cannot coexist efficiently |

## Architecture Note

This command spawns the `markdown-optimizer` agent (opus model) to do the heavy
file processing in an isolated context, protecting the main conversation from
large file contents.
