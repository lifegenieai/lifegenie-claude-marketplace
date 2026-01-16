# Setup Enforcement Workflow

## Objective

Implement deterministic enforcement mechanisms (hooks, managed settings, CI) to
ensure CLAUDE.md compliance.

## Process

### Step 1: Assess Current State

Ask user:

1. Project path
2. Tech stack (for appropriate linting tools)
3. Existing CI setup (GitHub Actions, GitLab CI, etc.)
4. Linting/formatting tools already configured
5. Sensitive files/directories to protect

### Step 2: Layer 1 - Managed Settings (Preventive)

**Purpose**: Block access to sensitive files and dangerous tools BEFORE
execution.

Create/update `.claude/settings.json`:

```json
{
  "managedSettings": {
    "blockedPaths": [
      "*.env",
      "*.env.*",
      ".env.local",
      "*.key",
      "*.pem",
      ".aws/*",
      ".gcp/*",
      "secrets/*"
    ],
    "blockedTools": ["Bash(rm:*)", "Bash(rm -rf:*)", "Bash(git push --force:*)"]
  }
}
```

**Add project-specific blocked paths:**

- Legacy code: `"src/legacy/*"`
- Generated code: `"dist/*"`, `"build/*"`
- Dependencies: `"node_modules/*"`

### Step 3: Layer 2 - PostToolUse Hooks (Detective)

**Purpose**: Auto-enforce standards AFTER file operations.

Choose strategy based on needs:

**Lightweight (Fast):**

```json
{
  "hooks": {
    "postToolUse": {
      "Edit|Write": {
        "command": "prettier --write ${file_path}"
      }
    }
  }
}
```

**Standard (Format + Lint):**

```json
{
  "hooks": {
    "postToolUse": {
      "Edit|Write": {
        "command": "prettier --write ${file_path} && eslint --fix ${file_path}"
      }
    }
  }
}
```

**Tech-specific alternatives:**

| Stack  | Command                                                    |
| ------ | ---------------------------------------------------------- |
| Python | `black ${file_path} && ruff check --fix ${file_path}`      |
| Go     | `gofmt -w ${file_path} && golangci-lint run ${file_path}`  |
| Rust   | `rustfmt ${file_path} && cargo clippy --fix --allow-dirty` |
| Biome  | `biome check --apply ${file_path}`                         |

### Step 4: Merge Settings

Combine into single `.claude/settings.json`:

```json
{
  "hooks": {
    "postToolUse": {
      "Edit|Write": {
        "command": "prettier --write ${file_path} && eslint --fix ${file_path}"
      }
    }
  },
  "managedSettings": {
    "blockedPaths": ["*.env", "*.key", "src/legacy/*"],
    "blockedTools": ["Bash(rm:*)", "Bash(git push --force:*)"]
  }
}
```

### Step 5: Layer 3 - Pre-commit Hooks (Corrective)

**Purpose**: Prevent bad commits from reaching version control.

**Option A: Husky (Node.js)**

```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm test"
```

**Option B: Git Hooks**

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
npm run lint || exit 1
npm test || exit 1
```

Make executable: `chmod +x .git/hooks/pre-commit`

### Step 6: Layer 4 - CI Checks (Corrective)

**Purpose**: Prevent bad code from merging to main.

**GitHub Actions** (`.github/workflows/code-quality.yml`):

```yaml
name: Code Quality

on:
  pull_request:
    branches: [main, master]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

### Step 7: Document in CLAUDE.md

Update project CLAUDE.md:

```markdown
## Protected Areas

| Area          | Rule                    | Enforcement       |
| ------------- | ----------------------- | ----------------- |
| Test files    | Must not modify         | CI rejection      |
| src/legacy/\* | Must not touch          | Managed settings  |
| \*.env files  | Must not access         | Managed settings  |
| Code style    | Must follow conventions | PostToolUse hooks |
| All code      | Must pass tests         | Pre-commit + CI   |

## Enforcement Layers

1. **Preventive**: Managed settings block sensitive files/tools
2. **Detective**: PostToolUse hooks auto-format/lint after edits
3. **Corrective**: Pre-commit + CI prevent bad commits/merges

Configuration in `.claude/settings.json` and CI workflows.
```

### Step 8: Verification

Test each layer:

| Layer             | Test                   | Expected       |
| ----------------- | ---------------------- | -------------- |
| Managed Settings  | Access `.env` file     | Blocked        |
| PostToolUse Hooks | Edit file with Claude  | Auto-formatted |
| Pre-commit        | Commit style violation | Rejected       |
| CI                | PR with failing tests  | CI fails       |

### Step 9: Generate Setup Report

```markdown
## Enforcement Setup Report

**Project**: [path] **Date**: [date]

### Layers Implemented

| Layer             | Status       | Details                 |
| ----------------- | ------------ | ----------------------- |
| Managed Settings  | [X] patterns | `.claude/settings.json` |
| PostToolUse Hooks | [Strategy]   | [tools used]            |
| Pre-commit        | [Method]     | [checks]                |
| CI                | [Platform]   | [checks]                |

### Testing Results

- [x] Managed settings block sensitive files
- [x] PostToolUse hooks auto-format code
- [x] Pre-commit hooks prevent bad commits
- [x] CI checks prevent bad merges

### Next Steps

1. Test with real Claude coding session
2. Monitor for false positives
3. Fine-tune based on team workflow
```

## Enforcement Checklist

- [ ] `.claude/settings.json` created
- [ ] Sensitive files/directories blocked
- [ ] Dangerous commands blocked
- [ ] PostToolUse hooks configured
- [ ] Hooks tested and working
- [ ] Pre-commit hooks installed
- [ ] CI workflow created
- [ ] Documentation updated in CLAUDE.md
- [ ] All layers tested independently

## Success Criteria

Setup is complete when:

- All enforcement layers implemented
- Each layer tested and verified
- Documentation updated
- User understands how enforcement works
