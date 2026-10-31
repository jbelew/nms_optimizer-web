# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc or `--body-file` for multi-line bodies.
- **Read an issue**: `gh issue view <number> --json number,title,body,labels,comments --jq '"#\(.number) \(.title)\nLabels: \([.labels[].name] | join(", "))\n\n\(.body)"'` (renders readable newlines instead of single-line `\n`-escaped JSON blobs; append `\(.comments | map("\n---\n" + .body) | join(""))` when comments are needed).
- **Update a PR body or title**: `gh api --method PATCH repos/{owner}/{repo}/pulls/<number> -F body=@<body-file>` (uses GitHub's REST API directly so `gh pr edit` never fails on GitHub's deprecated classic Projects `projectCards` GraphQL field).
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Make an issue a sub-issue of a parent**: `gh api --method POST repos/{owner}/{repo}/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>` (numeric database id from `gh api repos/{owner}/{repo}/issues/<n> --jq .id`, as in **Blocking** below). On `gh` 2.94+: `gh issue create --parent <parent> ...` or `gh issue edit <parent> --add-sub-issue <child>`. Without sub-issues, put `Part of #<parent>` at the top of the child body.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close / resolve a ticket**: check off completed acceptance criteria (`- [ ]` → `- [x]`) in the issue body (`gh issue edit <number> --body "..."`), then close with `gh issue close <number> --comment "Resolved in <sha>."`. When committing in a sibling repo (e.g. `nms_optimizer-service` for a ticket tracked in `jbelew/nms_optimizer-web`), pass `-R jbelew/nms_optimizer-web`.

Infer the repo from `git remote -v`; `gh` does this automatically when run inside a clone.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh api --paginate 'repos/{owner}/{repo}/pulls?state=open' --jq '.[] | select(.author_association | IN("OWNER","MEMBER","COLLABORATOR") | not) | {number, title, author: .user.login, author_association, labels: [.labels[].name]}'`.
- **Comment / label / edit / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh api --method PATCH repos/{owner}/{repo}/pulls/<number> -F body=@<file>`, `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either: resolve with `gh pr view 42 --json number,title,body,labels,comments` and fall back to `gh issue view 42 --json number,title,body,labels,comments`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue:

- **Specs (`/to-spec`)**: Prefix the issue title with `spec:` (or `spec(<scope>):`) and apply the `spec` label (`gh issue create --title "spec: ..." --label "spec"`).
- **Tickets (`/to-tickets`)**: Use Conventional Commit prefixes (`feat:`, `fix:`, `refactor:`, etc.) for child ticket titles, link each child as a sub-issue of the parent spec, and ensure the parent spec carries `spec` without `ready-for-agent` (`gh issue edit <parent> --add-label spec --remove-label ready-for-agent`) so only actionable leaf tickets carry `ready-for-agent`.

## When a skill says "fetch the relevant ticket"

Read it as in **Read an issue** above. When `/implement` completes (after commit and `code-review` pass), immediately resolve the ticket as in **Close / resolve a ticket** above—check off `- [ ]` → `- [x]` in the issue body and close the issue with the commit SHA. Do not defer closing until `git push`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `gh issue create --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (see **Make an issue a sub-issue of a parent**). Where sub-issues aren't enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: GitHub's **native issue dependencies**, the canonical, UI-visible representation. Add an edge with `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric **database id** (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, _not_ the `#number` or `node_id`). GitHub reports `issue_dependencies_summary.blocked_by` (open blockers only, the live gate). Where dependencies aren't available, fall back to a `Blocked by: #<n>, #<n>` line at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Frontier query**: list the map's open children (`gh issue list --state open`, scoped to the map's sub-issues / task list), drop any with an open blocker (`issue_dependencies_summary.blocked_by > 0`, or an open issue in the `Blocked by` line) or an assignee; first in map order wins.
- **Claim**: `gh issue edit <n> --add-assignee @me`, the session's first write.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then `gh issue close <n>`, then append a context pointer (gist + link) to the map's Decisions-so-far.
