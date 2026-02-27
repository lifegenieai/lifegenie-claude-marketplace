# Copy Editor — Stylometric Document Transformer

A Claude Code plugin that transforms documents by applying target writing styles
while preserving factual accuracy and core meaning. Operates as a senior
literary ghostwriter with deep expertise in stylometry.

## Usage

```
/copy-editor <style> <source> <output> [narrative direction...]
```

### Arguments

| Position | Name                | Required | Description                                       |
| -------- | ------------------- | -------- | ------------------------------------------------- |
| 1        | Style               | Yes      | Target voice (named style, file path, or inline)  |
| 2        | Source              | Yes      | Document to transform (file path, URL, or inline) |
| 3        | Output              | Yes      | Output file path (format inferred from extension) |
| 4+       | Narrative Direction | No       | Additional transformation instructions            |

### Style Input Options

- **Named style** — Pre-defined profiles: `john-roberts`,
  `narrative-technologist`
- **File path** — A reference document or structured style profile (`.md`,
  `.txt`, `.pdf`)
- **Inline description** — Quoted string (e.g.,
  `"formal academic, passive voice"`)

## Examples

```bash
# Apply the John Roberts style to a draft
/copy-editor john-roberts ./draft.md ./output.md

# Use the narrative technologist voice
/copy-editor narrative-technologist ./blog-post.md ./restyled.md

# Apply a custom style from a reference document
/copy-editor ./brand-voice.md ./article.md ./restyled.md

# Inline style with narrative direction
/copy-editor "terse, declarative, Anglo-Saxon vocabulary" ./verbose.md ./clean.md make accessible to general audience
```

## Named Styles

| Name                     | Description                                                                       |
| ------------------------ | --------------------------------------------------------------------------------- |
| `john-roberts`           | Conversational inevitability — deceptively simple prose with premise-driven logic |
| `narrative-technologist` | Warm, story-driven technical writing that leads with human experience             |

### Adding Custom Styles

Create a style profile following the schema in
`skills/copy-editor/references/style-profile-schema.md` and place it in
`skills/copy-editor/references/named-styles/`.

## How It Works

The transformer follows a 5-phase methodology:

1. **Style Absorption** — Analyzes the target voice across sentence
   architecture, lexical profile, rhythm, rhetorical devices, and structural
   conventions
2. **Source Analysis** — Catalogs the source document's current voice and maps
   the delta to the target
3. **Transformation** — Restructures at the sentence, lexical, rhythmic, and
   rhetorical levels (inside-out: structure first, then surface)
4. **Narrative Direction** — Applies any additional user instructions
5. **Output** — Writes the result and summarizes key transformations applied

## Reference Files

- `stylometric-framework.md` — Analysis dimensions for building stylometric
  profiles
- `transformation-methodology.md` — Systematic approach to applying style
  transformations
- `style-profile-schema.md` — YAML schema for defining reusable style profiles
- `style-profile-example.md` — Complete example of a structured style profile
