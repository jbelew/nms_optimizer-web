#!/bin/bash

# Exit immediately if any command fails
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RALPH_ONCE="$PROJECT_ROOT/ralph_once.sh"

MAX_ITERATIONS=${1:-20}
# If the first argument is a number, consume it and shift
if [[ "$MAX_ITERATIONS" =~ ^[0-9]+$ ]]; then
    shift
else
    MAX_ITERATIONS=20
fi

echo "=== Starting Antigravity Ralph Loop ($MAX_ITERATIONS max iterations) ==="

ITERATION=1
while [ $ITERATION -le $MAX_ITERATIONS ]; do
    echo ""
    echo "========================================="
    echo "  Iteration $ITERATION / $MAX_ITERATIONS"
    echo "========================================="
    echo ""
    
    # Run a single iteration, forwarding any extra flags
    if ! "$RALPH_ONCE" "$@"; then
        echo "Error: Iteration $ITERATION failed."
        exit 1
    fi
    
    # Check if there are any remaining open issues
    # 2>/dev/null to hide deprecation warnings
    OPEN_ISSUES=$(gh issue list --state open --label "ready-for-agent" --json number --jq 'length' 2>/dev/null || echo "0")
    if [ "$OPEN_ISSUES" -eq 0 ]; then
        echo ""
        echo "========================================="
        echo "  All 'ready-for-agent' tasks completed!"
        echo "========================================="
        echo ""
        exit 0
    fi
    
    echo "Cooling down for 5 seconds..."
    sleep 5
    
    ITERATION=$((ITERATION+1))
done

echo "Warning: Reached maximum iterations ($MAX_ITERATIONS) without completing all tasks."
exit 1
