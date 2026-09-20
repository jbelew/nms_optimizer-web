#!/usr/bin/env python3
"""
CLI entrypoint for the Ralph autonomous issue task runner.
"""

import argparse
from pathlib import Path
import sys

# Ensure project root is in sys.path when invoked directly as a script
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from scripts.ralph.runner import TaskRunner


def parse_issue_number(val: str) -> int:
    return int(val.lstrip("#"))


def main():
    parser = argparse.ArgumentParser(
        description="Autonomous issue runner for Antigravity (Ralph loop).",
        add_help=False,
    )
    parser.add_argument(
        "issue_number",
        nargs="?",
        type=parse_issue_number,
        default=None,
        help="Optional issue number to run (e.g. 773 or #773). If omitted, picks next 'ready-for-agent' issue.",
    )
    parser.add_argument(
        "--max-retries",
        type=int,
        default=3,
        help="Maximum verification gate retry attempts (default: 3).",
    )
    parser.add_argument(
        "-h",
        "--help",
        action="help",
        help="Show this help message and exit.",
    )

    args, unknown = parser.parse_known_args()

    runner = TaskRunner()
    exit_code = runner.run(
        issue_number=args.issue_number,
        max_retries=args.max_retries,
        extra_args=unknown if unknown else None,
    )
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
