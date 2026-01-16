# Analysis Report Template

Use this template for presenting CLAUDE.md analysis results.

---

## CLAUDE.md Analysis Report

### File Information
- **Path**: `[file path]`
- **Lines**: [count]
- **Version**: [if present in header]
- **Last Updated**: [if present]

---

### Mechanical Analysis (from analyzer)

```json
{
  "lineCount": 0,
  "aggressiveLanguage": {
    "count": 0,
    "instances": []
  },
  "xmlTags": [],
  "sections": [],
  "hasBoundariesSection": false,
  "codeBlocks": 0,
  "tables": 0,
  "externalLinks": 0,
  "whyContextCount": 0
}
```

---

### Score Summary

| Category | Score | Max | Notes |
|----------|-------|-----|-------|
| **Structure & Organization** | /25 | 25 | |
| - Length optimization | /5 | | [X lines] |
| - XML tag usage | /5 | | [X tags found] |
| - Section hierarchy | /5 | | [AI judgment] |
| - Modular references | /5 | | [X external links] |
| - Scanability | /5 | | [AI judgment] |
| **Content Quality** | /25 | 25 | |
| - Concrete examples | /5 | | [X code blocks] |
| - Commands with flags | /5 | | [AI judgment] |
| - Version specificity | /5 | | [AI judgment] |
| - "Why" context | /5 | | [X instances found] |
| - Decision guidance | /5 | | [AI judgment] |
| **Boundary Definition** | /20 | 20 | |
| - Always/Ask/Never tiers | /10 | | [present/absent] |
| - Protected areas | /5 | | [AI judgment] |
| - Workflow gates | /5 | | [AI judgment] |
| **Claude 4.5 Optimization** | /15 | 15 | |
| - Avoiding aggressive triggers | /5 | | [X instances] |
| - Positive framing | /5 | | [AI judgment] |
| - Context for motivation | /5 | | [AI judgment] |
| **Token Efficiency** | /15 | 15 | |
| - No redundancy | /5 | | [AI judgment] |
| - Essential content only | /5 | | [AI judgment] |
| - Hierarchy utilization | /5 | | [AI judgment] |

**Total: X/100** | **Rating: ⭐⭐⭐☆☆**

---

### Key Issues (By Impact)

#### High Impact
1. **[Issue Name]**
   - **Current**: `[example from file]`
   - **Proposed**: `[improved version]`
   - **Impact**: +X points

#### Medium Impact
2. **[Issue Name]**
   - **Current**: `[example]`
   - **Proposed**: `[improvement]`
   - **Impact**: +X points

#### Low Impact
3. **[Issue Name]**
   - **Current**: `[example]`
   - **Proposed**: `[improvement]`
   - **Impact**: +X points

---

### Recommended Changes

1. [ ] **Add boundaries section** at top of file
2. [ ] **Soften X aggressive language instances**
3. [ ] **Add "Why" context** to key rules
4. [ ] **Extract [section]** to module file
5. [ ] [Other recommendations]

---

### Projected Score After Improvements

| Category | Current | After | Change |
|----------|---------|-------|--------|
| Structure | /25 | /25 | +X |
| Content | /25 | /25 | +X |
| Boundaries | /20 | /20 | +X |
| Claude 4.5 | /15 | /15 | +X |
| Efficiency | /15 | /15 | +X |
| **Total** | **/100** | **/100** | **+X** |

---

### Implementation Plan

If approved:
1. Create `[module file]` with extracted content
2. Update CLAUDE.md with improvements
3. Re-run analysis to verify
4. Commit with message: "refactor(claude): optimize CLAUDE.md (score X→Y)"
