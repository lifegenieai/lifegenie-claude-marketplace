---
name: research-workflow
description: |
  Comprehensive web research with verified citations using direct API integration.
  No MCP servers - all search is code-wrapped for reliability.

  Use when the user wants to research a topic with multiple sources and citation verification.
  Runs in main conversation context (not as subagent) for full tool access.
allowed-tools:
  - AskUserQuestion
  - Read
  - Write
  - Bash
  - Glob
---

# Research Skill

Orchestrates comprehensive research using direct API calls (Tavily, Gemini) with
citation verification.

## Architecture

```
SKILL (main conversation)
├── Phase 1: Clarify scope with user
├── Phase 2: Define 4 research angles
├── Phase 3: Execute parallel Bash searches
├── Phase 4: Read results and synthesize
├── Phase 5: Verify citations
└── Phase 6: Write final report
```

## Configuration

- **Output Base**:
  `/mnt/c/Obsidian/MainVault/MainVault/CrystalBall/research-inbox/`
- **Date Format**: YYYY-MM-DD
- **Scratchpad**: Use session scratchpad for intermediate files

---

## Phase 1: Clarify Scope

**Do NOT use pre-defined questions.** Instead:

1. **Read the topic** the user provided
2. **Reason about ambiguity** - What's underspecified? What assumptions would I
   be making?
3. **Ask only what's needed** - Use AskUserQuestion for genuine clarifications
4. **Stop when clear** - Some topics need 0 questions, others need 3+

### Decision Process

Ask yourself:

- Is the scope clear enough to define useful search queries?
- Am I making assumptions that could send research in the wrong direction?
- What would change my approach if answered differently?

### Examples

**Topic: "What's on Hacker News today?"**

- Scope is clear, no questions needed
- Proceed directly to Phase 2

**Topic: "Research databases"**

- Highly ambiguous - ask:
  - What use case? (transactional, analytics, time-series, vector?)
  - What scale? (hobby project, startup, enterprise?)
  - Any constraints? (cloud-only, on-prem, cost limits?)

**Topic: "Compare React vs Vue for our new project"**

- Partially specified - might ask:
  - What kind of project? (dashboard, e-commerce, content site?)
  - Team experience with either framework?
  - Any hard requirements? (SSR, mobile, specific integrations?)

### Interview Guidelines

**What to ask:**

- Non-obvious, in-depth questions that reveal hidden constraints
- Probe implicit assumptions that could derail research
- Explore the "why" behind the request - what decision does this inform?
- Challenge vague sections - push for specificity
- Identify scope boundaries - what's explicitly out of scope?

**What NOT to ask:**

- Things already clearly specified in the topic
- Generic "depth" or "format" questions - infer from context
- Questions with obvious answers
- Anything that doesn't change your research approach

**Areas to explore (as relevant to topic):**

- Use case context - why do they need this research?
- Constraints - time, budget, technical, organizational
- Specific comparisons - what alternatives matter?
- Prior knowledge - what do they already know or have tried?
- Output expectations - decision support, learning, documentation?
- Integration points - how will this research be used?

**Continue until all ambiguity that affects research direction is resolved.**

---

## Phase 2: Write Research Brief

Once all ambiguity is resolved, write a complete research brief. This is a
**standalone document** that captures everything needed to guide research.

### Output Location

```bash
OUTPUT_DIR="/mnt/c/Obsidian/MainVault/MainVault/CrystalBall/research-inbox/$(date +%Y-%m-%d)-[topic-slug]"
mkdir -p "$OUTPUT_DIR"
```

Write `research-brief.md` to this directory.

### Brief Content (Dynamic, Not Templated)

The brief should include:

1. **Research Question** - The core question or topic, clearly stated
2. **Context** - Why this research matters, what decision it informs
3. **Scope** - What's in scope, what's explicitly out of scope
4. **Constraints** - Time, technical, organizational, or other limitations
5. **Success Criteria** - What would make this research useful?
6. **Key Areas to Investigate** - Themes or subtopics that emerged from
   clarification

**Do NOT use a rigid template.** Write the brief as a thoughtful document that a
researcher could pick up and execute without further context.

