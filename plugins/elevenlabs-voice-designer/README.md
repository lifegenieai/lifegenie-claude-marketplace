# ElevenLabs Voice Designer

Expert voice design prompting for creating AI-generated voices with ElevenLabs
Voice Design.

## Features

- **Comprehensive voice design knowledge** with rich examples demonstrating full
  character embodiment
- **Interactive `/design-voice` wizard** that generates multiple prompt
  variations
- **22+ technique-organized examples** covering accent layering, emotional
  complexity, fantasy voices, and more

## Installation

Add to your Claude Code plugins:

```bash
claude --plugin-dir /path/to/elevenlabs-voice-designer
```

Or copy to your marketplace plugins directory.

## Usage

### Skill Triggers

The voice-design skill activates on natural language queries:

- "How do I write ElevenLabs voice prompts?"
- "Help me create an AI voice"
- "Voice design best practices"
- "Design a character voice"

Or use explicitly: `elevenlabs-voice-designer:voice-design`

### /design-voice Command

Interactive wizard for building voice prompts:

```
/design-voice
/design-voice narrator
/design-voice villain
```

The wizard asks 8 questions about your voice (type, age, gender, accent, tone,
pacing, emotion, audio quality) and generates **2-3 prompt variations** to
choose from.

## Components

### Skills

| Skill          | Purpose                                                              |
| -------------- | -------------------------------------------------------------------- |
| `voice-design` | Core voice design knowledge with prompt templates and best practices |

### Commands

| Command         | Purpose                                                                       |
| --------------- | ----------------------------------------------------------------------------- |
| `/design-voice` | Interactive wizard for building voice prompts with multiple output variations |

### Reference Files

| File                  | Purpose                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| `voice-attributes.md` | Complete attribute reference (age, tone, accent, pacing, etc.)         |
| `example-prompts.md`  | 22+ examples organized by technique with full prompts and preview text |

## Example Output

When you run `/design-voice` and specify a "villain" archetype with middle-aged,
male, British accent:

**Variation A (Conservative):**

> "A middle-aged man with a thick British accent. His voice is deep and smooth,
> speaking at a measured pace. He sounds authoritative and menacing."

**Variation B (Creative):**

> "A man in his 50s with a refined British accent that sharpens when displeased.
> His voice is silken yet cold, each word precisely placed like a chess move.
> Beneath the cultured exterior lies something predatory—he speaks slowly,
> savoring the discomfort he causes."

**Variation C (Experimental):**

> "Perfect audio quality. A well-educated British man whose voice carries the
> weight of countless betrayals. His tone shifts between warm hospitality and
> ice-cold threat without warning. Speaking deliberately, he treats conversation
> as manipulation—pausing strategically to unsettle listeners."

## Credits

Based on official
[ElevenLabs Voice Design documentation](https://elevenlabs.io/docs/creative-platform/voices/voice-design).

## Author

erikb
