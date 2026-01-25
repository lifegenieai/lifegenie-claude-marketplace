---
description:
  Publish a plugin to the lifegenie marketplace. Validates structure, registers
  in marketplace.json, commits, and pushes. Use after creating a new plugin in
  plugins/ folder.
argument-hint: <plugin-name>
allowed-tools:
  - Read
  - Edit
  - Bash
  - Glob
---

# Publish Plugin to Marketplace

You are publishing a plugin to the lifegenie-claude-marketplace. This command
ensures the complete publication process is executed correctly.

## Required Argument

The user MUST provide a plugin name. If not provided, list available unpublished
plugins and ask which one to publish.

## Publication Workflow

Execute these steps in order. Do NOT skip any step.

### Step 1: Validate Plugin Exists

```bash
# Check plugin directory exists
ls -la ${MARKETPLACE_ROOT}/plugins/<plugin-name>/.claude-plugin/plugin.json
```

If the plugin doesn't exist, stop and inform the user.

### Step 2: Read Plugin Manifest

Read the plugin's `plugin.json` to extract:

- name
- description
- version
- author
- keywords (for tags)

### Step 3: Check If Already Registered

Read `${MARKETPLACE_ROOT}/.claude-plugin/marketplace.json` and check if the
plugin is already in the `plugins` array.

If already registered, inform the user and ask if they want to update the entry.

### Step 4: Determine Category

Based on the plugin's purpose, suggest a category. Available categories in this
marketplace:

- `development` - Dev tools, code quality, workflows
- `creative` - Content creation, media, design
- `writing` - Documentation, reports, text processing
- `utilities` - General-purpose tools
- `research` - Research, analysis, synthesis
- `documentation` - Doc generation and maintenance

Ask the user to confirm or choose a different category.

### Step 5: Register in marketplace.json

Add a new entry to the `plugins` array in `.claude-plugin/marketplace.json`:

```json
{
  "name": "<plugin-name>",
  "description": "<description from plugin.json>",
  "version": "<version from plugin.json>",
  "author": {
    "name": "<author from plugin.json or 'Erik B'>"
  },
  "source": "./plugins/<plugin-name>",
  "category": "<chosen-category>",
  "tags": [<keywords from plugin.json>]
}
```

Use the Edit tool to add this entry. Maintain proper JSON formatting.

### Step 6: Verify Registration

Read the updated marketplace.json and confirm the entry was added correctly.

### Step 7: Git Operations

Execute these git commands:

```bash
cd ${MARKETPLACE_ROOT}

# Check if plugin files are already committed
git status

# If plugin files are untracked, add them first
git add plugins/<plugin-name>/

# Add marketplace.json
git add .claude-plugin/marketplace.json

# Create commit
git commit -m "feat(<plugin-name>): publish to marketplace

- Add plugin to marketplace registry
- Category: <category>
- Tags: <tags>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# Push to origin
git push origin master
```

### Step 8: Confirmation

Report to the user:

- Plugin name
- Category assigned
- Tags assigned
- Git commit hash
- Confirmation that plugin is now discoverable via `/plugin`

## Environment Variables

- `MARKETPLACE_ROOT` = `/home/erikb/dev/lifegenie-claude-marketplace`

## Error Handling

- If plugin directory doesn't exist: Stop and list available plugins in
  `plugins/` folder
- If plugin.json is invalid: Report the JSON error
- If already registered: Ask if user wants to update the existing entry
- If git push fails: Report the error but note the local commit succeeded

## Example Usage

```
User: /publish-plugin elevenlabs-voice-designer
→ Validates plugin exists
→ Reads plugin.json
→ Checks not already registered
→ Asks for category confirmation
→ Adds to marketplace.json
→ Commits and pushes
→ Reports success
```
