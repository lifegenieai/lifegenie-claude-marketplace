# Scenario 1: AI Anti-Pattern Detection (All 18 Patterns)

## Setup

Create a source file `contaminated.md` with the following content. This
document is intentionally seeded with all 18 AI anti-patterns. Each paragraph
contains one or more patterns.

```markdown
# Trunk-Based Development: A Comprehensive Guide

In this post, we'll explore how trunk-based development transforms the way
teams ship software. What follows is a deep dive into modern branching
strategies.

Not a branching strategy. A survival mechanism. Not just a workflow. A
philosophy. Where feature branches give you isolation, trunk-based gives you
speed. Where long-lived branches give you safety, short-lived ones give you
momentum.

Fast. Reliable. Tested. And shipped on a Monday. Feature flags. Dark launches.
Percentage rollouts. Pure control. Same pipeline. Same config. Different
result.

The code doesn't define the process; the process defines the code. The
developer writes the test; the test writes the confidence. Process without
discipline yields organized chaos. Discipline without process yields
correctly-structured confusion.

And the deployment? Zero rollbacks. The result? Everyone could deploy. The best
part? It just worked. The takeaway? Confidence is everything.

The pipeline -- which we had built over three sprints -- handled it gracefully.
The config -- our most critical file -- was updated without downtime. The tests
-- all 200 of them -- passed on the first run. The monitoring -- set up by the
SRE team -- caught every anomaly.

It's worth noting that trunk-based development isn't new. Interestingly enough,
Google has used it for over a decade. To be fair, not every team can adopt it
overnight. It bears mentioning that the cultural shift is the hardest part.

Our team leveraged trunk-based development to streamline our deployment
pipeline. We delved into the intricacies of continuous integration and fostered
a robust culture of code review. The pivotal decision to adopt feature flags
was truly transformative, creating a seamless developer experience across our
entire ecosystem. This groundbreaking approach showcased the vital importance of
navigating the landscape of modern DevOps practices.

Trunk-based development served as the backbone of our CI/CD pipeline. The
feature flag system stood as a testament to incremental delivery. Our monitoring
dashboard boasted real-time alerting. The deployment process showcased zero-
downtime releases.

We reviewed the pipeline configuration. We checked the integration test suite.
We ran the end-to-end tests locally. We deployed the changes to staging first.
We monitored the production metrics carefully.

What I find genuinely interesting about this transition is how it changed our
team dynamics. I keep coming back to the idea that confidence in deployment
unlocks creativity. Something feels off about the old way of doing things now.
Picture the workflow: you sit down at your desk, open the terminal, and start
deploying with confidence.

From solo developers just learning the ropes to hundred-person engineering orgs
running distributed systems at scale, trunk-based development works for teams of
all sizes. Whether you're building a side project or a Fortune 500 deployment
pipeline, the principles remain the same.

The CI pipeline automated our deployments. Later, the integration system caught
regressions before production. Eventually, the build infrastructure scaled to
handle peak loads. The automation layer -- as we came to call it -- became
indispensable.

Here's what we achieved: zero rollbacks in production \ud83d\ude80, 99.9% uptime \ud83d\udd25,
and a team that actually enjoys deploying on Fridays \ud83c\udf89.

\u201cTrunk-based development isn\u2019t about moving fast,\u201d our tech lead said. \u201cIt\u2019s
about moving safely.\u201d The transition took three months\u2026 but it was worth it.
We went from deploying once a week to deploying 10\u201315 times per day.
```

## Task

Run the copy-editor in Edit mode to clean AI anti-patterns while preserving the
document's informational content:

```
/copy-editor "clean technical prose, direct, no AI tells" contaminated.md cleaned.md edit: remove all AI anti-patterns, preserve factual content
```

The output should have every one of the 18 AI anti-patterns identified and
rewritten. The factual claims (zero rollbacks, 99.9% uptime, 200 tests, Google
using it for a decade, three-month transition, 10-15 deploys per day) must be
preserved.
