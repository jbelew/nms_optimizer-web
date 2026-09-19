"""
Module for running the verification gatekeeper and reporting distilled results.
"""

import re
from dataclasses import dataclass
from typing import List, Optional

from .adapters import CommandRunnerAdapter, SubprocessCommandRunnerAdapter


def strip_ansi(text: str) -> str:
    """Remove ANSI escape sequences from terminal text."""
    ansi_regex = re.compile(r"\x1b\[[0-9;]*[a-zA-Z]|\x1b\([a-zA-Z]")
    return ansi_regex.sub("", text)


def distill_gate_output(output: str, max_lines: int = 100) -> str:
    """
    Distill raw gate output to reduce token usage during remediation retries:
    1. Strips ANSI color codes.
    2. Filters out passing test lines (✓, PASS).
    3. Truncates massive cascades at max_lines with a notice.
    """
    clean_text = strip_ansi(output)
    lines = clean_text.splitlines()

    filtered_lines: List[str] = []
    for line in lines:
        stripped = line.strip()
        # Drop passing test cases and passing file confirmations
        if stripped.startswith("✓") or stripped.startswith("PASS ") or stripped.startswith("PASS:"):
            continue
        filtered_lines.append(line)

    if len(filtered_lines) > max_lines:
        truncated_count = len(filtered_lines) - max_lines
        distilled = "\n".join(filtered_lines[:max_lines])
        return f"{distilled}\n\n... [{truncated_count} lines truncated to save context tokens]"

    return "\n".join(filtered_lines)


@dataclass
class VerificationResult:
    passed: bool
    output: str
    exit_code: int
    distilled_output: str = ""


class VerificationGate:
    """Encapsulates execution and evaluation of the pre-commit verification gate."""

    def __init__(
        self,
        runner: Optional[CommandRunnerAdapter] = None,
        command: Optional[List[str]] = None,
        max_distilled_lines: int = 100,
    ):
        self.runner = runner or SubprocessCommandRunnerAdapter()
        self.command = command or ["bunx", "lefthook", "run", "pre-commit"]
        self.max_distilled_lines = max_distilled_lines

    def verify(self) -> VerificationResult:
        """Run the gate command and return structured result."""
        exit_code, stdout, stderr = self.runner.run(self.command)
        output = f"{stdout}\n{stderr}".strip() if stderr else stdout.strip()
        distilled = (
            distill_gate_output(output, max_lines=self.max_distilled_lines)
            if exit_code != 0
            else ""
        )
        return VerificationResult(
            passed=(exit_code == 0),
            output=output,
            exit_code=exit_code,
            distilled_output=distilled,
        )
