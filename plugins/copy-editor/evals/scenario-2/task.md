# Scenario 2: Style Extraction from Reference Document

## Setup

Create a reference style document `reference-voice.md` with the following
content. This is a writing sample that exemplifies a specific voice the
copy-editor must extract and apply:

```markdown
I spent Tuesday morning debugging a race condition that existed only on
machines with exactly four CPU cores. Not three. Not five. Four. Something
about the scheduler's thread affinity on quad-core chips created a window --
maybe 200 nanoseconds wide -- where two goroutines could both believe they
held the lock.

You find these bugs the way you find a slow leak in a tire. You don't hear it.
You don't see it. You just notice, three weeks later, that the car pulls left.

The fix was six lines. The investigation was three days. I'm not sure which
number I should put on the invoice, but I know which one the client will
question.

Here is what nobody tells you about concurrency: the textbook examples work.
They always work. It is the interaction between your concurrency model and your
specific hardware, your specific OS scheduler, your specific memory hierarchy
that creates the bugs. The textbook says "use a mutex." The textbook is correct.
The textbook also assumes your mutex implementation doesn't have a fast-path
optimization that skips the memory barrier on architectures that Intel stopped
making in 2019.

I keep a file called `bugs-that-taught-me-things.md`. It has 847 entries. Entry
number 412 is "never trust a benchmark that runs for less than 30 seconds" and
I think about it roughly once a week.
```

Create a source document `corporate-memo.md`:

```markdown
# Q4 Infrastructure Modernization Initiative Update

## Executive Summary

The infrastructure modernization initiative has made significant progress this
quarter. Our team has leveraged cutting-edge containerization technologies to
streamline deployment workflows, resulting in a robust and seamless CI/CD
pipeline that serves as the backbone of our engineering organization.

## Key Achievements

The migration to Kubernetes has been transformative. We have successfully
navigated the landscape of container orchestration challenges, fostering a
culture of operational excellence. The pivotal decision to adopt GitOps has
proven groundbreaking, showcasing our team's ability to harness modern DevOps
practices.

Key metrics include:
- Deployment frequency increased from weekly to 12x daily
- Mean time to recovery reduced from 4 hours to 18 minutes
- Infrastructure costs reduced by 34%

## Next Steps

It is important to note that the journey toward full modernization continues.
From our platform team to our application developers, everyone plays a
significant role in shaping the next phase of this initiative.
```

## Task

Run the copy-editor in Transform mode, using the reference document as the
style source:

```
/copy-editor reference-voice.md corporate-memo.md output.md preserve all metrics and data points
```

The output should read as if the author of `reference-voice.md` wrote a piece
covering the same information as the corporate memo. The voice should match:
specific anecdotes over general claims, short-long sentence rhythm, dry humor,
first-person perspective, direct "is/has" over inflated verbs. All metrics must
be preserved exactly.
