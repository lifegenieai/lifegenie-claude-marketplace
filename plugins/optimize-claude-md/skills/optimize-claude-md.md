# CLAUDE.md Optimizer Skill

Analyze, score, and optimize CLAUDE.md files using research-backed best
practices, deterministic analysis, and AI-powered recommendations.

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  Phase 1: Research (Parallel Agents)                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│  │ Anthropic    │ │ Community    │ │ Prompt Eng   │                │
│  │ Official Docs│ │ Patterns     │ │ Principles   │                │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘                │
│         └────────────────┼────────────────┘                         │
│                          ▼                                          │
│              Update best-practices.md                               │
└─────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Phase 2: Mechanical Analysis (TypeScript)                          │
│  • Line count, structure detection                                  │
│  • Aggressive language pattern matching                             │
│  • XML tag inventory                                                │
│  • Section identification                                           │
│  → Output: JSON metrics (no AI tokens spent)                        │
└─────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Phase 3: AI Scoring & Recommendations                              │
│  • Interpret metrics against rubric                                 │
│  • Score subjective criteria (clarity, examples)                    │
│  • Generate improvement recommendations                             │
│  • Propose specific changes                                         │
└─────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Phase 4: Implementation (with approval)                            │
│  • Create module files for extracted content                        │
│  • Update CLAUDE.md with improvements                               │
│  • Re-run analysis to verify                                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Research Best Practices

Launch **3 parallel research agents** to gather current best practices. Each
agent focuses on a different domain to maximize coverage while protecting
context.

### Agent 1: Anthropic Official Sources

```
Search for and summarize:
- Claude Code CLAUDE.md official documentation
- Anthropic engineering blog posts about Claude Code
- Official best practices and recommendations
- Any recent updates or changes to guidance

Output: Summary of official Anthropic guidance (bullet points)
```

### Agent 2: Community Patterns & Research

```
Search for and summarize:
- GitHub's research on AGENTS.md files (2,500+ repos)
- Community blog posts about effective CLAUDE.md files
- Token efficiency patterns and optimizations
- Anti-patterns and common mistakes

Output: Summary of community learnings (bullet points)
```

### Agent 3: Claude 4.5 Prompt Engineering

```
Analyze prompt engineering best practices for Claude 4.5:
- Aggressive language sensitivity (NEVER, MUST, CRITICAL)
- "Why" context importance for generalization
- XML tag structuring
- Positive vs negative framing
- Extended thinking considerations

Output: Summary of Claude 4.5 optimization techniques (bullet points)
```

### After Research Completes

1. Read current `references/best-practices.md` from this plugin
2. **Merge new findings** into the canonical document (don't rebuild)
3. Flag any **contradictions** with existing guidance
4. Update the **last-updated date**

---

## Phase 2: Mechanical Analysis

Run the TypeScript analyzer to gather metrics deterministically.

**Find the analyzer script in this plugin's scripts directory:**

```bash
# From the plugin installation directory:
npx ts-node ./scripts/analyze.ts <path-to-claudemd>
```

The script outputs JSON with:

- `lineCount`: Total lines
- `aggressiveLanguage`: Count and locations of
  NEVER/MUST/CRITICAL/ALWAYS/MANDATORY
- `xmlTags`: List of XML tags found
- `sections`: Detected markdown sections
- `hasBoundariesSection`: Boolean
- `codeExamples`: Count of code blocks
- `tables`: Count of markdown tables
- `links`: External file references
- `whyContextCount`: Heuristic count of explanatory phrases

This costs **zero AI tokens** and produces consistent results.

---

## Phase 3: AI Scoring & Recommendations

With research updated and metrics in hand, score the file:

### Scoring Process

1. **Load the rubric** from `references/rubric.md` in this plugin
2. **Apply mechanical scores** directly from analyzer output:
   - Length optimization: Based on `lineCount`
   - Aggressive triggers: Based on `aggressiveLanguage.count`
   - XML tag usage: Based on `xmlTags.length`
3. **Apply subjective scores** via AI judgment:
   - Content clarity and quality
   - Example effectiveness
   - Decision guidance usefulness
4. **Calculate total** and assign star rating

### Recommendation Generation

For each issue found:

1. Reference the **transformation guide** for language softening
2. Reference **templates** for missing sections
3. Propose **specific before/after** changes
4. Estimate **point improvement**

---

## Phase 4: Implementation

After user approval:

1. **Create module files** if extracting content (e.g., CLI commands)
2. **Apply transformations** to CLAUDE.md
3. **Re-run analyzer** to verify improvements
4. **Show before/after comparison**

---

## Reference Files

| File                                 | Purpose                                        |
| ------------------------------------ | ---------------------------------------------- |
| `references/best-practices.md`       | Canonical best practices (updated by research) |
| `references/rubric.md`               | 100-point scoring rubric                       |
| `references/transformation-guide.md` | Language softening patterns                    |
| `templates/boundaries-section.md`    | Template for Always/Ask/Never section          |
| `templates/analysis-report.md`       | Output format template                         |
| `scripts/analyze.ts`                 | Deterministic analysis script                  |

---

## File Discovery

When no path is provided, search for CLAUDE.md in this order (use first found):

1. `./CLAUDE.md` - Project root (most common)
2. `./.claude/CLAUDE.md` - Project .claude folder
3. `~/.claude/CLAUDE.md` - User-level global config

If no CLAUDE.md is found in any location, ask the user to specify a path.

**Important:** Always confirm which file you're analyzing before proceeding:

> "Found CLAUDE.md at `./CLAUDE.md` (142 lines). Proceeding with analysis."

---

## Usage

```
/optimize-claude-md                       # Auto-discover and analyze CLAUDE.md
/optimize-claude-md ./path/to/CLAUDE.md   # Analyze specific file
/optimize-claude-md --skip-research       # Use cached best practices
```

---

## Key Principles

1. **Compound knowledge** - Research updates canonical doc, doesn't rebuild
2. **Protect context** - Parallel agents + deterministic code
3. **Deterministic where possible** - TypeScript for mechanical analysis
4. **AI for judgment** - Subjective scoring and recommendations
5. **User approval gates** - No changes without confirmation
