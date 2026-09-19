#!/bin/bash

# Exit immediately if any command fails, and preserve pipeline exit codes
set -eo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec python3 "$PROJECT_ROOT/scripts/ralph_runner.py" "$@"
