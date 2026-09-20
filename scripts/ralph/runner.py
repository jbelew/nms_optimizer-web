"""
Main TaskRunner coordinator: orchestrates issue lifecycle, agent execution,
verification gates, git operations, and downstream promotion.
"""

import sys
from typing import List, Optional

from .adapters import CommandRunnerAdapter, SubprocessCommandRunnerAdapter
from .agent import AgentClient
from .gate import VerificationGate
from .git import commit, format_commit_message, has_staged_changes, stage_all
from .issues import IssueLifecycle


class TaskRunner:
    """Deep module coordinating the complete autonomous issue execution lifecycle."""

    def __init__(
        self,
        lifecycle: Optional[IssueLifecycle] = None,
        gate: Optional[VerificationGate] = None,
        agent: Optional[AgentClient] = None,
        cmd_runner: Optional[CommandRunnerAdapter] = None,
    ):
        self.cmd_runner = cmd_runner or SubprocessCommandRunnerAdapter()
        self.lifecycle = lifecycle or IssueLifecycle()
        self.gate = gate or VerificationGate(runner=self.cmd_runner)
        self.agent = agent or AgentClient()

    def run(
        self,
        issue_number: Optional[int] = None,
        max_retries: int = 3,
        extra_args: Optional[List[str]] = None,
    ) -> int:
        """
        Execute one autonomous issue task.
        Returns 0 on success, non-zero on failure.
        """
        # 1. Resolve issue
        if issue_number is not None:
            print(f"Fetching details for issue #{issue_number}...", file=sys.stderr)
            issue = self.lifecycle.get_issue_context(issue_number)
            if not issue:
                print(f"Error: Issue #{issue_number} not found.", file=sys.stderr)
                return 1
        else:
            print("Querying GitHub for the next 'ready-for-agent' issue...", file=sys.stderr)
            issue = self.lifecycle.get_next_ready_issue()
            if not issue:
                print("=========================================")
                print("  No 'ready-for-agent' issues found!")
                print("=========================================")
                return 0

        # 2. Claim issue
        print("=========================================")
        print(f"Claiming and starting issue #{issue.number}")
        print(f"Title: {issue.title}")
        if issue.parent_number:
            print(f"Parent Spec: #{issue.parent_number}")
        print("=========================================")

        self.lifecycle.claim(issue.number)

        # 3. Run initial agent implementation
        initial_ok = self.agent.run_initial(issue, extra_args=extra_args)
        if not initial_ok:
            print(f"❌ Initial agent run failed for issue #{issue.number}.", file=sys.stderr)
            return 1

        stage_all(self.cmd_runner)

        if not has_staged_changes(self.cmd_runner):
            print(f"⚠️  Warning: No staged changes found for issue #{issue.number}.", file=sys.stderr)

        # 4. Verification gate & remediation loop
        print("\n=========================================")
        print("Running pre-commit verification gate...")
        print("=========================================")

        attempt = 1
        gate_passed = False

        while attempt <= max_retries:
            result = self.gate.verify()
            if result.passed:
                print("✔️  Pre-commit verification passed.")
                gate_passed = True
                break

            print(f"❌ Pre-commit verification failed (attempt {attempt} / {max_retries}):")
            print(result.output)

            if attempt == max_retries:
                print(f"❌ Verification gate failed after {max_retries} attempts. Aborting.", file=sys.stderr)
                return 1

            print("\nResuming agent with failure output to fix issues...\n")
            self.agent.remediate(result.distilled_output or result.output, extra_args=extra_args)
            stage_all(self.cmd_runner)
            attempt += 1

        if not gate_passed:
            return 1

        # 5. Commit verified changes
        if not has_staged_changes(self.cmd_runner):
            print(f"❌ Error: No staged changes found to commit for issue #{issue.number}.", file=sys.stderr)
            return 1

        commit_msg = format_commit_message(issue.title, issue.number)
        print(f"\nCommitting:\n{commit_msg}")
        if not commit(commit_msg, self.cmd_runner):
            print("❌ Error: Failed to commit changes.", file=sys.stderr)
            return 1

        # 6. Complete issue and unblock downstream issues
        self.lifecycle.complete(issue.number, comment="Resolved.")

        print("=========================================")
        print(f"Successfully completed issue #{issue.number}")
        print("=========================================")
        return 0
