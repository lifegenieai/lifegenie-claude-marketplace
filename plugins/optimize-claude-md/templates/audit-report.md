# CLAUDE.md Audit Report Template

Use this template structure for audit outputs.

```markdown
## CLAUDE.md Audit Report

**File**: [path] **Level**: [User-Level / Project-Level] **Date**: [YYYY-MM-DD]
**Total Score**: [X]/100 ([Grade])

---

### Executive Summary

[2-3 sentences summarizing the overall state and top priorities]

---

### Category Breakdown

| Category                            | Score   | Key Findings |
| ----------------------------------- | ------- | ------------ |
| Hierarchy & Universal Applicability | \_\_/20 | [summary]    |
| Format Effectiveness                | \_\_/20 | [summary]    |
| Instruction Budget Management       | \_\_/15 | [summary]    |
| Enforcement Mechanisms              | \_\_/20 | [summary]    |
| Specificity & Clarity               | \_\_/10 | [summary]    |
| Protected Boundaries                | \_\_/10 | [summary]    |
| Progressive Disclosure              | \_\_/5  | [summary]    |

**Total: \_\_/100**

---

### Grade Interpretation

| Score  | Grade     | Description                           |
| ------ | --------- | ------------------------------------- |
| 90-100 | Excellent | Production-ready with enforcement     |
| 75-89  | Good      | Solid foundation, minor improvements  |
| 60-74  | Fair      | Functional, missing key optimizations |
| <60    | Poor      | Requires significant restructuring    |

---

### Top 3 Priority Improvements

#### 1. [Issue Name] (Impact: High, Effort: Low)

**Current State**: [description of problem]

**Recommendation**: [specific action to take]

**Expected Improvement**: +[X] points

**Location**: Lines [X-Y] or Section "[name]"

#### 2. [Issue Name] (Impact: High, Effort: Medium)

[Same structure as above]

#### 3. [Issue Name] (Impact: Medium, Effort: Low)

[Same structure as above]

---

### Warning Signs

[List any red flags that require immediate attention]

- [ ] [Warning 1]
- [ ] [Warning 2]

---

### Specific Findings

#### Hierarchy & Universal Applicability (20 pts)

- Line count: [X] lines
- Universal applicability: [X]% of instructions
- Task-specific content: [present/not present]
- Score: \_\_/20

#### Format Effectiveness (20 pts)

- High-efficiency formats: [X]%
- Code examples: [X]
- XML tags: [X]
- Tables: [X]
- Score: \_\_/20

#### Instruction Budget Management (15 pts)

- Instruction count: [X]
- Must/Should markers: [X]
- Redundancy issues: [none/list]
- Score: \_\_/15

#### Enforcement Mechanisms (20 pts)

- PostToolUse hooks: [configured/not configured]
- Managed settings: [configured/not configured]
- Pre-commit/CI: [configured/not configured]
- Score: \_\_/20

#### Specificity & Clarity (10 pts)

- Explicit markers: [X]%
- Specific paths: [X]
- Ambiguous terms: [list any]
- Score: \_\_/10

#### Protected Boundaries (10 pts)

- Protected areas section: [present/missing]
- Items protected: [X]
- Consequences listed: [yes/no]
- Score: \_\_/10

#### Progressive Disclosure (5 pts)

- Reference files: [X]
- Naming convention: [clear/unclear]
- Referenced in CLAUDE.md: [yes/no]
- Score: \_\_/5

---

### Next Steps

- [ ] [Action item 1]
- [ ] [Action item 2]
- [ ] [Action item 3]

---

### Next Audit Date

Schedule re-audit for: [date, typically 2-4 weeks out]
```
