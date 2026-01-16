---
name: optimize-claude-md
description:
  Optimize, audit, create, and migrate CLAUDE.md files using research-backed
  best practices. USE WHEN user mentions CLAUDE.md, optimize instructions, audit
  configuration, create new project config, migrate to Opus 4.5, setup
  enforcement hooks OR wants to improve Claude Code instruction-following.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Bash
  - WebSearch
  - WebFetch
metadata:
  author: erikb
  version: 2.0.0
  category: development
---

# CLAUDE.md Optimizer

Comprehensive toolkit for CLAUDE.md file optimization, auditing, creation, and
enforcement setup.

## Examples

**Example 1: Audit existing configuration**

```
User: "Audit my CLAUDE.md file"
-> Asks for file path
-> Scores against 100-point rubric
-> Identifies top 3 priority improvements
-> Provides specific recommendations
```

**Example 2: Create new project config**

```
User: "Create a CLAUDE.md for my Next.js project"
-> Asks about tech stack, project structure
-> Builds optimized file from template
-> Recommends enforcement setup
```

**Example 3: Migrate for Opus 4.5**

```
User: "My CLAUDE.md triggers too aggressively with Opus 4.5"
-> Identifies aggressive language patterns
-> Softens ALL CAPS to normal case
-> Adds over-engineering prevention
```

## Essential Principles

**LLMs Are Stateless**: Claude starts every session with zero codebase
knowledge. CLAUDE.md is the ONLY file included by default in every conversation.

**Critical Constraints**: | Constraint | Limit | |------------|-------| |
Instruction Limit | ~150-200 instructions (LLM reliable following) | | Claude
Code System | ~50 instructions consumed by harness | | Your Budget | ~100-150
instructions for CLAUDE.md |

**4-Tier Hierarchy** (specific to general):

1. **Project local**: `./CLAUDE.local.md` (gitignored)
2. **Project shared**: `./CLAUDE.md` (<300 lines)
3. **User**: `~/.claude/CLAUDE.md` (<60 lines)
4. **Enterprise**: System-wide policies

**Format Efficiency**: | Format | Efficiency | |--------|-----------| | Code
examples | 10x prose | | XML tags | 10x + parsing | | Tables | 5x prose | |
Bullets | 3x prose | | Prose | 1x (avoid) |

## Workflow Routing

| Intent                                | Workflow     | File                             |
| ------------------------------------- | ------------ | -------------------------------- |
| "audit", "score", "assess", "review"  | **Audit**    | `workflows/audit-claudemd.md`    |
| "optimize", "improve", "refactor"     | **Optimize** | `workflows/optimize-claudemd.md` |
| "create", "new", "build from scratch" | **Create**   | `workflows/create-claudemd.md`   |
| "opus", "4.5", "migrate", "upgrade"   | **Migrate**  | `workflows/migrate-opus.md`      |
| "enforcement", "hooks", "settings"    | **Setup**    | `workflows/setup-enforcement.md` |

## Intake

When invoked, ask:

> What would you like to do?
>
> 1. **Audit** - Score against rubric, identify improvements
> 2. **Optimize** - Apply best practices to existing file
> 3. **Create** - Build new CLAUDE.md from scratch
> 4. **Migrate** - Adjust for Opus 4.5+ behavior
> 5. **Setup Enforcement** - Configure hooks and settings

Route to appropriate workflow based on response.

## Reference Files

| File                                    | Purpose                                     |
| --------------------------------------- | ------------------------------------------- |
| `references/best-practices.md`          | Canonical best practices (research-updated) |
| `references/rubric.md`                  | 100-point scoring framework                 |
| `references/transformation-guide.md`    | Language softening patterns                 |
| `templates/boundaries-section.md`       | Always/Ask/Never template                   |
| `templates/audit-report.md`             | Audit output format                         |
| `templates/project-claudemd-starter.md` | Project template                            |
| `templates/user-claudemd-starter.md`    | User template                               |
| `scripts/analyze.ts`                    | Deterministic analysis script               |

## Anti-Patterns

| Pattern                       | Problem                             |
| ----------------------------- | ----------------------------------- |
| Auto-generating CLAUDE.md     | Loses high-leverage manual crafting |
| Mixing hierarchy levels       | User vs project vs task-specific    |
| Task-specific in project file | Use progressive disclosure          |
| Style guides in CLAUDE.md     | Use linters + hooks instead         |
| Embedded code snippets        | Use `file:line` pointers            |
| Exceeding instruction budget  | Ruthlessly cut non-essential        |

## Success Criteria

A well-optimized CLAUDE.md:

- Scores 75+ on quality rubric (90+ excellent)
- Uses 80%+ high-efficiency formats
- Has clear hierarchy separation
- Implements 2+ enforcement layers
- Stays within instruction budget
- Results in fewer clarification questions
