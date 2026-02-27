# Style Profile Schema

Structured format for defining reusable stylometric profiles. Use this schema
when creating named styles or when converting analysis notes into a formal
profile.

## Schema Format

Style profiles use YAML frontmatter followed by optional prose elaboration. All
fields are optional — include only those relevant to the style. Omitted fields
indicate "no strong preference; use natural judgment."

```yaml
---
name: "Style Name"
description: "One-sentence summary of this voice"
source: "Attribution or origin (author name, publication, brand, etc.)"

# ── Sentence Architecture ──────────────────────
sentence:
  avg_length: 18 # Average words per sentence
  length_range: [8, 35] # Min-max word count
  variance: "high" # low | medium | high
  fragment_frequency: "rare" # none | rare | occasional | frequent
  preferred_structures:
    - "simple" # simple | compound | complex | compound-complex
    - "complex"
  opening_patterns:
    - "subject-verb" # Most common opening type
    - "prepositional" # Second most common
  transitional_words: "moderate" # none | rare | moderate | frequent

# ── Lexical Profile ────────────────────────────
lexicon:
  register: "conversational-professional" # Free text descriptor
  formality: 5 # 1 (casual speech) to 10 (legal/academic)
  latinate_preference: "balanced" # anglo-saxon | balanced | latinate
  vocabulary_level: "educated-general" # basic | general | educated-general | specialist | academic
  intensifiers:
    preferred: ["remarkably", "genuinely", "strikingly"]
    avoided: ["very", "really", "extremely"]
  hedges:
    frequency: "low" # none | low | moderate | high
    preferred: ["tends to", "in most cases"]
  forbidden_words:
    - "delve"
    - "leverage"
    - "unlock"
    - "game-changer"
    - "cutting-edge"

# ── Voice and Stance ───────────────────────────
voice:
  active_passive_ratio: "85/15" # Approximate active/passive split
  point_of_view: "first-plural" # first-singular | first-plural | second | third
  authority: "confident-but-curious" # Free text descriptor
  confidence_level: 7 # 1 (heavily hedged) to 10 (absolute declarations)
  reader_relationship: "knowledgeable peer" # How the author relates to reader

# ── Rhythm and Cadence ─────────────────────────
rhythm:
  paragraph_avg_sentences: 4 # Average sentences per paragraph
  single_sentence_paragraphs: "occasional" # none | rare | occasional | frequent
  punctuation:
    em_dash: "frequent" # none | rare | occasional | frequent
    semicolon: "rare"
    colon: "moderate"
    parenthetical_style: "em-dash" # parens | em-dash | commas | mixed
  pacing: "varies" # steady | varies | builds | staccato

# ── Rhetorical Devices ─────────────────────────
rhetoric:
  characteristic_devices:
    - "tricolon"
    - "rhetorical-question"
    - "understatement"
  metaphor_density: "moderate" # none | sparse | moderate | rich | dense
  metaphor_type: "fresh" # dead | conventional | fresh | extended
  argumentation: "inductive" # inductive | deductive | mixed | narrative
  evidence_style: "anecdotal-then-data" # data | anecdotal | mixed | anecdotal-then-data

# ── Structural Conventions ─────────────────────
structure:
  headers: "minimal" # none | minimal | moderate | granular
  lists: "rare" # none | rare | occasional | frequent
  intro_pattern: "anecdote" # hook | thesis | anecdote | question | context
  conclusion_pattern: "open-question" # summary | call-to-action | open-question | callback

# ── Signature Moves ────────────────────────────
# The 3-5 most distinctive features of this voice.
# These should be prioritized during transformation.
signature_moves:
  - "Opens with a specific, concrete image before generalizing"
  - "Uses tricolon at paragraph endings for emphasis"
  - "Favors short declarative sentences after complex ones"
  - "Addresses the reader directly in moments of insight"
---
```

## Prose Elaboration (Optional)

Below the frontmatter, include free-form notes that capture aspects of the voice
too nuanced for structured fields:

```markdown
## Voice Notes

This style carries the authority of someone who has seen a lot but isn't tired
of it. There's genuine curiosity underneath the confidence — the kind of writer
who presents conclusions but remains visibly interested in being proven wrong.

Paragraphs often follow a pattern: setup (1-2 sentences of context), pivot (a
"but" or "however" that reframes), then delivery (the actual point, stated
plainly). The pivot is the signature — nearly every paragraph has one.

## What This Style Is NOT

- Not academic: avoids citation-heavy prose and hedging
- Not casual: no slang, no sentence fragments for effect
- Not journalistic: doesn't use inverted pyramid or quote-heavy structure
```

## Creating a Named Style

To register a style profile as a named shorthand:

1. Create the profile following this schema
2. Save to `references/named-styles/<name>.md`
3. The name becomes usable as argument 1 in the skill invocation:
   `/copy-editor <name> source.md output.md`

## Minimal Profile

Not all fields need specification. A minimal but useful profile:

```yaml
---
name: "Terse Technical"
description: "Direct, minimal, engineering-oriented prose"
sentence:
  avg_length: 12
  variance: "low"
  fragment_frequency: "occasional"
lexicon:
  formality: 4
  latinate_preference: "anglo-saxon"
voice:
  active_passive_ratio: "95/5"
  confidence_level: 9
signature_moves:
  - "State the fact. No preamble."
  - "One idea per sentence, no exceptions"
  - "Code examples replace lengthy explanations"
---
```
