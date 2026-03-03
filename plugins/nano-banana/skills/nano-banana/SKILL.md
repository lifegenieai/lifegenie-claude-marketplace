---
name: nano-banana
description: This skill should be used when the user wants to generate AI images, create pictures, make transparent PNGs, perform style transfer, edit images with AI, or use the nano-banana CLI. Covers Gemini 3.1 Flash (fast, cheap) and Gemini 3 Pro (highest quality) image generation with multi-resolution output (512-4K), aspect ratios, reference images, green screen transparency, and cost tracking. Triggered by phrases like "generate an image", "create a picture", "make an icon", "transparent sprite", "nano banana", or "edit this image with AI".
---

# nano-banana

AI image generation CLI. Default model: Gemini 3.1 Flash Image Preview (Nano Banana 2).

## First-Time Setup

When the user says "init", "setup nano-banana", or "install nano-banana":

```bash
# Install dependencies for the bundled CLI tool
cd "${CLAUDE_PLUGIN_ROOT}/tools" && bun install
```

**Prerequisites:**
- [Bun](https://bun.sh) must be installed. If not: `curl -fsSL https://bun.sh/install | bash`
- For transparent mode (`-t`): FFmpeg + ImageMagick
  - macOS: `brew install ffmpeg imagemagick`
  - Windows: `winget install ffmpeg` and `winget install ImageMagick`

**API key setup:**
```bash
mkdir -p ~/.nano-banana
echo "GEMINI_API_KEY=<ask user for their key>" > ~/.nano-banana/.env
```

Get a Gemini API key at: https://aistudio.google.com/apikey

## Running the Tool

Always invoke via:
```bash
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" "prompt" [options]
```

## Quick Reference

| Option            | Default              | Description                                            |
|-------------------|----------------------|--------------------------------------------------------|
| `-o, --output`    | `nano-gen-{timestamp}` | Output filename (no extension)                       |
| `-s, --size`      | `1K`                 | Image size: `512`, `1K`, `2K`, or `4K`                 |
| `-a, --aspect`    | model default        | Aspect ratio: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, etc. |
| `-m, --model`     | `flash`              | Model: `flash`/`nb2`, `pro`/`nb-pro`, or any model ID |
| `-d, --dir`       | current directory    | Output directory                                       |
| `-r, --ref`       | -                    | Reference image (can use multiple times)               |
| `-t, --transparent`| -                   | Generate on green screen, remove background (FFmpeg)   |
| `--api-key`       | -                    | Gemini API key (overrides env/file)                    |
| `--no-search`     | -                    | Disable Google Search grounding                        |
| `--costs`         | -                    | Show cost summary                                      |

## Models

| Alias           | Model                        | Use When                                  |
|-----------------|------------------------------|-------------------------------------------|
| `flash`, `nb2`  | Gemini 3.1 Flash             | Default. Fast, cheap (~$0.067/1K image). Supports image search grounding |
| `pro`, `nb-pro` | Gemini 3 Pro                 | Highest quality needed (~$0.134/1K image). Web search grounding only     |

## Sizes and Costs

| Size  | Cost (Flash) | Cost (Pro) |
|-------|-------------|------------|
| `512` | ~$0.045     | Flash only |
| `1K`  | ~$0.067     | ~$0.134    |
| `2K`  | ~$0.101     | ~$0.201    |
| `4K`  | ~$0.151     | ~$0.302    |

## Aspect Ratios

Supported: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `4:5`, `5:4`, `21:9`

## Key Workflows

### Basic Generation

```bash
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" "minimal dashboard UI with dark theme"
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" "cinematic landscape" -s 2K -a 16:9
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" "quick concept sketch" -s 512
```

### Model Selection

```bash
# Default (Flash - fast, cheap)
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" "your prompt"

# Pro (highest quality)
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" "detailed portrait" --model pro -s 2K
```

### Reference Images (Style Transfer / Editing)

```bash
# Edit existing image
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" "change the background to pure white" -r dark-ui.png -o light-ui

# Style transfer - multiple references
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" "combine these two styles" -r style1.png -r style2.png -o combined
```

### Transparent Assets

```bash
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" "robot mascot character" -t -o mascot
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" "pixel art treasure chest" -t -o chest
```

The `-t` flag automatically prompts the AI to generate on a green screen, then uses FFmpeg `colorkey` + `despill` to key out the background and remove green spill from edge pixels. Pixel-perfect transparency with no manual prompting needed.

### Exact Dimensions

To get a specific output dimension:
1. First `-r` flag: your reference/style image
2. Last `-r` flag: blank image in target dimensions
3. Include dimensions in prompt

```bash
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" "pixel art character in style of first image, 256x256" -r style.png -r blank-256x256.png -o sprite
```

## Reference Order Matters

- First reference: primary style/content source
- Additional references: secondary influences
- Last reference: controls output dimensions (if using blank image trick)

### Search Grounding (Flash only)

Flash model automatically uses Google Search (web + image) to ground generated images in real-world references. The output shows which queries and sources were used. Disable with `--no-search` if not needed.

```bash
# Grounding helps with real-world subjects - the model searches for visual references
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" "the Golden Gate Bridge at sunset" -a 16:9 -s 2K

# Disable grounding for purely creative/abstract prompts
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" "abstract geometric pattern" --no-search
```

## Cost Tracking

Every generation is logged to `~/.nano-banana/costs.json`. View summary:

```bash
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" --costs
```

## Prompt Best Practices

### Natural Language Descriptions
Write prompts as natural descriptions, not keyword lists:
- Good: `"A cozy coffee shop interior with warm lighting and wooden furniture"`
- Bad: `"coffee shop, cozy, warm, wood, interior"`

### Be Specific About Style
Include art style, lighting, and composition when they matter:
```bash
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" "clean SaaS dashboard with analytics charts, white background"
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" "cyberpunk cityscape at sunset" -a 16:9 -s 2K
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" "Premium SaaS chat interface, dark mode, minimal, Linear-style aesthetic"
bun run "${CLAUDE_PLUGIN_ROOT}/tools/cli.ts" "mobile app onboarding screen" -a 9:16
```

## Use Cases

- **Landing page assets** - product mockups, UI previews
- **Image editing** - transform existing images with prompts
- **Style transfer** - combine multiple reference images
- **Marketing materials** - hero images, feature illustrations
- **UI iterations** - quickly generate variations of designs
- **Transparent assets** - icons, logos, mascots with no background
- **Game assets** - sprites, backgrounds, characters
- **Video production** - visual elements for video compositions

## API Key Resolution

The CLI resolves the Gemini API key in this order:
1. `--api-key` flag
2. `GEMINI_API_KEY` environment variable
3. `.env` file in current directory
4. `.env` file next to the CLI script
5. `~/.nano-banana/.env`

Get a key at: https://aistudio.google.com/apikey
