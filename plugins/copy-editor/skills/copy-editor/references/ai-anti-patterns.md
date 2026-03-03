# AI Writing Anti-Patterns

These are hard rules. Every piece of output — generated, edited, rewritten, or
transformed — must be scanned against these patterns during the Phase 5 quality
gate. If any pattern is detected, rewrite the offending passage. Zero tolerance.

These patterns are structural fingerprints of AI-generated text. They appear
regardless of vocabulary quality or topic. A reader may not be able to name the
pattern, but they will feel that something is off. Each pattern includes: the
tell, symptoms, examples, why it's a tell, and what to do instead.

---

## 1. Rhetorical Contrastive Negation

**The tell:** "Not X. Y." or "Not X. Just Y." or "It's not about X. It's about
Y." A negation followed by an affirmation, framed as revelation.

**Symptoms:**

- Two short sentences, first negating, second affirming
- Often starts with "Not" or "It's not about"
- The pair is supposed to sound like a mic drop

**Examples:**

- "Not just a tool. A methodology."
- "It's not about the code. It's about the process."
- "Not hype. Results."

**Why it's a tell:** This is the single most common LLM writing pattern. It
sounds confident and pithy to a machine. To a human reader it sounds like a
LinkedIn post.

**Instead:** Make the point directly.

- "The process matters more than the code, and here's three hours of public
  embarrassment proving it."

---

## 2. Parallel Binary Comparisons

**The tell:** Balanced A/B sentence pairs with mirrored structure. One thing
does X, the other does Y, and the two clauses are suspiciously symmetrical.

**Symptoms:**

- Two clauses with identical grammatical structure
- "Where X gives you A, Y gives you B"
- "One approach [verb]. The other [same verb]."

**Examples:**

- "Where vibecoding gives you speed, spec-driven development gives you
  correctness."
- "One approach trusts the model. The other trusts the process."

**Why it's a tell:** Real comparisons are messy. Things don't map 1:1 onto neat
structural parallels. When they do in prose, it's because the writer
manufactured the symmetry.

**Instead:** Show the comparison through narrative. Tell the story of A failing,
then tell the story of B succeeding. Let the reader draw the conclusion.

---

## 3. Asyndetic Tricolon with a Kicker

**The tell:** Three short fragments in sequence, followed by a punchline.
"X. Y. Z. And then [dramatic conclusion]."

**Symptoms:**

- Three sentence fragments, usually 1-4 words each
- Followed by a longer sentence starting with "And"
- Designed to build rhythm toward a reveal

**Examples:**

- "Fast. Cheap. Wrong. And deployed to production."
- "No tests. No specs. No way to verify. And 25% of Y Combinator is built this
  way."

**Why it's a tell:** Natural tricolons occur inside flowing paragraphs, not as
standalone staccato fragments designed to sound dramatic.

**Instead:** Embed the list in a flowing sentence.

- "No tests, no specs, no way to verify if it's doing what you actually wanted."

---

## 4. Choppy Fragment Chains

**The tell:** Multiple sentence fragments in sequence for "dramatic effect."
Each fragment is 1-5 words, usually noun phrases.

**Symptoms:**

- Three or more consecutive fragments
- No verbs, just noun phrases with periods
- Reads like a movie trailer voiceover

**Examples:**

- "Purple gradients. Chat interface. Zero tests. Pure vibes."
- "Same model. Same prompt. Different result."

**Why it's a tell:** It substitutes rhythm for meaning. Every fragment carries
equal weight, which means none of them carry any weight.

**Instead:** Write actual sentences.

- "You get something that looks like an app. Purple gradients, chat interface,
  the whole AI-generated aesthetic. But underneath? Useless error handling."

---

## 5. Symmetrical LLM Patterns

**The tell:** Any sentence where the two halves mirror each other structurally.
The clauses are balanced like a seesaw.

**Symptoms:**

