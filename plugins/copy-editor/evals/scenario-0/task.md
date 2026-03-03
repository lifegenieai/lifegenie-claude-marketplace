# Scenario 0: Basic Style Transformation with Named Style

## Setup

Create a source file `source.md` with the following content:

```markdown
# The Importance of Code Review

Code review is a crucial practice in software development. It serves as a
cornerstone of quality assurance. When developers leverage code review processes,
they can navigate the landscape of potential bugs more effectively.

The process works as follows. First, a developer submits their code. Then,
another developer reviews it. After that, feedback is provided. Finally,
changes are made. This cycle repeats until the code is approved.

It's worth noting that code review has many benefits. Interestingly enough,
studies have shown that code review catches 60% of defects. The result? Better
software. The best part? It's essentially free.

From junior developers to seasoned architects, everyone can benefit from code
review. The tool -- which has been around for decades -- remains the single most
effective quality gate. The practice -- often overlooked by fast-moving teams --
deserves more attention.

In this article, we'll explore why code review matters and how to do it well.
Not just a process. A philosophy. Where manual review gives you depth,
automated review gives you speed.
```

## Task

Run the copy-editor skill in Transform mode using the `narrative-technologist`
named style:

```
/copy-editor narrative-technologist source.md output.md
```

The output should:
1. Transform the source into the narrative-technologist voice
2. Detect and fix all AI anti-patterns present in the source
3. Preserve the factual claims about code review
4. Pass all 9 quality checks
