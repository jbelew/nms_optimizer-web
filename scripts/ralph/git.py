"""
Git operations and commit message formatting adhering to Angular conventions and length limits.
"""

from typing import Optional

from .adapters import CommandRunnerAdapter, SubprocessCommandRunnerAdapter


def format_commit_message(title: str, issue_num: int, max_header: int = 95) -> str:
    """
    Format a commit message using Angular convention with issue suffix.
    Ensures the header is <= max_header characters for commitlint.
    """
    title = title.strip()
    suffix = f" (#{issue_num})"

    if len(title) + len(suffix) <= max_header:
        return f"{title}{suffix}"

    avail = max_header - len(suffix) - 3
    if avail <= 0:
        return f"{title[:max_header-len(suffix)]}{suffix}\n\n{title}"

    short_slice = title[:avail]
    if " " in short_slice:
        short_title = short_slice.rsplit(" ", 1)[0] + "..."
    else:
        short_title = short_slice + "..."

    header = f"{short_title}{suffix}"
    return f"{header}\n\n{title}"


def stage_all(runner: Optional[CommandRunnerAdapter] = None) -> bool:
    """Stage all current repository changes (git add .)."""
    r = runner or SubprocessCommandRunnerAdapter()
    code, _, _ = r.run(["git", "add", "."])
    return code == 0


def has_staged_changes(runner: Optional[CommandRunnerAdapter] = None) -> bool:
    """Check if there are any staged changes in git index."""
    r = runner or SubprocessCommandRunnerAdapter()
    code, _, _ = r.run(["git", "diff", "--cached", "--quiet"])
    # git diff --quiet returns 1 if differences exist, 0 if clean
    return code != 0


def commit(message: str, runner: Optional[CommandRunnerAdapter] = None) -> bool:
    """Commit staged changes with message."""
    r = runner or SubprocessCommandRunnerAdapter()
    code, _, _ = r.run(["git", "commit", "-m", message])
    return code == 0
