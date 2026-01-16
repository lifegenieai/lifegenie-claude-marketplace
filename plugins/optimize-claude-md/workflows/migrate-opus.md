# Migrate to Opus 4.5+ Workflow

## Objective

Adjust an existing CLAUDE.md file for Opus 4.5+ behavioral differences to
prevent overtriggering and improve code quality.

## Process

### Step 1: Read Existing File

Load the current CLAUDE.md and identify areas needing adjustment.

### Step 2: Language Softening

**Problem**: Opus 4.5 is more responsive to system prompts. Aggressive language
causes overtriggering.

**Find and replace:**

| Find                  | Replace                   |
| --------------------- | ------------------------- |
| `CRITICAL: You MUST`  | `Must`                    |
| `ALWAYS call`         | `Call`                    |
| `You are REQUIRED to` | `Should`                  |
| `NEVER skip`          | `Don't skip`              |
| `YOU MUST`            | `Must`                    |
| `YOU SHOULD`          | `Should`                  |
| `IMPORTANT:` (prefix) | (remove, use XML instead) |
| `MANDATORY`           | `Required`                |

**Pattern**: Replace ALL CAPS → normal case.

### Step 3: Add Over-Engineering Prevention

Check if present. If not, add:

```markdown
<coding_guidelines>

- Avoid over-engineering. Only make changes directly requested or clearly
  necessary. Keep solutions simple and focused.
- Don't add features, refactor code, or make "improvements" beyond what was
  asked. A bug fix doesn't need surrounding code cleaned up.
- Don't add error handling, fallbacks, or validation for scenarios that can't
  happen. Trust internal code and framework guarantees.
- Don't create helpers, utilities, or abstractions for one-time operations.
  Don't design for hypothetical future requirements. </coding_guidelines>
```

### Step 4: Add Code Exploration Requirements

Check if present. If not, add:

```markdown
<code_exploration> Read and understand relevant files before proposing code
edits. Don't speculate about code you haven't inspected. If referencing a
specific file/path, inspect it before explaining or proposing fixes. Be rigorous
in searching code for key facts. </code_exploration>
```

### Step 5: Replace "Think" Language

**Problem**: Without extended thinking enabled (default), Opus 4.5 is sensitive
to "think" language.

| Find                         | Replace                       |
| ---------------------------- | ----------------------------- |
| `think about`                | `consider`                    |
| `think through`              | `evaluate`                    |
| `I think`                    | `I believe`                   |
| `think carefully`            | `consider carefully`          |
| `thinking` (in instructions) | `evaluating` or `considering` |

**Note**: Only apply if extended thinking is NOT enabled.

### Step 6: Verify XML Tag Usage

Ensure critical sections use XML tags:

```markdown
<system_context> [content] </system_context>

<critical_notes> [content] </critical_notes>

<coding_guidelines> [content] </coding_guidelines>

<boundaries>
[content]
</boundaries>
```

Don't use markdown headings alone for critical instructions.

### Step 7: Test Priority Markers

Ensure Must/Should/Should not use normal case:

**Correct:**

- Must run tests before committing
- Should use TypeScript for new files
- Should not add console.log in production

**Incorrect (avoid):**

- MUST run tests before committing
- SHOULD use TypeScript for new files

### Step 8: Verification Pass

Checklist:

- [ ] No ALL CAPS emphasis remaining
- [ ] Over-engineering prevention present
- [ ] Code exploration requirements present
- [ ] "Think" language replaced (if applicable)
- [ ] XML tags used for critical sections
- [ ] Must/Should markers use normal case
- [ ] File still <300 lines
- [ ] All instructions still universally applicable

### Step 9: Generate Migration Report

```markdown
## Opus 4.5 Migration Report

**File**: [path] **Date**: [date]

### Changes Applied

| Change                        | Count           |
| ----------------------------- | --------------- |
| ALL CAPS removed              | [X]             |
| Over-engineering prevention   | [Added/Present] |
| Code exploration requirements | [Added/Present] |
| "Think" language replaced     | [X]             |
| XML tags added                | [X]             |

### Before/After

| Metric             | Before | After |
| ------------------ | ------ | ----- |
| ALL CAPS instances | [X]    | 0     |
| XML tag sections   | [X]    | [Y]   |
| Total line count   | [X]    | [Y]   |

### Expected Improvements

- Reduced overtriggering on system instructions
- Better code quality (less over-engineering)
- More thorough code exploration before proposals
- Improved instruction following
```

### Step 10: Test Recommendations

After migration:

1. Test with real coding task using Opus 4.5
2. Monitor for overtriggering or undertriggering
3. Fine-tune based on actual behavior observed

## Migration Checklist

- [ ] ALL CAPS emphasis replaced with normal case
- [ ] Over-engineering prevention guidelines added
- [ ] Code exploration requirements added
- [ ] "Think" language replaced (if applicable)
- [ ] XML tags used for critical sections
- [ ] Must/Should markers use normal case
- [ ] File still within size/instruction limits
- [ ] Migration report generated
- [ ] Tested with real task

## Success Criteria

Migration is complete when:

- All checklist items verified
- File tested with Opus 4.5 on real task
- Overtriggering behaviors resolved
- Code quality improves
- User satisfied with results
