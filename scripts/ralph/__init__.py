"""
Ralph autonomous task runner package.
"""

from .adapters import (
    AgentRunnerAdapter,
    CliAgentRunnerAdapter,
    CliIssueTrackerAdapter,
    CommandRunnerAdapter,
    FakeAgentRunnerAdapter,
    FakeCommandRunnerAdapter,
    FakeIssueTrackerAdapter,
    IssueTrackerAdapter,
    SubprocessCommandRunnerAdapter,
)
from .gate import VerificationGate, VerificationResult
from .git import format_commit_message, has_staged_changes, stage_all
from .issues import Issue, IssueLifecycle
from .runner import TaskRunner

__all__ = [
    "AgentRunnerAdapter",
    "CliAgentRunnerAdapter",
    "CliIssueTrackerAdapter",
    "CommandRunnerAdapter",
    "FakeAgentRunnerAdapter",
    "FakeCommandRunnerAdapter",
    "FakeIssueTrackerAdapter",
    "Issue",
    "IssueLifecycle",
    "IssueTrackerAdapter",
    "SubprocessCommandRunnerAdapter",
    "TaskRunner",
    "VerificationGate",
    "VerificationResult",
    "format_commit_message",
    "has_staged_changes",
    "stage_all",
]
