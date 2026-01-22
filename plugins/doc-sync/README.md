# Doc-Sync Plugin

Automatically update documentation based on git commit history.

## Overview

Doc-Sync analyzes your git commits to identify which documentation needs
updating, then either reports the gaps or automatically updates the docs.

### Key Features

- **Git-Aware**: Analyzes commits on your current branch since diverging from
  main
- **Smart Detection**: Categorizes changes by type (feature, architecture,
  dependency)
- **Gap Analysis**: Identifies stale docs, missing docs, and wrong status
  markers
- **Auto-Update**: Can automatically update documentation (or just report gaps)
- **Context-Protected**: Sub-agents handle heavy lifting, keeping main
  conversation clean

## Installation

Add to your Claude Code plugins by including this plugin directory in your
`.claude/plugins/` or by adding the path to your Claude Code settings.

## Target Taxonomy

Doc-Sync is tuned for the **tech-docs** documentation taxonomy:

```
docs/tech-docs/
├── README.md                    # Index with priority-sorted tables
├── quick-reference/             # Fast-lookup guides (CRITICAL/HIGH priority)
├── architecture/                # System design
│   ├── overview.md
│   └── decisions/               # ADRs: NNN-topic.md
├── features/                    # Per-feature implementation docs
├── guides/                      # Step-by-step instructions
├── reference/                   # API reference, tech stack
├── design/                      # Design system docs
└── _archive/                    # Historical docs
```

### Frontmatter Standard

Every doc uses YAML frontmatter:

```yaml
---
title: Document Title
description: One-line description
priority: CRITICAL | HIGH | MEDIUM
last_updated: YYYY-MM-DD
status: IMPLEMENTED | PLANNED # features only
---
```

## Usage

### Analyze and Update Documentation

```bash
/update-docs
```

This will:

1. Analyze git commits on your current branch
2. Identify documentation gaps
3. Automatically update documentation

### Analyze Only (Review First)

```bash
/update-docs --analyze-only
```

This will:

1. Analyze git commits on your current branch
2. Identify documentation gaps
3. **Report the gaps without making changes**

Use this to review what would be updated before committing to changes.

### Specify Starting Point

```bash
/update-docs --since=abc1234
```

Analyze from a specific commit instead of the branch divergence point.

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                     /update-docs Command                            │
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│  │   Git       │───▶│   Doc Gap   │───▶│   Doc       │            │
│  │   Analyzer  │    │   Analyzer  │    │   Updater   │            │
│  │   (Haiku)   │    │   (Opus)    │    │   (Opus)    │            │
│  └─────────────┘    └─────────────┘    └─────────────┘            │
│        │                  │                  │                     │
│        ▼                  ▼                  ▼                     │
│   changes.md         gaps.md           Updated docs               │
│   (workspace)       (workspace)        (project)                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 1: Git Change Analyzer (Haiku)

- Identifies base branch (main/master)
- Gets commits since branch divergence
- Categorizes files by documentation impact type
- Writes analysis to `.claude/doc-sync/changes.md`

### Step 2: Doc Gap Analyzer (Opus)

- Discovers project's documentation structure
- Maps code changes to documentation needs
- Identifies stale, missing, or incorrect docs
- Prioritizes gaps (Critical → High → Medium → Low)
- Writes analysis to `.claude/doc-sync/gaps.md`

### Step 3: Doc Updater (Opus)

- Reads gap analysis
- Updates documentation following project conventions
- Updates frontmatter (status, last_updated)
- Creates new docs where needed (e.g., ADRs)
- Reports all changes made

## Change Categories

| Category     | File Patterns                             | Documentation Impact        |
| ------------ | ----------------------------------------- | --------------------------- |
| feature      | `src/app/*`, `src/pages/*`, `routes/*`    | Feature docs, routes        |
| architecture | `src/lib/*`, `migrations/*`, `supabase/*` | ADRs, architecture overview |
| dependency   | `package.json`, `requirements.txt`        | Tech stack reference        |
| config       | `*.config.*`, `.env*`, `deployment/*`     | Guides, deployment docs     |
| style        | `*.css`, `globals.css`, `theme*`          | Design system docs          |

## Supported Documentation Structures

Doc-Sync automatically detects common documentation structures:

- **Next.js/React**: `docs/tech-docs/` with features/, architecture/, reference/
- **General**: `docs/` directory with subdirectories
- **Minimal**: Just `CLAUDE.md` and `README.md`

## Workspace Files

Doc-Sync creates workspace files in `.claude/doc-sync/`:

| File         | Purpose                    |
| ------------ | -------------------------- |
| `changes.md` | Git change analysis        |
| `gaps.md`    | Documentation gap analysis |

These are intermediate files used between agents. You can review them to
understand the analysis, but they're regenerated on each run.

## Best Practices

### Before Merging PRs

```bash
/update-docs --analyze-only
```

Review gaps before merging to ensure docs stay current.

### After Major Features

```bash
/update-docs
```

Let doc-sync update feature docs, tech stack, and create ADRs.

### Regular Maintenance

Run periodically to catch documentation drift.

## Per-Repo Customization

For repos with slight variations from the standard taxonomy, create a
`.doc-sync.yml` in the project root:

```yaml
# .doc-sync.yml - Optional per-repo customization
taxonomy: tech-docs # Default taxonomy (currently the only supported one)

# Override default paths (usually not needed)
paths:
  docs_root: docs/tech-docs # Default
  features: features
  architecture: architecture
  decisions: architecture/decisions
  reference: reference
  design: design
  guides: guides
  quick_reference: quick-reference

# Additional feature directories to scan (beyond src/app/)
feature_paths:
  - src/features
  - app

# Additional patterns for dependency detection
dependency_files:
  - package.json
  - requirements.txt

# Skip certain paths from analysis
ignore:
  - "**/*.test.ts"
  - "**/fixtures/**"

# Custom priority rules
priority_overrides:
  # Treat all auth-related changes as HIGH priority
  - pattern: "**/auth/**"
    min_priority: HIGH
```

Most repos won't need a config file - the defaults work for the standard
tech-docs taxonomy.

## Troubleshooting

### "No commits found"

You're on the base branch (main/master) with no new commits.

### "No documentation structure"

Doc-sync couldn't find a `docs/` directory or `CLAUDE.md`. Consider creating
basic documentation structure first.

### "Gap analysis seems wrong"

Review `.claude/doc-sync/changes.md` to verify git analysis is correct. The gap
analyzer uses this as input.

## Plugin Structure

```
doc-sync/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── commands/
│   └── update-docs.md       # /update-docs command
├── agents/
│   ├── git-change-analyzer.md   # Haiku - parses git
│   ├── doc-gap-analyzer.md      # Opus - identifies gaps
│   └── doc-updater.md           # Opus - writes docs
├── skills/
│   └── doc-sync/
│       ├── SKILL.md             # Skill knowledge
│       └── references/
│           ├── doc-patterns.md  # Doc patterns by project
│           └── change-mapping.md # Change→doc mappings
└── README.md                # This file
```

## License

MIT
