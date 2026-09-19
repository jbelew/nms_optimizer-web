"""
Agent orchestration module: prompt formatting, session continuation, and remediation.
"""

from typing import List, Optional

from .adapters import AgentRunnerAdapter, CliAgentRunnerAdapter
from .issues import Issue


def format_initial_prompt(issue: Issue) -> str:
    """Construct the initial autonomous implementation prompt for the agent."""
    parent_section = ""
    if issue.parent_spec:
        parent_section = f"## Parent Specification & Architecture Guardrails:\n{issue.parent_spec}\n\n"

    comments_section = ""
    if issue.comments:
        comments_section = "\n".join(issue.comments)

    return f"""/implement GitHub issue #{issue.number}: "{issue.title}".

## Issue Description:
{issue.body}

{parent_section}## Comments & Context:
{comments_section}

## Autonomous Execution Guardrails:
- You are running in autonomous batch mode.
- Implement the necessary changes and write/update unit tests.
- Verify your work using targeted test commands (`bunx vitest run <path>`) and typechecking (`bun run typecheck`).
- When executing commands, set `WaitMsBeforeAsync: 10000` so commands run synchronously. Do NOT background commands.
- Stage all your changes (`git add .`).
- Append a one-line summary with the date to `progress.txt`.
- NOTE: Do NOT run `lefthook`, `git commit`, or `gh issue close` yourself. The runner harness will execute the pre-commit verification gate, commit, and close the issue automatically once verified."""


def format_remediation_prompt(gate_output: str) -> str:
    """Construct the continuation prompt when verification gate fails."""
    return f"""Pre-commit verification failed with the following errors:

{gate_output}

Please fix these errors, verify with targeted tests, and stage your changes ('git add .'). Do NOT run lefthook yourself."""


class AgentClient:
    """High-level client for running the autonomous agent."""

    def __init__(self, adapter: Optional[AgentRunnerAdapter] = None):
        self.adapter = adapter or CliAgentRunnerAdapter()

    def run_initial(self, issue: Issue, extra_args: Optional[List[str]] = None) -> bool:
        """Run the initial autonomous session for an issue with high reasoning effort."""
        prompt = format_initial_prompt(issue)
        return self.adapter.run_agent(
            prompt=prompt,
            continue_session=False,
            effort="high",
            extra_args=extra_args,
        )

    def remediate(self, gate_output: str, extra_args: Optional[List[str]] = None) -> bool:
        """Resume an existing session with low reasoning effort to fix verification failures."""
        prompt = format_remediation_prompt(gate_output)
        return self.adapter.run_agent(
            prompt=prompt,
            continue_session=True,
            effort="low",
            extra_args=extra_args,
        )