### Quality Check

Before proceeding, verify the brief:

- Could someone unfamiliar with the conversation execute this research?
- Are the scope boundaries clear?
- Are success criteria specific enough to evaluate?

---

## Phase 3: Create Research Tasks

Break the research brief into **independent research tasks**. Like converting a
spec into actionable work items.

### Task Design Principles

- **Independent** - Each task can run in parallel without dependencies
- **Focused** - One theme or subtopic per task
- **Complete** - Task includes enough context to execute standalone
- **Right-sized** - Not too granular, not too broad

### Number of Tasks

Let the brief determine task count:

- Simple topic → 2-3 tasks
- Moderate complexity → 3-5 tasks
- Deep investigation → 5-8 tasks

### Task Briefing Document

For each task, create a mini-briefing that will be passed to BOTH search
engines:

```markdown
## Task: [Task Name]

**From Research Brief**: [Topic]

**Question**: [Specific question this task answers]

**Context**: [Why this matters to the overall research]

**Look for**:

- [Specific thing 1]
- [Specific thing 2]
- [Specific thing 3]

**Constraints**: [Any scope limitations]
```

Write task briefings to scratchpad: `${SCRATCHPAD}/task-N-brief.md`

---

## Phase 4: Execute Tasks (Dual-Source)

For **each task**, run the same briefing through both search engines in
parallel.

### Check API Availability

```bash
"${CLAUDE_PLUGIN_ROOT}/scripts/search-api.sh" check
```

### Execute Per Task

For each task N, run these two commands in parallel:

```bash
# Tavily (LLM-optimized search results)
"${CLAUDE_PLUGIN_ROOT}/scripts/search-api.sh" tavily "$(cat ${SCRATCHPAD}/task-N-brief.md)" "${SCRATCHPAD}/task-N-tavily.json"

# Gemini CLI (Google grounding, synthesized prose)
"${CLAUDE_PLUGIN_ROOT}/scripts/gemini-research.sh" "$(cat ${SCRATCHPAD}/task-N-brief.md)" "${SCRATCHPAD}/task-N-gemini.md"
```

### Parallelization

Run ALL tasks in parallel. If you have 4 tasks, that's 8 parallel bash calls (4
Tavily + 4 Gemini).

### Fallback

If Tavily API is not configured:

- Run all tasks through Gemini CLI only
- Note reduced source diversity in final report

---

## Phase 5: Per-Task Synthesis

For each task, synthesize the Tavily and Gemini results **before** moving to the
final report.

### Read Task Results

For task N, read:

- `${SCRATCHPAD}/task-N-tavily.json` - Structured search results
- `${SCRATCHPAD}/task-N-gemini.md` - Synthesized prose with citations

### Synthesis Process

1. **Extract findings** from both sources
2. **Identify agreement** - Claims supported by both
3. **Identify unique insights** - Claims from only one source (preserve with
   attribution)
4. **Identify contradictions** - Claims that conflict (flag explicitly)
5. **Assess confidence** - High/Medium/Low based on source agreement and quality

### Contradiction Resolution

When Tavily and Gemini disagree:

- **Note the contradiction explicitly** - Don't silently pick one
- **Check source quality** - Is one citing authoritative sources?
- **Check recency** - Is one using outdated information?
- **If unresolvable** - Flag as "Open Question" for final report

### Write Task Synthesis

Write `${SCRATCHPAD}/task-N-synthesis.md` with:

- Key findings (with confidence levels)
- Contradictions found
- Sources used (full URLs)

---

## Phase 6: Final Report

Once all tasks are synthesized, author the final research report.

### Inputs

- Original research brief (`research-brief.md`)
- All task syntheses (`task-N-synthesis.md`)

### Report Structure

Write `research-report.md` to the output directory:

