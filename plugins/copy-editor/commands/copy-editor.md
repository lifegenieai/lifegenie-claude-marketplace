---
description:
  Full-service copy editor — generates, edits, rewrites, transforms, and
  proofreads content with stylometric precision and AI anti-pattern guardrails
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebFetch
  - Bash
argument-hint: <style> [source] <output> [narrative direction...]
---

# Copy Editor Command

Full-service copy editing: generate new text, edit existing copy, rewrite and
transform voice, or proofread — all with stylometric precision and guardrails
against detectable AI writing patterns.

## Input Parameters

- **Style**: $1 — stylometric style definition (file path, named style, or
  quoted inline description)
- **Source**: $2 — document to transform (file path, URL, or quoted inline text)
- **Output**: $3 — file path for the result (format inferred from extension)
- **Narrative direction**: $4+ — optional additional transformation instructions

## Execution

Load and execute the `copy-editor` skill with the provided arguments.

The skill handles:

1. **Style absorption** — Reads the style input and builds an internal
   stylometric profile using the framework in
   `${CLAUDE_PLUGIN_ROOT}/skills/copy-editor/references/stylometric-framework.md`
2. **Source analysis** — Reads the source document and catalogs its current
   voice
3. **Transformation** — Applies the target style following the methodology in
   `${CLAUDE_PLUGIN_ROOT}/skills/copy-editor/references/transformation-methodology.md`
4. **Narrative direction** — Applies any additional instructions from $4+
5. **Output** — Writes the transformed document to the output path

### Style Resolution

The style argument ($1) resolves in this order:

1. **Named style** — Check
   `${CLAUDE_PLUGIN_ROOT}/skills/copy-editor/references/named-styles/` for a
   matching profile (case-insensitive, flexible matching)
2. **File path** — Read the file and extract or analyze the stylometric profile
3. **Inline description** — If quoted, extrapolate a profile from the
   description using the style profile schema at
   `${CLAUDE_PLUGIN_ROOT}/skills/copy-editor/references/style-profile-schema.md`

### Available Named Styles

| Name                     | Description                                                                       |
| ------------------------ | --------------------------------------------------------------------------------- |
| `john-roberts`           | Conversational inevitability — deceptively simple prose with premise-driven logic |
| `narrative-technologist` | Warm, story-driven technical writing that leads with human experience             |
| `walken`                 | Discovered cadence — plain, musical, staccato prose with unpredictable pauses     |

## Examples

```
/copy-editor john-roberts ./draft.md ./output.md
/copy-editor narrative-technologist ./blog-post.md ./restyled.md
/copy-editor ./brand-voice.md https://example.com/article ./restyled.html preserve all headers
/copy-editor "terse, declarative, short sentences" ./verbose.md ./clean.md
```
