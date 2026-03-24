---
name: agent-validation
description: "This skill should be used when the user asks to validate, lint, or check Claude Code agent files, review agent frontmatter fields, or verify agent configurations against the official spec. Trigger phrases: 'validate my agents', 'check this agent file', 'lint agent files', 'review agent configs'."
version: 0.2.0
---

# Agent Validation Methodology

## Source of Truth

The official spec lives at **https://code.claude.com/docs/en/sub-agents**. Before validating format-specific rules (valid field names, allowed values, required vs optional), fetch the current spec using Context7:

```
Context7 library ID: /llmstxt/code_claude_llms_txt
Query: "subagent frontmatter supported fields required optional valid values"
```

If Context7 is unavailable, use WebFetch on `https://code.claude.com/docs/en/sub-agents` and extract the "Supported frontmatter fields" table.

**Do not validate from training data or cached knowledge.** The spec changes frequently.

## Spec Violations (from official docs)

These checks enforce documented requirements. Severity: **CRITICAL**.

| Check                    | Rule                                                        |
| ------------------------ | ----------------------------------------------------------- |
| YAML parses              | Frontmatter between `---` delimiters must be valid YAML     |
| `name` present           | Required. Lowercase letters, numbers, hyphens only          |
| `description` present    | Required. Tells Claude when to delegate to this agent       |
| Duplicate names          | No two agent files may define the same `name` value         |
| `tools` type (if set)    | Must be a comma-separated string or YAML list, not a quoted comma-string like `"Read,Write"` |

## Recommendations (engineering judgment)

These are not documented requirements but improve agent quality. Severity: **IMPORTANT** unless noted.

| Check                      | Rule                                                              | Severity     |
| -------------------------- | ----------------------------------------------------------------- | ------------ |
| Description length         | Descriptions over 200 chars may waste context on every message    | IMPORTANT    |
| Description with examples  | Official examples use 1-2 sentences, not `<example>` blocks       | IMPORTANT    |
| System prompt exists       | Body after frontmatter should contain a system prompt             | IMPORTANT    |
| System prompt voice        | Should use 2nd person ("You are...", "Your role is...")           | NICE-TO-HAVE |
| `model: opus` cost flag    | Flag for cost awareness — not an error, just a heads-up           | NICE-TO-HAVE |

## Validation Procedure

For each agent file:

1. Parse YAML frontmatter (between `---` delimiters)
2. Parse markdown body (everything after second `---`)
3. Run spec violation checks first, then recommendation checks
4. Record findings as structured data:
   - `severity`: CRITICAL | IMPORTANT | NICE-TO-HAVE
   - `source`: "official docs" or "recommendation"
   - `file`: filename
   - `field`: which field or section
   - `issue`: what's wrong
   - `suggested_fix`: how to fix it
5. An agent with zero findings is "passing"

## Severity Definitions

- **CRITICAL**: Agent will not function correctly or will fail to register. Must fix. Source: official docs.
- **IMPORTANT**: Agent will function but may have suboptimal behavior or waste context. Should fix. Source: engineering judgment.
- **NICE-TO-HAVE**: Cosmetic or optimization suggestions. Fix at user's discretion.
