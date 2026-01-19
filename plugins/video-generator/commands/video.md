---
name: video
description: Generate videos using Google Veo 3.1 API
allowed-tools:
  - Bash
  - AskUserQuestion
  - Read
arguments:
  - name: prompt
    description: Video generation prompt (what to create)
    required: false
  - name: duration
    description: "Video duration: 4, 6, or 8 seconds"
    required: false
  - name: aspect-ratio
    description: "Aspect ratio: 16:9, 9:16, or 1:1"
    required: false
  - name: preset
    description: "Preset name: cinematic, vertical-social, product-demo, documentary"
    required: false
  - name: output
    description: Output file path (.mp4)
    required: false
---

# /video - Generate Videos with Veo 3.1

You are helping the user generate a video using Google's Veo 3.1 API.

## Tool Location

The generation tool is at: `${CLAUDE_PLUGIN_ROOT}/tools/Generate.ts`

Run with: `bun run "${CLAUDE_PLUGIN_ROOT}/tools/Generate.ts" [OPTIONS]`

## Interactive Flow

### 1. Check What's Provided

Parse the command arguments:
- `$ARGUMENTS.prompt` - Video prompt
- `$ARGUMENTS.duration` - Duration (4, 6, 8)
- `$ARGUMENTS.aspect-ratio` - Aspect ratio (16:9, 9:16, 1:1)
- `$ARGUMENTS.preset` - Preset name
- `$ARGUMENTS.output` - Output path

### 2. Gather Missing Required Information

If prompt is missing, ask the user:
```
What video would you like to generate? Describe the scene, subject, and action.
```

If duration is missing, ask with options:
- 4 seconds ($0.60 fast / $1.60 standard)
- 6 seconds ($0.90 fast / $2.40 standard)
- 8 seconds ($1.20 fast / $3.20 standard) - Recommended for most use cases

If aspect-ratio is missing, ask with options:
- 16:9 (YouTube, presentations) - Recommended
- 9:16 (TikTok, Reels, Stories)
- 1:1 (Instagram feed)

### 3. Optional Enhancements

Optionally ask about:
- **Preset**: Would you like to apply a style preset? (cinematic, vertical-social, product-demo, documentary, none)
- **Resolution**: 720p (default) or 1080p (only for 8s duration)
- **Speed**: fast (default, cheaper) or standard (higher quality, 2.6x cost)

### 4. Output Path

If output is missing, generate a sensible default:
```
~/Downloads/video-[timestamp].mp4
```

### 5. Cost Estimation

Before generating, run a dry-run to show cost:
```bash
bun run "${CLAUDE_PLUGIN_ROOT}/tools/Generate.ts" \
  --prompt "..." --duration X --aspect-ratio X:X --dry-run
```

Show the estimated cost and confirm with the user.

### 6. Generate Video

Run the generation:
```bash
bun run "${CLAUDE_PLUGIN_ROOT}/tools/Generate.ts" \
  --prompt "USER_PROMPT" \
  --duration DURATION \
  --aspect-ratio ASPECT_RATIO \
  [--preset PRESET] \
  [--resolution RESOLUTION] \
  [--speed SPEED] \
  [--confirm-cost] \
  --output OUTPUT_PATH
```

### 7. Report Results

After completion, report:
- Output file path
- Actual cost
- Whether the video can be extended
- Metadata file path (for extensions)

## Example Flows

### Full Arguments Provided
```
/video "A cat walking on a beach at sunset" --duration 8 --aspect-ratio 16:9 --output ~/Downloads/cat.mp4
```
→ Show cost estimate, confirm, generate

### Minimal (Prompt Only)
```
/video "Cinematic drone shot of a mountain range"
```
→ Ask duration, ask aspect ratio, generate default output path, show cost, generate

### Interactive (No Arguments)
```
/video
```
→ Ask for prompt, ask duration, ask aspect ratio, optionally ask preset, generate

## Presets Reference

| Preset | Style | Aspect |
|--------|-------|--------|
| cinematic | Film-quality, 24fps, shallow DOF | Any |
| vertical-social | Punchy social media, 30fps | 9:16 |
| product-demo | Clean studio lighting | Any |
| documentary | Nature documentary style | Any |

## Video Extension

If the user wants to extend a video they previously generated:
```bash
bun run "${CLAUDE_PLUGIN_ROOT}/tools/Generate.ts" \
  --extend /path/to/previous.mp4 \
  --prompt "Continue the scene as..." \
  --output /path/to/extended.mp4
```

Extensions add 7 seconds and require the `.meta.json` sidecar file from the original generation.
