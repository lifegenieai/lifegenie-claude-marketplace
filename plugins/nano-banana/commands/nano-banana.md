---
name: nano-banana
description: Generate AI images using Gemini 3.1 Flash or Pro
allowed-tools:
  - Bash
  - AskUserQuestion
  - Read
arguments:
  - name: prompt
    description: Image generation prompt (what to create)
    required: false
  - name: size
    description: "Image size: 512, 1K, 2K, or 4K"
    required: false
  - name: model
    description: "Model: flash (default, cheap), pro (highest quality)"
    required: false
  - name: aspect-ratio
    description: "Aspect ratio: 1:1, 16:9, 9:16, 4:3, 3:4, etc."
    required: false
  - name: output
    description: Output filename (without extension)
    required: false
  - name: transparent
    description: "Set to true for transparent background (requires FFmpeg + ImageMagick)"
    required: false
  - name: ref
    description: "Path to reference image(s) for style transfer or editing"
    required: false
---

# /nano-banana - Generate AI Images

You are helping the user generate an image using the nano-banana CLI, powered by Google's Gemini image generation models.

## Tool Location

The CLI tool is at: `${CLAUDE_PLUGIN_ROOT}/tools/cli.ts`

Run with: `bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" [PROMPT] [OPTIONS]`

## Prerequisites Check

Before first use, verify dependencies are installed:
```bash
cd "${CLAUDE_PLUGIN_ROOT}/tools" && [ -d "node_modules" ] && echo "READY" || echo "NEEDS_INSTALL"
```

If `NEEDS_INSTALL`, run:
```bash
cd "${CLAUDE_PLUGIN_ROOT}/tools" && bun install
```

## Interactive Flow

### 1. Check What's Provided

Parse the command arguments:
- `$ARGUMENTS.prompt` - Image prompt
- `$ARGUMENTS.size` - Size (512, 1K, 2K, 4K)
- `$ARGUMENTS.model` - Model (flash, pro)
- `$ARGUMENTS.aspect-ratio` - Aspect ratio
- `$ARGUMENTS.output` - Output filename
- `$ARGUMENTS.transparent` - Transparent background
- `$ARGUMENTS.ref` - Reference image path

### 2. Gather Missing Required Information

If prompt is missing, ask the user:
```
What image would you like to generate? Describe the subject, style, and composition.
```

### 3. Optional Enhancements

If size/model/aspect were not provided, ask with sensible defaults:

**Size** (if not provided, default to 1K):
- 512 (~$0.045 Flash) - Quick concepts
- 1K (~$0.067 Flash) - Standard quality (Recommended)
- 2K (~$0.101 Flash) - High quality
- 4K (~$0.151 Flash) - Ultra high quality

**Model** (if not provided, default to flash):
- flash - Fast, cheap (Recommended for most uses)
- pro - Highest quality, 2x cost

**Aspect Ratio** (only ask if relevant to the prompt):
- 1:1 - Square (default)
- 16:9 - Widescreen/landscape
- 9:16 - Portrait/mobile
- 4:3 - Standard photo

### 4. Output Path

If output is not provided, generate a descriptive default based on the prompt:
```
[descriptive-slug]-[timestamp]
```

Use `-d` flag to place in `~/Downloads` or the user's preferred directory.

### 5. Build and Run Command

Construct the full command:
```bash
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" "USER_PROMPT" \
  [-s SIZE] \
  [-m MODEL] \
  [-a ASPECT_RATIO] \
  [-o OUTPUT_NAME] \
  [-d OUTPUT_DIR] \
  [-r REFERENCE_IMAGE] \
  [-t]
```

### 6. Report Results

After completion, report:
- Output file path and size
- Estimated cost
- Suggest next steps (edit with reference, try different size, etc.)

## Example Flows

### Full Arguments Provided
```
/nano-banana "A sunset over mountains" --size 2K --aspect-ratio 16:9 --output sunset
```
-> Build command and run immediately

### Prompt Only
```
/nano-banana "A minimalist logo for a tech startup"
```
-> Use defaults (1K, flash, 1:1), generate with descriptive filename

### Interactive (No Arguments)
```
/nano-banana
```
-> Ask for prompt, use sensible defaults, generate

### Transparent Asset
```
/nano-banana "pixel art robot character" --transparent --output robot
```
-> Run with `-t` flag, report transparent PNG output

### Reference Image
```
/nano-banana "make this image brighter and more vibrant" --ref ./screenshot.png
```
-> Run with `-r` flag for image editing

## Models Reference

| Alias           | Model              | Cost/1K | Best For                 |
|-----------------|--------------------|---------|--------------------------|
| `flash`, `nb2`  | Gemini 3.1 Flash   | ~$0.067 | Speed, volume, iteration |
| `pro`, `nb-pro` | Gemini 3 Pro       | ~$0.134 | Final quality, complex   |

## Important Notes

- Always quote the prompt string in the bash command
- For transparent mode, user needs FFmpeg + ImageMagick installed
- Reference images must exist at the specified path - verify before running
- Cost tracking is automatic - user can check with `--costs` flag
