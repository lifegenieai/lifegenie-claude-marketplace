---
name: voice-design
description: |
  Expert guidance for crafting ElevenLabs Voice Design prompts. USE WHEN: "ElevenLabs voice prompts", "voice design", "create AI voice", "voice description", designing character voices, optimizing voice prompts for accent, age, tone, pacing, and audio quality. Covers the complete Voice Design workflow from prompt writing to preview text optimization and guidance scale tuning. Explicit: elevenlabs-voice-designer:voice-design
---

# ElevenLabs Voice Design Prompting

Expert guidance for creating AI-generated voices using ElevenLabs Voice Design.

## Quick Start Decision Tree

| Goal                 | Approach                                                  |
| -------------------- | --------------------------------------------------------- |
| Generic narrator     | Short prompt: "A calm male narrator"                      |
| Specific character   | Detailed prompt with age, accent, tone, pacing, emotion   |
| High audio quality   | Add "perfect audio quality" or "studio-quality recording" |
| Stylized/lo-fi audio | Add "low-fidelity audio" or "sounds like a voicemail"     |
| Strong accent        | Use "thick" (not "strong"): "thick French accent"         |
| Subtle accent        | Use "slight": "slight Southern drawl"                     |

## Prompt Structure Template

Build prompts by combining these elements:

```
[Audio Quality] + [Age] + [Gender] + [Accent] + [Tone/Timbre] + [Pacing] + [Character/Emotion]
```

**Example:**

> "Perfect audio quality. A man in his 40s with a thick British accent. His
> voice is deep and warm, speaking at a natural conversational pace. He sounds
> confident and approachable."

## Phrasing Experimentation

How you phrase descriptors matters. The same concept written differently can
produce noticeably different results:

| Phrasing A              | Phrasing B                     | Notes                                 |
| ----------------------- | ------------------------------ | ------------------------------------- |
| "Perfect audio quality" | "The audio quality is perfect" | May produce different tonal qualities |
| "Speaking quickly"      | "A fast pace"                  | Affects rhythm differently            |
| "Deep voice"            | "His voice is deep"            | Contextual vs standalone descriptor   |
| "Thick accent"          | "A very pronounced accent"     | Intensity perception varies           |

**Best Practice:** When iterating on a voice, try rephrasing key descriptors
rather than just adding more details. Small wording changes can unlock the exact
voice you're looking for.

## Core Attributes Reference

### Age Descriptors

| Descriptor                 | Effect                  |
| -------------------------- | ----------------------- |
| Adolescent                 | Youthful, higher energy |
| Young adult / in their 20s | Fresh, vibrant          |
| Middle-aged / in their 40s | Mature, experienced     |
| Elderly / in their 80s     | Weathered, wise         |

### Tone/Timbre Descriptors

| Category | Options                                 |
| -------- | --------------------------------------- |
| Depth    | Deep, low-pitched, booming, resonant    |
| Texture  | Smooth, gravelly, raspy, breathy, airy  |
| Quality  | Warm, mellow, rich, buttery             |
| Edge     | Nasally, shrill, harsh, tinny, metallic |
| Special  | Ethereal, robotic, throaty              |

### Pacing Descriptors

| Speed    | Descriptors                                             |
| -------- | ------------------------------------------------------- |
| Fast     | Speaking quickly, fast-paced, hurried cadence, staccato |
| Normal   | Normal pace, conversational, relaxed pacing             |
| Slow     | Speaking slowly, deliberate, measured, drawn out        |
| Variable | Erratic pacing, rhythmic, musical                       |

### Accent Guidance

**Use "thick" for prominent accents, "slight" for subtle:**

- "A middle-aged man with a thick French accent"
- "A young woman with a slight Southern drawl"
- "An old man with a heavy Eastern European accent"

**Avoid:** "foreign", "exotic" (too vague)

**For fantasy characters, reference real accents:**

- "An elf with a proper thick British accent. He is regal and lyrical."
- "A goblin with a raspy Eastern European accent."

## Technical Parameters

### Guidance Scale Settings

| Scenario                      | Guidance Scale | Notes                      |
| ----------------------------- | -------------- | -------------------------- |
| Accent/tone accuracy critical | 35-40%         | Higher adherence to prompt |
| Balanced quality + accuracy   | 25-30%         | Good middle ground         |
| Performance quality priority  | 15-25%         | More creative freedom      |
| Very niche/specific prompts   | Lower (20%)    | Prevents audio artifacts   |

### Loudness Control

Controls the volume level of preview generation and saved voice output.

| Setting         | Use Case                                             |
| --------------- | ---------------------------------------------------- |
| Higher loudness | Energetic voices, announcers, shouting characters    |
| Default/medium  | Most conversational voices                           |
| Lower loudness  | Soft-spoken characters, whispers, intimate narration |

**Tip:** Adjust loudness to match the character's energy level. A drill sergeant
should be louder than a meditation guide.

## Preview Text Best Practices

1. **Match emotional tone** - Preview text should complement the voice
   description
2. **Use longer text** - Full sentences or paragraphs produce more stable
   results
3. **Avoid contradictions** - Don't use aggressive text for a calm voice
   description

**Bad pairing:**

> Voice: "calm and reflective younger female voice" Preview: "Hey! I can't stand
> what you've done!!!"

**Good pairing:**

> Voice: "calm and reflective younger female voice" Preview: "It's been quiet
> lately... I've had time to think, and maybe that's what I needed most."

## Special Effects in Preview Text

Use these in preview text for expressive delivery:

- `[laughs]` - Laughter
- `[sighs]` - Sighs
- `[exhales]` - Exhale
- `[lip smacks]` - Lip smack
- `(maniacal laughter)` - Parenthetical actions

## Common Voice Archetypes

| Archetype          | Key Prompt Elements                                 |
| ------------------ | --------------------------------------------------- |
| Sports Commentator | High-energy, thick accent, quick pace, enthusiastic |
| Drill Sergeant     | Angry, fast pace, shouting, authoritative           |
| Movie Trailer      | Dramatic, builds anticipation, deep, resonant       |
| Friendly Narrator  | Warm, conversational pace, approachable             |
| Evil Villain       | Deep, resonant, slow, menacing                      |
| Cute Character     | Squeaky, high-pitched, playful                      |

## Detailed Reference

For complete attribute tables, example prompts with preview text, and advanced
techniques, read:

- `references/voice-attributes.md` - Complete attribute reference with all
  descriptors
- `references/example-prompts.md` - Full example prompts with preview text and
  guidance scales

## Key Reminders

1. **More detail = better accuracy** for specific characters
2. **Simple prompts work** for generic/neutral voices
3. **"thick" > "strong"** for accent prominence
4. **Preview text matters** - match it to your voice description
5. **Longer preview text = more stable** voice generation
6. **Guidance scale tradeoff:** Higher = more accurate but potential quality
   loss
7. **Experiment with phrasing** - same concept, different words can produce
   different results
8. **Adjust loudness** to match character energy level
