#!/usr/bin/env python3
"""
Promote unblocked issues to 'ready-for-agent' and demote blocked issues.
Thin CLI adapter delegating to scripts.ralph.issues.IssueLifecycle.
"""

import json
from pathlib import Path
import sys

# Ensure project root is in sys.path when invoked directly as a script
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from scripts.ralph.issues import IssueLifecycle


def main():
    lifecycle = IssueLifecycle()

    if "--next" in sys.argv:
        issue = lifecycle.get_next_ready_issue()
        if issue:
            out = {
                "number": issue.number,
                "title": issue.title,
                "body": issue.body,
            }
            print(json.dumps(out))
        else:
            print("null")
    else:
        print("Checking for unblocked issues to promote/demote...", file=sys.stderr)
        updated = lifecycle.promote_all(log_output=True)
        if not updated:
            print("No label updates needed.", file=sys.stderr)


if __name__ == "__main__":
    main()
