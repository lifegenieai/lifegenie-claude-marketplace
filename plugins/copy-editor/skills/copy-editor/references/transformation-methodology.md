# Copy Editing Methodology & Quality Gates

Systematic approach to all copy-editing operations: transformations, rewrites,
edits, generation, and proofreading. Follow these procedures and quality gates
for every mode of operation.

## Core Principle: Inside-Out Transformation

Transform at the structural level first, then refine surface features. Reversing
this order produces text that "sounds wrong" — the words may be right but the
rhythm betrays the original voice.

**Transformation order:**

1. Paragraph architecture (macro rhythm)
2. Sentence structure (micro rhythm)
3. Rhetorical patterns (persuasion architecture)
4. Lexical register (word choice)
5. Surface polish (punctuation, formatting)

## Phase 1: Structural Reshaping

### Paragraph Architecture

- Split or merge paragraphs to match target length distribution
- Relocate topic sentences if target prefers different positioning (e.g.,
  deductive style = topic sentence first; inductive = last)
- Add or remove single-sentence paragraphs per target frequency
- Adjust transitional passages between sections

### Sentence Restructuring

**Shortening long sentences (when target favors brevity):**

- Break at natural clause boundaries
- Convert subordinate clauses to independent sentences
- Remove unnecessary qualifiers and hedges
- Replace relative clauses with appositives or separate sentences

**Lengthening short sentences (when target favors complexity):**

- Combine related short sentences using subordination
- Add qualifying clauses for nuance
- Embed parenthetical detail
- Use periodic sentence structure (delay main clause)

**Adjusting sentence openings:**

- If target avoids "There is/are" constructions, restructure
- Match target's subject-first vs. modifier-first ratio
- Vary per target's transitional word usage patterns

## Phase 2: Voice Alignment

### Active/Passive Calibration

- Count current active/passive ratio
- Convert constructions to match target ratio
- Preserve deliberate passive usage (when agent is unknown or unimportant)
- Ensure passive conversions maintain clarity

### Point of View Adjustment

- Shift pronouns to match target's preferred POV
- When converting to first person: ensure it reads as genuine experience
- When converting to third person: maintain specificity, avoid vagueness
- When converting to second person: ensure direct address feels natural

### Authority Stance

- Add or remove hedge words per target's confidence level
- Adjust citation style (if target uses more/fewer qualifiers)
- Calibrate declarative vs. qualified assertion ratio
- Match the target's characteristic way of introducing claims

## Phase 3: Rhetorical Pattern Application

### Device Insertion

When the target style uses specific rhetorical devices:

- Identify natural opportunities in the source content
- Apply devices where they enhance rather than distort meaning
- Maintain the device's frequency — don't overuse
- Ensure devices serve the content, not the other way around

### Argumentation Restructuring

When target's argumentation pattern differs from source:

- Identify the source's logical structure
- Remap to target pattern while preserving logical validity
- If source is inductive and target is deductive: extract the implicit thesis,
  state it first, then reorganize evidence as support
- If source is deductive and target is inductive: remove thesis from opening,
  build through examples, arrive at conclusion

### Concession and Counterargument

- Match target's characteristic way of acknowledging opposing views
- Some styles dismiss opposition quickly; others engage deeply
- Adjust hedging language around concessions per target

## Phase 4: Lexical Calibration

### Vocabulary Register Shift

**Formal → Informal:**

- Replace Latinate words with Anglo-Saxon equivalents
- Shorten polysyllabic words where monosyllabic alternatives exist
- Convert noun phrases to verb forms ("the implementation of" → "implementing")
- Introduce colloquial expressions appropriate to register

**Informal → Formal:**

- Replace colloquialisms with standard register
- Expand contractions
- Convert phrasal verbs to single-word equivalents ("figure out" → "determine")
- Remove conversational fillers and discourse markers

### Domain Language

- Preserve necessary technical terminology — accuracy over style
- Adjust the level of explanation around technical terms per target audience
- If target style defines technical terms inline, add definitions
- If target style assumes expertise, remove redundant explanations

### Intensifier and Hedge Calibration

- Replace source's intensifiers with target's preferred forms
- Add or remove hedges to match target's certainty level
- Calibrate superlatives per target's rhetorical temperature

## Phase 5: Surface Polish

### Punctuation Normalization

- Convert punctuation patterns to match target (em dashes, semicolons, colons,
  parentheticals)
- Match target's list formatting style
- Align quotation mark usage (if target has preferences)

### Formatting Alignment

- Match header depth and style
- Align list formatting preferences
- Match paragraph spacing conventions
- Apply any target-specific formatting conventions

## Quality Checks

After completing any operation (transform, rewrite, edit, generate, or
proofread), verify all applicable checks. The anti-pattern enforcement gate runs
FIRST — it is the most critical check and all subsequent checks validate text
that has already passed it.