- "[Subject A] [verb] [object]. [Subject B] [same verb] [contrasting object]."
- Chiasmus or antithesis that reads like a fortune cookie
- Inverted parallelism: "X without Y yields A. Y without X yields B."

**Examples:**

- "The model is smart, but the context is dumb."
- "Process without knowledge yields organized hallucinations. Knowledge without
  process yields correctly spelled chaos."

**Why it's a tell:** These read like fortune cookies. The structural balance
makes the writer feel clever, but the reader feels lectured.

**Instead:** Make the point once, directly, without the balancing act.

- "The linter will tell your code what's wrong, but it has no idea what your
  API endpoint actually needs to look like. That's what integration tests are
  for."

---

## 6. Self-Answering Fragment Questions

**The tell:** A short noun phrase posed as a question, immediately answered by
its own punchy fragment. The "question" never actually asks anything.

**Symptoms:**

- [Short noun phrase, 2-4 words]? [Short declarative fragment].
- Two fragments, neither a real sentence
- The question mark is doing the work of an em-dash

**Examples:**

- "And the UI? No purple gradients."
- "The result? A cleaner architecture."
- "The best part? It just works."
- "The takeaway? Context is everything."

**Why it's a tell:** It creates fake dramatic tension where none exists. It's a
formatting trick pretending to be rhetoric.

**Instead:** Use real rhetorical questions that invite the reader to think.

- "You know what's worse than an agent that hallucinates an API? One that
  hallucinates the error message too."

Real rhetorical questions work because the reader pauses to consider them. The
self-answering version never invites thought.

---

## 7. Parenthetical Em-Dashes

**The tell:** Paired em-dashes used to set off an aside, where commas or
parentheses would do the same job.

**Symptoms:**

- "X -- [subordinate clause] -- Y" structure
- The aside between the dashes is not dramatic or surprising enough to warrant
  them
- Often used for simple relative clauses or appositives

**Examples:**

- "The agent -- which had already failed twice -- tried again."
- "The project's CLI -- the part most developers interact with first -- handles
  all of this."

**Why it's a tell:** Paired em-dashes make every aside feel like a dramatic
reveal when it's just a subordinate clause. LLMs scatter them everywhere because
they pattern-match on "emphasis" without understanding that not everything
deserves it.

**Instead:** Use commas or parentheses.

- "The agent, which had already failed twice, tried again."
- "The project's CLI (the part most developers interact with first) handles all
  of this."

**Note:** A single em-dash for a hard break at the end of a clause is fine:
"It worked -- barely." It's the matched pair acting as fancy commas that's the
problem.

---

## 8. Excessive Em-Dashes

**The tell:** More than two em-dashes per section, even when used correctly.

**Symptoms:**

- Three or more em-dashes in a paragraph
- Em-dashes used as default punctuation instead of commas, colons, or periods

**Why it's a tell:** Moderate em-dash usage is fine. One or two per section is
natural. Five per paragraph means the writing is using them as a crutch instead
of writing clearer sentences.

**Instead:** Use commas, colons, semicolons, or periods. The em-dash is a
spice, not a staple.

---

## 9. Preamble Announcements

**The tell:** Announcing what the text is about to do before doing it.

**Symptoms:**

- "In this article, we'll explore..."
- "Let's take a look at..."
- "What follows is..."
- "In this section, we will discuss..."

**Why it's a tell:** The reader is already reading. They know what the text is
about. Announcing it again is filler.

**Instead:** Just start. Open with the substance. The reader doesn't need a
table of contents narrated to them.

---

## 10. Sycophantic Hedging

**The tell:** Filler phrases that soften a point without adding information.

**Symptoms:**

- "It's worth noting that..."
- "Interestingly enough..."
- "To be fair..."
- "It bears mentioning that..."

**Why it's a tell:** These are throat-clearing. They signal the writer isn't
confident enough to just make the point. LLMs insert them as politeness padding.

**Instead:** Delete the hedge and start with the actual point.

---

## 11. Emojis

