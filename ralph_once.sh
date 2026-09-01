#!/bin/bash

# Exit immediately if any command fails
set -e

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

# Check if this issue is part of a parent spec/epic (e.g., "Part of #738")
PARENT_NUM=$(echo "$ISSUE_BODY" | grep -oEi '(Part of|Parent:?|Parent issue:?) *#([0-9]+)' | grep -oE '[0-9]+' | head -n 1 || true)
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
Implement GitHub issue #$ISSUE_NUM: "$ISSUE_TITLE".

## Issue Description:
$ISSUE_BODY

$([ -n "$PARENT_SPEC" ] && echo -e "## Parent Specification & Architecture Guardrails:\n$PARENT_SPEC\n")
## Comments & Context:
$ISSUE_COMMENTS

## After implementation:
- Stage changes: \`git add .\`
- Run verification: \`bunx lefthook run pre-commit\`
- Fix any failures, re-stage, and re-run until clean.
- Close the issue: \`gh issue close $ISSUE_NUM --comment "Resolved."\`
- Append a one-line summary with the date to \`progress.txt\`.
- Commit using Angular convention (e.g. \`feat(grid): ...\`), subject under 90 chars. Reference the issue number in the commit message (e.g. \`#$ISSUE_NUM\`).
EOF
)

# Run agy in headless mode with the generated prompt
# Pass any extra arguments from user (e.g., --model, --effort) to agy
agy \
	--mode=accept-edits \
	--model="Gemini 3.7 Flash (High)" \
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
