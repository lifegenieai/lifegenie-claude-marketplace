<div align="center">

#  LifeGenie Plugin Marketplace

**Supercharge Claude Code with production-ready plugins**

[![Plugins](https://img.shields.io/badge/plugins-12-blue)](./plugins)
[![Claude Code](https://img.shields.io/badge/claude--code-compatible-green)](https://claude.ai/claude-code)
[![License](https://img.shields.io/badge/license-MIT-purple)](./LICENSE)

_A curated collection of plugins that extend Claude Code's capabilities for
search, research, writing, video generation, image creation, voice design, and
more._

[Quick Start](#-quick-start) • [Plugins](#-plugins) •
[Installation](#-installation) • [Contributing](#-contributing)

</div>

---

## ✨ What's Inside

| Plugin                                                       | Category      | Description                                        | Command         |
| ------------------------------------------------------------ | ------------- | -------------------------------------------------- | --------------- |
| [**Search Hub**](#-search-hub)                               | Research      | Multi-source search across 4 providers in parallel | `/search`       |
| [**Research Coordinator**](#-research-coordinator)           | Research      | Multi-agent research with citation verification    | `/research`     |
| [**Research Synthesizer**](#-research-synthesizer)           | Writing       | Combine multiple research reports into one         | `/mindmeld`     |
| [**Copy Editor**](#-copy-editor)                             | Writing       | Stylometric document transformation and editing    | `/copy-editor`  |
| [**Video Generator**](#-video-generator)                     | Creative      | Generate videos with Google Veo 3.1 API            | `/video`        |
| [**Nano Banana**](#-nano-banana)                             | Creative      | AI image generation with Gemini Flash and Pro      | `/nano-banana`  |
| [**ElevenLabs Voice Designer**](#-elevenlabs-voice-designer) | Creative      | Interactive AI voice design wizard                 | `/design-voice` |
| [**CLAUDE.md Optimizer**](#-claudemd-optimizer)              | Development   | Audit, optimize, and manage CLAUDE.md files        | `/claudemd`     |
| [**Markdown Optimizer**](#-markdown-optimizer)               | Utilities     | Compress markdown for LLM context efficiency       | `/optimize`     |
| [**Doc-Sync**](#-doc-sync)                                   | Documentation | Auto-update docs from git history                  | `/update-docs`  |
| [**Agent Reviewer**](#-agent-reviewer)                       | Development   | Validate and fix Claude Code agent files           | `/review-agents`|
| [**Thinking Partner**](#-thinking-partner)                   | Creative      | Collaborative brainstorming and exploration        | Agent-based     |

---

## 🚀 Quick Start

```bash
# Clone the marketplace
git clone https://github.com/lifegenieai/lifegenie-claude-marketplace.git

# Use any plugin directly
claude --plugin-dir ./lifegenie-claude-marketplace/plugins/video-generator

# Or reference in your settings for persistent access
```

---

## 📦 Plugins

### 🔍 Search Hub

> **Multi-source search that fans out to 4 providers in parallel**

Hit Tavily, Perplexity, Gemini, and Exa simultaneously for every query.
Cross-referencing what multiple providers surface reveals what's actually
important versus what's noise.

**Key Features:**

- 🌐 **Parallel Fan-Out** — All available providers searched simultaneously
- 📊 **Provider-Attributed Results** — Each source's answer reproduced
  faithfully
- 🔗 **Cross-Provider Signal** — Synthesis section highlights agreements and
  contradictions
- 🎯 **Single-Provider Mode** — Target one provider when explicitly needed

**Usage:**

```bash
/search "latest TypeScript features"
/search "compare React vs Svelte" --providers tavily,perplexity
/search perplexity "quantum computing" --model sonar-pro
/search --status
```

**Providers:**

| Provider   | Strength                        | Cost                |
| ---------- | ------------------------------- | ------------------- |
| Gemini     | Google's live index             | Free (OAuth)        |
| Tavily     | Fast web results, LLM-optimized | Free tier (1000/mo) |
| Perplexity | Cited synthesis, deep research  | $0.01-$0.15/query   |
| Exa        | Neural/semantic matching        | ~$0.005/query       |

**Requirements:** API keys in `~/.claude/.env` for Tavily, Perplexity, Exa.
Gemini uses OAuth via `gemini` CLI. Bun runtime required.

---

### 🔬 Research Coordinator

> **Comprehensive web research with verified citations**

A full 7-phase research workflow: scope clarification, research brief, task
decomposition, dual-source execution (Tavily + Gemini), per-task synthesis,
final report, and citation verification.

**Key Features:**

- 📋 **Research Brief** — Standalone scope document with success criteria
- 🔄 **Dual-Source Execution** — Tavily + Gemini per task for cross-verification
- ✅ **Citation Verification** — Parallel Haiku agents check URL accessibility
  and accuracy
- 📄 **Publication-Ready Output** — Markdown report with verified sources table

**Usage:**

```bash
/research "What are current best practices for AI agent architectures?"
/research
```

**Search APIs Supported:**

| API           | Cost              | Best For        |
| ------------- | ----------------- | --------------- |
| Tavily        | $10/1000 searches | LLM-optimized   |
| SerpAPI       | $50/5000 searches | Raw SERP data   |
| Brave Search  | Free 2000/month   | Privacy-focused |
| Google Custom | Free 100/day      | Domain-specific |
| Gemini CLI    | Free (fallback)   | Always works    |

**Requirements:** Optional API keys in `~/.claude/.env` (`TAVILY_API_KEY`,
`SERPAPI_KEY`, `BRAVE_API_KEY`, `GOOGLE_API_KEY`). Falls back to Gemini CLI.

---

### 🧠 Research Synthesizer

> **Combine multiple research reports into one coherent document**

The "Mind Melder" reads multiple research files and produces a unified synthesis
that removes redundancy, preserves unique insights, and explicitly flags
contradictions.

**Key Features:**

- 🔗 **Deduplication** — Consolidate overlapping information
- 💡 **Insight Preservation** — Keep unique findings with source attribution
- ⚠️ **Contradiction Flagging** — Highlight where sources disagree
- 📊 **Structured Output** — Consistent template with sections for findings,
  code examples, and open questions

**Usage:**

```bash
/mindmeld research-file-1.md research-file-2.md research-file-3.md
```

**Output Structure:**

```
# [Topic] - Research Mind Meld
> Synthesized from: 3 reports | Date: 2026-01-18

## Key Findings
## Implementation Approach
## Code Examples
## Contradictions & Open Questions
## Source Attribution
```

---

### ✍️ Copy Editor

> **Stylometric document transformation and full-service copy editing**

Applies target writing styles to content while preserving factual accuracy.
Operates as a senior literary ghostwriter with deep stylometry expertise and AI
anti-pattern guardrails.

**Key Features:**

- 🎭 **Style Absorption** — Analyze and apply any target voice from files, named
  profiles, or descriptions
- 📝 **Five Modes** — Transform, Rewrite, Edit, Generate, Proofread
- 🛡️ **AI Anti-Patterns** — Detects and removes detectable AI writing
- 📄 **Flexible Input** — File paths, URLs, or inline content as source

**Usage:**

```bash
/copy-editor john-roberts ./draft.md ./output.md
/copy-editor narrative-technologist ./blog-post.md ./restyled.md
/copy-editor ./brand-voice.md https://example.com/article ./restyled.html
/copy-editor "terse, declarative" ./verbose.md ./clean.md make accessible to general audience
```

**Operating Modes:**

| Mode      | When                         | Purpose                              |
| --------- | ---------------------------- | ------------------------------------ |
| Transform | Source + style + output      | Apply target voice to source content |
| Rewrite   | Source + "rewrite" direction | Substantially restructure            |
| Edit      | Source + "edit" direction    | Grammar/clarity/tone corrections     |
| Generate  | No source, style + output    | Create new content in target voice   |
| Proofread | Source + "proofread"         | Grammar/spelling/punctuation only    |

**Named Styles:** `john-roberts` (conversational inevitability),
`narrative-technologist` (story-driven technical writing). Custom styles via
YAML profiles.

---

### 🎬 Video Generator

> **Generate stunning videos using Google's Veo 3.1 API**

Transform text prompts into high-quality video clips with full control over
duration, aspect ratio, resolution, and style presets.

**Key Features:**

- 🎨 **Style Presets** — Cinematic, vertical-social, product-demo, documentary
- ⏱️ **Flexible Duration** — 4, 6, or 8 seconds per clip
- 🔄 **Video Extension** — Extend videos up to 148 seconds in 7-second
  increments
- 💰 **Cost Controls** — Automatic estimation and confirmation before generation
- 📐 **Multiple Formats** — 16:9 (YouTube), 9:16 (TikTok/Reels), 1:1 (Instagram)

**Usage:**

```bash
/video "A cat walking on a beach at sunset"
/video "Cinematic drone shot" --duration 8 --preset cinematic
```

**Pricing:**

| Model    | Cost/Second | 8s Clip |
| -------- | ----------- | ------- |
| Fast     | $0.15       | $1.20   |
| Standard | $0.40       | $3.20   |

**Requirements:** `GOOGLE_API_KEY` in `~/.claude/.env`

---

### 🍌 Nano Banana

> **AI image generation powered by Gemini 3.1 Flash and Pro**

Generate images from text prompts with multi-resolution output, aspect ratio
control, transparent assets, reference images for style transfer, and automatic
cost tracking.

**Key Features:**

- 🎨 **Two Models** — Flash (fast, cheap) for iteration, Pro for final quality
- 📐 **Multi-Resolution** — 512px, 1K, 2K, 4K output sizes
- 🟢 **Transparency** — Green screen to transparent PNG via FFmpeg
- 🖼️ **Reference Images** — Style transfer and image editing
- 🔍 **Google Search Grounding** — Web + image search for accurate rendering
- 💰 **Cost Tracking** — Per-image and session cost summaries

**Usage:**

```bash
/nano-banana "A sunset over mountains"
/nano-banana "pixel art robot" --transparent --output robot
/nano-banana "dashboard UI" -s 2K -a 16:9 -m pro
```

**Models & Pricing:**

| Model | Alias           | 1K Cost | Best For                      |
| ----- | --------------- | ------- | ----------------------------- |
| Flash | `flash`, `nb2`  | ~$0.067 | Speed, volume, iteration      |
| Pro   | `pro`, `nb-pro` | ~$0.134 | Final quality, complex images |

**Requirements:** `GEMINI_API_KEY` in `~/.nano-banana/.env`. Bun runtime.
FFmpeg + ImageMagick for transparent mode.

---

### 🎙️ ElevenLabs Voice Designer

> **Interactive wizard for crafting AI voice design prompts**

Guided 8-step wizard that generates 3 distinct prompt variations (Conservative,
Creative, Experimental) with guidance scale recommendations and preview text for
each.

**Key Features:**

- 🎭 **8-Step Interview** — Voice type, age, gender, accent, tone, pacing,
  emotion, audio quality
- 🎯 **3 Variations** — Conservative, Creative, and Experimental prompt options
- 📋 **Copy-Paste Ready** — Complete ElevenLabs Voice Design prompts
- 📚 **22+ Examples** — Technique-organized reference library

**Usage:**

```bash
/design-voice
/design-voice narrator
/design-voice villain
```

**Guidance Scale Reference:**

| Range   | Style           | Use Case                        |
| ------- | --------------- | ------------------------------- |
| 0.0-0.3 | Very natural    | Professional, narrator voices   |
| 0.3-0.5 | Balanced        | Most character voices           |
| 0.5-0.7 | More stylized   | Fantasy, exaggerated characters |
| 0.7-1.0 | Highly stylized | Extreme, experimental voices    |

**Requirements:** No dependencies for prompt generation. ElevenLabs API account
for actual voice creation.

---

### 📋 CLAUDE.md Optimizer

> **The ultimate toolkit for CLAUDE.md file management**

Audit, optimize, create, migrate, and enforce best practices for your CLAUDE.md
configuration files.

**Key Features:**

- 🔍 **Audit** — Score against a 100-point rubric with actionable
  recommendations
- ⚡ **Optimize** — Apply best practices and high-efficiency formats
  automatically
- ✨ **Create** — Generate new CLAUDE.md files from templates
- 🚀 **Migrate** — Update files for Opus 4.5+ behavior patterns
- 🔒 **Enforce** — Set up hooks and settings for ongoing compliance

**Usage:**

```bash
/claudemd audit      # Score and analyze your CLAUDE.md
/claudemd optimize   # Apply best practices
/claudemd create     # Generate from scratch
/claudemd migrate    # Update for Opus 4.5+
```

**Why It Matters:**

| Constraint           | Limit                           |
| -------------------- | ------------------------------- |
| Instruction Budget   | ~100-150 instructions max       |
| Efficiency Hierarchy | Code > Tables > Bullets > Prose |
| Target Score         | 75+ (90+ excellent)             |

---

### 📄 Markdown Optimizer

> **Maximize information density for LLM context windows**

Compress markdown documents to fit more knowledge into limited context budgets.
Uses mode-based optimization: Light, Standard, Aggressive, or Split.

**Key Features:**

- 📉 **Token Reduction** — Compress documents by 30-60%
- 📊 **Mode Selection** — Automatic based on document size
- 🔄 **Format Conversion** — Prose → Tables → Maximum density
- ✂️ **Smart Splitting** — Recommend file splits for 10K+ token documents

**Usage:**

```bash
/optimize docs/architecture.md
```

**Optimization Modes:**

| Mode       | Token Range | Strategy                          |
| ---------- | ----------- | --------------------------------- |
| Light      | < 3K        | Minimal changes, add frontmatter  |
| Standard   | 3K-6K       | Aggressive compression to 3-4K    |
| Aggressive | 6K-10K      | Maximum density, <6K target       |
| Split      | 10K+        | Recommend semantic file splitting |

**Output Example:**

```
Token Efficiency Metrics:
├─ Input:  6,240 tokens
├─ Output: 3,180 tokens
├─ Reduction: 49%
└─ Tables created: 8
```

---

### 📚 Doc-Sync

> **Automatically update documentation based on git commit history**

Analyzes your current branch's commits, identifies which documentation needs
updating, and either reports gaps or auto-updates your docs. Tuned for the
**tech-docs** taxonomy.

**Key Features:**

- 🔍 **Git-Aware** — Analyzes commits since branch diverged from main
- 📊 **Smart Detection** — Categorizes changes by type (feature, architecture,
  dependency)
- 🎯 **Gap Analysis** — Identifies stale docs, missing docs, and wrong status
  markers
- ✏️ **Auto-Update** — Automatically update documentation (or review-only mode)
- 🛡️ **Context-Protected** — Sub-agents handle heavy lifting, keeping main
  conversation clean

**Usage:**

```bash
/update-docs                    # Analyze and update docs
/update-docs --analyze-only     # Report gaps without making changes
/update-docs --since=abc1234    # Analyze from specific commit
```

**Agent Pipeline:**

```
Git Analyzer (Haiku) → Gap Analyzer (Opus) → Doc Updater (Opus)
     │                      │                      │
     ▼                      ▼                      ▼
  changes.md             gaps.md             Updated docs
```

**Change Categories:**

| Category     | File Patterns               | Documentation Impact |
| ------------ | --------------------------- | -------------------- |
| feature      | `src/app/*`, `routes/*`     | Feature docs, routes |
| architecture | `src/lib/*`, `migrations/*` | ADRs, overview       |
| dependency   | `package.json`              | Tech stack reference |
| config       | `*.config.*`, `.env*`       | Guides, deployment   |
| style        | `*.css`, `theme*`           | Design system docs   |

**Target Structure:**

```
docs/tech-docs/
├── README.md                    # Index
├── quick-reference/             # Fast-lookup guides
├── architecture/decisions/      # ADRs
├── features/                    # Per-feature docs
├── reference/                   # Tech stack, scripts
└── design/                      # Design system
```

---

### 🔎 Agent Reviewer

> **Structural validation and interactive triage for Claude Code agent files**

Validates agent `.md` files against the official spec, consolidates findings by
severity, lets you triage fixes interactively, then applies them. Catches
missing fields, invalid values, tools-as-strings, misplaced example blocks, and
more.

**Key Features:**

- 🔍 **Spec-Driven Validation** — Loads the current agent spec at runtime, never
  validates from stale training data
- 📊 **Severity Classification** — Critical, Important, Nice-to-have findings
- 🗳️ **Interactive Triage** — Grouped by issue type so 12 agents missing `color`
  is one decision, not 12
- 🔧 **Auto-Fix** — Applies agreed-upon fixes via Edit tool

**Usage:**

```bash
/review-agents path/to/agents/          # Validate all agents in a directory
/review-agents path/to/single-agent.md  # Validate a single file
```

**Checks Performed:**

| Check             | Severity  | Example                              |
| ----------------- | --------- | ------------------------------------ |
| Missing `name`    | Critical  | Agent won't register                 |
| Missing `model`   | Critical  | Agent won't function                 |
| Tools as string   | Critical  | `tools: "Read,Write"` instead of array |
| Missing `color`   | Important | No color badge in UI                 |
| No `<example>` blocks | Important | Poor triggering accuracy         |
| `model: opus`     | Nice      | Cost justification flag              |

**Requirements:** `plugin-dev` plugin must be installed (provides the
`agent-development` skill used as the source of truth for field specs).

---

### 💭 Thinking Partner

> **A collaborative intellectual companion for complex exploration**

Not just an information provider—a genuine thinking partner for brainstorming,
strategic planning, philosophical inquiry, and navigating ambiguous challenges.

**Key Features:**

- 🔍 **Deep Listening** — Understands full context and nuance
- 🗺️ **Territory Mapping** — Visualizes conceptual landscapes
- 🔄 **Multiple Perspectives** — Systems thinking, first principles, analogies
- 💡 **Insight Synthesis** — Crystallizes understanding progressively

**Approach:**

1. Map the territory of ideas
2. Identify connections and unexplored areas
3. Balance divergent/convergent thinking
4. Challenge assumptions constructively
5. Navigate complexity without forcing conclusions

**Best For:**

- Strategic decision-making
- Research synthesis and exploration
- Creative brainstorming sessions
- Complex problem decomposition

---

## 📥 Installation

### Option 1: Clone and Reference

```bash
git clone https://github.com/lifegenieai/lifegenie-claude-marketplace.git ~/.claude/marketplaces/lifegenie
```

### Option 2: Individual Plugin

```bash
# Copy just one plugin
cp -r lifegenie-claude-marketplace/plugins/video-generator ~/.claude/plugins/
```

### Option 3: Direct Use

```bash
claude --plugin-dir /path/to/lifegenie-claude-marketplace/plugins/video-generator
```

### Environment Setup

Some plugins require API keys. Add to `~/.claude/.env`:

```bash
# Video Generator, Research Coordinator
GOOGLE_API_KEY=your-google-api-key

# Search Hub
TAVILY_API_KEY=tvly-...
PERPLEXITY_API_KEY=pplx-...
EXA_API_KEY=...

# Research Coordinator (optional extras)
SERPAPI_KEY=...
BRAVE_API_KEY=...
```

Nano Banana uses a separate config: `~/.nano-banana/.env` with `GEMINI_API_KEY`.
Gemini search uses OAuth via the `gemini` CLI (no API key needed).

---

## 🏗️ Plugin Structure

Each plugin follows Claude Code's standard structure:

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json        # Plugin manifest
├── commands/              # Slash commands (/video, /mindmeld)
├── agents/                # Autonomous agents
├── skills/                # Knowledge and workflows
├── tools/                 # CLI tools and scripts
└── README.md
```

---

## 🤝 Contributing

Contributions welcome! Please ensure plugins:

1. Follow the standard plugin structure
2. Include comprehensive documentation
3. Have clear usage examples
4. Work independently (no cross-plugin dependencies)

---

## 📜 License

MIT License - Use freely, modify openly, share generously.

---

<div align="center">

**Built with ❤️ for the Claude Code community**

[Report Issue](https://github.com/lifegenieai/lifegenie-claude-marketplace/issues)
•
[Request Plugin](https://github.com/lifegenieai/lifegenie-claude-marketplace/issues/new)

</div>
