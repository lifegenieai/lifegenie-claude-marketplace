#!/usr/bin/env bun

/**
 * Generate.ts - Video Generation CLI using Google Veo 3.1 API
 *
 * Follows agent-native architecture principles:
 * - Structured JSON output for agent parsing
 * - Explicit parameters (no hidden defaults)
 * - Query operations for runtime discoverability
 * - Cost controls with mechanical constraints
 * - Operation lifecycle management
 *
 * Usage:
 *   bun run Generate.ts --prompt "..." --duration 8 --aspect-ratio 16:9 --output ~/Downloads/video.mp4
 */

import {
  GoogleGenAI,
  type GenerateVideosConfig,
  type GenerateVideosParameters,
  type GenerateVideosOperation,
  type VideoGenerationReferenceImage,
  VideoGenerationReferenceType,
} from "@google/genai";
import { writeFile, readFile, mkdir } from "node:fs/promises";
import { extname, resolve, dirname } from "node:path";

// ============================================================================
// Types
// ============================================================================

type Duration = 4 | 6 | 8;
type AspectRatio = "16:9" | "9:16" | "1:1";
type Resolution = "720p" | "1080p";
type Speed = "fast" | "standard";

interface CLIArgs {
  // Required for generation
  prompt?: string;
  output?: string;
  duration?: Duration;
  aspectRatio?: AspectRatio;

  // Optional generation params
  speed: Speed;
  resolution: Resolution;
  negativePrompt?: string;
  fps: number;
  seed?: number;
  preset?: string;
  referenceImages: string[];
  audio: boolean;
  timeout: number;
  confirmCost: boolean;

  // Extension mode
  extend?: string;

  // Query modes
  listPresets: boolean;
  showPreset?: string;
  status?: string;
  cancel?: string;
  dryRun: boolean;
  promptOnly: boolean;
}

interface Preset {
  negativePrompt?: string;
  fps?: number;
  resolution?: Resolution;
  aspectRatio?: AspectRatio;
  promptPrefix?: string;
  promptSuffix?: string;
}

interface OperationMetadata {
  operationId: string;
  videoReference: unknown;
  duration: number;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  createdAt: string;
}

interface JSONOutput {
  status: "complete" | "dry-run" | "error" | "cancelled" | "in-progress";
  [key: string]: unknown;
}

// ============================================================================
// Constants
// ============================================================================

const VALID_DURATIONS: Duration[] = [4, 6, 8];
const VALID_ASPECT_RATIOS: AspectRatio[] = ["16:9", "9:16", "1:1"];
const VALID_RESOLUTIONS: Resolution[] = ["720p", "1080p"];
const VALID_SPEEDS: Speed[] = ["fast", "standard"];

const COST_PER_SECOND = {
  fast: 0.15,
  standard: 0.40,
};

const MODELS = {
  fast: "veo-3.1-fast-generate-preview",
  standard: "veo-3.1-generate-preview",
};

const DEFAULTS = {
  speed: "fast" as Speed,
  resolution: "720p" as Resolution,
  fps: 24,
  timeout: 300000, // 5 minutes
};

const SKILL_DIR = resolve(dirname(new URL(import.meta.url).pathname), "..");

// ============================================================================
// Environment Loading
// ============================================================================

