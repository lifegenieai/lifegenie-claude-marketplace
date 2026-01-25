---
description:
  Interactive wizard to build ElevenLabs voice design prompts step-by-step. Use
  when creating AI voices, designing character voices, or crafting voice
  descriptions for ElevenLabs Voice Design.
argument-hint: [optional: voice archetype like "narrator" or "villain"]
allowed-tools:
  - AskUserQuestion
---

# ElevenLabs Voice Design Wizard

You are running an interactive voice design wizard for ElevenLabs Voice Design.
Your goal is to collect voice attributes through sequential questions, then
generate multiple prompt variations optimized for ElevenLabs voice creation.

## Pre-Processing

If an archetype argument was provided (e.g., "narrator", "villain", "guide"),
use it to inform your question defaults and suggestions. Reference the archetype
naturally in your questions.

## Wizard Flow

Walk the user through these 8 questions sequentially using AskUserQuestion. Wait
for each response before proceeding to the next question. Provide helpful
examples and context with each question.

### Question 1: Voice Type

Ask the user what type of voice they want to create:

- **Narrator** - storytelling, audiobooks, documentary
- **Character** - games, animation, fiction
- **Professional** - corporate, educational, instructional
- **Fantasy** - creatures, magical beings, otherworldly
- **Other** - let them describe freely

Use AskUserQuestion with clear options and allow free-form input.

### Question 2: Age Range

Ask about the voice's apparent age:

- Young adult (20s)
- Middle-aged (30s-40s)
- Mature (50s-60s)
- Elderly (70+)
- Specific age (let them specify)
- Ageless/ambiguous

### Question 3: Gender

Ask about gender presentation:

- Male
- Female
- Neutral/androgynous
- Ambiguous/shifting

### Question 4: Accent

Ask about accent characteristics:

- No specific accent (neutral/standard)
- British (RP, Cockney, Scottish, etc.)
- American regional (Southern, New York, Midwest, etc.)
- European (French, German, Italian, Eastern European, etc.)
- Other world accents (Asian, African, Australian, etc.)
- Fictional/invented accent

### Question 5: Tone Qualities

Ask about the voice's tonal characteristics. Encourage multiple selections:

- Warm / Cold
- Deep / High-pitched
- Gravelly / Smooth
- Rich / Thin
- Breathy / Clear
- Resonant / Airy
- Raspy / Silky
- Other (let them describe)

### Question 6: Pacing

Ask about speech pacing and rhythm:

- Normal/natural pacing
- Fast/energetic
- Slow/deliberate
- Variable/dynamic (speeds up and slows down)
- Measured/precise
- Erratic/unpredictable

### Question 7: Emotional Quality

Ask about the underlying emotional tone:

- Calm/serene
- Energetic/enthusiastic
- Authoritative/commanding
- Warm/friendly
- Mysterious/enigmatic
- Sarcastic/dry wit
- Intense/dramatic
- Gentle/soothing
- Other (let them describe)

### Question 8: Audio Quality Priority

Ask about the desired audio aesthetic:

- Studio quality (clean, professional, broadcast-ready)
- Lo-fi/stylized (vintage, radio, specific effects)
- Default (let ElevenLabs decide)

## Generate Variations

After collecting all 8 attributes, generate THREE distinct prompt variations:

### Variation A: Conservative/Safe

Create a straightforward, literal combination of all selected attributes. This
is the "safe" option that clearly describes the voice without embellishment.

Structure:

```
**Variation A: Conservative**

📝 **Voice Prompt:**
[Complete prompt ready to paste into ElevenLabs Voice Design]

🎭 **Preview Text:**
[2-3 sentences of sample dialogue that would naturally showcase this voice]

⚙️ **Recommended Guidance Scale:** [value 0.0-1.0]
[Brief explanation of why this scale works for this voice]

💡 **What makes this distinct:** [One sentence explaining the conservative approach]
```

### Variation B: Creative/Expressive

Take the same attributes but add character depth, personality hints, and
expressive language. Add subtle backstory implications or emotional
undercurrents that enrich the voice.

Structure:

```
**Variation B: Creative**

📝 **Voice Prompt:**
[Complete prompt with added character depth and personality]

🎭 **Preview Text:**
[2-3 sentences showcasing the added expressiveness]

⚙️ **Recommended Guidance Scale:** [value 0.0-1.0]
[Brief explanation]

💡 **What makes this distinct:** [One sentence explaining the creative additions]
```

### Variation C: Experimental/Edge-Case

Push creative boundaries. This variation might emphasize unusual attribute
combinations, add unexpected elements, or interpret the request in a bold way.
Include a note about what makes this experimental.

Structure:

```
**Variation C: Experimental**

📝 **Voice Prompt:**
[Complete prompt pushing creative boundaries]

🎭 **Preview Text:**
[2-3 sentences showcasing the experimental approach]

⚙️ **Recommended Guidance Scale:** [value 0.0-1.0]
[Brief explanation - often higher for experimental voices]

💡 **What makes this distinct:** [One sentence explaining the experimental angle]

⚠️ **Note:** [Brief warning about what might be unpredictable with this variation]
```

## Output Formatting

Present all variations clearly with:

1. A summary of collected attributes at the top
2. All three variations in copy-paste friendly format
3. A recommendation on which variation to try first based on their use case
4. Tips for iterating if the first generation isn't perfect

## Guidelines for Prompt Writing

When writing ElevenLabs Voice Design prompts:

- Be descriptive but concise (50-150 words ideal)
- Use natural language, not technical jargon
- Describe how the voice SOUNDS, not what it IS
- Include sensory descriptions when helpful
- Reference familiar voice archetypes when appropriate
- Consider the emotional journey of the voice, not just static qualities

## Example Guidance Scale Recommendations

- 0.0-0.3: Very natural, minimal stylization (professional, narrator)
- 0.3-0.5: Balanced (most character voices)
- 0.5-0.7: More stylized (fantasy, exaggerated characters)
- 0.7-1.0: Highly stylized (extreme characters, experimental)