1. **AI Anti-Pattern Enforcement (MANDATORY — most critical gate)** — This is
   not a cursory scan. Execute the following protocol:
   a. **Re-read** `ai-anti-patterns.md` in full — do not rely on earlier context.
      The file must be fresh in working memory.
   b. **Per-pattern sweep** — Check EACH of the 18 patterns individually against
      the full output. For each pattern, either confirm "clean" or quote the
      violating passage and rewrite it inline.
   c. **Vocabulary scan** — Search output for every word on the AI Vocabulary
      Watchlist (pattern #12) and every copula evasion (pattern #13). One flagged
      word in a long document is acceptable. Two or more in the same section is a
      contamination event requiring rewrite.
   d. **Burstiness check** — Verify sentence length variance across 3+
      consecutive paragraphs. If all sentences within a paragraph fall within 5
      words of each other in length, rewrite for rhythm variation.
   e. **Re-scan after rewrites** — Any passage rewritten in steps b-d must be
      re-checked against all 18 patterns. Rewrites frequently introduce new
      violations (e.g., fixing a self-answering question by introducing copula
      avoidance).
   f. **Report** — In the output summary, list the count of violations caught
      per pattern category.
2. **Factual integrity** — All data points, proper nouns, citations preserved
3. **Logical coherence** — Argument still follows, no non-sequiturs introduced
4. **Voice consistency** — Verify using the checklist below
5. **No over-correction** — Dimensions already aligned should remain natural
6. **No artifacts** — No remnant phrases from source voice that clash
7. **Readability** — Text flows naturally, no awkward constructions
8. **Narrative density check** — For each paragraph, apply this test: "Could I
   rewrite this paragraph as three bullet points in a status update and lose
   nothing?" If yes, it's been flattened into a summary -- restore specificity.
   Watch especially for the MIDDLE of documents, where AI tends to drift from
   vivid prose into report mode. Symptoms of flattening:
   - Passive constructions that remove the human ("Implementation proceeded"
     instead of "I hit enter and watched it scaffold 62 files in twelve
     seconds")
   - Abstract nouns replacing lived experience ("The architectural convergence"
     instead of "Three companies shipped the same idea within a month")
   - Missing human reactions: what did someone think, say, or feel when it
     happened? If a paragraph describes an event without anyone reacting to it,
     it's a summary, not a story
9. **Tightening pass** — Re-read the output sentence by sentence:
   - For every sentence, ask: "Would the reader miss this if it vanished?" If
     not, cut it.
   - Two sentences making the same point in different words? Keep the stronger
     one, cut the other.
   - Bloated transitions: "Now that we've seen X, let's look at Y" -- just
     start Y. The reader doesn't need a narrator announcing scene changes.
   - Hedging filler that crept in: "basically," "essentially," "in order to,"
     "it should be noted that" -- delete.
   - The goal is to tighten without losing substance. Lean prose that earns
     every sentence is better than padded prose that hits a word count.
10. **Structural metrics verification** (Transform and Rewrite modes only) —
    After completing the transformation, measure the output's actual structural
    metrics and compare against the style profile's quantitative targets:
    - **Average sentence length** — Count words per sentence across the full
      output. Compare to the profile's `sentence.avg_length`.
    - **Sentence length range** — Find the shortest and longest sentences.
      Compare to the profile's `sentence.length_range`.
    - **Fragment frequency** — Count intentional fragments as a percentage of
      total sentences. Compare to the profile's `sentence.fragment_frequency`.
    - **Paragraph sentence count** — Average sentences per paragraph. Compare
      to `rhythm.paragraph_avg_sentences`.
    If any metric diverges from the profile's target by more than 30%, the
    transformation is cosmetic — word swaps on the original skeleton. Return to
    Phase 1: re-read the style profile (especially the test passage if one
    exists), then redo from Phase 3. This is the gate that catches "same
    skeleton, different shirt" transformations.
11. **Before/after diff check** (Transform and Rewrite modes only) — Select 3
    representative paragraphs from the source document and their transformed
    equivalents. For each pair, measure:
    - Sentence count
    - Average sentence length (words)
    - Longest sentence (words)
    - Shortest sentence (words)
    If before and after metrics are within 10% of each other on ALL four
    measures for ALL three paragraphs, the transformation was surface-level —
    vocabulary and punctuation changes without structural reshaping. This is a
    hard fail. Return to Phase 3 and restructure the prose, not just the words.
    Common triggers for this failure:
    - Expanding or contracting contractions without breaking sentences
    - Adding interjections to existing sentence structures instead of
      rebuilding them
    - Swapping vocabulary register while preserving clause nesting
    These are edits, not transformations. The voice lives in the sentence
    architecture, not the word choice.

### Voice Consistency Checklist (Check #4 Expanded)

Before finalizing output, verify:

- [ ] Does every section sound like the same author, or does the voice drift
      mid-document? (Common failure: technical sections shift to a different,
      more clinical register)
- [ ] Are rhetorical devices from the target style present throughout, not just
      concentrated in the opening?
- [ ] Are cultural references earned (they illuminate the point) or decorative
      (name-dropping)?
- [ ] Would you be embarrassed to read any sentence aloud? If yes, the sentence
      is trying too hard or not hard enough.
- [ ] Does the confidence level remain consistent? (No sudden shifts from
      authoritative to hedging or vice versa)
- [ ] In Transform/Rewrite modes: does the output read as if the target author
      wrote it natively, or does it read like a translation?

## Common Pitfalls

### Word-Swap Syndrome

Replacing individual words while leaving sentence structure intact. The result
reads like a thesaurus was applied. Always restructure first, then adjust words.

### Voice Averaging

Blending source and target into a middle ground that sounds like neither. Commit
fully to the target voice — half-measures produce uncanny results.

### Mechanical Regularity

Applying target patterns too uniformly. Natural writing has variance. If the
target averages 15-word sentences, that means some are 8 and some are 25 — not
all 15.

### Content Distortion

Restructuring so aggressively that factual claims shift meaning. Always verify
that transformed sentences make the same claim as the original, just differently
expressed.

### Style Overloading

Cramming every characteristic device into every paragraph. A writer who uses
tricolon doesn't use it in every sentence. Match the frequency, not just the
presence, of stylistic features.
