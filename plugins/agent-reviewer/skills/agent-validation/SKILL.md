---
name: agent-validation
description: "This skill should be used when the user asks to validate, lint, or check Claude Code agent files, review agent frontmatter fields, or verify agent configurations against the official spec. Trigger phrases: 'validate my agents', 'check this agent file', 'lint agent files', 'review agent configs'."
version: 0.1.0
---

# Agent Validation Methodology

**IMPORTANT**: Always load the `plugin-dev:agent-development` skill FIRST to get the current spec. The rules below encode severity classifications and additional checks — the agent-development skill is the source of truth for what fields exist and their valid values.

## Frontmatter Field Checks

Validate each field's constraints and allowed values against the `agent-development` skill spec. Apply these severities:

| Field         | Severity if missing/invalid                          |
| ------------- | ---------------------------------------------------- |
| `name`        | CRITICAL                                             |
| `description` | CRITICAL (missing) / IMPORTANT (no examples)         |
| `model`       | CRITICAL                                             |
| `color`       | IMPORTANT                                            |
| `tools`       | CRITICAL (if present but wrong type, e.g. not array) |

## System Prompt Checks

| Check              | Rule                                                    | Severity     |
| ------------------ | ------------------------------------------------------- | ------------ |
| Length              | 20-10,000 characters                                    | IMPORTANT    |
| Voice               | Should use 2nd person ("You are...", "Your role is...") | NICE-TO-HAVE |

## Additional Checks

### Cost Flags

- If `model: opus` — flag for cost justification. This is not an error, but should be noted so the user can confirm intent. Severity: NICE-TO-HAVE.

### Structural Issues

- **Duplicate agent names**: If multiple files define the same `name` field value, flag all duplicates. Severity: CRITICAL.
- **`tools` as comma-string**: Check if `tools` is a single string with commas (e.g., `tools: "Read,Write,Edit"`) instead of a YAML array. Severity: CRITICAL.
- **Invalid color values**: Flag values not in the allowed set defined by the `agent-development` skill spec. Severity: IMPORTANT.

### Description Quality

- **`<example>` blocks in system prompt body**: If the markdown body contains `<example>` blocks that look like they belong in the `description` field (i.e., they show triggering patterns like "user: ..." / "assistant: ..."), flag them. Severity: IMPORTANT.
- **No `<example>` blocks anywhere**: If neither the description nor body contains example triggering patterns, flag. Severity: IMPORTANT.

## Validation Procedure

For each agent file:

1. Parse YAML frontmatter (between `---` delimiters)
2. Parse markdown body (everything after second `---`)
3. Run each check from the tables above
4. Record findings as structured data:
   - `severity`: CRITICAL | IMPORTANT | NICE-TO-HAVE
   - `file`: filename
   - `field`: which field or section
   - `issue`: what's wrong
   - `suggested_fix`: how to fix it
5. An agent with zero findings is "passing"

## Severity Definitions

- **CRITICAL**: Agent will not function correctly or will fail to register. Must fix.
- **IMPORTANT**: Agent will function but may have degraded behavior (poor triggering, missing metadata). Should fix.
- **NICE-TO-HAVE**: Cosmetic or optimization suggestions. Fix at user's discretion.
