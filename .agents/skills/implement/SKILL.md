---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

If the user passes a ticket reference, fetch it from the issue tracker and state its title before starting. If the reference is ambiguous, ask.

Call the Skill tool with "tdd" where possible, at pre-agreed seams.

Run typechecking (`bun run typecheck`) and targeted test files (`bun run test -- <path>`) regularly during development, and `bun run test:related` once at the end.

Commit your work to the current branch (scoping to the touched files).

Once committed, call the Skill tool with "code-review" against `HEAD~1` to review the commit, amending if any fixes are required.
