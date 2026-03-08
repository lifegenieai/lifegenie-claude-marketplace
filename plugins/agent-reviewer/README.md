# agent-reviewer

Structural validation and interactive triage for Claude Code agent files.

## What it does

The `/review-agents` command runs a 3-phase workflow:

1. **Validate** — Reads agent `.md` files, loads the current spec from `plugin-dev:agent-development`, and checks each file against severity-classified rules
2. **Triage** — Groups findings by issue type and asks you to Fix / Skip / Modify each group
3. **Fix** — Applies agreed-upon edits

## Usage

```
/review-agents path/to/agents/          # validate all agents in a directory
/review-agents path/to/single-agent.md  # validate a single file
```

## Dependencies

- **`plugin-dev` plugin** — must be installed. The `agent-development` skill is loaded at runtime as the source of truth for agent field specs. Without it, validation cannot determine valid field values.

## Components

| Component                              | Purpose                                    |
| -------------------------------------- | ------------------------------------------ |
| `commands/review-agents.md`            | Slash command — orchestrates the 3 phases  |
| `skills/agent-validation/SKILL.md`     | Severity classifications and extra checks  |

## Severity Levels

| Level       | Meaning                                                  |
| ----------- | -------------------------------------------------------- |
| CRITICAL    | Agent won't function or register — must fix              |
| IMPORTANT   | Degraded behavior (poor triggering, missing metadata)    |
| NICE-TO-HAVE | Cosmetic or optimization — fix at your discretion       |