Never. Zero. Not in headings, not in body text, not in summaries.

The only exception: if the target style profile explicitly includes emoji usage
as a signature element AND the user has requested their inclusion.

---

## 12. AI Vocabulary Contamination

**The tell:** Specific words and phrases that appear 5-50x more frequently in
AI-generated text than in human writing. These are LLM "comfort words" -- they
sound authoritative to a model but scream machine to a reader.

**The watchlist:**

Verbs: "delve", "underscore", "highlight" (as verb), "foster", "leverage",
"harness", "showcase", "streamline", "navigate" (abstract), "cultivate",
"illuminate", "orchestrate", "spearhead"

Nouns: "tapestry", "landscape" (abstract), "realm", "journey" (abstract),
"ecosystem", "paradigm", "trajectory", "blueprint", "interplay", "intricacies"

Adjectives: "pivotal", "crucial", "vital", "nuanced", "multifaceted", "robust",
"seamless", "comprehensive", "cutting-edge", "groundbreaking", "transformative"

Inflation phrases: "plays a significant role in shaping", "serves as a
testament to", "it is important to note", "a vibrant tapestry of"

**Why it's a tell:** Research tracking word frequency before and after ChatGPT
shows "delve" spiked 10-50x, "tapestry" and "landscape" (abstract) 5-20x, and
"plays a significant role in shaping" appeared 207x more often in AI text.
Readers have learned to pattern-match on these words.

**Instead:** Use plain words. "Delve into" -> "look at." "Leverage" -> "use."
"Navigate the landscape" -> "figure out." "Pivotal" -> "important" (or better:
show why it matters instead of asserting it). "Nuanced" -> "detailed" or just
describe the actual nuance.

One of these words in a 2,000-word document is fine. Three in a paragraph is a
contamination event. Scan for them.

---

## 13. Copula Avoidance

**The tell:** LLMs avoid simple "is", "are", and "has" constructions,
substituting elaborate verbs that inflate the significance of mundane statements.

**Symptoms:**

- "serves as" / "stands as" / "acts as" instead of "is"
- "boasts" / "features" / "offers" instead of "has"
- "represents" / "marks" / "signals" instead of "is"
- "underscores" / "highlights" / "reflects" instead of "shows"

**Examples:**

- "This feature serves as a bridge between the developer and the runtime."
- "The config file stands as the single source of truth."
- "The dashboard boasts a real-time monitoring panel."

**Why it's a tell:** These substitutions make everything sound ceremonial. A
config file doesn't "stand as" anything. It IS the source of truth. The inflated
verb implies the sentence is making a grander point than it actually is.

**Instead:** Use "is", "are", "has." They're not boring -- they're precise.

- "This feature connects the developer to the runtime."
- "The config file is the source of truth."
- "The dashboard has a real-time monitoring panel."

---

## 14. Low Burstiness

**The tell:** Every sentence is roughly the same length and structure. No rhythm
variation between short punchy sentences and longer complex ones.

**Symptoms:**

- Three or more consecutive sentences within 5 words of each other in length
- Every paragraph has the same cadence: medium sentence, medium sentence, medium
  sentence
- No one-line paragraphs for emphasis, no long flowing sentences for complexity
- Reads like it was generated by the same function called in a loop

**Why it's a tell:** Human writers naturally vary sentence length. A short
sentence after a long one creates emphasis. A long sentence after two short ones
builds complexity. LLMs produce text with remarkably uniform sentence length --
researchers call this "low burstiness." It's one of the most reliable structural
signals of AI text, even when the vocabulary is clean.

**Instead:** Read the paragraphs out loud. If every sentence takes the same
number of breaths, rewrite. Break a long sentence into a punchy two-worder.
Combine two medium sentences into one that flows. The goal is rhythm, not
uniformity.

Good target distribution: roughly 20% short (under 10 words), 50% medium
(10-20 words), 30% long (20+ words). Don't count -- just listen for monotony.

---

