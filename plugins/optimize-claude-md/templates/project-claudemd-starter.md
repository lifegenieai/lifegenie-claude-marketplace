# Project CLAUDE.md Starter Template

Use this as a foundation for new project-level CLAUDE.md files. Customize each
section for your specific project.

```markdown
<system_context> | Component | Technology | |-----------|------------| |
Language | TypeScript 5.x | | Framework | [Framework + version] | | Database |
[Database + version] | | Package Manager | pnpm | </system_context>

## Project Structure

- `src/` - Source code
  - `components/` - UI components
  - `lib/` - Utilities
  - `app/` - Application routes
- `tests/` - Test files
- `docs/` - Documentation

## Development Commands

| Task    | Command        | Notes              |
| ------- | -------------- | ------------------ |
| Install | `pnpm install` | After pulling      |
| Dev     | `pnpm dev`     | Starts :3000       |
| Test    | `pnpm test`    | Before commit      |
| Build   | `pnpm build`   | Before PR          |
| Lint    | `pnpm lint`    | Auto-fix available |

<coding_guidelines>

- Read relevant files before proposing code edits
- Avoid over-engineering - minimum complexity for current task
- Don't add features beyond what was requested
- Don't create abstractions for one-time operations
- Don't add error handling for scenarios that can't happen </coding_guidelines>

<code_exploration> Read and understand relevant files before proposing code
edits. Don't speculate about code you haven't inspected. If referencing a
specific file/path, inspect it before explaining or proposing fixes.
</code_exploration>

## Protected Areas

| Area         | Rule            | Enforcement      |
| ------------ | --------------- | ---------------- |
| tests/\*     | Must not modify | CI rejection     |
| .env files   | Must not access | Blocked          |
| node_modules | Must not touch  | Managed settings |

## Boundaries

### Always Do

- Run tests before committing
- Use TypeScript for new files
- Follow existing patterns in codebase

### Ask First

- Database schema changes — requires migration planning
- New dependencies — check bundle impact

### Avoid

- console.log in production code (use logger)
- Direct DOM manipulation (use framework)
- any types (use proper typing)

## Additional Context

Task-specific docs in `agent_docs/`:

- `architecture.md` - System design
- `testing.md` - Test patterns
- `api.md` - API conventions

Read relevant files BEFORE starting related tasks.
```

## Template Notes

**Line Count Target**: <200 lines ideal, <300 max

**Customization Checklist**:

- [ ] Update tech stack versions
- [ ] Add project-specific commands
- [ ] Define actual protected areas
- [ ] Create referenced agent_docs files
- [ ] Remove sections that don't apply

**Do NOT include**:

- User preferences (belongs in ~/.claude/CLAUDE.md)
- Task-specific instructions (belongs in agent_docs)
- Style guide details (use linters)
- Embedded code snippets (use file:line pointers)
