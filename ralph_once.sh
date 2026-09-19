#!/bin/bash

# Exit immediately if any command fails, and preserve pipeline exit codes
set -eo pipefail

# Support overriding the issue number via argument
ISSUE_NUM=""
if [[ "$1" =~ ^[0-9]+$ ]]; then
	ISSUE_NUM="$1"
	shift
fi

# Query GitHub CLI via promote_issues.py to find the next unblocked issue if not specified
if [ -z "$ISSUE_NUM" ]; then
	echo "Querying GitHub for the next 'ready-for-agent' issue..."
	NEXT_ISSUE=$(python3 ./scripts/promote_issues.py --next)

	if [ -z "$NEXT_ISSUE" ] || [ "$NEXT_ISSUE" = "null" ]; then
		echo "========================================="
		echo "  No 'ready-for-agent' issues found!"
		echo "========================================="
		exit 0
	fi

	ISSUE_NUM=$(echo "$NEXT_ISSUE" | jq -r '.number')
	ISSUE_TITLE=$(echo "$NEXT_ISSUE" | jq -r '.title')
	ISSUE_BODY=$(echo "$NEXT_ISSUE" | jq -r '.body')
else
	# Fetch details for the specified issue number
	echo "Fetching details for issue #$ISSUE_NUM..."
	ISSUE_DETAILS=$(gh issue view "$ISSUE_NUM" --json number,title,body --jq '.' 2>/dev/null || true)
	if [ -z "$ISSUE_DETAILS" ] || [ "$ISSUE_DETAILS" = "null" ]; then
		echo "Error: Issue #$ISSUE_NUM not found."
		exit 1
	fi
	ISSUE_TITLE=$(echo "$ISSUE_DETAILS" | jq -r '.title')
	ISSUE_BODY=$(echo "$ISSUE_DETAILS" | jq -r '.body')
fi

# Fetch comments for context
ISSUE_COMMENTS=$(gh issue view "$ISSUE_NUM" --json comments --jq '.comments[].body' 2>/dev/null || echo "")

# Check if this issue is part of a parent spec/epic (e.g., "Part of #738" or "## Parent\n\n#738")
PARENT_NUM=$(python3 -c "import sys, re; m = re.search(r'(?:Part of|Parent(?: issue)?:?)\s*(?:[\r\n]+\s*)?#(\d+)', sys.stdin.read(), re.I); print(m.group(1) if m else '')" <<< "$ISSUE_BODY")
PARENT_SPEC=""
if [ -n "$PARENT_NUM" ]; then
	echo "Detected parent spec #$PARENT_NUM. Fetching specification context..."
	PARENT_SPEC=$(gh issue view "$PARENT_NUM" --json number,title,body --jq '"### Parent Spec #\(.number): \(.title)\n\n\(.body)"' 2>/dev/null || echo "")
fi

echo "========================================="
echo "Claiming and starting issue #$ISSUE_NUM"
echo "Title: $ISSUE_TITLE"
if [ -n "$PARENT_NUM" ]; then
	echo "Parent Spec: #$PARENT_NUM"
fi
echo "========================================="

# Claim the issue by assigning to me (@me)
gh issue edit "$ISSUE_NUM" --add-assignee @me 2>/dev/null || echo "Note: Could not assign issue (continuing anyway)."

# Construct the prompt for the Antigravity CLI agent
PROMPT=$(
	cat <<EOF
/implement GitHub issue #$ISSUE_NUM: "$ISSUE_TITLE".

## Issue Description:
$ISSUE_BODY

$([ -n "$PARENT_SPEC" ] && echo -e "## Parent Specification & Architecture Guardrails:\n$PARENT_SPEC\n")
## Comments & Context:
$ISSUE_COMMENTS

## Autonomous Execution Guardrails:
- You are running in autonomous batch mode.
- Implement the necessary changes and write/update unit tests.
- Verify your work using targeted test commands (\`bunx vitest run <path>\`) and typechecking (\`bun run typecheck\`).
- When executing commands, set \`WaitMsBeforeAsync: 10000\` so commands run synchronously. Do NOT background commands.
- Stage all your changes (\`git add .\`).
- Append a one-line summary with the date to \`progress.txt\`.
- NOTE: Do NOT run \`lefthook\`, \`git commit\`, or \`gh issue close\` yourself. The runner harness will execute the pre-commit verification gate, commit, and close the issue automatically once verified.
EOF
)

# Run agy in headless mode with live stream formatting
# Pass any extra arguments from user (e.g., --model, --effort) to agy
agy \
	--mode=accept-edits \
	--model="Gemini 3.8 Flash (High)" \
	--dangerously-skip-permissions \
	--project="$(pwd)" \
	--print-timeout=20m \
	--output-format=stream-json \
	--prompt "$PROMPT" \
	"$@" | python3 ./scripts/format_stream.py

# Ensure any changes made by the agent are staged
git add .

# Check if there are any staged changes
if git diff --cached --quiet; then
	echo "⚠️  Warning: No staged changes found for issue #$ISSUE_NUM."
fi

# Outer verification gate: run lefthook in native bash (handles 1-3min runtimes without timeout)
echo ""
echo "========================================="
echo "Running pre-commit verification gate..."
echo "========================================="

GATE_MAX_RETRIES=3
GATE_ATTEMPT=1

while [ $GATE_ATTEMPT -le $GATE_MAX_RETRIES ]; do
	set +e
	GATE_OUTPUT=$(bunx lefthook run pre-commit 2>&1)
	GATE_STATUS=$?
	set -e

	if [ $GATE_STATUS -eq 0 ]; then
		echo "✔️  Pre-commit verification passed."
		break
	fi

	echo "❌ Pre-commit verification failed (attempt $GATE_ATTEMPT / $GATE_MAX_RETRIES):"
	echo "$GATE_OUTPUT"

	if [ $GATE_ATTEMPT -eq $GATE_MAX_RETRIES ]; then
		echo "❌ Verification gate failed after $GATE_MAX_RETRIES attempts. Aborting."
		exit 1
	fi

	echo ""
	echo "Resuming agent with failure output to fix issues..."
	echo ""

	agy \
		--continue \
		--mode=accept-edits \
		--model="Gemini 3.8 Flash (High)" \
		--dangerously-skip-permissions \
		--project="$(pwd)" \
		--print-timeout=20m \
		--output-format=stream-json \
		--prompt "Pre-commit verification failed with the following errors:

$GATE_OUTPUT

Please fix these errors, verify with targeted tests, and stage your changes ('git add .'). Do NOT run lefthook yourself." \
		"$@" | python3 ./scripts/format_stream.py

	git add .
	GATE_ATTEMPT=$((GATE_ATTEMPT + 1))
done

# Commit the verified changes using Angular convention, ensuring header <= 95 chars for commitlint
COMMIT_MSG=$(python3 -c "
title = '''$ISSUE_TITLE'''.strip()
issue = '$ISSUE_NUM'
suffix = f' (#{issue})'
max_header = 95
if len(title) + len(suffix) <= max_header:
    print(f'{title}{suffix}')
else:
    avail = max_header - len(suffix) - 3
    short_title = title[:avail].rsplit(' ', 1)[0] + '...'
    header = f'{short_title}{suffix}'
    print(f'{header}\n\n{title}')
")

echo ""
echo "Committing:"
echo "$COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# Close the issue on GitHub
gh issue close "$ISSUE_NUM" --comment "Resolved."

# Automatically promote any issues that are now unblocked by the completion of this issue
./scripts/promote_issues.py

echo "========================================="
echo "Successfully completed issue #$ISSUE_NUM"
echo "========================================="