async function loadEnv(): Promise<void> {
  const paiDir = process.env.PAI_DIR || resolve(process.env.HOME!, ".config/pai");
  const envPaths = [
    resolve(paiDir, ".env"),
    resolve(process.env.HOME!, ".claude/.env"),
  ];

  for (const envPath of envPaths) {
    try {
      const envContent = await readFile(envPath, "utf-8");
      for (const line of envContent.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIndex = trimmed.indexOf("=");
        if (eqIndex === -1) continue;
        const key = trimmed.slice(0, eqIndex).trim();
        let value = trimmed.slice(eqIndex + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
      break;
    } catch {
      // Continue to next path
    }
  }
}

// ============================================================================
// Error Handling
// ============================================================================

class CLIError extends Error {
  constructor(
    message: string,
    public code: string = "CLI_ERROR",
    public exitCode: number = 1
  ) {
    super(message);
    this.name = "CLIError";
  }
}

function outputJSON(data: JSONOutput): void {
  console.log(JSON.stringify(data, null, 2));
}

function handleError(error: unknown): never {
  if (error instanceof CLIError) {
    outputJSON({
      status: "error",
      code: error.code,
      message: error.message,
    });
    process.exit(error.exitCode);
  }
  if (error instanceof Error) {
    outputJSON({
      status: "error",
      code: "UNEXPECTED_ERROR",
      message: error.message,
    });
    process.exit(1);
  }
  outputJSON({
    status: "error",
    code: "UNKNOWN_ERROR",
    message: String(error),
  });
  process.exit(1);
}

// ============================================================================
// Help
// ============================================================================

function showHelp(): void {
  console.log(`
Generate.ts - Video Generation CLI using Google Veo 3.1 API

USAGE:
  bun run Generate.ts --prompt "<prompt>" --duration <4|6|8> --aspect-ratio <16:9|9:16|1:1> --output <path> [OPTIONS]

REQUIRED (for generation):
  --prompt <text>        Video generation prompt (max 1024 tokens)
  --duration <n>         Video duration: 4, 6, or 8 seconds
  --aspect-ratio <ratio> Aspect ratio: 16:9, 9:16, or 1:1
  --output <path>        Output file path (.mp4)

OPTIONS:
  --speed <mode>         Model speed: fast (default, $0.15/s) or standard ($0.40/s)
  --resolution <res>     Resolution: 720p (default) or 1080p (8s duration only)
  --negative-prompt <t>  Things to avoid in generation
  --fps <n>              Frames per second (default: 24)
  --seed <n>             Seed for reproducibility
  --preset <name>        Load preset from Presets.json
  --reference-image <p>  Reference image for style consistency (can specify up to 3)
  --audio                (No-op) Audio is automatic in Veo 3.1 via prompt cues
  --timeout <ms>         Timeout in milliseconds (default: 300000)
  --confirm-cost         Required when using --speed standard

VIDEO EXTENSION:
  --extend <path>        Path to video to extend (adds 7 seconds)
                         Requires .meta.json sidecar from original generation

QUERY OPERATIONS (no generation):
  --list-presets         List available presets as JSON
  --show-preset <name>   Show preset details as JSON
  --status <id>          Check status of operation ID
  --cancel <id>          Cancel in-progress operation
  --dry-run              Estimate cost without generating
  --prompt-only          Output final prompt as JSON without generating

EXAMPLES:
  # Basic generation
  bun run Generate.ts --prompt "A cat on a beach" --duration 8 --aspect-ratio 16:9 --output ~/Downloads/cat.mp4

  # With preset (audio is automatic from prompt cues)
  bun run Generate.ts --prompt "Drone shot of highway" --duration 8 --aspect-ratio 16:9 --preset cinematic --output ~/Downloads/highway.mp4

  # 1080p quality (8s only)
  bun run Generate.ts --prompt "Final render" --duration 8 --aspect-ratio 16:9 --resolution 1080p --output ~/Downloads/final.mp4

  # Standard quality (requires cost confirmation)
  bun run Generate.ts --prompt "Hero shot" --duration 8 --aspect-ratio 16:9 --speed standard --confirm-cost --output ~/Downloads/hero.mp4

  # Extend existing video
  bun run Generate.ts --extend ~/Downloads/base.mp4 --prompt "Continue the scene" --output ~/Downloads/extended.mp4

  # Cost estimate
  bun run Generate.ts --prompt "test" --duration 8 --aspect-ratio 16:9 --dry-run

  # Prompt only (review final prompt without generating)
  bun run Generate.ts --prompt "A sunset over mountains" --preset cinematic --prompt-only

ENVIRONMENT:
  GOOGLE_API_KEY    Required - set in ~/.claude/.env or $PAI_DIR/.env

COST:
  Fast model:     $0.15/second ($1.20 for 8s clip)
  Standard model: $0.40/second ($3.20 for 8s clip)
  Extension:      7 seconds per extension ($1.05 fast, $2.80 standard)

MORE INFO:
  Documentation: See plugin skills/video-generation/SKILL.md
  Prompting:     See plugin skills/video-generation/references/prompting.md
`);
  process.exit(0);
}

// ============================================================================
// Argument Parsing
// ============================================================================

function parseArgs(argv: string[]): CLIArgs {
  const args = argv.slice(2);

  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    showHelp();
  }

  const parsed: CLIArgs = {
    speed: DEFAULTS.speed,
    resolution: DEFAULTS.resolution,
    fps: DEFAULTS.fps,
    timeout: DEFAULTS.timeout,
    referenceImages: [],
    audio: false,
    confirmCost: false,
    listPresets: false,
    dryRun: false,
    promptOnly: false,
  };

  for (let i = 0; i < args.length; i++) {
    const flag = args[i];

    if (!flag.startsWith("--")) {
      throw new CLIError(`Invalid flag: ${flag}`, "INVALID_FLAG");
    }

    const key = flag.slice(2);

    // Boolean flags
    if (key === "audio") { parsed.audio = true; continue; }
    if (key === "confirm-cost") { parsed.confirmCost = true; continue; }
    if (key === "list-presets") { parsed.listPresets = true; continue; }
    if (key === "dry-run") { parsed.dryRun = true; continue; }
    if (key === "prompt-only") { parsed.promptOnly = true; continue; }

    // Flags with values
    const value = args[i + 1];
    if (!value || value.startsWith("--")) {
      throw new CLIError(`Missing value for: ${flag}`, "MISSING_VALUE");
    }

    switch (key) {
      case "prompt":
        parsed.prompt = value;
        i++;
        break;
      case "output":
        parsed.output = value.startsWith("~")
          ? value.replace("~", process.env.HOME!)
          : value;
        i++;
        break;
      case "duration": {
        const d = parseInt(value, 10) as Duration;
        if (!VALID_DURATIONS.includes(d)) {
          throw new CLIError(
            `Invalid duration: ${value}. Must be 4, 6, or 8`,
            "INVALID_DURATION"
          );
        }
        parsed.duration = d;
        i++;
        break;
      }
      case "aspect-ratio":
        if (!VALID_ASPECT_RATIOS.includes(value as AspectRatio)) {
          throw new CLIError(
            `Invalid aspect-ratio: ${value}. Must be 16:9, 9:16, or 1:1`,
            "INVALID_ASPECT_RATIO"
          );
        }
        parsed.aspectRatio = value as AspectRatio;
        i++;
        break;
      case "speed":
        if (!VALID_SPEEDS.includes(value as Speed)) {
          throw new CLIError(
            `Invalid speed: ${value}. Must be fast or standard`,
            "INVALID_SPEED"
          );
        }
        parsed.speed = value as Speed;
        i++;
        break;
      case "resolution":
        if (!VALID_RESOLUTIONS.includes(value as Resolution)) {
          throw new CLIError(
            `Invalid resolution: ${value}. Must be 720p or 1080p`,
            "INVALID_RESOLUTION"
          );
        }
        parsed.resolution = value as Resolution;
        i++;
        break;
      case "negative-prompt":
        parsed.negativePrompt = value;
        i++;
        break;
      case "fps": {
        const fps = parseInt(value, 10);
        if (isNaN(fps) || fps < 1 || fps > 60) {
          throw new CLIError(`Invalid fps: ${value}`, "INVALID_FPS");
        }
        parsed.fps = fps;
        i++;
        break;
      }
      case "seed": {
        const seed = parseInt(value, 10);
        if (isNaN(seed)) {
          throw new CLIError(`Invalid seed: ${value}`, "INVALID_SEED");
        }
        parsed.seed = seed;
        i++;
        break;
      }
      case "preset":
        parsed.preset = value;
        i++;
        break;
      case "reference-image": {
        const imgPath = value.startsWith("~")
          ? value.replace("~", process.env.HOME!)
          : value;
        parsed.referenceImages.push(imgPath);
        i++;
        break;
      }
      case "timeout": {
        const timeout = parseInt(value, 10);
        if (isNaN(timeout) || timeout < 1000) {
          throw new CLIError(`Invalid timeout: ${value}`, "INVALID_TIMEOUT");
        }
        parsed.timeout = timeout;
        i++;
        break;
      }
      case "extend": {
        const extendPath = value.startsWith("~")
          ? value.replace("~", process.env.HOME!)
          : value;
        parsed.extend = extendPath;
        i++;
        break;
      }
      case "show-preset":
        parsed.showPreset = value;
        i++;
        break;
      case "status":
        parsed.status = value;
        i++;
        break;
      case "cancel":
        parsed.cancel = value;
        i++;
        break;
      default:
        throw new CLIError(`Unknown flag: ${flag}`, "UNKNOWN_FLAG");
    }
  }

  return parsed;
}

// ============================================================================
// Validation
// ============================================================================

function validateGenerationArgs(args: CLIArgs): void {
  if (!args.prompt) {
    throw new CLIError("Missing required: --prompt", "MISSING_PROMPT");
  }
  if (!args.output) {
    throw new CLIError("Missing required: --output", "MISSING_OUTPUT");
  }
  if (!args.duration) {
    throw new CLIError("Missing required: --duration", "MISSING_DURATION");
  }
  if (!args.aspectRatio) {
    throw new CLIError("Missing required: --aspect-ratio", "MISSING_ASPECT_RATIO");
  }

  // Resolution validation: 1080p only for 8s duration
  if (args.resolution === "1080p" && args.duration !== 8) {
    throw new CLIError(
      `1080p resolution only available for 8-second videos. Use --resolution 720p for ${args.duration}s duration.`,
      "INVALID_RESOLUTION"
    );
  }

  // Cost confirmation for standard mode
  if (args.speed === "standard" && !args.confirmCost) {
    const cost = (args.duration * COST_PER_SECOND.standard).toFixed(2);
    throw new CLIError(
      `Standard mode costs $${cost} for ${args.duration}s. Re-run with --confirm-cost to proceed.`,
      "COST_CONFIRMATION_REQUIRED"
    );
  }

  // Reference image limit
  if (args.referenceImages.length > 3) {
    throw new CLIError(
      `Too many reference images: ${args.referenceImages.length}. Maximum is 3.`,
      "TOO_MANY_REFERENCE_IMAGES"
    );
  }
}

function validateExtensionArgs(args: CLIArgs): void {
  if (!args.extend) {
    throw new CLIError("Missing required: --extend", "MISSING_EXTEND");
  }
  if (!args.output) {
    throw new CLIError("Missing required: --output", "MISSING_OUTPUT");
  }
  if (!args.prompt) {
    throw new CLIError("Missing required: --prompt for extension", "MISSING_PROMPT");
  }

  // Cost confirmation for standard mode extensions
  if (args.speed === "standard" && !args.confirmCost) {
    const cost = (7 * COST_PER_SECOND.standard).toFixed(2);
    throw new CLIError(
      `Standard mode costs $${cost} for 7s extension. Re-run with --confirm-cost to proceed.`,
      "COST_CONFIRMATION_REQUIRED"
    );
  }
}

// ============================================================================
// Presets
// ============================================================================

async function loadPresets(): Promise<Record<string, Preset>> {
  const presetsPath = resolve(SKILL_DIR, "tools", "Presets.json");
  try {
    const content = await readFile(presetsPath, "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function applyPreset(args: CLIArgs): Promise<CLIArgs> {
  if (!args.preset) return args;

  const presets = await loadPresets();
  const preset = presets[args.preset];

  if (!preset) {
    throw new CLIError(
      `Unknown preset: ${args.preset}. Use --list-presets to see available presets.`,
      "UNKNOWN_PRESET"
    );
  }

  // Apply preset defaults (CLI args take precedence)
  const result = { ...args };

  if (preset.fps && args.fps === DEFAULTS.fps) {
    result.fps = preset.fps;
  }
  if (preset.resolution && args.resolution === DEFAULTS.resolution) {
    result.resolution = preset.resolution;
  }
  if (preset.aspectRatio && !args.aspectRatio) {
    result.aspectRatio = preset.aspectRatio;
  }
  if (preset.negativePrompt) {
    result.negativePrompt = args.negativePrompt
      ? `${args.negativePrompt}, ${preset.negativePrompt}`
      : preset.negativePrompt;
  }
  if (preset.promptPrefix || preset.promptSuffix) {
    result.prompt = `${preset.promptPrefix || ""}${args.prompt}${preset.promptSuffix || ""}`;
  }

  return result;
}

// ============================================================================
// Query Operations
// ============================================================================

async function listPresets(): Promise<void> {
  const presets = await loadPresets();
  const list = Object.entries(presets).map(([name, preset]) => ({
    name,
    aspectRatio: preset.aspectRatio,
    resolution: preset.resolution,
    fps: preset.fps,
    hasPromptModifiers: !!(preset.promptPrefix || preset.promptSuffix),
  }));
  outputJSON({
    status: "complete" as const,
    presets: list,
  });
}

async function showPreset(name: string): Promise<void> {
  const presets = await loadPresets();
  const preset = presets[name];

  if (!preset) {
    throw new CLIError(
      `Unknown preset: ${name}. Use --list-presets to see available presets.`,
      "UNKNOWN_PRESET"
    );
  }

  outputJSON({
    status: "complete" as const,
    name,
    preset,
  });
}

async function checkOperationStatus(ai: GoogleGenAI, operationId: string): Promise<void> {
  try {
    // Create a minimal operation object with the name for lookup
    const operationRef = { name: operationId } as GenerateVideosOperation;
    const operation = await ai.operations.getVideosOperation({
      operation: operationRef,
    });

    outputJSON({
      status: operation.done ? "complete" : "in-progress",
      operationId,
      done: operation.done,
      metadata: operation.metadata,
    });
  } catch (error) {
    throw new CLIError(
      `Failed to get operation status: ${error instanceof Error ? error.message : String(error)}`,
      "OPERATION_STATUS_FAILED"
    );
  }
}

function cancelOperation(_ai: GoogleGenAI, _operationId: string): Promise<void> {
  // Note: The Google GenAI SDK does not expose a cancelVideosOperation method.
  // Cancellation would need to be done through the Google Cloud console or REST API directly.
  throw new CLIError(
    "Operation cancellation is not supported via the SDK. Use the Google Cloud console to cancel operations.",
    "CANCEL_NOT_SUPPORTED"
  );
}

// ============================================================================
// Cost Estimation
// ============================================================================

function estimateCost(args: CLIArgs): void {
  const duration = args.extend ? 7 : (args.duration || 8);
  const cost = (duration * COST_PER_SECOND[args.speed]).toFixed(2);
  const model = MODELS[args.speed];

  outputJSON({
    status: "dry-run",
    estimatedCost: `$${cost}`,
    duration,
    resolution: args.extend ? "720p" : args.resolution,
    model,
    speed: args.speed,
    isExtension: !!args.extend,
  });
}

// ============================================================================
// Reference Images
// ============================================================================

async function loadReferenceImages(
  paths: string[]
): Promise<VideoGenerationReferenceImage[]> {
  const images: VideoGenerationReferenceImage[] = [];

  for (const imagePath of paths) {
    const imageBuffer = await readFile(imagePath);
    const imageBase64 = imageBuffer.toString("base64");
    const ext = extname(imagePath).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
    };
    const mimeType = mimeMap[ext];
    if (!mimeType) {
      throw new CLIError(
        `Unsupported image format: ${ext}. Use PNG, JPG, or WebP.`,
        "UNSUPPORTED_IMAGE_FORMAT"
      );
    }
    images.push({
      image: { imageBytes: imageBase64, mimeType },
      referenceType: VideoGenerationReferenceType.ASSET,
    });
  }

  return images;
}

// ============================================================================
// Operation Metadata
// ============================================================================

async function saveOperationMetadata(
  outputPath: string,
  operationId: string,
  videoReference: unknown,
  duration: number,
  aspectRatio: AspectRatio,
  resolution: Resolution
): Promise<string> {
  const metadata: OperationMetadata = {
    operationId,
    videoReference,
    duration,
    aspectRatio,
    resolution,
    createdAt: new Date().toISOString(),
  };

  const metaPath = outputPath.replace(".mp4", ".meta.json");
  await writeFile(metaPath, JSON.stringify(metadata, null, 2));
  return metaPath;
}

async function loadOperationMetadata(videoPath: string): Promise<OperationMetadata> {
  const metaPath = videoPath.replace(".mp4", ".meta.json");

  try {
    const content = await readFile(metaPath, "utf-8");
    return JSON.parse(content);
  } catch {
    throw new CLIError(
      `Cannot extend: ${metaPath} not found. Only videos generated by this tool can be extended.`,
      "EXTENSION_METADATA_MISSING"
    );
  }
}

// ============================================================================
// Polling
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollOperation(
  ai: GoogleGenAI,
  operation: GenerateVideosOperation,
  timeoutMs: number
): Promise<GenerateVideosOperation> {
  const startTime = Date.now();
  let interval = 5000; // Start at 5s
  const maxInterval = 30000; // Max 30s
  let currentOp = operation;

  while (!currentOp.done) {
    if (Date.now() - startTime > timeoutMs) {
      throw new CLIError(
        `Timeout after ${Math.round(timeoutMs / 1000)}s`,
        "TIMEOUT"
      );
    }

    await sleep(interval);
    process.stderr.write("."); // Progress to stderr, keep stdout clean

    currentOp = await ai.operations.getVideosOperation({
      operation: currentOp,
    });

    interval = Math.min(interval * 1.5, maxInterval);
  }

  process.stderr.write("\n");
  return currentOp;
}

// ============================================================================
// Video Download
// ============================================================================

async function downloadVideo(uri: string, outputPath: string, apiKey: string): Promise<void> {
  process.stderr.write("Downloading video...\n");

  // Add API key to the download URL for authentication
  const downloadUrl = new URL(uri);
  downloadUrl.searchParams.set("key", apiKey);

  const response = await fetch(downloadUrl.toString());
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new CLIError(
      `Failed to download video: ${response.status} ${response.statusText} - ${body}`,
      "DOWNLOAD_FAILED"
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, buffer);
}

// ============================================================================
// Video Generation
// ============================================================================

async function generateVideo(ai: GoogleGenAI, args: CLIArgs): Promise<void> {
  const model = MODELS[args.speed];

  process.stderr.write(`Generating video with ${model}...\n`);

  // Build generation config
  const config: GenerateVideosConfig = {
    aspectRatio: args.aspectRatio,
    numberOfVideos: 1,
    durationSeconds: args.duration,
  };

  if (args.resolution === "1080p") {
    config.resolution = "1080p";
  }
  if (args.negativePrompt) {
    config.negativePrompt = args.negativePrompt;
  }
  if (args.seed !== undefined) {
    config.seed = args.seed;
  }
  // Note: Gemini API generates audio automatically based on prompt cues
  // (dialogue in quotes, sound effects, ambient noise). The generateAudio
  // parameter is only used by Vertex AI, not the consumer Gemini API.
  // Audio-rich prompts will produce synchronized audio without this flag.
  if (args.fps !== DEFAULTS.fps) {
    config.fps = args.fps;
  }

  // Add reference images to config if provided
  if (args.referenceImages.length > 0) {
    config.referenceImages = await loadReferenceImages(args.referenceImages);
  }

  // Build request
  const request: GenerateVideosParameters = {
    model,
    prompt: args.prompt,
    config,
  };

  // Start generation
  const operation = await ai.models.generateVideos(request);

  // Poll for completion
  const completedOperation = await pollOperation(ai, operation, args.timeout);

  // Extract video URI
  const response = completedOperation.response as {
    generatedVideos?: Array<{ video?: { uri?: string } }>;
  };

  if (
    !response?.generatedVideos ||
    response.generatedVideos.length === 0 ||
    !response.generatedVideos[0]?.video?.uri
  ) {
    throw new CLIError(
      "No video returned from API",
      "NO_VIDEO_RETURNED"
    );
  }

  const videoUri = response.generatedVideos[0].video.uri;
  const videoReference = response.generatedVideos[0].video;

  // Download video
  await downloadVideo(videoUri, args.output!, process.env.GOOGLE_API_KEY!);

  // Save metadata for extension support
  const metaPath = await saveOperationMetadata(
    args.output!,
    completedOperation.name!,
    videoReference,
    args.duration!,
    args.aspectRatio!,
    args.resolution
  );

  // Output result
  const cost = (args.duration! * COST_PER_SECOND[args.speed]).toFixed(2);

  outputJSON({
    status: "complete",
    outputPath: args.output,
    metadataPath: metaPath,
    operationId: completedOperation.name,
    duration: args.duration,
    resolution: args.resolution,
    cost: `$${cost}`,
    model,
    extendable: true,
  });
}

// ============================================================================
// Video Extension
// ============================================================================

async function extendVideo(ai: GoogleGenAI, args: CLIArgs): Promise<void> {
  // Load metadata from original video
  const metadata = await loadOperationMetadata(args.extend!);

  const model = MODELS[args.speed];

  process.stderr.write(`Extending video with ${model}...\n`);

  // Build extension request - video field is used for extending existing videos
  const request: GenerateVideosParameters = {
    model,
    prompt: args.prompt,
    video: metadata.videoReference as { uri?: string },
  };

  // Start extension
  const operation = await ai.models.generateVideos(request);

  // Poll for completion
  const completedOperation = await pollOperation(ai, operation, args.timeout);

  // Extract video URI
  const response = completedOperation.response as {
    generatedVideos?: Array<{ video?: { uri?: string } }>;
  };

  if (
    !response?.generatedVideos ||
    response.generatedVideos.length === 0 ||
    !response.generatedVideos[0]?.video?.uri
  ) {
    throw new CLIError(
      "No video returned from API",
      "NO_VIDEO_RETURNED"
    );
  }

  const videoUri = response.generatedVideos[0].video.uri;
  const videoReference = response.generatedVideos[0].video;

  // Download video
  await downloadVideo(videoUri, args.output!, process.env.GOOGLE_API_KEY!);

  // Calculate cumulative duration
  const extensionDuration = 7;
  const totalDuration = metadata.duration + extensionDuration;

  // Save metadata for further extension
  const metaPath = await saveOperationMetadata(
    args.output!,
    completedOperation.name!,
    videoReference,
    totalDuration,
    metadata.aspectRatio,
    "720p" // Extensions always 720p
  );

  // Output result
  const cost = (extensionDuration * COST_PER_SECOND[args.speed]).toFixed(2);

  outputJSON({
    status: "complete",
    outputPath: args.output,
    metadataPath: metaPath,
    operationId: completedOperation.name,
    extendedFrom: args.extend,
    extensionDuration,
    totalDuration,
    resolution: "720p",
    cost: `$${cost}`,
    model,
    extendable: totalDuration < 148,
  });
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  try {
    await loadEnv();
    let args = parseArgs(process.argv);

    // Handle query operations first (no API key needed for presets)
    if (args.listPresets) {
      await listPresets();
      return;
    }

    if (args.showPreset) {
      await showPreset(args.showPreset);
      return;
    }

    // API operations require key
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new CLIError(
        "Missing GOOGLE_API_KEY. Set in ~/.claude/.env or $PAI_DIR/.env",
        "MISSING_API_KEY"
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Handle status/cancel operations
    if (args.status) {
      await checkOperationStatus(ai, args.status);
      return;
    }

    if (args.cancel) {
      await cancelOperation(ai, args.cancel);
      return;
    }

    // Handle dry run
    if (args.dryRun) {
      // Need basic validation for cost estimation
      if (!args.duration && !args.extend) {
        throw new CLIError("--dry-run requires --duration or --extend", "MISSING_DURATION");
      }
      estimateCost(args);
      return;
    }

    // Apply preset if specified
    args = await applyPreset(args);

    // Handle prompt-only mode (output final prompt without generating)
    if (args.promptOnly) {
      if (!args.prompt) {
        throw new CLIError("--prompt-only requires --prompt", "MISSING_PROMPT");
      }
      outputJSON({
        status: "complete" as const,
        mode: "prompt-only",
        prompt: args.prompt,
        negativePrompt: args.negativePrompt || null,
        preset: args.preset || null,
        referenceImages: args.referenceImages.length > 0 ? args.referenceImages : null,
        parameters: {
          duration: args.duration || null,
          aspectRatio: args.aspectRatio || null,
          resolution: args.resolution,
          fps: args.fps,
          speed: args.speed,
        },
      });
      return;
    }

    // Handle extension mode
    if (args.extend) {
      validateExtensionArgs(args);
      await extendVideo(ai, args);
      return;
    }

    // Handle normal generation
    validateGenerationArgs(args);
    await generateVideo(ai, args);
  } catch (error) {
    handleError(error);
  }
}

main();
