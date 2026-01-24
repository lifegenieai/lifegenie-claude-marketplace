---
name: process
description: Process Crystal Ball inbox items into structured backlog items
---

# Process Crystal Ball Inbox

Read all files in the inbox, transform each into a structured backlog item, move
to backlog.

## Workspace

`/mnt/c/Obsidian/MainVault/MainVault/CrystalBall/`

## Instructions

1. Read all `.md` files in `inbox/`
2. For each file:
   - Parse the raw content (voice-to-text, messy thoughts, stream of
     consciousness)
   - Extract the core idea(s) - if multiple distinct ideas, create separate
     items
   - Generate a slug from the main concept
   - Create structured backlog file with this format:

```markdown
---
id: {YYYY-MM-DD}-{slug}
category: {inferred from content: pai | culinary-advisor | lifegenie | personal}
type: {idea | task | bug | feature}
priority: {high | medium | low}
created: {YYYY-MM-DD}
source: {original filename}
---

# {Title}

{One sentence summary}

## Raw Capture

{Original text, preserved verbatim}

## Analysis

- What is this?
- Why does it matter?
- Rough scope/effort

## Questions

- [ ] {Open questions that need answers before execution}

## Next Action

{Specific, concrete next step}
```

3. Write to `backlog/{YYYY-MM-DD}-{slug}.md`
4. Delete the original inbox file
5. Report what was processed

## Output

After processing, show:

- Number of items processed
- List of created backlog items with their titles and priorities
- Any items that were split into multiple backlog entries
