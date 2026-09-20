"""
Protocols and concrete adapters for external dependencies (CLI tools, agent, and subprocesses).
"""

import json
import os
import subprocess
import sys
from typing import Any, Dict, List, Optional, Protocol, Tuple


class CommandRunnerAdapter(Protocol):
    """Interface for running OS commands."""

    def run(self, cmd: List[str], cwd: Optional[str] = None) -> Tuple[int, str, str]:
        """
        Execute a command.
        Returns (exit_code, stdout, stderr).
        """
        ...


class SubprocessCommandRunnerAdapter:
    """Real implementation of CommandRunnerAdapter using subprocess."""

    def run(self, cmd: List[str], cwd: Optional[str] = None) -> Tuple[int, str, str]:
        res = subprocess.run(
            cmd,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        return res.returncode, res.stdout, res.stderr


class FakeCommandRunnerAdapter:
    """In-memory fake CommandRunnerAdapter for testing."""

    def __init__(self):
        self.recorded_commands: List[Tuple[List[str], Optional[str]]] = []
        self.responses: Dict[str, Tuple[int, str, str]] = {}
        self.default_response: Tuple[int, str, str] = (0, "", "")

    def set_response(self, command_prefix: str, exit_code: int, stdout: str = "", stderr: str = ""):
        self.responses[command_prefix] = (exit_code, stdout, stderr)

    def run(self, cmd: List[str], cwd: Optional[str] = None) -> Tuple[int, str, str]:
        self.recorded_commands.append((cmd, cwd))
        cmd_str = " ".join(cmd)
        for prefix, resp in self.responses.items():
            if cmd_str.startswith(prefix):
                return resp
        return self.default_response


class IssueTrackerAdapter(Protocol):
    """Interface for querying and updating GitHub issues."""

    def list_open_issues(self, limit: int = 100) -> List[Dict[str, Any]]:
        """List open issues with number, title, body, and labels."""
        ...

    def get_issue(self, number: int) -> Optional[Dict[str, Any]]:
        """Fetch details for a single issue (number, title, body)."""
        ...

    def get_comments(self, number: int) -> List[str]:
        """Fetch comments for an issue."""
        ...

    def edit_issue(
        self,
        number: int,
        add_assignee: Optional[str] = None,
        add_label: Optional[str] = None,
        remove_label: Optional[str] = None,
        body: Optional[str] = None,
    ) -> bool:
        """Edit an issue's assignee, labels, or body."""
        ...

    def close_issue(self, number: int, comment: Optional[str] = None) -> bool:
        """Close an issue with an optional comment."""
        ...


class CliIssueTrackerAdapter:
    """Adapter for GitHub using gh CLI."""

    def __init__(self, runner: Optional[CommandRunnerAdapter] = None):
        self.runner = runner or SubprocessCommandRunnerAdapter()

    def list_open_issues(self, limit: int = 100) -> List[Dict[str, Any]]:
        cmd = [
            "gh",
            "issue",
            "list",
            "--state",
            "open",
            "--json",
            "number,title,body,labels",
            "--limit",
            str(limit),
        ]
        code, out, err = self.runner.run(cmd)
        if code != 0 or not out.strip():
            return []
        try:
            return json.loads(out)
        except json.JSONDecodeError:
            return []

    def get_issue(self, number: int) -> Optional[Dict[str, Any]]:
        cmd = ["gh", "issue", "view", str(number), "--json", "number,title,body", "--jq", "."]
        code, out, _ = self.runner.run(cmd)
        if code != 0 or not out.strip() or out.strip() == "null":
            return None
        try:
            return json.loads(out)
        except json.JSONDecodeError:
            return None

    def get_comments(self, number: int) -> List[str]:
        cmd = ["gh", "issue", "view", str(number), "--json", "comments", "--jq", ".comments[].body"]
        code, out, _ = self.runner.run(cmd)
        if code != 0 or not out.strip():
            return []
        return [c.strip() for c in out.splitlines() if c.strip()]

    def edit_issue(
        self,
        number: int,
        add_assignee: Optional[str] = None,
        add_label: Optional[str] = None,
        remove_label: Optional[str] = None,
        body: Optional[str] = None,
    ) -> bool:
        cmd = ["gh", "issue", "edit", str(number)]
        if add_assignee:
            cmd.extend(["--add-assignee", add_assignee])
        if add_label:
            cmd.extend(["--add-label", add_label])
        if remove_label:
            cmd.extend(["--remove-label", remove_label])
        if body is not None:
            cmd.extend(["--body", body])
        code, _, _ = self.runner.run(cmd)
        return code == 0

    def close_issue(self, number: int, comment: Optional[str] = None) -> bool:
        cmd = ["gh", "issue", "close", str(number)]
        if comment:
            cmd.extend(["--comment", comment])
        code, _, _ = self.runner.run(cmd)
        return code == 0


class FakeIssueTrackerAdapter:
    """In-memory fake IssueTrackerAdapter for testing."""

    def __init__(self, initial_issues: Optional[List[Dict[str, Any]]] = None):
        self.issues: Dict[int, Dict[str, Any]] = {}
        self.comments: Dict[int, List[str]] = {}
        self.closed_issues: Dict[int, Optional[str]] = {}

        if initial_issues:
            for issue in initial_issues:
                num = issue["number"]
                self.issues[num] = {
                    "number": num,
                    "title": issue.get("title", ""),
                    "body": issue.get("body", ""),
                    "labels": issue.get("labels", []),
                    "assignees": issue.get("assignees", []),
                }
                if "comments" in issue:
                    self.comments[num] = list(issue["comments"])

    def list_open_issues(self, limit: int = 100) -> List[Dict[str, Any]]:
        open_list = [
            issue
            for num, issue in self.issues.items()
            if num not in self.closed_issues
        ]
        return open_list[:limit]

    def get_issue(self, number: int) -> Optional[Dict[str, Any]]:
        return self.issues.get(number)

    def get_comments(self, number: int) -> List[str]:
        return self.comments.get(number, [])

    def edit_issue(
        self,
        number: int,
        add_assignee: Optional[str] = None,
        add_label: Optional[str] = None,
        remove_label: Optional[str] = None,
        body: Optional[str] = None,
    ) -> bool:
        if number not in self.issues:
            return False
        issue = self.issues[number]
        if add_assignee:
            if "assignees" not in issue:
                issue["assignees"] = []
            if add_assignee not in issue["assignees"]:
                issue["assignees"].append(add_assignee)
        if add_label:
            labels = issue.setdefault("labels", [])
            label_names = [l["name"] if isinstance(l, dict) else l for l in labels]
            if add_label not in label_names:
                labels.append({"name": add_label})
        if remove_label:
            labels = issue.get("labels", [])
            issue["labels"] = [
                l for l in labels
                if (l["name"] if isinstance(l, dict) else l) != remove_label
            ]
        if body is not None:
            issue["body"] = body
        return True

    def close_issue(self, number: int, comment: Optional[str] = None) -> bool:
        if number not in self.issues:
            return False
        self.closed_issues[number] = comment
        return True


class AgentRunnerAdapter(Protocol):
    """Interface for invoking the autonomous agent."""

    def run_agent(
        self,
        prompt: str,
        continue_session: bool = False,
        effort: str = "high",
        extra_args: Optional[List[str]] = None,
    ) -> bool:
        """Run the agent with a prompt. Returns True if successful."""
        ...


def model_supports_effort(model_name: str) -> bool:
    """Check if a model identifier accepts the --effort flag in agy."""
    lowered = model_name.lower()
    if any(suffix in lowered for suffix in ["(high)", "(medium)", "(low)", "-high", "-medium", "-low"]):
        return False
    if "claude" in lowered:
        return False
    return True


class CliAgentRunnerAdapter:
    """Real adapter running `agy` and formatting the NDJSON stream in-process."""

    def __init__(self, project_dir: Optional[str] = None):
        self.project_dir = project_dir or os.getcwd()

    def build_cmd(
        self,
        prompt: str,
        continue_session: bool = False,
        effort: str = "high",
        extra_args: Optional[List[str]] = None,
    ) -> List[str]:
        cmd = ["agy"]
        if continue_session:
            cmd.append("--continue")

        cmd.extend([
            "--mode=accept-edits",
            "--dangerously-skip-permissions",
            f"--project={self.project_dir}",
            "--print-timeout=20m",
            "--output-format=stream-json",
        ])

        model_val = None
        for i, arg in enumerate(extra_args or []):
            if arg.startswith("--model="):
                model_val = arg.split("=", 1)[1]
            elif arg == "--model" and i + 1 < len(extra_args or []):
                model_val = (extra_args or [])[i + 1]

        if not model_val:
            cmd.append("--model=gemini-3.8-flash")
            model_val = "gemini-3.8-flash"

        has_effort_override = any(arg.startswith("--effort") for arg in (extra_args or []))
        if not has_effort_override and model_supports_effort(model_val) and effort:
            cmd.append(f"--effort={effort}")

        cmd.extend([
            "--prompt",
            prompt,
        ])

        if extra_args:
            cmd.extend(extra_args)

        return cmd

    def run_agent(
        self,
        prompt: str,
        continue_session: bool = False,
        effort: str = "high",
        extra_args: Optional[List[str]] = None,
    ) -> bool:
        cmd = self.build_cmd(
            prompt=prompt,
            continue_session=continue_session,
            effort=effort,
            extra_args=extra_args,
        )

        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )

        from scripts.format_stream import process_stream

        success = process_stream(proc.stdout)
        proc.wait()
        return success and (proc.returncode == 0)


class FakeAgentRunnerAdapter:
    """Fake AgentRunnerAdapter for testing."""

    def __init__(self, should_succeed: bool = True):
        self.recorded_runs: List[Dict[str, Any]] = []
        self.should_succeed = should_succeed

    def run_agent(
        self,
        prompt: str,
        continue_session: bool = False,
        effort: str = "high",
        extra_args: Optional[List[str]] = None,
    ) -> bool:
        self.recorded_runs.append({
            "prompt": prompt,
            "continue_session": continue_session,
            "effort": effort,
            "extra_args": extra_args or [],
        })
        return self.should_succeed
