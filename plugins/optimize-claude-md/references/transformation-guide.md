# Language Transformation Guide

Patterns for converting aggressive or bare instructions into Claude 4.5-optimized guidance.

---

## Aggressive → Softer Framing

### Pattern: State the mechanism, not the prohibition

| Aggressive | Softer | Why It Works |
|------------|--------|--------------|
| "NEVER push to master" | "Direct pushes to master are blocked by pre-push hook" | States the reality without triggering over-caution |
| "NEVER use local Docker" | "This project uses remote hosted Supabase (no local Docker)" | Explains the setup positively |
| "ALWAYS run tests" | "Run tests before commits" | Direct instruction without urgency |
| "YOU MUST verify" | "Verify before proceeding" | Removes accusatory "you" |

### Pattern: Replace mandate with default/preference

| Aggressive | Softer | Why It Works |
|------------|--------|--------------|
| "ALWAYS use Server Components" | "Server Components are the default" | Establishes norm without command |
| "MUST use getUser()" | "Use getUser() for auth checks" | Direct guidance |
| "MANDATORY code review" | "All changes require code review" | States requirement factually |

### Pattern: Remove emphasis words entirely

| Aggressive | Softer | Why It Works |
|------------|--------|--------------|
| "CRITICAL: Never assume" | "Verify issues before diagnosing" | The instruction is clear without "critical" |
| "IMPORTANT: Always check" | "Check before proceeding" | The placement makes it important |
| "WARNING: Do not modify" | "Protected file - regenerate instead" | Explains what to do |

---

## Adding "Why" Context

### Pattern: Append benefit with em-dash

```markdown
Before: Server Components default
After:  Server Components default — reduces bundle size, improves SEO, enables streaming
```

### Pattern: Parenthetical explanation

```markdown
Before: No `any` types
After:  No `any` types (catches bugs at compile time, enables IDE autocomplete)
```

### Pattern: Table with "Why" column

```markdown
| Rule | Why |
|------|-----|
| Server Components default | Smaller bundle, better SEO |
| Use `getUser()` | Returns null safely, handles expired sessions |
```

---

## Common Transformations

### Technology Rules

| Before | After |
|--------|-------|
| "NEVER use any types" | "Avoid `any` types (breaks type safety, disables autocomplete)" |
| "ALWAYS await createClient()" | "Server client requires await: `const supabase = await createClient()`" |
| "MUST use semantic tokens" | "Use semantic tokens (`bg-background`) for theme consistency" |

### Git/Workflow Rules

| Before | After |
|--------|-------|
| "NEVER commit to master" | "Direct commits to master are blocked by hooks" |
| "ALWAYS create PR" | "All changes go through PRs" |
| "MUST run build before commit" | "Run `npm run build && npm test` before commits" |

### File Protection Rules

| Before | After |
|--------|-------|
| "NEVER edit types.ts directly" | "types.ts is auto-generated — regenerate instead of editing" |
| "DO NOT modify ui/* components" | "ui/* contains shadcn originals — customize, don't replace" |
| "NEVER commit .env files" | "Secrets (.env*, *.key) are gitignored" |

---

## Boundaries Section Transformation

### Before (scattered rules)
```markdown
## Rules
- Never push to master
- Always run tests
- Don't modify test files without asking
- Never commit secrets
```

### After (structured boundaries)
```markdown
## 🚦 Action Boundaries

<boundaries>

### ✅ Always Do
- Run `npm run build && npm test` before commits
- Use Server Components for data fetching (reduces bundle, improves SEO)

### ⚠️ Ask First
- Modifying test files (`*.test.ts(x)`) — canonical specs
- Changes to database migrations — schema history

### ❌ Avoid
- Direct pushes to master (blocked by pre-push hook)
- Using `any` types (breaks compile-time safety)
- Committing secrets (`.env*`, `*.key`)

</boundaries>
```

---

## Quick Reference Checklist

When transforming a CLAUDE.md:

- [ ] Replace NEVER/MUST/ALWAYS/CRITICAL with softer alternatives
- [ ] Add "Why" context to key rules (at least 5+)
- [ ] Group scattered rules into boundaries section
- [ ] Use positive framing ("Use X" not "Don't use Y")
- [ ] State mechanisms over prohibitions
- [ ] Remove accusatory "YOU" from instructions
