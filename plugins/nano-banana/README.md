# Nano Banana - AI Image Generation Plugin

AI image generation CLI powered by Gemini 3.1 Flash (default) and Gemini 3 Pro. Multi-resolution (512-4K), aspect ratios, cost tracking, green screen transparency, reference images, and style transfer.

**Original**: [kingbootoshi/nano-banana-2-skill](https://github.com/kingbootoshi/nano-banana-2-skill) by [Bootoshi](https://github.com/kingbootoshi)

## Installation

### As a Claude Code Plugin

```bash
# Install from marketplace
claude install-plugin lifegenieai/lifegenie-claude-marketplace --plugin nano-banana

# Or reference directly
claude --plugin-dir /path/to/nano-banana
```

### First-Time Setup

After installing the plugin, run `/nano-banana` or say "setup nano-banana" to Claude. It will:

1. Install dependencies: `cd "${CLAUDE_PLUGIN_ROOT}/tools" && bun install`
2. Prompt you for your Gemini API key

**Prerequisites:**
- [Bun](https://bun.sh) runtime
- [Gemini API key](https://aistudio.google.com/apikey)
- For transparent mode: [FFmpeg](https://ffmpeg.org) + [ImageMagick](https://imagemagick.org)
  - macOS: `brew install ffmpeg imagemagick`
  - Windows: `winget install ffmpeg` and `winget install ImageMagick`

## Usage

### Slash Command (Interactive)

```
/nano-banana "A sunset over mountains"
/nano-banana "pixel art robot" --transparent --output robot
/nano-banana
```

### Conversational

Just describe what you want:
- "Generate an image of a dashboard UI"
- "Create a transparent mascot sprite"
- "Make this image brighter" (with a reference image)

## Features

| Feature              | Description                                                        |
|----------------------|--------------------------------------------------------------------|
| Multi-resolution     | 512px, 1K, 2K, 4K output sizes                                    |
| Aspect ratios        | 1:1, 16:9, 9:16, 4:3, 3:4, and more                              |
| Model selection      | Gemini 3.1 Flash (fast/cheap) or Gemini 3 Pro (highest quality)    |
| Reference images     | Edit existing images or combine styles                             |
| Transparent assets   | Green screen → FFmpeg colorkey → clean PNG with transparency       |
| Cost tracking        | Automatic per-generation cost logging with `--costs` summary       |

## Components

| Component   | Path                              | Purpose                              |
|-------------|-----------------------------------|--------------------------------------|
| Skill       | `skills/nano-banana/SKILL.md`     | CLI reference and prompt guidance    |
| Command     | `commands/nano-banana.md`         | Interactive `/nano-banana` wizard    |
| CLI Tool    | `tools/cli.ts`                    | Bun-powered image generation CLI     |

## Costs

| Size  | Flash    | Pro      |
|-------|----------|----------|
| 512   | ~$0.045  | N/A      |
| 1K    | ~$0.067  | ~$0.134  |
| 2K    | ~$0.101  | ~$0.201  |
| 4K    | ~$0.151  | ~$0.302  |

## License

MIT — Original work by [Bootoshi](https://github.com/kingbootoshi)
