# Video Generator Plugin

Generate videos using Google's Veo 3.1 API with presets, extensions, and cost controls.

## Prerequisites

- **Bun runtime** - TypeScript execution
- **Google API Key** - With Gemini API access (Veo 3.1)

## Installation

1. Install dependencies:
   ```bash
   cd ~/.claude/plugins/lifegenie-marketplace/video-generator
   bun install
   ```

2. Set up your Google API key in `~/.claude/.env`:
   ```bash
   echo 'GOOGLE_API_KEY=your-api-key-here' >> ~/.claude/.env
   ```

## Quick Start

### Using the Interactive Command

```bash
/video "A cat walking on a beach at sunset"
```

Or with full parameters:
```bash
/video "Cinematic drone shot" --duration 8 --aspect-ratio 16:9 --preset cinematic
```

### Using the CLI Tool Directly

```bash
bun run tools/Generate.ts \
  --prompt "A cat walking on a beach at sunset" \
  --duration 8 \
  --aspect-ratio 16:9 \
  --output ~/Downloads/cat.mp4
```

## Features

- **Presets**: cinematic, vertical-social, product-demo, documentary
- **Duration**: 4, 6, or 8 seconds per clip
- **Aspect Ratios**: 16:9, 9:16, 1:1
- **Resolution**: 720p (default) or 1080p (8s only)
- **Video Extension**: Extend videos in 7-second increments up to 148 seconds
- **Cost Controls**: Automatic cost estimation and confirmation

## Cost

| Model    | Cost/Second | 8s Clip |
|----------|-------------|---------|
| Fast     | $0.15       | $1.20   |
| Standard | $0.40       | $3.20   |

Standard mode requires `--confirm-cost` flag.

## Documentation

- **Skill Guide**: `skills/video-generation/SKILL.md`
- **Prompting Guide**: `skills/video-generation/references/prompting.md`
- **Presets**: `tools/Presets.json`

## License

MIT
