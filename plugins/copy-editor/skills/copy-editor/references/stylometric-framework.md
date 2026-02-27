# Stylometric Analysis Framework

A comprehensive framework for building stylometric profiles from source
material. Apply these dimensions when analyzing either a style reference
document or a source document's current voice.

## Analysis Dimensions

### 1. Sentence Architecture

**Sentence Length Distribution**

- Measure: average words per sentence, standard deviation, range
- Pattern: Does the author favor uniform length or high variance?
- Signature: Short-short-long? Cascading? Periodic sentences?
- Fragments: Frequency and purpose of intentional fragments

**Clause Structure**

- Simple vs. compound vs. complex sentence ratio
- Subordination depth (levels of nested clauses)
- Preferred conjunction patterns (coordinating vs. subordinating)
- Parenthetical frequency and placement

**Sentence Opening Patterns**

- Subject-verb ratio in openings (vs. prepositional, participial, adverbial)
- Frequency of transitional openings ("However," "Moreover," "In fact,")
- Use of interrogative openings
- Inverted syntax frequency

### 2. Lexical Profile

**Vocabulary Register**

- Latinate vs. Anglo-Saxon word preference
- Technical density (domain jargon frequency)
- Formality level (1-10 scale: casual speech to legal/academic prose)
- Readability metrics: approximate Flesch-Kincaid grade level

**Word Choice Signatures**

- Preferred intensifiers (very, extremely, remarkably, quite)
- Hedge words frequency (perhaps, somewhat, arguably, tends to)
- Concrete vs. abstract noun ratio
- Action verb vs. state verb preference

**Forbidden or Avoided Language**

- Words the target style never uses
- Cliches or idioms the style avoids
- AI-associated language to exclude (delve, leverage, realm, unlock,
  game-changer, cutting-edge, etc.)

### 3. Voice and Stance

**Active/Passive Ratio**

- Measure percentage of passive constructions
- Context: When does the author choose passive deliberately?
- Agentless passives vs. by-agent passives

**Point of View**

- First person singular (I) vs. plural (we)
- Second person (you) — direct address frequency
- Third person distance
- Editorial "we" usage

**Authority Positioning**

- Declarative vs. qualified assertions
- Citation/evidence style (inline, parenthetical, narrative)
- Confidence markers (certainly, clearly, undoubtedly)
- Uncertainty markers (might, could, appears to)

### 4. Rhythm and Cadence

**Paragraph Architecture**

- Average paragraph length (sentences)
- Single-sentence paragraph frequency
- Opening/closing paragraph patterns
- Transitional paragraph usage

**Punctuation Rhythm**

- Em dash frequency and purpose
- Semicolon usage patterns
- Colon usage (introductory vs. elaborative)
- Parenthetical style (parens, dashes, commas)
- Ellipsis usage

**Pacing Patterns**

- Information density per sentence
- Breathing room (where does the prose slow down?)
- Acceleration patterns (where does it speed up?)
- List and enumeration style

### 5. Rhetorical Devices

**Characteristic Devices**

- Anaphora (repetition at sentence starts)
- Tricolon (groups of three)
- Antithesis (contrasting pairs)
- Rhetorical questions
- Understatement/litotes
- Hyperbole frequency
- Metaphor density and type (dead vs. fresh, extended vs. quick)

**Argumentation Pattern**

- Inductive (examples → conclusion) vs. deductive (thesis → support)
- Concession-then-counter pattern frequency
- Analogical reasoning frequency
- Narrative/anecdotal evidence vs. data/statistical evidence

### 6. Structural Conventions

**Document Organization**

- Header usage and granularity
- Section length preferences
- Introduction pattern (hook type, context setting)
- Conclusion pattern (summary, call to action, open question)

**Formatting Preferences**

- Bullet/list usage vs. prose paragraphs
- Table usage
- Blockquote/pull-quote style
- Code block conventions (if technical)

## Building a Profile

When analyzing a reference document:

1. Read the entire document before beginning analysis
2. Collect quantitative measurements first (sentence lengths, word counts,
   passive voice percentage)
3. Identify qualitative patterns (what makes this voice distinctive?)
4. Note 3-5 "signature moves" — the most distinctive stylistic features
5. Identify what the style is NOT (negative space is informative)
6. Synthesize into a profile using the schema in `style-profile-schema.md`

When the style input is a brief description rather than a full document,
extrapolate from the description using these dimensions as a guide, filling in
reasonable defaults for unspecified dimensions based on the described register
and context.

## Delta Mapping

When comparing source voice to target voice:

1. Score each dimension for both source and target
2. Identify dimensions with the largest gap — these require the most work
3. Identify dimensions already aligned — preserve these, don't over-correct
4. Prioritize transformation effort: rhythm and sentence architecture create the
   strongest "voice" impression and should be adjusted first
5. Lexical changes should follow structural changes, not lead them
