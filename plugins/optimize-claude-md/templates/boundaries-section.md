# Boundaries Section Template

Copy and customize this template when adding a boundaries section to a CLAUDE.md file.

---

## 🚦 Action Boundaries

<boundaries>

### ✅ Always Do
- Run `[quality command]` before commits
- [Required action] ([brief reason])
- [Another required action]

### ⚠️ Ask First
- Modifying [protected files] — [why confirmation needed]
- Changes to [sensitive area] — [consequence of mistakes]
- Adding new [things that need review]

### ❌ Avoid
- [Dangerous action] (blocked by [mechanism] / causes [problem])
- [Anti-pattern] ([why it's problematic])
- Committing [sensitive files] (gitignored / security risk)

</boundaries>

---

## Customization Notes

### Always Do Section
- Include pre-commit quality gates
- List verification steps for common tasks
- Add reading requirements (read before edit)

### Ask First Section
- Protected file types (tests, migrations, configs)
- Architectural decisions
- Dependency changes
- Anything with blast radius

### Avoid Section
- Things blocked by tooling (just explain the mechanism)
- Anti-patterns with consequences
- Security-sensitive actions
- Keep consequences brief and in parentheses

---

## Example: Next.js Project

```markdown
## 🚦 Action Boundaries

<boundaries>

### ✅ Always Do
- Run `npm run build && npm test` before commits
- Use Server Components for data fetching (reduces bundle, improves SEO)
- Verify column names against schema before writing queries
- Read files before proposing edits

### ⚠️ Ask First
- Modifying test files (`*.test.ts(x)`) — canonical specs
- Changes to database migrations — schema history
- Adding new dependencies — bundle size impact
- Changes to authentication flow — security implications

### ❌ Avoid
- Direct pushes to master (blocked by pre-push hook)
- Using `any` types (breaks compile-time safety, disables autocomplete)
- Hardcoding design values (use semantic tokens for theme consistency)
- Committing secrets (`.env*`, `*.key`, `*.pem`)

</boundaries>
```
