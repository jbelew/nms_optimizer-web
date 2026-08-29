#!/bin/bash

# Exit immediately if any command fails
set -e

# Support overriding the issue number via argument
ISSUE_NUM=""
if [[ "$1" =~ ^[0-9]+$ ]]; then
	ISSUE_NUM="$1"
	shift
fi

# Query GitHub CLI to find the next issue if not specified
if [ -z "$ISSUE_NUM" ]; then
	echo "Querying GitHub for the next 'ready-for-agent' issue..."
	# 2>/dev/null to hide GitHub GraphQL deprecation warnings
	NEXT_ISSUE=$(gh issue list --state open --label "ready-for-agent" --json number,title,body --jq '.[0]' 2>/dev/null || true)

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

echo "========================================="
echo "Claiming and starting issue #$ISSUE_NUM"
echo "Title: $ISSUE_TITLE"
echo "========================================="

# Claim the issue by assigning to me (@me)
gh issue edit "$ISSUE_NUM" --add-assignee @me 2>/dev/null || echo "Note: Could not assign issue (continuing anyway)."

# Construct the prompt for the Antigravity CLI agent
PROMPT=$(
	cat <<EOF
Implement GitHub issue #$ISSUE_NUM: "$ISSUE_TITLE".

## Issue Description:
$ISSUE_BODY

## Comments & Context:
$ISSUE_COMMENTS

## After implementation:
- Stage changes: \`git add .\`
- Run verification: \`bunx lefthook run pre-commit\`
- Fix any failures, re-stage, and re-run until clean.
- Close the issue: \`gh issue close $ISSUE_NUM --comment "Resolved."\`
- Append a one-line summary with the date to \`progress.txt\`.
- Commit using Angular convention (e.g. \`feat(grid): ...\`), subject under 50 chars. Reference the issue number in the commit message (e.g. \`#123\`).
EOF
)

# Run agy in headless mode with the generated prompt
# Pass any extra arguments from user (e.g., --model, --effort) to agy
agy \
	--mode=accept-edits \
	--model="Gemini 3.5 Flash (High)" \
	--dangerously-skip-permissions \
	--project="$(pwd)" \
	--print-timeout=20m \
	--prompt "$PROMPT" \
	"$@"

# Automatically promote any issues that are now unblocked by the completion of this issue
./scripts/promote_issues.py

echo "========================================="
echo "Finished iteration for issue #$ISSUE_NUM"
echo "========================================="
