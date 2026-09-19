"""
Domain module for GitHub issue lifecycle, blocker graph resolution, and task state transitions.
"""

import re
import sys
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set

from .adapters import CliIssueTrackerAdapter, IssueTrackerAdapter


@dataclass
class Issue:
    number: int
    title: str
    body: str
    labels: List[str] = field(default_factory=list)
    comments: List[str] = field(default_factory=list)
    parent_number: Optional[int] = None
    parent_spec: Optional[str] = None


def extract_blockers(body: str) -> List[int]:
    """Extract blocking issue numbers from a 'Blocked by' section in markdown body."""
    lines = body.splitlines()
    in_blocked_section = False
    blockers: List[int] = []
    for line in lines:
        line_strip = line.strip()
        if not line_strip:
            continue
        # Check if we hit a markdown header (e.g. # Header, ## Header)
        if re.match(r"^#{1,6}\s", line_strip):
            if "blocked by" in line_strip.lower():
                in_blocked_section = True
            else:
                in_blocked_section = False
            continue
        if in_blocked_section:
            matches = re.findall(r"#(\d+)", line_strip)
            for m in matches:
                blockers.append(int(m))
    return blockers


def extract_parent_issue(body: str) -> Optional[int]:
    """Detect parent spec/epic issue number (e.g., 'Part of #738' or 'Parent #738')."""
    m = re.search(
        r"(?:Part of|Parent(?: issue)?:?)\s*(?:[\r\n]+\s*)?#(\d+)",
        body,
        re.I,
    )
    return int(m.group(1)) if m else None


def check_all_tasks(body: str) -> str:
    """Check off all markdown task list checkboxes (- [ ] -> - [x])."""
    return re.sub(r"^- \[ \]", "- [x]", body, flags=re.MULTILINE)


class IssueLifecycle:
    """Deep module managing issue triage, claims, parent specs, and resolution."""

    def __init__(self, adapter: Optional[IssueTrackerAdapter] = None):
        self.adapter = adapter or CliIssueTrackerAdapter()

    def promote_all(self, log_output: bool = True) -> List[int]:
        """
        Evaluate all open issues against blocker graphs and spec labels.
        Promote unblocked issues to 'ready-for-agent', demote blocked ones.
        Returns list of modified issue numbers.
        """
        open_issues = self.adapter.list_open_issues()
        if not open_issues:
            return []

        open_issues.sort(key=lambda x: x["number"])
        open_issue_numbers = {issue["number"] for issue in open_issues}
        updated: List[int] = []

        for issue in open_issues:
            number = issue["number"]
            title = issue.get("title", "")
            body = issue.get("body", "")
            raw_labels = issue.get("labels", [])
            labels = [
                l["name"] if isinstance(l, dict) else l
                for l in raw_labels
            ]

            is_spec = (
                title.lower().startswith("spec:")
                or title.lower().startswith("spec(")
                or any("spec" in l.lower() for l in labels)
                or number == 717
            )
            blockers = extract_blockers(body)
            active_blockers = [b for b in blockers if b in open_issue_numbers]

            should_have_label = not is_spec and not active_blockers and number != 717
            has_label = "ready-for-agent" in labels

            if has_label and not should_have_label:
                reason = "is a spec issue" if is_spec else f"is blocked by open issues: {active_blockers}"
                if log_output:
                    print(f"Issue #{number} ({title}) should not be ready ({reason}). Removing 'ready-for-agent'...", file=sys.stderr)
                if self.adapter.edit_issue(number, remove_label="ready-for-agent"):
                    updated.append(number)
            elif not has_label and should_have_label:
                if log_output:
                    print(f"Issue #{number} ({title}) is unblocked. Promoting to 'ready-for-agent'...", file=sys.stderr)
                if self.adapter.edit_issue(number, add_label="ready-for-agent"):
                    updated.append(number)

        return updated

    def get_next_ready_issue(self) -> Optional[Issue]:
        """Find the first open issue with the 'ready-for-agent' label."""
        self.promote_all(log_output=False)
        open_issues = self.adapter.list_open_issues()
        open_issues.sort(key=lambda x: x["number"])

        for issue_data in open_issues:
            raw_labels = issue_data.get("labels", [])
            labels = [
                l["name"] if isinstance(l, dict) else l
                for l in raw_labels
            ]
            if "ready-for-agent" in labels:
                return self.get_issue_context(issue_data["number"])
        return None

    def get_issue_context(self, number: int) -> Optional[Issue]:
        """Fetch an issue, its comments, and its parent spec if declared."""
        data = self.adapter.get_issue(number)
        if not data:
            return None

        title = data.get("title", "")
        body = data.get("body", "")
        raw_labels = data.get("labels", [])
        labels = [
            l["name"] if isinstance(l, dict) else l
            for l in raw_labels
        ]
        comments = self.adapter.get_comments(number)

        parent_num = extract_parent_issue(body)
        parent_spec = None
        if parent_num:
            parent_data = self.adapter.get_issue(parent_num)
            if parent_data:
                p_title = parent_data.get("title", "")
                p_body = parent_data.get("body", "")
                parent_spec = f"### Parent Spec #{parent_num}: {p_title}\n\n{p_body}"

        return Issue(
            number=number,
            title=title,
            body=body,
            labels=labels,
            comments=comments,
            parent_number=parent_num,
            parent_spec=parent_spec,
        )

    def claim(self, number: int, assignee: str = "@me") -> bool:
        """Assign issue to indicate work has started."""
        return self.adapter.edit_issue(number, add_assignee=assignee)

    def complete(self, number: int, comment: str = "Resolved.") -> bool:
        """
        Mark all task list items resolved in issue body, close the issue,
        and unblock downstream issues via promote_all().
        """
        issue_data = self.adapter.get_issue(number)
        if issue_data:
            body = issue_data.get("body", "")
            updated_body = check_all_tasks(body)
            if updated_body != body:
                self.adapter.edit_issue(number, body=updated_body)

        success = self.adapter.close_issue(number, comment=comment)
        # Automatically unblock downstream issues
        self.promote_all(log_output=True)
        return success
