<div align="center">

# 🧞 LifeGenie Plugin Marketplace

**Supercharge Claude Code with production-ready plugins**

[![Plugins](https://img.shields.io/badge/plugins-5-blue)](./plugins)
[![Claude Code](https://img.shields.io/badge/claude--code-compatible-green)](https://claude.ai/claude-code)
[![License](https://img.shields.io/badge/license-MIT-purple)](./LICENSE)

*A curated collection of plugins that extend Claude Code's capabilities for video generation, document optimization, research synthesis, and more.*

[Quick Start](#-quick-start) • [Plugins](#-plugins) • [Installation](#-installation) • [Contributing](#-contributing)

</div>

---

## ✨ What's Inside

| Plugin | Category | Description | Command |
|--------|----------|-------------|---------|
| [**Video Generator**](#-video-generator) | Creative | Generate videos with Google Veo 3.1 API | `/video` |
| [**CLAUDE.md Optimizer**](#-claudemd-optimizer) | Development | Audit, optimize, and manage CLAUDE.md files | `/claudemd` |
| [**Research Synthesizer**](#-research-synthesizer) | Writing | Combine multiple research reports into one | `/mindmeld` |
| [**Markdown Optimizer**](#-markdown-optimizer) | Utilities | Compress markdown for LLM context efficiency | `/optimize` |
| [**Thinking Partner**](#-thinking-partner) | Creative | Collaborative brainstorming and exploration | Agent-based |

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

### 🎬 Video Generator

> **Generate stunning videos using Google's Veo 3.1 API**

Transform text prompts into high-quality video clips with full control over duration, aspect ratio, resolution, and style presets.

**Key Features:**
- 🎨 **Style Presets** — Cinematic, vertical-social, product-demo, documentary
- ⏱️ **Flexible Duration** — 4, 6, or 8 seconds per clip
- 🔄 **Video Extension** — Extend videos up to 148 seconds in 7-second increments
- 💰 **Cost Controls** — Automatic estimation and confirmation before generation
- 📐 **Multiple Formats** — 16:9 (YouTube), 9:16 (TikTok/Reels), 1:1 (Instagram)

**Usage:**
```bash
/video "A cat walking on a beach at sunset"
/video "Cinematic drone shot" --duration 8 --preset cinematic
```

**Pricing:**
| Model | Cost/Second | 8s Clip |
|-------|-------------|---------|
| Fast | $0.15 | $1.20 |
| Standard | $0.40 | $3.20 |

**Requirements:** `GOOGLE_API_KEY` in `~/.claude/.env`

---

### 📋 CLAUDE.md Optimizer

> **The ultimate toolkit for CLAUDE.md file management**

Audit, optimize, create, migrate, and enforce best practices for your CLAUDE.md configuration files.

**Key Features:**
- 🔍 **Audit** — Score against a 100-point rubric with actionable recommendations
- ⚡ **Optimize** — Apply best practices and high-efficiency formats automatically
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

| Constraint | Limit |
|------------|-------|
| Instruction Budget | ~100-150 instructions max |
| Efficiency Hierarchy | Code > Tables > Bullets > Prose |
| Target Score | 75+ (90+ excellent) |

---

### 🧠 Research Synthesizer

> **Combine multiple research reports into one coherent document**

The "Mind Melder" reads multiple research files and produces a unified synthesis that removes redundancy, preserves unique insights, and explicitly flags contradictions.

**Key Features:**
- 🔗 **Deduplication** — Consolidate overlapping information
- 💡 **Insight Preservation** — Keep unique findings with source attribution
- ⚠️ **Contradiction Flagging** — Highlight where sources disagree
- 📊 **Structured Output** — Consistent template with sections for findings, code examples, and open questions

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

### 📄 Markdown Optimizer

> **Maximize information density for LLM context windows**

Compress markdown documents to fit more knowledge into limited context budgets. Uses mode-based optimization: Light, Standard, Aggressive, or Split.

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

| Mode | Token Range | Strategy |
|------|-------------|----------|
| Light | < 3K | Minimal changes, add frontmatter |
| Standard | 3K-6K | Aggressive compression to 3-4K |
| Aggressive | 6K-10K | Maximum density, <6K target |
| Split | 10K+ | Recommend semantic file splitting |

**Output Example:**
```
Token Efficiency Metrics:
├─ Input:  6,240 tokens
├─ Output: 3,180 tokens  
├─ Reduction: 49%
└─ Tables created: 8
```

---

### 💭 Thinking Partner

> **A collaborative intellectual companion for complex exploration**

Not just an information provider—a genuine thinking partner for brainstorming, strategic planning, philosophical inquiry, and navigating ambiguous challenges.

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
# For Video Generator
GOOGLE_API_KEY=your-google-api-key
```

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

[Report Issue](https://github.com/lifegenieai/lifegenie-claude-marketplace/issues) • [Request Plugin](https://github.com/lifegenieai/lifegenie-claude-marketplace/issues/new)

</div>