```markdown
# Research Report: [Topic]

**Generated**: [YYYY-MM-DD HH:MM] **Research Method**: Dual-source (Tavily +
Gemini) per task

## Executive Summary

[2-3 paragraphs synthesizing key findings across all tasks]

## Findings

### [Theme/Topic 1]

[Findings with inline citations [1], [2], etc.]

### [Theme/Topic 2]

[Findings with inline citations]

[Continue for each major theme - structure should mirror the research brief]

## Contradictions & Open Questions

[Explicit list of unresolved disagreements between sources]

| Topic | Tavily Says | Gemini Says | Resolution                      |
| ----- | ----------- | ----------- | ------------------------------- |
| [X]   | [Claim]     | [Claim]     | [Unresolved / Resolved: reason] |

## Sources

| #   | URL        | Title   | Confidence | Source | Task   |
| --- | ---------- | ------- | ---------- | ------ | ------ |
| 1   | [Full URL] | [Title] | High       | Tavily | Task 1 |
| 2   | [Full URL] | [Title] | Medium     | Gemini | Task 1 |

**Confidence Levels:**

- High: Multiple sources agree, authoritative citations
- Medium: Single reliable source, or sources mostly agree
- Low: Single source, outdated, or inference

## Research Metadata

- **Tasks executed**: N
- **Searches performed**: N×2 (Tavily + Gemini per task)
- **Sources cited**: N
- **Contradictions flagged**: N
- **Open questions**: N
```

### Update Brief Status

Update `research-brief.md` status to "Complete".

### Report to User

```
Research Complete!

📁 Output: [full path]
📋 Brief: research-brief.md
📊 Report: research-report.md

Tasks: N completed
Sources: N cited (X Tavily + Y Gemini)
Contradictions: N flagged

Key findings:
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]
```

---

## Phase 7: Verify Final Report

After the report is written, run a verification pass as a final quality gate.

### Verification Strategy

Spawn **parallel Haiku sub-agents** to fact-check citations. Haiku is ideal:
fast, cheap, and verification is a focused task.

### Extract Citations to Verify

From the final report, identify:

- All URLs in the Sources table
- High-confidence claims (priority verification)
- Any claim that seems surprising or controversial

### Spawn Verification Agents

For each URL (or batch of URLs), spawn a Haiku agent:

```
Task tool with model: haiku
Prompt: "Verify this citation:
  URL: [url]
  Claim: [what the report says this URL supports]

  1. Fetch the URL using fetch-url.sh
  2. Check if the content supports the claim
  3. Return: VERIFIED, UNVERIFIED (URL inaccessible), or DISPUTED (content doesn't match)"
```

Run verifications in parallel (batch 5-10 URLs per agent for efficiency).

### Update Report with Verification Status

After verification completes, update the Sources table:

| Status | Meaning                                           |
| ------ | ------------------------------------------------- |
| ✓      | Verified - URL accessible, content supports claim |
| ⚠      | Unverified - URL inaccessible (404, timeout)      |
| ⚡     | Disputed - Content doesn't support the claim      |
| 🔍     | Unchecked - Not verified (lower priority)         |

### Handle Disputed Citations

If a citation is disputed:

1. **Do NOT silently remove it** - flag it explicitly
2. **Note what the URL actually says** vs. what was claimed
3. **Downgrade confidence** to Low
4. **Add to Contradictions section** if significant

### Verification Metadata

Add to report metadata:

```markdown
## Verification Results

- **Citations checked**: N
- **Verified**: N ✓
- **Unverified**: N ⚠
- **Disputed**: N ⚡
- **Verification method**: Haiku sub-agents with URL fetch
```

### Skip Verification When

- User requests quick/draft output
- All sources are from highly authoritative domains (official docs, etc.)
- Time constraints specified in original brief

---

## Error Handling

| Error                    | Action                                  |
| ------------------------ | --------------------------------------- |
| Tavily API fails         | Fall back to Gemini only                |
| Gemini CLI not found     | Warn user, provide install instructions |
| Output path inaccessible | Use scratchpad, notify user             |
| All verifications fail   | Flag in report, recommend manual review |

---

## Quality Checklist

Before completing:

- [ ] All 4 research angles executed
- [ ] Sources have clickable URLs
- [ ] Top citations verified
- [ ] Contradictions explicitly flagged
- [ ] Report includes metadata (search counts, verification stats)
- [ ] No "0 searches performed" warnings
- [ ] Files written to correct output location