## 15. Fabricated Experience

**The tell:** The AI simulates personal encounters, emotional reactions, or
sensory moments that never happened. It narrates an internal state to sound
human.

**Symptoms:**

- "What I find genuinely interesting is..."
- "I keep bumping into this pattern..."
- "Picture the workflow: you sit down at your desk and..."
- "I've been wrestling with this question..."
- "Something feels off about this approach..."
- "The thing that struck me watching this was..."

**Why it's a tell:** Good writing SHOULD have personal voice and real
experience. The problem is when the AI manufactures these moments instead of
drawing from actual source material. The fabricated version is always vague
("I find this interesting") where real experience is specific ("I tried this at
2 AM and the build broke in a way I'd never seen").

**Instead:** Personal moments must come from the source material, the author's
notes, or the actual events described. If there's no real moment available,
don't invent one. Write the point directly instead of wrapping it in fake
experience.

- "I keep coming back to this idea that agents need guardrails." (fabricated)
- "Twelve minutes into the demo, the agent deleted the test database. That's
  when we started talking about guardrails." (specific and real)

---

## 16. False Ranges

**The tell:** "From X to Y" constructions that claim universal applicability
without evidence. The range sounds inclusive but says nothing specific.

**Symptoms:**

- "From beginners to experts"
- "From startups to enterprises"
- "From simple scripts to complex architectures"
- "Whether you're building a side project or scaling to millions of users"

**Why it's a tell:** Real writing is honest about who it's for. "From X to Y"
is a hedge disguised as inclusivity -- it avoids committing to an audience
because the AI doesn't know who the audience actually is.

**Instead:** Be specific about who this is for and own the limitation.

- "If you've shipped a production app and gotten paged for it, this will make
  sense. If you're still in tutorials, bookmark it for later."

---

## 17. Synonym Cycling

**The tell:** The same thing is called by a different name every time it
appears. "The CLI" becomes "the tool" becomes "the interface" becomes "the
command-line solution" across consecutive paragraphs -- all referring to the
exact same thing.

**Symptoms:**

- A technical concept is named differently in each paragraph
- "Developers" -> "engineers" -> "practitioners" -> "builders" -> "teams"
- "The feature" -> "the capability" -> "the functionality" -> "the offering"
- Each synonym is less precise than the original term

**Why it's a tell:** LLMs are trained with repetition penalties that discourage
reusing tokens. So the model reaches for synonyms even when the original word
was the right one. In technical writing, this creates confusion -- the reader
wonders whether "the tool" and "the interface" are the same thing or different
things. Repetition of the precise term is clarity. Variation with imprecise
synonyms is noise.

**Instead:** Use the same word. "The CLI" is "the CLI" every time. If it
appears too often in a passage, restructure the sentences or use a pronoun --
don't swap in a vaguer synonym.

- "The CLI scaffolds the project. Once it finishes, review the output. It will
  prompt you for confirmation."

---

## 18. Unicode Giveaways

**The tell:** The draft contains Unicode characters that a human typing in a
text editor would not produce. These are character-level fingerprints of
LLM-generated text.

**Characters to scan for:**

- Curly double quotes: \u201C and \u201D -- instead of straight `"`
- Curly single quotes: \u2018 and \u2019 -- instead of straight `'`
- Horizontal ellipsis: \u2026 -- instead of three dots `...`
- Bullet character: \u2022 -- instead of markdown `-` or `*`
- En dash: \u2013 -- instead of a hyphen or em-dash

**Why it's a tell:** A human writing in a text editor, markdown file, or code
editor produces straight quotes, three dots, and hyphens. When the source
already contains curly quotes or a Unicode ellipsis, it means the text was
generated by an LLM (ChatGPT in particular outputs curly quotes by default).

**Instead:** Use plain ASCII in the output. Straight quotes, three dots,
hyphens. Let the publishing system handle typography. During the anti-pattern
scan, search the output for these Unicode characters and replace any that
appear.
